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
4. 供应商索引缓存只需监听一个主合约（`ProtocolRegistry`）事件。

## 3. 合约一：ProtocolRegistry

## 3.1 职责

1. 商业供应商注册（年费 300 USDC，默认值可由 owner 修改）。
2. 为每个商业供应商创建唯一的 `SupplierVault`。
3. 维护 `supplierId -> owner -> vault -> metadataURI -> expiry -> status`。
4. 提供给 Vault 的全局配置查询接口（`treasury`、`withdrawFeeBps`）。
5. 提供给 Cloudflare/终端的查询接口与事件。

## 3.2 核心状态

1. `address public owner`
2. `address public pendingOwner`
3. `address public immutable usdc`
4. `address public treasury`
5. `uint256 public annualFeeUsdc`（默认 `300e6`）
6. `uint16 public withdrawFeeBps`（默认 `1000`，即 10%）
7. `uint16 public immutable maxWithdrawFeeBps`
8. `mapping(bytes32 => SupplierRecord) suppliers`
9. `mapping(address => bytes32) supplierHashByVault`

`SupplierRecord` 字段：

1. `supplierId`
2. `owner`
3. `vault`
4. `metadataURI`
5. `expiry`
6. `suspended`

## 3.3 核心函数

1. `registerCommercial(string supplierId, string metadataURI)`
2. `renewCommercial(bytes32 supplierIdHash, uint16 yearsToAdd)`
3. `updateMetadataURI(bytes32 supplierIdHash, string metadataURI)`
4. `transferSupplierOwner(bytes32 supplierIdHash, address newOwner)`
5. `suspendSupplier(bytes32 supplierIdHash)`
6. `reactivateSupplier(bytes32 supplierIdHash)`
7. `setAnnualFeeUsdc(uint256 newFee)`
8. `setWithdrawFeeBps(uint16 newFeeBps)`
9. `setTreasury(address newTreasury)`
10. `getFeeConfig() -> (address treasury, uint16 withdrawFeeBps)`
11. `getSupplierOwner(bytes32 supplierIdHash)`（给 Vault 调用）
12. `isSupplierActive(bytes32 supplierIdHash)`

## 3.4 registerCommercial 执行逻辑

1. 校验 `supplierId` 格式（小写、数字、点分隔、不能首尾点、不能连续点）。
2. `supplierIdHash = keccak256(bytes(supplierId))`。
3. 检查 `supplierId` 未注册。
4. 收取 1 年年费：`annualFeeUsdc`（`transferFrom(msg.sender, treasury, annualFeeUsdc)`）。
5. 创建 `SupplierVault` 实例，参数为：`registry`, `supplierIdHash`（供应商 owner 动态从 Registry 查询）。
6. 保存供应商记录并发出 `SupplierRegistered` 事件。

## 3.5 事件（供 Cloudflare 缓存）

1. `SupplierRegistered`
2. `SupplierRenewed`
3. `SupplierMetadataUpdated`
4. `SupplierOwnerTransferred`
5. `SupplierStatusChanged`
6. `AnnualFeeUpdated`
7. `WithdrawFeeBpsUpdated`
8. `TreasuryUpdated`

## 4. 合约二：SupplierVault

## 4.1 职责

1. 接收用户支付的 USDC（直接转入 Vault 地址）。
2. 支持供应商提现。
3. 提现时按 Registry 的最新 `withdrawFeeBps` 扣平台服务费到 `treasury`。

## 4.2 核心状态

1. `address public immutable registry`
2. `address public immutable usdc`
3. `bytes32 public immutable supplierIdHash`

## 4.3 核心函数

1. `previewWithdraw(uint256 amount)`
2. `withdraw(uint256 amount, address to)`
3. `withdrawAll(address to)`

## 4.4 withdraw 执行逻辑

1. 调用 `ProtocolRegistry.getSupplierOwner(supplierIdHash)` 校验调用者权限。
2. 调用 `ProtocolRegistry.getFeeConfig()` 获取最新 `treasury` 和 `withdrawFeeBps`。
3. 计算 `fee = amount * bps / 10000`，`net = amount - fee`。
4. `fee` 转给 `treasury`，`net` 转给 `to`。
5. 发出 `Withdrawn` 事件。

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
2. `withdrawFeeBps` 必须有上限（例如 <= 2000）。
3. Vault 提现权限以 Registry 中的最新 supplier owner 为准。
4. 所有 USDC 交互必须检查返回值（防静默失败）。
5. 供应商是否展示给终端，由 `isSupplierActive` 决定（`!suspended && expiry >= now`）。

