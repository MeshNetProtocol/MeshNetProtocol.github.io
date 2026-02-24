# 两合约最终方案：ProtocolRegistry + SupplierVault

## 1. 目标与边界

1. 只使用 2 个智能合约：`ProtocolRegistry` 和 `SupplierVault`。
2. 平台负责：商业供应商注册、索引、全局费率治理、协议规则。
3. 供应商负责：自建结算节点、维护用户-供应商小账本、与终端双签。
4. 终端用户每次固定支付 `0.01 USDC` 到供应商的 `SupplierVault`。
5. 个人供应商不走链上收费，仅由 Cloudflare API 管理其 `supplierId/profile`。

## 2. 为什么只要 2 个合约

1. `ProtocolRegistry` 合并了“注册表 + 参数配置 + Vault 创建入口”。
2. `SupplierVault` 负责“收款 + 提现 + 动态手续费扣除”。
3. 手续费配置不放在 Vault 中，Vault 每次提现实时查询 Registry 的最新费率。
4. 每个供应商 Vault 通过 EIP-1167 最小代理克隆创建，显著降低每次注册的部署 gas。
5. 供应商索引缓存只需监听一个主合约（`ProtocolRegistry`）事件。

## 3. 合约一：ProtocolRegistry

## 3.1 职责

1. 商业供应商注册（年费 300 USDC，默认值可由 owner 修改）。
2. 为每个商业供应商创建唯一的 `SupplierVault`。
3. 维护 `supplierId -> owner -> vault -> metadataURI -> expiry -> status`。
4. 提供给 Vault 的全局配置查询接口（`treasury`、`withdrawFeePercent`）。
5. 提供给 Cloudflare/终端的查询接口与事件。

## 3.2 核心状态

1. `address public owner`
2. `address public immutable usdc`
3. `address public treasury`
4. `uint256 public annualFeeUsdc`（默认 `300e6`）
5. `uint16 public withdrawFeePercent`（默认建议 `10`，即 10%）
6. `mapping(bytes32 => SupplierRecord) suppliers`
7. `mapping(address => bytes32) supplierHashByVault`

`SupplierRecord` 字段：

1. `supplierId`
2. `owner`
3. `vault`
4. `metadataURI`
5. `expiry`
6. `suspended`

## 3.3 核心函数

1. `registerCommercialWithAuthorization(string supplierId, string metadataURI, TransferAuthorization paymentAuthorization)`
2. `renewCommercialWithAuthorization(bytes32 supplierIdHash, TransferAuthorization paymentAuthorization)`
3. `updateMetadataURI(bytes32 supplierIdHash, string metadataURI)`
4. `transferSupplierOwner(bytes32 supplierIdHash, address newOwner)`
5. `suspendSupplier(bytes32 supplierIdHash)`
6. `reactivateSupplier(bytes32 supplierIdHash)`
7. `setAnnualFeeUsdc(uint256 newFee)`
8. `setWithdrawFeePercent(uint16 newFeePercent)`
9. `setTreasury(address newTreasury)`
10. `getFeeConfig() -> (address treasury, uint16 withdrawFeePercent)`
11. `getSupplierOwner(bytes32 supplierIdHash)`（给 Vault 调用）
12. `getSupplierCountByOwner(address supplierOwner)`（钱包登录后查询名下 profile 数量）
13. `getSupplierHashesByOwner(address supplierOwner, uint256 offset, uint256 limit)`（分页查询名下 profile）
14. `isSupplierActive(bytes32 supplierIdHash)`

## 3.4 registerCommercialWithAuthorization 执行逻辑

1. `supplierIdHash = keccak256(bytes(supplierId))`。
2. 检查 `supplierId` 未注册（只做唯一性约束，不做格式约束；若已被任意地址占用则注册失败）。
3. 收取 1 年年费：`annualFeeUsdc`（仅 `receiveWithAuthorization` 路径）。
4. 通过 `vaultImplementation` 克隆一个 `SupplierVault`，并初始化 `registry/supplierIdHash`。
5. 保存供应商记录并发出 `SupplierRegistered` 事件。

唯一支付路径：

1. 供应商在链下签名 USDC `receiveWithAuthorization` 数据。
2. 调用 `registerCommercialWithAuthorization(...)` 一次性完成“扣年费 + 注册 + 创建 Vault”。
3. 该路径不需要额外的业务动作签名层，复杂度更低。
4. `renewCommercialWithAuthorization(...)` 每次续费固定增加 1 年，到期计算规则为 `max(block.timestamp, oldExpiry) + 365 days`，且允许任意地址代付续费。

