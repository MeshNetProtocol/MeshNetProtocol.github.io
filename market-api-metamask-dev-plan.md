# Market API + MetaMask 集成开发计划（可实施、可测试）

## 1. 项目目标与边界

### 1.1 目标
- 在 `openmesh-cli/market-api` 中新增供应商创建与“供应商管理自身配置”的 API。
- 在 `MeshNetProtocol.github.io` 中接入 MetaMask，实现对 `market-api` 的访问鉴权。
- 形成可回归测试的端到端流程：连接钱包 -> 签名登录 -> 获取令牌 -> 管理供应商配置。

### 1.2 范围
- 包含：SIWE（EIP-4361）登录、供应商 API、前端接入、安全基线。
- 不包含：复杂财务结算逻辑、跨多链统一账户体系、第三方 IAM 平台集成。

### 1.3 成功标准（总体验收）
- 用户可使用 MetaMask 完成登录并获取 token。
- 已绑定供应商的钱包可读写自己的配置；无权限钱包无法越权访问。
- 关键安全控制（nonce 防重放、签名校验、权限校验、限流）通过测试。
- 提供一组可在 CI 执行的自动化测试（单元+集成+E2E）。

---

## 2. 总体技术方案（对应方面 1：鉴权总体）

### 2.1 架构决策
- 鉴权模式：`MetaMask 签名（SIWE） -> market-api 验签 -> JWT/Session Token`。
- 权限模式：钱包地址为身份主键，后端维护供应商与角色映射（owner/manager）。
- API 访问：前端统一带 `Authorization: Bearer <token>` 调用 `market-api`。

### 2.2 核心流程
1. 前端请求 `GET /auth/nonce`。
2. 后端返回一次性 nonce（短时有效）。
3. 前端调用 MetaMask 签名 SIWE message。
4. 前端提交 `POST /auth/verify`（message + signature）。
5. 后端验签成功后签发 access token（可选 refresh token）。
6. 前端携带 token 调用供应商相关 API。

### 2.3 数据模型（最小集）
- `wallet_sessions`: nonce、wallet_address、expired_at、used_at。
- `suppliers`: id、name、owner_wallet、status、created_at。
- `supplier_managers`: supplier_id、manager_wallet、role。
- `supplier_configs`: supplier_id、config_json、updated_at、updated_by_wallet。

### 2.4 里程碑 A（鉴权基础）

#### 开发步骤
1. 新增 `auth/nonce` 与 `auth/verify` 接口。
2. 实现 SIWE message 校验（domain、uri、chainId、nonce、issuedAt、expirationTime）。
3. 实现 nonce 一次性消费机制与过期策略。
4. 实现 token 签发与中间件鉴权。

#### 测试步骤
1. 单元测试：签名校验函数、nonce 状态机（未使用/已使用/已过期）。
2. 集成测试：完整登录流程（成功、过期 nonce、重复 nonce、错误签名）。
3. 安全测试：重放攻击测试（同签名二次提交必须失败）。

#### 验收标准
- 正常登录成功率 100%（测试集）。
- 错误签名、过期 nonce、重放请求均返回预期 401/400。
- access token 可访问受保护接口，过期后不可访问。

#### 交付物
- `market-api` 鉴权接口说明文档。
- 鉴权中间件与测试报告（测试命令、通过截图或日志）。

---

## 3. 供应商 API 开发计划（对应方面 2：供应商 API 设计）

### 3.1 API 清单（建议最小版本）
- `POST /suppliers`：创建供应商（首次绑定 owner wallet）。
- `GET /suppliers/me`：获取当前钱包所属供应商信息。
- `PATCH /suppliers/me`：更新供应商基本信息（例如名称、公开简介）。
- `GET /suppliers/me/config`：读取供应商配置。
- `PUT /suppliers/me/config`：更新供应商配置。
- `POST /suppliers/me/managers`：新增 manager（可选，owner only）。
- `DELETE /suppliers/me/managers/:wallet`：移除 manager（可选，owner only）。

