# Market API + Base 链重构方案计划书（V2）

## 1. 重构目标

本次为不兼容旧逻辑的重大重构，目标是把系统从“中心化鉴权驱动”改成“链上状态驱动”：

1. 商业供应商的准入、续费、收费、分账以智能合约为准。
2. 私人供应商不进入公共市场，不提供收费能力，仅支持本地导入/手动更新。
3. 后端降级为最小服务：仅负责供应商 `supplierId` 全局唯一性登记与基础查询聚合。
4. 客户端公共市场只展示商业供应商；私人供应商通过文件或 URL 本地导入。
5. 支付链固定为 Base，支持主网与测试网切换。

---

## 2. 已确认业务约束（冻结）

1. 商业供应商入驻费：`300 USDC / 年`。
2. 入驻费可由合约 `owner` 修改（链上参数）。
3. 商业供应商每年续费一次，未续费即失效。
4. 服务费：商业供应商提取 USDC 时按 `10%` 收取。
5. 服务费接收地址：合约 `owner`（管理员地址）。
6. `supplierId` 采用苹果 App Store 风格反向域名格式，如：`com.meshi.app.v1`。
7. 私人与商业供应商都必须有全局唯一 `supplierId`。
8. 商业供应商配置只在链上存 `profileUrl`（关键索引信息），不在服务器存完整配置。
9. 私人供应商配置来源为文件或 URL；客户端已有解析逻辑，本次不改 profile JSON 格式。

---

## 3. 总体架构（重构后）

## 3.1 组件职责

1. 智能合约（Base Mainnet / Base Sepolia）
- 负责商业供应商：入驻、续费、状态、生效期、profile URL、支付收款、提取分账。
- 链上事件作为收费与账本事实来源。

2. `market-api`（V2）
- 只负责 `supplierId` 全局唯一登记（private/commercial 统一命名空间）。
- 提供商业供应商聚合查询接口（可缓存链上结果）。
- 不再提供 SIWE/JWT/nonce/supplier-manager 等旧鉴权与后端配置管理。

3. `MeshNetProtocol.github.io`（客户端）
- 宣传页与业务页分离。
- 商业供应商：钱包交互合约、支付、续费、更新 URL。
- 私人供应商：导入文件/URL、本地 profile、手动刷新。
- 公共市场只展示商业供应商。

4. 后续新工程（账本与 VPN 授权服务）
- 消费链上支付事件，驱动 VPN 服务授权与账本同步。
- 本计划只做接口预留，不在本仓库实现完整账本系统。

## 3.2 关键设计原则

1. 链上状态优先：商业供应商有效性以合约为准。
2. 后端最小化：避免重复中心化鉴权。
3. 不兼容迁移：删除旧表、旧接口、旧鉴权逻辑，不保留兼容层。

---

## 4. 智能合约重构方案

## 4.1 合约模块建议

建议拆分为两个合约（也可合并为一个）：

1. `SupplierRegistry`
- 管理商业供应商注册、续费、到期时间、profile URL。
- 维护 `annualFeeUsdc`（默认 300e6，6 位 USDC 精度），`owner` 可更新。

2. `PaymentHub`
- 接收用户 x402 支付（USDC）。
- 记录供应商可提取余额。
- 提取时自动按 90% 给供应商、10% 给 owner（服务费）。

## 4.2 链上核心状态

1. `annualFeeUsdc`：年费，默认 `300 USDC`，`onlyOwner` 可改。
2. `serviceFeeBps`：固定 `1000`（10%）。
3. `supplierIdHash => Supplier`：商业供应商链上状态。
4. `supplierBalanceUsdc`：每个商业供应商可提取余额。
5. `isActive(supplierId)`：以 `paidUntil >= block.timestamp` 判定是否有效。

## 4.3 核心方法

1. `registerCommercialSupplier(supplierId, profileUrl, years)`
- 支付 `annualFeeUsdc * years`（USDC transferFrom）。
- 首次注册或续费。
- 校验 `supplierId` 格式与唯一性（链上商业域内唯一）。

2. `renewCommercialSupplier(supplierId, years)`
- 续费并延长 `paidUntil`。

3. `updateProfileUrl(supplierId, profileUrl)`
- 仅供应商 owner 可更新链上 URL。

4. `payForService(supplierId, orderId, amountUsdc, payer)`
- 用户支付入口（供 x402 集成调用）。
- 写入支付事件。