## 3.5 事件（供 Cloudflare 缓存）

1. `SupplierRegistered`
2. `SupplierRenewed`
3. `SupplierMetadataUpdated`
4. `SupplierOwnerTransferred`
5. `SupplierStatusChanged`
6. `AnnualFeeUpdated`
7. `WithdrawFeePercentUpdated`
8. `TreasuryUpdated`

## 4. 合约二：SupplierVault

## 4.1 职责

1. 接收用户支付的 USDC（直接转入 Vault 地址）。
2. 支持供应商提现。
3. 提现时按 Registry 的最新 `withdrawFeePercent` 扣平台服务费到 `treasury`。

## 4.2 核心状态

1. `address public registry`
2. `address public usdc`
3. `bytes32 public supplierIdHash`
4. `bool public initialized`

## 4.3 核心函数

1. `initialize(address registry, bytes32 supplierIdHash)`（仅 Registry 在创建 clone 后调用一次）
2. `previewWithdraw(uint256 amount)`
3. `withdraw(uint256 amount, address to)`
4. `withdrawAll(address to)`

## 4.4 withdraw 执行逻辑

1. 调用 `ProtocolRegistry.getSupplierOwner(supplierIdHash)` 校验调用者权限。
2. 调用 `ProtocolRegistry.getFeeConfig()` 获取最新 `treasury` 和 `withdrawFeePercent`。
3. 计算 `fee = amount * feePercent / 100`，`net = amount - fee`。
4. `fee` 转给 `treasury`，`net` 转给 `to`。
5. 发出 `Withdrawn` 事件。
6. `withdrawAll` 在 Vault 余额为 0 时返回 `(0,0)`，不抛错。
7. Vault 会防御性校验 `treasury != 0` 且 `withdrawFeePercent <= 100`。

## 5. 终端与供应商结算节点的小账本（链下双签）

平台不把链上合约做成流量明细账本。流量账本是链下双签状态机。

建议最小字段：

1. `chainId`
2. `supplierId`
3. `supplierVault`
4. `userAddress`
5. `nonce`（严格递增）
6. `unitPrice`
7. `purchasedUnitsTotal`
8. `consumedUnitsTotal`
9. `remainingUnits`
10. `lastPaymentTxHash`
11. `updatedAt`
12. `userSig`
13. `supplierSig`

规则：

1. 每次 `0.01 USDC` 购买后都更新账本并双签。
2. 不存在“未签单据后补争议窗口”模型。
3. 终端与供应商任一方丢失账本时，可从另一方或 Cloudflare 拉取最新双签状态恢复。

## 6. Cloudflare 与合约协作点

1. 监听 `ProtocolRegistry` 事件，构建商业供应商检索索引。
2. 校验用户支付交易（`0.01 USDC -> SupplierVault`）并生成支付回执。
3. 接收并存证双签账本最新状态（用于检索与恢复）。
4. 个人供应商继续走独立 API，不接入收费链路。

## 7. Gas 与 Base 链说明

1. “USDC 支付 gas / 资助 gas”属于钱包或 relayer/paymaster 交易入口层能力。
2. 本两合约方案不内置 gas 代付逻辑，保持协议层最小化与稳定性。
3. 终端是否走 gas sponsorship，不影响 `ProtocolRegistry + SupplierVault` 的资金规则。

## 8. 关键安全约束

1. `supplierId` 全局唯一。
2. `withdrawFeePercent` 取值必须在 `0~100` 之间。
3. Vault 提现权限以 Registry 中的最新 supplier owner 为准。
4. 所有 USDC 交互必须检查返回值（防静默失败）。
5. 供应商是否展示给终端，由 `isSupplierActive` 决定（`!suspended && expiry >= now`）。
6. `register/renew with authorization` 使用 USDC 原生 `receiveWithAuthorization`，避免授权被外部直接消费。
7. `ProtocolRegistry` 与 `SupplierVault` 均启用 OpenZeppelin 风格 `ReentrancyGuard`（`nonReentrant`）。
8. 部署阶段对 USDC 合约做能力探测：`balanceOf` 与 `authorizationState`（Registry）必须可用。
9. 关键链上追踪事件：`AnnualFeeCollected`、`SupplierRegistered`、`Withdrawn`。
10. 错误码已细分（如 `UsdcReceiveWithAuthorizationFailed`、`InvalidUsdcBalanceOf`），便于链上定位问题。
11. 每次供应商注册创建的是最小代理 Vault（clone），不是完整逻辑合约重复部署。

## 9. 实施顺序