### 3.2 权限规则
- `owner`：可管理供应商资料、配置、manager。
- `manager`：可管理配置，不可变更 owner 与 manager 列表（可按业务收紧）。
- 未绑定供应商的钱包：仅允许调用创建接口或只读公共接口。

### 3.3 里程碑 B（供应商域能力）

#### 开发步骤
1. 创建供应商相关数据表与迁移脚本。
2. 实现 `/suppliers` 与 `/suppliers/me*` 接口。
3. 增加 RBAC 中间件（owner/manager）。
4. 统一错误码（未授权、资源不存在、参数错误、冲突）。

#### 测试步骤
1. 单元测试：权限判断函数（owner/manager/anonymous）。
2. 集成测试：同一 token 访问不同接口的权限表现。
3. 回归测试：供应商配置更新后读取一致性。

#### 验收标准
- owner/manager/anonymous 的权限结果与预期矩阵一致。
- 任意钱包无法操作不属于自己的供应商数据。
- 配置写入与读取一致，版本字段或更新时间正确变化。

#### 交付物
- OpenAPI/接口文档更新。
- 权限矩阵文档（接口 x 角色）。

---

## 4. 前端接入与交互计划（对应方面 3：前端接入流程）

### 4.1 页面与模块
- `WalletConnect`：连接 MetaMask、显示地址与链 ID。
- `AuthLogin`：获取 nonce、触发签名、提交 verify、存储 token。
- `SupplierDashboard`：展示 `GET /suppliers/me` 信息。
- `SupplierConfigForm`：编辑并提交 `PUT /suppliers/me/config`。

### 4.2 前端状态流
1. 用户点击“连接钱包”。
2. 检查网络链 ID（不符则提示切换）。
3. 发起 nonce 请求并签名。
4. 完成 verify 后保存 token（建议内存 + 短期持久化策略）。
5. 使用 token 拉取供应商资料与配置。
6. 处理 token 过期：自动跳转重新签名或 refresh 流程。

### 4.3 里程碑 C（前端可用版本）

#### 开发步骤
1. 集成 EIP-1193 provider（MetaMask）与账户/网络监听。
2. 封装 `authClient` 与 `marketApiClient`（自动注入 token）。
3. 完成供应商状态页与配置编辑页。
4. 增加异常提示：拒绝签名、切链失败、token 失效。

#### 测试步骤
1. 组件测试：钱包连接状态、错误提示渲染。
2. E2E 测试：连接钱包 -> 登录 -> 修改配置 -> 刷新后验证。
3. 兼容性测试：主流 Chromium 环境下 MetaMask 扩展流程。

#### 验收标准
- 用户可在 1 次会话内完成登录与配置更新闭环。
- 页面可正确处理拒签、断网、401 返回并给出可操作提示。
- E2E 用例稳定通过（至少连续 3 次）。

#### 交付物
- 前端页面与 API 调用封装。
- E2E 脚本与执行说明。

---

## 5. 安全与运维计划（对应方面 4：安全要点）

### 5.1 安全控制清单
- nonce 一次性 + TTL（例如 5 分钟）。
- SIWE 严格字段校验（domain/uri/chainId/nonce/time window）。
- access token 短效（例如 15 分钟）+ refresh 机制（可选）。
- CORS 白名单仅允许 `MeshNetProtocol.github.io` 域名。
- 接口限流（按 IP + 钱包地址维度）。
- 审计日志：登录、验签失败、权限拒绝、配置变更。

### 5.2 里程碑 D（安全加固）

#### 开发步骤
1. 增加统一安全中间件（限流、CORS、安全响应头）。
2. 增加审计日志字段并接入日志系统。
3. 对敏感操作（如变更 owner）引入二次签名（如启用 manager 管理时）。
4. 编写安全基线检查脚本（配置项完整性）。

#### 测试步骤
1. 安全测试：重放、伪造 domain、跨域请求、暴力调用。
2. 稳定性测试：高并发下 nonce 与 token 行为。
3. 审计测试：关键行为日志是否完整且可追踪。

#### 验收标准
- 关键攻击路径均被拦截并记录日志。
- 日志可追溯到钱包地址、请求 ID、接口与结果码。
- 限流生效且不影响正常用户流量。

