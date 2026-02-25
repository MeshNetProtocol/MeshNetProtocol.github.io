# MeshNetProtocol Vendor Console 界面设计规格（Base 专用）

## 1. 设计目标

本规格用于重构 `/vendor-console.html`，目标是：

1. 明确“Base 链唯一支付链”定位。
2. 在登录钱包阶段就强制网络正确（Base Mainnet 或 Base Sepolia）。
3. 用最少但完整的操作集合覆盖供应商核心业务。
4. 清晰区分两种供应商模式：`Private` 与 `Commercial`。

设计原则：

1. 第一性原理：钱包地址是身份根；链上状态是商业供应商唯一真相；界面只负责显示状态、触发操作、反馈结果。
2. 奥卡姆剃刀：删除重复字段和重复入口；按“必须完成业务闭环”定义 MVP。

---

## 2. 业务模型（必须写在界面中）

## 2.1 Private Supplier（私人供应商）

1. 不上链注册。
2. 不进入公开商业市场。
3. 无年费、无链上提现分账。
4. 通过本地文件或 URL 导入 profile，手动更新。

建议展示文案（中/英 i18n）：

- `私人供应商只在本地生效，不会被公开检索。`
- `Private suppliers are local-only and are not listed in the public marketplace.`

## 2.2 Commercial Supplier（商业供应商）

1. 以链上合约状态为准。
2. 需要年费注册与续费。
3. 对外可检索（公共市场只展示商业供应商）。
4. 收入提现时按协议费率自动分账。

链上来源（当前合约）：

- `ProtocolRegistry`：注册、续费、有效性、费率配置、供应商索引。
- `SupplierProfile`：metadata 维护、owner 转移、提现与预估。

---

## 3. Base 链登录策略（回答“能否指定 MetaMask 登录 Base 链”）

可以，而且应当作为登录前置步骤。

## 3.1 目标网络

1. `Base Mainnet`
- `chainId`: `8453` (`0x2105`)
- `chainName`: `Base Mainnet`
- `rpcUrls`: `https://mainnet.base.org`
- `blockExplorerUrls`: `https://basescan.org`
- `nativeCurrency`: `ETH`

2. `Base Sepolia`
- `chainId`: `84532` (`0x14A34`)
- `chainName`: `Base Sepolia`
- `rpcUrls`: `https://sepolia.base.org`
- `blockExplorerUrls`: `https://sepolia.basescan.org`
- `nativeCurrency`: `ETH`

## 3.2 登录动作顺序（必须）

1. `eth_requestAccounts`
2. `eth_chainId`
3. 如果不在目标 Base 网络：
- 先调用 `wallet_switchEthereumChain`
- 若返回 `4902`（钱包没有该链），调用 `wallet_addEthereumChain` 后重试 `wallet_switchEthereumChain`
4. 网络正确后，再执行签名登录（SIWE / nonce challenge）

## 3.3 状态门禁

1. 非 Base 网络：禁用全部链上动作按钮（注册、续费、转移 owner、提现）。
2. 未签名登录：禁用供应商数据写操作。
3. 门禁状态在页面顶部常驻显示，不可隐藏。

---

## 4. 信息架构（单页）

页面分为 6 个区块，顺序固定：

1. `Global Status Bar`：钱包、网络、会话状态。
2. `Mode Intro`：Private vs Commercial 说明卡。
3. `Commercial Workspace`：商业供应商管理主区。
4. `Private Workspace`：私人供应商管理区。
5. `Transaction & Event Log`：链上/签名操作日志。
6. `Risk & Help`：关键风险提示与帮助入口。

交互导航建议：

1. 页面顶部增加轻量步骤条：`钱包与网络 -> 模式说明 -> 商业管理 -> 私人管理 -> 操作日志`。
2. 步骤条只用于定位，不做多页跳转，避免上下文丢失。

图片占位符：

- `[Image Placeholder: vendor-console-overview-banner.png]`
- `[Image Placeholder: supplier-mode-compare-cards.png]`

---

## 5. 操作元素清单（详细）

以下为推荐最小完整元素集合。

## 5.1 Global Status Bar（全局状态栏）

1. 元素：`Network Selector`
- 类型：下拉
- 值：`Base Mainnet` / `Base Sepolia`
- 行为：切换后触发网络对齐流程

2. 元素：`Connect Wallet` 按钮
- 类型：主按钮
- 行为：请求账户连接

3. 元素：`Switch To Base` 按钮
- 类型：次按钮（仅链不匹配时显示）
- 行为：调用 `wallet_switchEthereumChain`

4. 元素：`Sign In` 按钮
- 类型：主按钮
- 行为：触发 nonce + 签名登录
- 前置：钱包已连接且已在目标 Base 网络