5. `withdrawRevenue(supplierId, amountUsdc)`
- 供应商提取收入。
- 自动分账：10% 给合约 owner，90% 给供应商提现地址。

6. `setAnnualFeeUsdc(newFee)` / `setOwner(newOwner)`
- 合约治理与参数更新。

## 4.4 事件（后续账本服务依赖）

1. `CommercialSupplierRegistered`
2. `CommercialSupplierRenewed`
3. `CommercialSupplierProfileUrlUpdated`
4. `ServicePaid`
5. `RevenueWithdrawn`（含 gross / fee / net）
6. `AnnualFeeUpdated`

---

## 5. market-api（V2）重构方案

## 5.1 旧代码删除范围（必须执行）

删除 `/Users/wesley/MeshNetProtocol/openmesh-cli/market-api/src/index.ts` 中以下逻辑：

1. `/api/v1/auth/nonce`
2. `/api/v1/auth/verify`
3. `/api/v1/auth/me`
4. `/api/v1/suppliers*` 全部接口
5. JWT、nonce、RBAC、manager、supplier config 存储相关实现

删除旧数据库表及迁移：

1. `auth_nonces`
2. `suppliers`
3. `supplier_configs`
4. `supplier_managers`
5. `audit_logs`（若仅服务旧鉴权流程）
6. 旧 `providers` 表（若完全改为商业链上索引）

## 5.2 新后端最小数据模型

仅保留 `supplier_ids`（全局唯一命名空间）：

1. `supplier_id`（PK，唯一）
2. `supplier_type`（`private` / `commercial`）
3. `owner_wallet`
4. `chain_id`（商业供应商记录 Base chainId）
5. `status`（`reserved` / `active` / `expired`）
6. `created_at`
7. `updated_at`
8. `last_verified_tx`（商业供应商可选）

说明：
- 该表只做 ID 全局唯一与基础映射，不存商业配置 JSON。
- 私人配置文件内容不入库。

## 5.3 新 API（建议 `/api/v2`）

1. `POST /api/v2/supplier-ids/reserve`
- 钱包签名声明（非 JWT）申请占用 `supplierId`。
- 校验格式与唯一性。

2. `POST /api/v2/supplier-ids/confirm-commercial`
- 提交链上交易哈希，后端校验注册/续费事件后激活。

3. `POST /api/v2/supplier-ids/register-private`
- 私人供应商登记（仅记录 ID 与 owner，不公开）。

4. `GET /api/v2/commercial-suppliers`
- 返回商业供应商列表（来自链上或链上缓存）。
- 仅商业供应商对外可见。

5. `GET /api/v2/commercial-suppliers/:supplierId`
- 返回链上状态（owner、paidUntil、profileUrl、active）。

6. `GET /api/v2/networks`
- 返回当前支持网络（Base Mainnet / Base Sepolia）与合约地址。

---

## 6. 客户端重构方案（MeshNetProtocol.github.io）

## 6.1 页面与模块

1. 宣传页：仅产品介绍 + “进入供应商控制台”。
2. 供应商控制台页：拆成两个区块。
- 商业供应商（链上）
- 私人供应商（本地）
3. 钱包连接：保留单按钮流程，但改为“连接钱包 + 链上操作准备”，不再做 JWT 登录。

## 6.2 商业供应商流程（前端）

1. 连接钱包并选择 Base 网络（主网/测试网）。
2. 输入 `supplierId` 与 `profileUrl`。
3. 调用后端 reserve（签名声明）。
4. 调用合约注册并支付年费（300 USDC/年，或当时链上参数）。
5. 回传 txHash 给后端确认，状态置为 active。
6. 商业市场页面只读取商业供应商列表并展示。

## 6.3 私人供应商流程（前端）

1. 输入 `supplierId` 并登记（后端唯一性校验）。
2. 通过文件导入或 URL 导入 profile。
3. profile 仅存本地，不上链，不进公共市场。
4. 仅支持手动刷新（重新导入或手动拉取 URL），不做自动更新。

## 6.4 明确不修改内容

1. 现有客户端对 private profile 的 JSON 解析逻辑不改。
2. 不新增 private profile schema 版本体系。

---

## 7. 网络、环境与配置

## 7.1 仅支持网络

1. Base Mainnet（chainId: 8453）
2. Base Sepolia（chainId: 84532）

## 7.2 关键配置项（后端与前端）

