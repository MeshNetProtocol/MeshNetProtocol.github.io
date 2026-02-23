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

    function getLanguageBucket(bucketName) {
        const lang = window.i18n && typeof window.i18n.getCurrentLanguage === "function"
            ? window.i18n.getCurrentLanguage()
            : "en";
        const translations = window.i18n && window.i18n.translations ? window.i18n.translations : {};
        return translations[lang] && translations[lang][bucketName] ? translations[lang][bucketName] : {};
    }

    function formatText(template, vars) {
        if (typeof template !== "string") return "";
        if (!vars) return template;
        return template.replace(/\{(\w+)\}/g, function (_, key) {
            return Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : `{${key}}`;
        });
    }

    function tr(key, vars, fallback) {
        const runtime = getLanguageBucket("vendorRuntime");
        const template = runtime[key];
        if (typeof template === "string") {
            return formatText(template, vars);
        }
        return fallback || key;
    }

    function trPage(key, vars, fallback) {
        const page = getLanguageBucket("vendorPage");
        const template = page[key];
        if (typeof template === "string") {
            return formatText(template, vars);
        }
        return fallback || key;
    }

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
            setTextStatus(dom.apiBaseStatus, tr("apiInvalid", null, "API URL is invalid, please input a full URL."), "error");
            return false;
        }
        state.apiBaseUrl = normalized;
        if (dom.apiBaseInput) dom.apiBaseInput.value = normalized;
        if (save) localStorage.setItem(STORAGE_KEYS.apiBaseUrl, normalized);
        setTextStatus(dom.apiBaseStatus, tr("apiCurrent", { url: normalized }, `Current API: ${normalized}`), "success");
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
        if (!baseUrl) throw new Error(tr("apiNeedConfig", null, "Please configure API URL first."));
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
        if (dom.supplierSummary) dom.supplierSummary.textContent = trPage("supplierSummaryIdle", null, "Supplier data not loaded");
    }

    function clearAuthState() {
        saveToken("");
        clearSupplierUi();
        setTextStatus(dom.authStatus, trPage("authStatusIdle", null, "Not signed in"), "muted");
    }

    function showCreateCard(show) {
        if (!dom.supplierCreateCard) return;
        dom.supplierCreateCard.classList.toggle("hidden", !show);
    }

    function renderManagerList(managers, canManage) {
        if (!dom.managerList) return;
        if (!managers || managers.length === 0) {
            dom.managerList.innerHTML = `<p class="vendor-text muted">${trPage("managerEmpty", null, "No managers yet")}</p>`;
            return;
        }
        dom.managerList.innerHTML = managers.map(item => {
            const removeBtn = canManage
                ? `<button class="btn btn-danger remove-manager-btn" type="button" data-wallet="${item.manager_wallet}">${trPage("removeManagerButton", null, "Remove")}</button>`
                : "";
            return `
                <div class="manager-item">
                    <div>
                        <div class="manager-wallet">${item.manager_wallet}</div>
                        <div class="manager-meta">${tr("managerMeta", { role: item.role, created: item.created_at }, `role=${item.role} · created=${item.created_at}`)}</div>
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
            dom.supplierSummary.textContent = tr(
                "supplierSummaryLine",
                {
                    id: supplier.id,
                    role,
                    managerRole: payload.manager_role ? `(${payload.manager_role})` : "",
                    owner: supplier.owner_wallet,
                },
                `supplier_id=${supplier.id} | role=${role}${payload.manager_role ? `(${payload.manager_role})` : ""} | owner=${supplier.owner_wallet}`
            );
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
            setTextStatus(dom.supplierProfileStatus, tr("supplierRefreshed", null, "Supplier profile refreshed."), "success");
        } catch (error) {
            if (error.status === 404) {
                clearSupplierUi();
                showCreateCard(true);
                setTextStatus(dom.createSupplierStatus, tr("supplierNone", null, "Current wallet has no supplier yet. Please create one."), "muted");
                return;
            }
            setTextStatus(dom.supplierProfileStatus, getErrorMessage(error, tr("supplierRefreshFailed", null, "Failed to refresh supplier profile.")), "error");
        }
    }

    async function refreshSupplierConfig() {
        if (!state.accessToken) return;
        try {
            const payload = await apiRequest("/api/v1/suppliers/me/config");
            if (dom.configJsonInput) {
                dom.configJsonInput.value = JSON.stringify(payload.config || {}, null, 2);
            }
            setTextStatus(
                dom.supplierConfigStatus,
                tr("supplierConfigRefreshed", { time: payload.updated_at || "-" }, `Config refreshed. Last updated: ${payload.updated_at || "-"}`),
                "success"
            );
        } catch (error) {
            setTextStatus(dom.supplierConfigStatus, getErrorMessage(error, tr("supplierConfigRefreshFailed", null, "Failed to refresh config.")), "error");
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
            throw new Error(tr("walletMissingProvider", null, "MetaMask not detected (window.ethereum missing)."));
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
            setTextStatus(dom.walletStatus, tr("walletDisconnected", null, "Wallet not connected"), "muted");
            return;
        }
        setTextStatus(
            dom.walletStatus,
            tr("walletConnected", { address: shortAddress(state.walletAddress), chainId: state.chainId || "-" }, `Wallet connected: ${shortAddress(state.walletAddress)} | chainId=${state.chainId || "-"}`),
            "success"
        );
    }

    async function connectWallet() {
        const provider = await getEthereumProvider();
        await provider.request({ method: "eth_requestAccounts" });
        await updateWalletState();
        renderWalletState();
        setTextStatus(dom.authStatus, tr("authNeedSign", null, "Wallet connected, click sign-in button to continue."), "muted");
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
            throw new Error(tr("chainNotAllowed", {
                chainId: state.chainId,
                allowed: allowedChainIds.join(","),
            }, `Current chain ${state.chainId} is not in allowed list: ${allowedChainIds.join(",")}.`));
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
        setTextStatus(
            dom.authStatus,
            tr("authSignedIn", { address: shortAddress(verifyPayload.wallet), expires: verifyPayload.expires_in }, `Signed in: ${shortAddress(verifyPayload.wallet)} (${verifyPayload.expires_in}s)`),
            "success"
        );
        await refreshAllSupplierData();
    }

    async function validateExistingToken() {
        if (!state.accessToken) return false;
        try {
            const payload = await apiRequest("/api/v1/auth/me");
            setTextStatus(
                dom.authStatus,
                tr("authTokenValid", { address: shortAddress(payload.wallet), time: payload.token_expires_at }, `Signed in: ${shortAddress(payload.wallet)}, token expires at ${payload.token_expires_at}`),
                "success"
            );
            return true;
        } catch {
            clearAuthState();
            setTextStatus(dom.authStatus, tr("authTokenExpired", null, "Local token expired, please sign in again."), "error");
            return false;
        }
    }

    async function createSupplier() {
        const name = dom.createSupplierNameInput ? dom.createSupplierNameInput.value.trim() : "";
        const description = dom.createSupplierDescInput ? dom.createSupplierDescInput.value.trim() : "";
        if (!name) {
            setTextStatus(dom.createSupplierStatus, tr("supplierCreateNameRequired", null, "Supplier name is required."), "error");
            return;
        }
        try {
            await apiRequest("/api/v1/suppliers", {
                method: "POST",
                body: { name, description },
            });
            setTextStatus(dom.createSupplierStatus, tr("supplierCreateSuccess", null, "Supplier created successfully."), "success");
            await refreshAllSupplierData();
        } catch (error) {
            setTextStatus(dom.createSupplierStatus, getErrorMessage(error, tr("supplierCreateFailed", null, "Failed to create supplier.")), "error");
        }
    }

    async function saveSupplierProfile() {
        if (!state.supplier) {
            setTextStatus(dom.supplierProfileStatus, tr("supplierProfileNoData", null, "No supplier available to update."), "error");
            return;
        }
        const name = dom.supplierNameInput ? dom.supplierNameInput.value.trim() : "";
        const description = dom.supplierDescInput ? dom.supplierDescInput.value.trim() : "";
        const status = dom.supplierStatusInput ? dom.supplierStatusInput.value : "active";
        if (!name) {
            setTextStatus(dom.supplierProfileStatus, tr("supplierCreateNameRequired", null, "Supplier name is required."), "error");
            return;
        }
        try {
            await apiRequest("/api/v1/suppliers/me", {
                method: "PATCH",
                body: { name, description, status },
            });
            setTextStatus(dom.supplierProfileStatus, tr("supplierProfileSaveSuccess", null, "Supplier profile updated."), "success");
            await refreshSupplierProfile();
        } catch (error) {
            setTextStatus(dom.supplierProfileStatus, getErrorMessage(error, tr("supplierProfileSaveFailed", null, "Failed to update supplier profile.")), "error");
        }
    }

    async function saveSupplierConfig() {
        if (!dom.configJsonInput) return;
        const raw = dom.configJsonInput.value.trim();
        if (!raw) {
            setTextStatus(dom.supplierConfigStatus, tr("supplierConfigEmpty", null, "Config cannot be empty."), "error");
            return;
        }
        const parsed = safeJsonParse(raw);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            setTextStatus(dom.supplierConfigStatus, tr("supplierConfigInvalid", null, "Config must be a JSON object."), "error");
            return;
        }
        try {
            await apiRequest("/api/v1/suppliers/me/config", {
                method: "PUT",
                body: parsed,
            });
            setTextStatus(dom.supplierConfigStatus, tr("supplierConfigSaveSuccess", null, "Config saved successfully."), "success");
            await refreshSupplierConfig();
        } catch (error) {
            setTextStatus(dom.supplierConfigStatus, getErrorMessage(error, tr("supplierConfigSaveFailed", null, "Failed to save config.")), "error");
        }
    }

    async function addManager() {
        const wallet = dom.managerWalletInput ? dom.managerWalletInput.value.trim() : "";
        const role = dom.managerRoleInput ? dom.managerRoleInput.value.trim() : "manager";
        if (!wallet) {
            setTextStatus(dom.supplierManagerStatus, tr("managerNeedWallet", null, "Please input manager wallet address."), "error");
            return;
        }
        try {
            const payload = await apiRequest("/api/v1/suppliers/me/managers", {
                method: "POST",
                body: { wallet, role: role || "manager" },
            });
            state.managers = payload.managers || [];
            renderManagerList(state.managers, true);
            setTextStatus(dom.supplierManagerStatus, tr("managerAddSuccess", null, "Manager added successfully."), "success");
            if (dom.managerWalletInput) dom.managerWalletInput.value = "";
        } catch (error) {
            setTextStatus(dom.supplierManagerStatus, getErrorMessage(error, tr("managerAddFailed", null, "Failed to add manager.")), "error");
        }
    }

    async function removeManager(wallet) {
        try {
            const payload = await apiRequest(`/api/v1/suppliers/me/managers/${encodeURIComponent(wallet)}`, {
                method: "DELETE",
            });
            state.managers = payload.managers || [];
            renderManagerList(state.managers, true);
            setTextStatus(dom.supplierManagerStatus, tr("managerRemoveSuccess", null, "Manager removed."), "success");
        } catch (error) {
            setTextStatus(dom.supplierManagerStatus, getErrorMessage(error, tr("managerRemoveFailed", null, "Failed to remove manager.")), "error");
        }
    }

    function registerWalletEvents() {
        if (!window.ethereum || !window.ethereum.on) return;
        window.ethereum.on("accountsChanged", async function () {
            await updateWalletState();
            renderWalletState();
            clearAuthState();
            setTextStatus(dom.authStatus, tr("authAccountChanged", null, "Wallet account changed, please sign in again."), "muted");
        });
        window.ethereum.on("chainChanged", async function () {
            await updateWalletState();
            renderWalletState();
            clearAuthState();
            setTextStatus(dom.authStatus, tr("authChainChanged", null, "Network changed, please sign in again."), "muted");
        });
    }

    function bindVendorActions() {
        if (dom.saveApiBaseBtn) {
            dom.saveApiBaseBtn.addEventListener("click", function () {
                setApiBaseUrl(dom.apiBaseInput ? dom.apiBaseInput.value : "", true);
            });
        }

        if (dom.connectSigninBtn) {
            dom.connectSigninBtn.addEventListener("click", async function () {
                try {
                    await signIn();
                } catch (error) {
                    setTextStatus(dom.authStatus, getErrorMessage(error, tr("authSignInFailed", null, "Sign-in failed.")), "error");
                }
            });
        }

        if (dom.logoutBtn) {
            dom.logoutBtn.addEventListener("click", function () {
                clearAuthState();
                setTextStatus(dom.authStatus, tr("authSignedOut", null, "Signed out."), "muted");
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

    }

    async function initializeVendorConsole() {
        dom.apiBaseInput = document.getElementById("api-base-url");
        dom.saveApiBaseBtn = document.getElementById("save-api-base-btn");
        dom.apiBaseStatus = document.getElementById("api-base-status");
        dom.connectSigninBtn = document.getElementById("connect-signin-btn");
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
            setTextStatus(dom.apiBaseStatus, tr("legacyApiMigrated", { url: initialApiBase }, `Legacy API URL detected. Auto-switched to: ${initialApiBase}`), "success");
        }
        setApiBaseUrl(initialApiBase, false);

        clearSupplierUi();
        bindVendorActions();
        registerWalletEvents();

        try {
            await updateWalletState();
            renderWalletState();
        } catch (error) {
            setTextStatus(dom.walletStatus, getErrorMessage(error, tr("walletDisconnected", null, "Wallet not connected")), "muted");
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