5. 元素：`Disconnect` 按钮
- 类型：文本按钮
- 行为：清空本地 session、回到未登录状态

6. 元素：`Wallet Chip`
- 显示：短地址（例：`0x12ab...34cd`）

7. 元素：`Network Badge`
- 状态：`Base Ready` / `Wrong Network`

8. 元素：`Session Badge`
- 状态：`Signed In` / `Not Signed In` / `Token Expiring`

## 5.2 Mode Intro（模式说明区）

1. 卡片：`Private Supplier`
- 要点：本地导入、非公开、无链上费用

2. 卡片：`Commercial Supplier`
- 要点：链上注册、年费、公开可检索、提现分账

3. 卡片：`Why Base`
- 要点：统一结算链、降低决策复杂度、提升可审计性

## 5.3 Commercial Workspace（商业供应商区）

### A. Commercial Summary

1. 字段：`Annual Fee (USDC)`（只读，来自 `annualFeeUsdc`）
2. 字段：`Withdraw Fee (%)`（只读，来自 `getFeeConfig()`）
3. 字段：`Treasury`（只读，来自 `getFeeConfig()`）
4. 字段：`My Supplier Count`（只读，来自 `getSupplierCountByOwner`）

### B. My Commercial Suppliers

1. 表格列：
- `supplierId`
- `supplierIdHash`
- `profileAddress`
- `owner`
- `expiry`
- `suspended`
- `active`（由 `!suspended && expiry >= now` 推导）

2. 行级动作：
- `Open`：进入详情
- `Renew`：打开续费确认

3. 查询动作：
- `Refresh List`
- 分页参数：`offset` + `limit`

### C. Register Commercial Supplier

1. 输入：`supplierId`
- 必填
- 前端校验：长度 3-64、字符集 `[a-z0-9._-]`

2. 输入：`metadataURI`
- 必填
- 前端校验：必须是合法 URL

3. 输入：`USDC Authorization Payload`
- 字段：`validAfter` `validBefore` `nonce` `v` `r` `s`
- 说明：用于 `receiveWithAuthorization`

4. 按钮：`Sign Authorization`
- 作用：生成并填充授权参数

5. 按钮：`Register & Pay`
- 作用：调用 `registerCommercialWithAuthorization(...)`
- 成功反馈：展示 tx hash + 新 profile 地址

### D. Supplier Detail（选中单个供应商）

1. 只读字段：
- `supplierId`
- `supplierIdHash`
- `profileAddress`
- `expiry`
- `active`

2. 操作：`Update MetadataURI`
- 输入：`metadataURI`
- 按钮：`Save Metadata`
- 调用：`SupplierProfile.setMetadataURI(...)`

3. 操作：`Transfer Owner`
- 输入：`newOwner`
- 按钮：`Transfer Owner`
- 调用：`SupplierProfile.transferOwner(...)`
- 强提醒：不可撤销

4. 操作：`Withdraw`
- 输入：`amount`、`to`
- 预估按钮：`Preview Fee`
- 执行按钮：`Withdraw`
- 调用：`previewWithdraw` + `withdraw`

5. 操作：`Withdraw All`
- 输入：`to`
- 按钮：`Withdraw All`
- 调用：`withdrawAll`

## 5.4 Private Workspace（私人供应商区）

1. 标签页：`Import File`
- 元素：文件选择器（JSON）
- 按钮：`Import`

2. 标签页：`Import URL`
- 元素：`profileUrl` 输入
- 按钮：`Fetch & Import`

3. 标签页：`Local Update`
- 元素：本地 profile 摘要显示
- 按钮：`Refresh Local Profile`

4. 限制说明（常驻）：
- `此区块不会触发链上交易，不会进入公开商业市场。`

## 5.5 Transaction & Event Log（日志区）

1. 日志分类：
- `wallet`
- `signature`
- `transaction`
- `api`

2. 每条日志字段：
- 时间
- 动作
- 状态（pending/success/failed）
- 摘要
- 可展开详情（错误原因、tx hash、revert name）

3. 控件：
- `Clear`
- `Copy Latest Error`
4. 列表容量：
- 默认展示最近 `20` 条，支持“加载更多”。

---

## 6. 样式与视觉规范（与现站一致，专业化增强）

## 6.1 视觉方向

1. 延续当前站点“浅色 + 渐变 + 卡片”风格。
2. 强化状态可读性（徽章、边框、留白、分组标题）。
3. 商业区与私人区颜色轻微区分，避免误操作。

## 6.2 设计变量（可在 `styles.css` 扩展）

1. `--vendor-surface: #ffffff`
2. `--vendor-surface-muted: #f8fafc`
3. `--vendor-border: #dbe3f0`
4. `--vendor-commercial-accent: #1d4ed8`
5. `--vendor-private-accent: #0f766e`
6. `--vendor-success: #15803d`
7. `--vendor-warning: #b45309`
8. `--vendor-error: #b91c1c`