1. `BASE_MAINNET_RPC_URL`
2. `BASE_SEPOLIA_RPC_URL`
3. `SUPPLIER_REGISTRY_ADDRESS_MAINNET`
4. `SUPPLIER_REGISTRY_ADDRESS_SEPOLIA`
5. `PAYMENT_HUB_ADDRESS_MAINNET`
6. `PAYMENT_HUB_ADDRESS_SEPOLIA`
7. `USDC_ADDRESS_MAINNET`
8. `USDC_ADDRESS_SEPOLIA`
9. `DEFAULT_CHAIN_ENV`（mainnet/sepolia）

---

## 8. 实施里程碑（逐个验收）

## 里程碑 A：删除旧鉴权与旧供应商后端

1. 删除旧 API 路由和相关实现。
2. 删除旧 D1 表迁移文件并建立新 `supplier_ids` 迁移。
3. 清理旧环境变量（JWT、nonce、RBAC）。

验收：
1. `/api/v1/auth/*` 与 `/api/v1/suppliers/*` 不再可用（404/410）。
2. 新库结构只保留 V2 所需最小表。

## 里程碑 B：合约开发与 Base Sepolia 部署

1. 完成 `SupplierRegistry` + `PaymentHub`。
2. 实现 300 USDC/年年费与 owner 可修改。
3. 实现 10% 服务费分账到 owner。

验收：
1. 商业注册支付成功并可查询 `paidUntil`。
2. 提取时 fee/net 金额正确。
3. owner 修改年费后新交易生效。

## 里程碑 C：market-api V2（最小后端）

1. 完成 supplierId reserve/confirm/register-private。
2. 完成商业列表聚合查询接口。
3. 接入链上事件验证。

验收：
1. 同名 `supplierId`（含 private/commercial）被拒绝。
2. 未完成链上注册的商业供应商不会出现在公共列表。

## 里程碑 D：前端业务页重构

1. 商业与私人入口拆分清晰。
2. 移除 JWT 登录流程，改为钱包链上交互流程。
3. 公共市场仅显示商业供应商。

验收：
1. 私人供应商不可见于公共市场。
2. 商业供应商可完整完成“登记->支付->上架”。

## 里程碑 E：联调与发布（先测试网后主网）

1. Sepolia 全流程压测与主流程回归。
2. 主网地址切换与灰度发布。
3. 文档、运行手册、监控告警同步更新。

验收：
1. Sepolia 与 Mainnet 均可完成主流程。
2. 关键异常（支付失败、ID 冲突、链切换）有明确提示。

---

## 9. 主流程测试用例（最小集）

1. 商业供应商首次入驻
- 步骤：reserve ID -> 支付年费注册 -> confirm。
- 预期：状态 active，`paidUntil` 正确。

2. 商业供应商续费
- 步骤：调用续费交易。
- 预期：`paidUntil` 延长 1 年（或 years 对应时长）。

3. 商业供应商修改 profile URL
- 步骤：owner 调用更新 URL。
- 预期：链上 URL 更新，客户端下次拉取生效。

4. 用户支付与供应商提取
- 步骤：用户支付 USDC -> 供应商提取。
- 预期：提取时 10% 到 owner，90% 到供应商。

5. 私人供应商导入
- 步骤：登记 private ID -> 导入文件或 URL。
- 预期：本地 profile 可用，不出现在公共市场。

6. 私人供应商手动更新
- 步骤：再次导入文件或手动拉取 URL。
- 预期：本地 profile 更新成功，不触发自动更新。

7. 全局 ID 冲突
- 步骤：已存在 `com.meshi.app.v1` 后再次申请。
- 预期：后端返回冲突，不允许重名。

8. 网络切换
- 步骤：在 Base Sepolia 与 Base Mainnet 间切换。
- 预期：合约地址、USDC 地址、读取与交易逻辑同步切换。

---

## 10. 风险与控制

1. 风险：链上与后端状态短时不一致（事件确认延迟）。
- 控制：confirm-commercial 使用交易回执 + 确认块数策略。

2. 风险：USDC 精度与费用计算错误。
- 控制：全部按 6 位精度整数计算，增加单元测试和边界测试。

3. 风险：`supplierId` 风格不一致。
- 控制：统一小写校验规则，后端与合约同一正则约束。

---

## 11. 不在本次实现范围

1. 私人 profile JSON 结构改造。
2. 完整的“收费验证服务与 VPN 账本服务”实现（仅预留接口与事件契约）。
3. 旧 API 兼容层与数据平滑迁移（本次直接重构替换）。

