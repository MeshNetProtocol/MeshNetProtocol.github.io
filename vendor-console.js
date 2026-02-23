(function () {
    const PRODUCTION_API_BASE_URL = "https://openmesh-api.ribencong.workers.dev";
    const LEGACY_API_HOSTS = ["market.openmesh.network"];

    const STORAGE_KEYS = {
        apiBaseUrl: "market_api_base_url",
        accessToken: "market_api_access_token",
    };

    const state = {
        apiBaseUrl: "",
        walletAddress: "",
        chainId: null,
        accessToken: sessionStorage.getItem(STORAGE_KEYS.accessToken) || "",
        supplier: null,
        supplierRole: null,
        managers: [],
    };

    const dom = {};

    function getDefaultApiBaseUrl() {
        if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
            return "http://127.0.0.1:8787";
        }
        return PRODUCTION_API_BASE_URL;
    }

    function isLegacyApiBaseUrl(url) {
        if (!url) return false;
        try {
            const parsed = new URL(url);
            return LEGACY_API_HOSTS.includes(parsed.hostname.toLowerCase());
        } catch {
            return false;
        }
    }

    function normalizeApiBaseUrl(url) {
        const trimmed = String(url || "").trim();
        if (!trimmed) return "";
        try {
            const parsed = new URL(trimmed);
            parsed.pathname = "";
            parsed.search = "";
            parsed.hash = "";
            return parsed.toString().replace(/\/$/, "");
        } catch {
            return "";
        }
    }

    function setTextStatus(element, message, level) {
        if (!element) return;
        element.textContent = message;
        element.classList.remove("success", "error", "muted");
        element.classList.add(level || "muted");
    }

    function safeJsonParse(input) {
        try {
            return JSON.parse(input);
        } catch {
            return null;
        }
    }

    function shortAddress(address) {
        if (!address || address.length < 10) return address || "";
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    function hexChainIdToNumber(chainHex) {
        if (!chainHex || typeof chainHex !== "string") return null;
        const num = Number.parseInt(chainHex, 16);
        if (!Number.isFinite(num)) return null;
        return num;
    }

    function toHexChainId(chainId) {
        return `0x${Number(chainId).toString(16)}`;
    }

    function getApiBaseUrl() {
        return state.apiBaseUrl;
    }

    function setApiBaseUrl(url, save) {
        const normalized = normalizeApiBaseUrl(url);
        if (!normalized) {
            setTextStatus(dom.apiBaseStatus, "API 地址无效，请输入完整 URL。", "error");
            return false;
        }
        state.apiBaseUrl = normalized;
        if (dom.apiBaseInput) dom.apiBaseInput.value = normalized;
        if (save) localStorage.setItem(STORAGE_KEYS.apiBaseUrl, normalized);
        setTextStatus(dom.apiBaseStatus, `当前 API：${normalized}`, "success");
        return true;
    }

    function getErrorMessage(error, fallback) {
        if (!error) return fallback;
        if (typeof error === "string") return error;
        if (error.message) return error.message;
        if (error.data && error.data.error) return error.data.error;
        return fallback;
    }

    async function apiRequest(path, options) {
        const opts = options || {};
        const baseUrl = getApiBaseUrl();
        if (!baseUrl) throw new Error("请先配置 API 地址。");
        const url = `${baseUrl}${path}`;
        const headers = Object.assign({}, opts.headers || {});
        if (opts.body !== undefined) headers["Content-Type"] = "application/json";
        if (opts.auth !== false && state.accessToken) {
            headers.Authorization = `Bearer ${state.accessToken}`;
        }

        const response = await fetch(url, {
            method: opts.method || "GET",
            headers,
            body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
        });
        const text = await response.text();
        const data = text ? safeJsonParse(text) : null;
        if (!response.ok) {
            const error = new Error(data?.error || `HTTP ${response.status}`);
            error.status = response.status;
            error.data = data;
            throw error;
        }
        return data;
    }

    function saveToken(token) {
        state.accessToken = token || "";
        if (state.accessToken) {
            sessionStorage.setItem(STORAGE_KEYS.accessToken, state.accessToken);
        } else {
            sessionStorage.removeItem(STORAGE_KEYS.accessToken);
        }
    }

    function clearSupplierUi() {
        state.supplier = null;
        state.supplierRole = null;
        state.managers = [];

        if (dom.supplierManageCard) dom.supplierManageCard.classList.add("hidden");
        if (dom.supplierConfigCard) dom.supplierConfigCard.classList.add("hidden");
        if (dom.supplierManagerCard) dom.supplierManagerCard.classList.add("hidden");
        if (dom.supplierCreateCard) dom.supplierCreateCard.classList.add("hidden");
        if (dom.managerList) dom.managerList.innerHTML = "";
        if (dom.supplierSummary) dom.supplierSummary.textContent = "尚未加载供应商信息";
    }

    function clearAuthState() {
        saveToken("");
        clearSupplierUi();
        setTextStatus(dom.authStatus, "未登录", "muted");
    }

    function showCreateCard(show) {
        if (!dom.supplierCreateCard) return;
        dom.supplierCreateCard.classList.toggle("hidden", !show);
    }

    function renderManagerList(managers, canManage) {
        if (!dom.managerList) return;
        if (!managers || managers.length === 0) {
            dom.managerList.innerHTML = '<p class="vendor-text muted">暂无 manager</p>';
            return;
        }
        dom.managerList.innerHTML = managers.map(item => {
            const removeBtn = canManage
                ? `<button class="btn btn-danger remove-manager-btn" type="button" data-wallet="${item.manager_wallet}">移除</button>`
                : "";
            return `
                <div class="manager-item">
                    <div>
                        <div class="manager-wallet">${item.manager_wallet}</div>
                        <div class="manager-meta">role=${item.role} · created=${item.created_at}</div>
                    </div>
                    ${removeBtn}
                </div>
            `;
        }).join("");
    }

    function renderSupplierData(payload) {
        const role = payload.role;
        const supplier = payload.supplier;
        const managers = payload.managers || [];
        state.supplier = supplier;
        state.supplierRole = role;
        state.managers = managers;

        if (dom.supplierManageCard) dom.supplierManageCard.classList.remove("hidden");
        if (dom.supplierConfigCard) dom.supplierConfigCard.classList.remove("hidden");
        if (dom.supplierManagerCard) {
            dom.supplierManagerCard.classList.toggle("hidden", role !== "owner");
        }
        showCreateCard(false);

        if (dom.supplierSummary) {
            dom.supplierSummary.textContent = `supplier_id=${supplier.id} | role=${role}${payload.manager_role ? `(${payload.manager_role})` : ""} | owner=${supplier.owner_wallet}`;
        }
        if (dom.supplierNameInput) dom.supplierNameInput.value = supplier.name || "";
        if (dom.supplierDescInput) dom.supplierDescInput.value = supplier.description || "";
        if (dom.supplierStatusInput) dom.supplierStatusInput.value = supplier.status || "active";
        renderManagerList(managers, role === "owner");
    }

    async function refreshSupplierProfile() {
        if (!state.accessToken) {
            clearSupplierUi();
            return;
        }
        try {
            const payload = await apiRequest("/api/v1/suppliers/me");
            renderSupplierData(payload);
            setTextStatus(dom.supplierProfileStatus, "供应商信息已刷新。", "success");
        } catch (error) {
            if (error.status === 404) {
                clearSupplierUi();
                showCreateCard(true);
                setTextStatus(dom.createSupplierStatus, "当前钱包尚未绑定供应商，请先创建。", "muted");
                return;
            }
            setTextStatus(dom.supplierProfileStatus, getErrorMessage(error, "刷新供应商信息失败。"), "error");
        }
    }

    async function refreshSupplierConfig() {
        if (!state.accessToken) return;
        try {
            const payload = await apiRequest("/api/v1/suppliers/me/config");
            if (dom.configJsonInput) {
                dom.configJsonInput.value = JSON.stringify(payload.config || {}, null, 2);
            }
            setTextStatus(dom.supplierConfigStatus, `配置已刷新，最近更新：${payload.updated_at || "-"}`, "success");
        } catch (error) {
            setTextStatus(dom.supplierConfigStatus, getErrorMessage(error, "刷新配置失败。"), "error");
        }
    }

    async function refreshAllSupplierData() {
        await refreshSupplierProfile();
        if (state.supplier) {
            await refreshSupplierConfig();
        }
    }

    async function getEthereumProvider() {
        if (!window.ethereum) {
            throw new Error("未检测到 MetaMask（window.ethereum 不存在）。");
        }
        return window.ethereum;
    }

    async function updateWalletState() {
        const provider = await getEthereumProvider();
        const accounts = await provider.request({ method: "eth_accounts" });
        const chainHex = await provider.request({ method: "eth_chainId" });
        state.walletAddress = Array.isArray(accounts) && accounts[0] ? String(accounts[0]).toLowerCase() : "";
        state.chainId = hexChainIdToNumber(chainHex);
    }

    function renderWalletState() {
        if (!state.walletAddress) {
            setTextStatus(dom.walletStatus, "钱包未连接", "muted");
            return;
        }
        setTextStatus(dom.walletStatus, `已连接钱包：${shortAddress(state.walletAddress)} | chainId=${state.chainId || "-"}`, "success");
    }

    async function connectWallet() {
        const provider = await getEthereumProvider();
        await provider.request({ method: "eth_requestAccounts" });
        await updateWalletState();
        renderWalletState();
        setTextStatus(dom.authStatus, "钱包已连接，请点击“签名登录”。", "muted");
    }

    function buildSiweMessage(args) {
        return `${args.domain} wants you to sign in with your Ethereum account:
${args.address}

Sign in to OpenMesh Market.

URI: ${args.uri}
Version: 1
Chain ID: ${args.chainId}
Nonce: ${args.nonce}
Issued At: ${args.issuedAt}
Expiration Time: ${args.expirationTime}`;
    }

    async function signMessage(provider, address, message) {
        try {
            return await provider.request({
                method: "personal_sign",
                params: [message, address],
            });
        } catch {
            return await provider.request({
                method: "personal_sign",
                params: [address, message],
            });
        }
    }

    async function ensureAllowedChain(provider, allowedChainIds) {
        if (!allowedChainIds || allowedChainIds.length === 0) return;
        if (allowedChainIds.includes(state.chainId)) return;
        const target = Number(allowedChainIds[0]);
        await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: toHexChainId(target) }],
        });
        const chainHex = await provider.request({ method: "eth_chainId" });
        state.chainId = hexChainIdToNumber(chainHex);
        if (!allowedChainIds.includes(state.chainId)) {
            throw new Error(`当前链 ${state.chainId} 不在允许列表 ${allowedChainIds.join(",")} 中。`);
        }
    }

    async function signIn() {
        const provider = await getEthereumProvider();
        if (!state.walletAddress) {
            await connectWallet();
        }

        const noncePayload = await apiRequest("/api/v1/auth/nonce", { auth: false });
        await ensureAllowedChain(provider, noncePayload.chain_ids || []);

        const issuedAt = new Date();
        const expirationTime = new Date(issuedAt.getTime() + 5 * 60 * 1000);
        const message = buildSiweMessage({
            domain: noncePayload.domain,
            address: state.walletAddress,
            uri: noncePayload.uri,
            chainId: state.chainId,
            nonce: noncePayload.nonce,
            issuedAt: issuedAt.toISOString(),
            expirationTime: expirationTime.toISOString(),
        });
        const signature = await signMessage(provider, state.walletAddress, message);
        const verifyPayload = await apiRequest("/api/v1/auth/verify", {
            method: "POST",
            auth: false,
            body: {
                message,
                signature,
            },
        });
        saveToken(verifyPayload.access_token);
        setTextStatus(dom.authStatus, `登录成功：${shortAddress(verifyPayload.wallet)}（${verifyPayload.expires_in}s）`, "success");
        await refreshAllSupplierData();
    }

    async function validateExistingToken() {
        if (!state.accessToken) return false;
        try {
            const payload = await apiRequest("/api/v1/auth/me");
            setTextStatus(dom.authStatus, `已登录：${shortAddress(payload.wallet)}，token 到期 ${payload.token_expires_at}`, "success");
            return true;
        } catch {
            clearAuthState();
            setTextStatus(dom.authStatus, "本地 token 已失效，请重新签名登录。", "error");
            return false;
        }
    }

    async function createSupplier() {
        const name = dom.createSupplierNameInput ? dom.createSupplierNameInput.value.trim() : "";
        const description = dom.createSupplierDescInput ? dom.createSupplierDescInput.value.trim() : "";
        if (!name) {
            setTextStatus(dom.createSupplierStatus, "供应商名称不能为空。", "error");
            return;
        }
        try {
            await apiRequest("/api/v1/suppliers", {
                method: "POST",
                body: { name, description },
            });
            setTextStatus(dom.createSupplierStatus, "供应商创建成功。", "success");
            await refreshAllSupplierData();
        } catch (error) {
            setTextStatus(dom.createSupplierStatus, getErrorMessage(error, "创建供应商失败。"), "error");
        }
    }

    async function saveSupplierProfile() {
        if (!state.supplier) {
            setTextStatus(dom.supplierProfileStatus, "当前无可更新的供应商。", "error");
            return;
        }
        const name = dom.supplierNameInput ? dom.supplierNameInput.value.trim() : "";
        const description = dom.supplierDescInput ? dom.supplierDescInput.value.trim() : "";
        const status = dom.supplierStatusInput ? dom.supplierStatusInput.value : "active";
        if (!name) {
            setTextStatus(dom.supplierProfileStatus, "供应商名称不能为空。", "error");
            return;
        }
        try {
            await apiRequest("/api/v1/suppliers/me", {
                method: "PATCH",
                body: { name, description, status },
            });
            setTextStatus(dom.supplierProfileStatus, "供应商资料更新成功。", "success");
            await refreshSupplierProfile();
        } catch (error) {
            setTextStatus(dom.supplierProfileStatus, getErrorMessage(error, "更新供应商资料失败。"), "error");
        }
    }

    async function saveSupplierConfig() {
        if (!dom.configJsonInput) return;
        const raw = dom.configJsonInput.value.trim();
        if (!raw) {
            setTextStatus(dom.supplierConfigStatus, "配置不能为空。", "error");
            return;
        }
        const parsed = safeJsonParse(raw);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            setTextStatus(dom.supplierConfigStatus, "配置必须是 JSON 对象。", "error");
            return;
        }
        try {
            await apiRequest("/api/v1/suppliers/me/config", {
                method: "PUT",
                body: parsed,
            });
            setTextStatus(dom.supplierConfigStatus, "配置保存成功。", "success");
            await refreshSupplierConfig();
        } catch (error) {
            setTextStatus(dom.supplierConfigStatus, getErrorMessage(error, "保存配置失败。"), "error");
        }
    }

    async function addManager() {
        const wallet = dom.managerWalletInput ? dom.managerWalletInput.value.trim() : "";
        const role = dom.managerRoleInput ? dom.managerRoleInput.value.trim() : "manager";
        if (!wallet) {
            setTextStatus(dom.supplierManagerStatus, "请输入 manager 钱包地址。", "error");
            return;
        }
        try {
            const payload = await apiRequest("/api/v1/suppliers/me/managers", {
                method: "POST",
                body: { wallet, role: role || "manager" },
            });
            state.managers = payload.managers || [];
            renderManagerList(state.managers, true);
            setTextStatus(dom.supplierManagerStatus, "Manager 添加成功。", "success");
            if (dom.managerWalletInput) dom.managerWalletInput.value = "";
        } catch (error) {
            setTextStatus(dom.supplierManagerStatus, getErrorMessage(error, "添加 manager 失败。"), "error");
        }
    }

    async function removeManager(wallet) {
        try {
            const payload = await apiRequest(`/api/v1/suppliers/me/managers/${encodeURIComponent(wallet)}`, {
                method: "DELETE",
            });
            state.managers = payload.managers || [];
            renderManagerList(state.managers, true);
            setTextStatus(dom.supplierManagerStatus, "Manager 已移除。", "success");
        } catch (error) {
            setTextStatus(dom.supplierManagerStatus, getErrorMessage(error, "移除 manager 失败。"), "error");
        }
    }

    function registerWalletEvents() {
        if (!window.ethereum || !window.ethereum.on) return;
        window.ethereum.on("accountsChanged", async function () {
            await updateWalletState();
            renderWalletState();
            clearAuthState();
            setTextStatus(dom.authStatus, "检测到钱包账户变化，请重新签名登录。", "muted");
        });
        window.ethereum.on("chainChanged", async function () {
            await updateWalletState();
            renderWalletState();
            clearAuthState();
            setTextStatus(dom.authStatus, "检测到网络变化，请重新签名登录。", "muted");
        });
    }

    function bindVendorActions() {
        if (dom.saveApiBaseBtn) {
            dom.saveApiBaseBtn.addEventListener("click", function () {
                setApiBaseUrl(dom.apiBaseInput ? dom.apiBaseInput.value : "", true);
            });
        }

        if (dom.connectWalletBtn) {
            dom.connectWalletBtn.addEventListener("click", async function () {
                try {
                    await connectWallet();
                } catch (error) {
                    setTextStatus(dom.walletStatus, getErrorMessage(error, "连接钱包失败。"), "error");
                }
            });
        }

        if (dom.signInBtn) {
            dom.signInBtn.addEventListener("click", async function () {
                try {
                    await signIn();
                } catch (error) {
                    setTextStatus(dom.authStatus, getErrorMessage(error, "签名登录失败。"), "error");
                }
            });
        }

        if (dom.logoutBtn) {
            dom.logoutBtn.addEventListener("click", function () {
                clearAuthState();
                setTextStatus(dom.authStatus, "已退出登录。", "muted");
                showCreateCard(false);
            });
        }

        if (dom.createSupplierBtn) {
            dom.createSupplierBtn.addEventListener("click", createSupplier);
        }
        if (dom.refreshSupplierBtn) {
            dom.refreshSupplierBtn.addEventListener("click", refreshSupplierProfile);
        }
        if (dom.saveSupplierProfileBtn) {
            dom.saveSupplierProfileBtn.addEventListener("click", saveSupplierProfile);
        }
        if (dom.refreshConfigBtn) {
            dom.refreshConfigBtn.addEventListener("click", refreshSupplierConfig);
        }
        if (dom.saveConfigBtn) {
            dom.saveConfigBtn.addEventListener("click", saveSupplierConfig);
        }
        if (dom.addManagerBtn) {
            dom.addManagerBtn.addEventListener("click", addManager);
        }
        if (dom.managerList) {
            dom.managerList.addEventListener("click", function (event) {
                const target = event.target;
                if (!(target instanceof HTMLElement)) return;
                if (!target.classList.contains("remove-manager-btn")) return;
                const wallet = target.getAttribute("data-wallet");
                if (!wallet) return;
                removeManager(wallet);
            });
        }

        document.querySelectorAll(".cta-buttons .btn").forEach((btn, idx) => {
            btn.addEventListener("click", function () {
                const targetSelector = idx === 0 ? "#vendor-console" : "#features";
                const target = document.querySelector(targetSelector);
                if (target) {
                    target.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            });
        });
    }

    async function initializeVendorConsole() {
        dom.apiBaseInput = document.getElementById("api-base-url");
        dom.saveApiBaseBtn = document.getElementById("save-api-base-btn");
        dom.apiBaseStatus = document.getElementById("api-base-status");
        dom.connectWalletBtn = document.getElementById("connect-wallet-btn");
        dom.signInBtn = document.getElementById("sign-in-btn");
        dom.logoutBtn = document.getElementById("logout-btn");
        dom.walletStatus = document.getElementById("wallet-status");
        dom.authStatus = document.getElementById("auth-status");
        dom.supplierCreateCard = document.getElementById("supplier-create-card");
        dom.createSupplierNameInput = document.getElementById("create-supplier-name");
        dom.createSupplierDescInput = document.getElementById("create-supplier-description");
        dom.createSupplierBtn = document.getElementById("create-supplier-btn");
        dom.createSupplierStatus = document.getElementById("create-supplier-status");
        dom.supplierManageCard = document.getElementById("supplier-manage-card");
        dom.supplierSummary = document.getElementById("supplier-summary");
        dom.supplierNameInput = document.getElementById("supplier-name");
        dom.supplierStatusInput = document.getElementById("supplier-status");
        dom.supplierDescInput = document.getElementById("supplier-description");
        dom.refreshSupplierBtn = document.getElementById("refresh-supplier-btn");
        dom.saveSupplierProfileBtn = document.getElementById("save-supplier-profile-btn");
        dom.supplierProfileStatus = document.getElementById("supplier-profile-status");
        dom.supplierConfigCard = document.getElementById("supplier-config-card");
        dom.configJsonInput = document.getElementById("supplier-config-json");
        dom.refreshConfigBtn = document.getElementById("refresh-config-btn");
        dom.saveConfigBtn = document.getElementById("save-config-btn");
        dom.supplierConfigStatus = document.getElementById("supplier-config-status");
        dom.supplierManagerCard = document.getElementById("supplier-manager-card");
        dom.managerWalletInput = document.getElementById("manager-wallet-input");
        dom.managerRoleInput = document.getElementById("manager-role-input");
        dom.addManagerBtn = document.getElementById("add-manager-btn");
        dom.supplierManagerStatus = document.getElementById("supplier-manager-status");
        dom.managerList = document.getElementById("manager-list");

        const savedApiBase = localStorage.getItem(STORAGE_KEYS.apiBaseUrl);
        let initialApiBase = savedApiBase || getDefaultApiBaseUrl();
        if (isLegacyApiBaseUrl(initialApiBase)) {
            initialApiBase = getDefaultApiBaseUrl();
            localStorage.setItem(STORAGE_KEYS.apiBaseUrl, initialApiBase);
            setTextStatus(dom.apiBaseStatus, `检测到旧地址，已自动切换到：${initialApiBase}`, "success");
        }
        setApiBaseUrl(initialApiBase, false);

        clearSupplierUi();
        bindVendorActions();
        registerWalletEvents();

        try {
            await updateWalletState();
            renderWalletState();
        } catch {
            setTextStatus(dom.walletStatus, "未检测到钱包连接。", "muted");
        }

        const tokenValid = await validateExistingToken();
        if (tokenValid) {
            await refreshAllSupplierData();
        } else {
            showCreateCard(false);
        }
    }

    window.MeshVendorConsole = {
        initializeVendorConsole,
    };
})();