## 6.3 组件风格细则

1. 卡片
- 圆角 `14px`
- 边框 `1px solid var(--vendor-border)`
- 阴影轻量，避免营销页过强动效

2. 按钮层级
- `Primary`：会改变链上状态的动作
- `Secondary`：读取/刷新/辅助
- `Danger`：Owner 转移、不可逆操作

3. 状态徽章
- 统一胶囊形态，最小高度 `24px`
- 使用实色文字 + 低饱和背景

4. 表单与校验
- 失焦校验 + 提交前校验双保险
- 错误信息紧贴输入框，不使用全局弹窗打断

5. 日志面板
- 等宽字体展示 tx hash / 地址
- 支持水平滚动，不截断关键字段

## 6.4 响应式

1. `>= 1200px`：左侧列表 + 右侧详情（双栏）
2. `768px - 1199px`：上下布局，详情折叠
3. `< 768px`：单列，主动作按钮置顶固定

图片占位符：

- `[Image Placeholder: commercial-detail-desktop.png]`
- `[Image Placeholder: private-workspace-mobile.png]`

---

## 7. 前端状态机（强约束）

`INIT -> WALLET_CONNECTED -> BASE_READY -> AUTH_READY -> AUTHENTICATED -> DATA_READY -> TX_PENDING -> TX_CONFIRMED/TX_FAILED`

约束规则：

1. 未进入 `BASE_READY`，链上写按钮全部禁用。
2. `TX_PENDING` 时，当前动作按钮和同类按钮统一禁用，防重入。
3. 任意 `chainChanged`/`accountsChanged` 事件触发后，回退到 `WALLET_CONNECTED` 并要求重新认证。

---

## 8. 合约能力到界面动作映射

## 8.1 ProtocolRegistry

1. 读：
- `annualFeeUsdc()`
- `getFeeConfig()`
- `getSupplierCountByOwner(address)`
- `getSupplierHashesByOwner(address, offset, limit)`
- `getSupplier(bytes32)`
- `isSupplierActive(bytes32)`

2. 写：
- `registerCommercialWithAuthorization(...)`
- `renewCommercialWithAuthorization(...)`

## 8.2 SupplierProfile

1. 读：
- `owner()`
- `metadataURI()`
- `previewWithdraw(uint256)`

2. 写：
- `setMetadataURI(...)`
- `transferOwner(...)`
- `withdraw(amount, to)`
- `withdrawAll(to)`

---

## 9. MVP（功能完备最小集合）

1. 能连接 MetaMask，并强制切到 Base 目标网络。
2. 能完成签名登录并展示会话状态。
3. 能读取费用配置与我的商业供应商列表。
4. 能注册商业供应商（授权支付 + 上链）。
5. 能续费商业供应商（一年一续）。
6. 能修改 metadataURI。
7. 能转移 owner。
8. 能预估并执行提现。
9. 能导入私人供应商（文件 / URL）并本地更新。
10. 新增文案全部走 i18n，不硬编码中英文混排。

---

## 10. 建议落地顺序

1. 先改页面骨架：状态栏 + 模式说明 + 双工作区。
2. 再接入 Base 网络强制逻辑（含 `wallet_addEthereumChain` 兜底）。
3. 再接入合约读写动作与日志系统。
4. 最后补齐私人供应商区与 i18n 词条。

---

## 11. 多语言与文案策略

1. 默认语言跟随浏览器，保留现有 i18n 机制。
2. `vendor-console` 新增文案全部进入 i18n 词典，不硬编码中英混排。
3. 文案风格保持“短句 + 明确动作 + 明确前置条件”。

关键文案建议：

- `Wrong network. Please switch to Base Sepolia.`
- `This action requires on-chain signature and transaction confirmation.`
- `Private suppliers are local-only and not listed in the public marketplace.`

---

## 12. API 协作边界（与链上分工）

1. 链上负责商业供应商身份与费用真相（注册、续费、有效性、提现分账）。
2. API 保留最小职责：
- nonce/challenge 与会话鉴权
- 审计日志上报与检索
- 私人供应商本地配置同步（可选）
3. 前端必须优先展示链上状态，API 只作为协作层，不覆盖合约状态。

---

## 13. 设计资产占位（交付视觉设计）

- `[Image Placeholder: vendor-console-hero-banner.png]`
- `[Image Placeholder: supplier-mode-overview.png]`
- `[Image Placeholder: supplier-mode-cards.png]`
- `[Image Placeholder: commercial-workspace-empty-state.png]`
- `[Image Placeholder: tx-status-timeline-icons.svg]`