1. 部署 `ProtocolRegistry`。
2. 商业供应商调用 `registerCommercialWithAuthorization` 自动创建自己的 `SupplierVault`。
3. Cloudflare 对接 Registry 事件索引。
4. 终端接入支付与双签账本流程。
5. 供应商在 Vault 执行提现，链上自动扣平台费。

## 10. Base Sepolia 逐步部署清单

1. 准备网络与账户：使用 `Base Sepolia`（`chainId=84532`），准备 `平台Owner`、`商业供应商测试账户`，并给这些地址准备测试 ETH。
2. 确认 USDC 地址：使用你当前项目配置中的 Base Sepolia USDC 地址。
3. 本地编译合约：
```bash
cd /Users/wesley/MeshNetProtocol/MeshNetProtocol.github.io
solc --base-path . --include-path . --abi --bin contracts/ProtocolRegistry.sol contracts/SupplierVault.sol -o /tmp/meshnet-solc-out --overwrite
```
4. 部署 `ProtocolRegistry`，构造参数仅填入：`usdc_`。
5. 部署后读链确认：`usdc()`、`owner()`、`treasury()`、`annualFeeUsdc()`、`withdrawFeePercent()`、`vaultImplementation()` 都等于预期（默认分别为 `300000000` 与 `10`，且 `treasury` 默认等于部署者 `owner`）。
6. 商业供应商注册建议使用“授权支付”路径：链下签署 USDC `receiveWithAuthorization` 参数，然后调用 `registerCommercialWithAuthorization(...)`。
7. 注册成功后记录 `SupplierRegistered` 事件中的 `supplierIdHash` 和 `vault`。
8. 调用 `getSupplierById("com.meshi.app.v1")`，核对 `owner`、`vault`、`expiry`、`suspended=false`。
9. 用终端用户测试账户向 `vault` 直接转 `10000`（0.01 USDC），再检查 `USDC.balanceOf(vault)` 是否增加。
10. 供应商 owner 调用 `previewWithdraw(10000)`，确认 `fee=1000`、`net=9000`。
11. 供应商 owner 调用 `withdraw(10000, <supplierPayoutAddress>)`，确认 `treasury` 收到 `1000`、供应商收款地址收到 `9000`。
12. 平台 owner 调用 `setWithdrawFeePercent(12)`，重复充值和提现，确认 Vault 自动按 12% 新费率扣费。
13. 供应商续费走 `renewCommercialWithAuthorization(...)`（唯一路径，且每次固定 +1 年）。
14. 平台 owner 调用 `suspendSupplier(supplierIdHash)` 后，`isSupplierActive` 返回 `false`；调用 `reactivateSupplier` 后恢复为 `true`（未过期前提下）。

## 11. 主流程验收清单（建议逐条打勾）

1. `ProtocolRegistry` 初始化参数正确，且 `owner`、`treasury`、费率可读。
2. 商业供应商可成功注册并自动创建 `SupplierVault`。
3. 重复 `supplierId` 注册会失败（唯一性生效）。
4. 用户可直接向 Vault 支付 `0.01 USDC`。
5. 非 supplier owner 调用 Vault 提现会失败。
6. supplier owner 提现时，平台费与净额分账正确。
7. 修改 `withdrawFeePercent` 后，已存在 Vault 自动应用新费率。
8. `withdrawFeePercent` 只能设置在 `0~100` 区间。
9. `renewCommercialWithAuthorization`（固定 +1 年）、`suspendSupplier`、`reactivateSupplier` 行为符合预期。
10. Cloudflare 能正确索引 `SupplierRegistered`、`SupplierMetadataUpdated`、`SupplierStatusChanged`。
11. 终端检索可返回 `supplierId -> vault -> metadataURI -> activeStatus`。
12. 个人供应商 API 不受商业合约收费链路影响。
13. `registerCommercialWithAuthorization` 与 `renewCommercialWithAuthorization` 是唯一收费入口，并可成功扣费。

## 12. 常见问题排查（部署阶段）

1. `registerCommercialWithAuthorization` / `renewCommercialWithAuthorization` 失败时，检查 `receiveWithAuthorization` 的 `validBefore`、`nonce`、签名参数以及 USDC 合约地址是否正确。
2. Vault 提现失败时，检查调用地址是否为 Registry 记录的当前 supplier owner、Vault USDC 余额是否充足、`treasury` 是否被误配置。
3. 费率不符合预期时，先读 `ProtocolRegistry.withdrawFeePercent()`，再用 Vault `previewWithdraw` 验证实际执行费率。