## 9. 实施顺序

1. 部署 `ProtocolRegistry`。
2. 商业供应商调用 `registerCommercial` 自动创建自己的 `SupplierVault`。
3. Cloudflare 对接 Registry 事件索引。
4. 终端接入支付与双签账本流程。
5. 供应商在 Vault 执行提现，链上自动扣平台费。

## 10. Base Sepolia 逐步部署清单

1. 准备网络与账户：使用 `Base Sepolia`（`chainId=84532`），准备 `平台Owner`、`平台Treasury`、`商业供应商测试账户`，并给这些地址准备测试 ETH。
2. 确认 USDC 地址：使用你当前项目配置中的 Base Sepolia USDC 地址。
3. 本地编译合约：
```bash
cd /Users/wesley/MeshNetProtocol/MeshNetProtocol.github.io
solc --base-path . --include-path . --abi --bin contracts/ProtocolRegistry.sol contracts/SupplierVault.sol -o /tmp/meshnet-solc-out --overwrite
```
4. 部署 `ProtocolRegistry`，构造参数按顺序填入：`usdc_`、`treasury_`、`annualFeeUsdc_=300000000`、`withdrawFeeBps_=1000`、`maxWithdrawFeeBps_=2000`。
5. 部署后读链确认：`usdc()`、`treasury()`、`annualFeeUsdc()`、`withdrawFeeBps()`、`maxWithdrawFeeBps()` 都等于预期。
6. 商业供应商注册前先执行 USDC `approve(ProtocolRegistry, 300000000)`。
7. 调用 `registerCommercial("com.meshi.app.v1", "<metadataURI>")`，记录 `SupplierRegistered` 事件中的 `supplierIdHash` 和 `vault`。
8. 调用 `getSupplierById("com.meshi.app.v1")`，核对 `owner`、`vault`、`expiry`、`suspended=false`。
9. 用终端用户测试账户向 `vault` 直接转 `10000`（0.01 USDC），再检查 `USDC.balanceOf(vault)` 是否增加。
10. 供应商 owner 调用 `previewWithdraw(10000)`，确认 `fee=1000`、`net=9000`。
11. 供应商 owner 调用 `withdraw(10000, <supplierPayoutAddress>)`，确认 `treasury` 收到 `1000`、供应商收款地址收到 `9000`。
12. 平台 owner 调用 `setWithdrawFeeBps(1200)`，重复充值和提现，确认 Vault 自动按 12% 新费率扣费。
13. 供应商调用 `renewCommercial(supplierIdHash, 1)`，确认 `expiry` 增加约 365 天。
14. 平台 owner 调用 `suspendSupplier(supplierIdHash)` 后，`isSupplierActive` 返回 `false`；调用 `reactivateSupplier` 后恢复为 `true`（未过期前提下）。

## 11. 主流程验收清单（建议逐条打勾）

1. `ProtocolRegistry` 初始化参数正确，且 `owner`、`treasury`、费率可读。
2. 商业供应商可成功注册并自动创建 `SupplierVault`。
3. 重复 `supplierId` 注册会失败（唯一性生效）。
4. 用户可直接向 Vault 支付 `0.01 USDC`。
5. 非 supplier owner 调用 Vault 提现会失败。
6. supplier owner 提现时，平台费与净额分账正确。
7. 修改 `withdrawFeeBps` 后，已存在 Vault 自动应用新费率。
8. `withdrawFeeBps` 不可超过 `maxWithdrawFeeBps`。
9. `renewCommercial`、`suspendSupplier`、`reactivateSupplier` 行为符合预期。
10. Cloudflare 能正确索引 `SupplierRegistered`、`SupplierMetadataUpdated`、`SupplierStatusChanged`。
11. 终端检索可返回 `supplierId -> vault -> metadataURI -> activeStatus`。
12. 个人供应商 API 不受商业合约收费链路影响。

## 12. 常见问题排查（部署阶段）

1. `registerCommercial` 失败时，先检查 USDC `approve` 是否足额，再检查 `supplierId` 格式和唯一性。
2. Vault 提现失败时，检查调用地址是否为 Registry 记录的当前 supplier owner、Vault USDC 余额是否充足、`treasury` 是否被误配置。
3. 费率不符合预期时，先读 `ProtocolRegistry.withdrawFeeBps()`，再用 Vault `previewWithdraw` 验证实际执行费率。