#### 交付物
- 安全测试报告。
- 运行手册（安全配置项、告警阈值、日志字段说明）。

---

## 6. 分阶段排期建议（可执行顺序）

1. 里程碑 A：鉴权基础（3-5 天）
2. 里程碑 B：供应商 API（4-6 天）
3. 里程碑 C：前端接入（4-6 天）
4. 里程碑 D：安全加固（2-4 天）

> 建议先完成 A+B+C 形成可用闭环，再进入 D。

---

## 7. 主流程测试方案（测试用例最小集）

以下用例仅用于验证主流程是否“可用可走通”，不追求全覆盖。

### 7.1 用例 1：MetaMask 签名登录成功
1. 前置条件：浏览器已安装 MetaMask；`market-api` 可访问；配置正确链 ID。
2. 操作步骤：连接钱包 -> 获取 nonce -> 签名 -> 调用 `/api/v1/auth/verify`。
3. 预期结果：返回 `200`，包含 `access_token`；调用 `/api/v1/auth/me` 返回当前钱包地址。

### 7.2 用例 2：首次创建供应商成功
1. 前置条件：使用未绑定供应商的钱包，已完成登录。
2. 操作步骤：调用 `POST /api/v1/suppliers` 提交 name/description。
3. 预期结果：返回 `201`；`GET /api/v1/suppliers/me` 返回 `role=owner` 且 supplier 信息正确。

### 7.3 用例 3：Owner 更新资料与配置成功
1. 前置条件：owner 钱包已登录且已有 supplier。
2. 操作步骤：调用 `PATCH /api/v1/suppliers/me` 更新资料；调用 `PUT /api/v1/suppliers/me/config` 更新配置。
3. 预期结果：两个接口均返回 `200`；随后 `GET /api/v1/suppliers/me/config` 返回最新配置。

### 7.4 用例 4：Owner 添加 Manager，Manager 可改配置
1. 前置条件：owner 与 manager 两个钱包均可登录。
2. 操作步骤：owner 调用 `POST /api/v1/suppliers/me/managers` 添加 manager；manager 登录后调用 `PUT /api/v1/suppliers/me/config`。
3. 预期结果：添加 manager 返回 `200`；manager 改配置成功返回 `200`。

### 7.5 用例 5：Manager 不能改 Owner 资料与管理名单
1. 前置条件：manager 已绑定到 supplier。
2. 操作步骤：manager 调用 `PATCH /api/v1/suppliers/me`，以及 `POST /api/v1/suppliers/me/managers`。
3. 预期结果：均返回 `403`（`SUPPLIER_FORBIDDEN`）。

### 7.6 用例 6：安全主流程（重放/CORS/限流）
1. 前置条件：开启安全配置（CORS 白名单、限流、审计日志）。
2. 操作步骤：
   - 重放同一个 nonce 的 verify 请求；
   - 用非白名单 Origin 调用 API；
   - 连续触发 nonce 超过阈值。
3. 预期结果：
   - 重放返回 `401`（`NONCE_ALREADY_USED`）；
   - 非白名单返回 `403`（`CORS_ORIGIN_FORBIDDEN`）；
   - 超阈值返回 `429`（`RATE_LIMITED`）。

---

## 8. 风险与应对

- 风险：前端钱包兼容差异导致登录失败。
- 应对：优先 MetaMask 主流程，记录 provider 错误码并做降级提示。

- 风险：链 ID 不一致导致签名不可用。
- 应对：登录前强校验链 ID，提供“一键切链”引导。

- 风险：权限模型后期扩展复杂。
- 应对：先落地 owner/manager 两级 RBAC，保留角色扩展字段。

---

## 9. 执行检查清单（落地用）

1. 确认 `market-api` 数据库迁移与环境变量模板。
2. 完成 SIWE 鉴权接口与 token 中间件。
3. 完成供应商 API 与 RBAC。
4. 完成前端 MetaMask 登录与供应商配置页面。
5. 补齐单元/集成/E2E 测试并接入 CI。
6. 完成安全加固与审计日志。
