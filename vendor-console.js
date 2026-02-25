(function () {
    const STORAGE_KEYS = {
        targetNetworkKey: "vendor_target_network_key",
    };

    const DEFAULT_TARGET_NETWORK_KEY = "base-mainnet";
    const MAX_LOG_ENTRIES = 20;

    const NETWORK_CONFIGS = {
        "base-mainnet": {
            key: "base-mainnet",
            name: "Base Mainnet",
            chainId: 8453,
            chainIdHex: "0x2105",
            rpcUrls: ["https://mainnet.base.org"],
            blockExplorerUrls: ["https://basescan.org"],
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
            // TODO: replace with your final mainnet registry address when ready.
            registryAddress: "0x068277480caa9d395ac130a4c5ea7b0f314251d8",
            usdcAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        },
        "base-sepolia": {
            key: "base-sepolia",
            name: "Base Sepolia",
            chainId: 84532,
            chainIdHex: "0x14a34",
            rpcUrls: ["https://sepolia.base.org"],
            blockExplorerUrls: ["https://sepolia.basescan.org"],
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
            // Current default follows your request: same as mainnet until split deployment.
            registryAddress: "0x068277480caa9d395ac130a4c5ea7b0f314251d8",
            usdcAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
        },
    };

    const REGISTRY_ABI = [
        "function annualFeeUsdc() view returns (uint256)",
        "function getFeeConfig() view returns (address feeTreasury, uint16 feePercent)",
        "function getSupplierCountByOwner(address supplierOwner) view returns (uint256)",
        "function getSupplierHashesByOwner(address supplierOwner, uint256 offset, uint256 limit) view returns (bytes32[])",
        "function getSupplier(bytes32 supplierIdHash) view returns (string supplierId, address profile, uint64 expiry, bool suspended)",
        "function isSupplierActive(bytes32 supplierIdHash) view returns (bool)",
    ];

    const state = {
        walletAddress: "",
        chainId: null,
        targetNetworkKey: localStorage.getItem(STORAGE_KEYS.targetNetworkKey) || DEFAULT_TARGET_NETWORK_KEY,
        isAuthenticated: false,
        actionLogs: [],
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

    function shortAddress(address) {
        if (!address || address.length < 10) return address || "";
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    function setTextStatus(element, message, level) {
        if (!element) return;
        element.textContent = message;
        element.classList.remove("success", "error", "muted", "network-ok", "network-warn");
        element.classList.add(level || "muted");
    }

    function formatLogTime(date) {
        const d = date instanceof Date ? date : new Date();
        return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
    }

    function escapeHtml(input) {
        return String(input || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function addActionLog(type, level, message) {
        state.actionLogs.unshift({
            time: formatLogTime(new Date()),
            type: type || "app",
            level: level || "pending",
            message: String(message || ""),
        });
        if (state.actionLogs.length > MAX_LOG_ENTRIES) {
            state.actionLogs.length = MAX_LOG_ENTRIES;
        }
        renderActionLogs();
    }

    function renderActionLogs() {
        if (!dom.logList) return;
        if (!state.actionLogs.length) {
            dom.logList.innerHTML = `<p class="vendor-text muted">${tr("logEmpty", null, "No logs yet")}</p>`;
            return;
        }
        dom.logList.innerHTML = state.actionLogs.map(function (item) {
            return `
                <div class="vendor-log-item ${item.level}">
                    <div class="vendor-log-meta">[${item.time}] [${item.type}] [${item.level}]</div>
                    <div class="vendor-log-message">${escapeHtml(item.message)}</div>
                </div>
            `;
        }).join("");
    }

    function getLatestErrorLog() {
        return state.actionLogs.find(function (item) {
            return item.level === "error";
        }) || null;
    }

    function hexChainIdToNumber(chainHex) {
        if (!chainHex || typeof chainHex !== "string") return null;
        const num = Number.parseInt(chainHex, 16);
        if (!Number.isFinite(num)) return null;
        return num;
    }

    function getTargetNetworkConfig() {
        return NETWORK_CONFIGS[state.targetNetworkKey] || NETWORK_CONFIGS[DEFAULT_TARGET_NETWORK_KEY];
    }

    function isBaseReady() {
        const cfg = getTargetNetworkConfig();
        return Boolean(state.walletAddress) && state.chainId === cfg.chainId;
    }

    function syncActionGuards() {
        const allowWrite = state.isAuthenticated && isBaseReady();
        const buttons = document.querySelectorAll(".guard-auth, .guard-base-ready");
        buttons.forEach(function (btn) {
            if (!(btn instanceof HTMLButtonElement)) return;
            btn.disabled = !allowWrite;
            if (!state.isAuthenticated) {
                btn.title = tr("guardNeedAuth", null, "Please connect wallet first.");
            } else if (!isBaseReady()) {
                btn.title = tr("guardNeedNetwork", null, "Switch to target Base network first.");
            } else {
                btn.title = "";
            }
        });
    }

    function applyTargetNetworkSelection(key, save) {
        state.targetNetworkKey = NETWORK_CONFIGS[key] ? key : DEFAULT_TARGET_NETWORK_KEY;
        if (save) localStorage.setItem(STORAGE_KEYS.targetNetworkKey, state.targetNetworkKey);
        if (dom.targetNetworkSelect) dom.targetNetworkSelect.value = state.targetNetworkKey;
        renderContractStatus();
        renderNetworkState();
    }

    function renderContractStatus() {
        const cfg = getTargetNetworkConfig();
        setTextStatus(
            dom.contractStatus,
            tr("contractConfigLine", {
                network: cfg.name,
                registry: shortAddress(cfg.registryAddress),
                usdc: shortAddress(cfg.usdcAddress),
            }, `Target=${cfg.name} | Registry=${shortAddress(cfg.registryAddress)} | USDC=${shortAddress(cfg.usdcAddress)}`),
            "muted"
        );
    }

    function renderNetworkState() {
        const cfg = getTargetNetworkConfig();
        if (!state.walletAddress || !state.chainId) {
            setTextStatus(dom.networkStatus, tr("networkNeedWallet", { target: cfg.name }, `Wallet not connected. Target network: ${cfg.name}`), "muted");
            if (dom.switchNetworkBtn) dom.switchNetworkBtn.disabled = true;
            syncActionGuards();
            return;
        }

        if (state.chainId === cfg.chainId) {
            setTextStatus(dom.networkStatus, tr("networkReady", { current: cfg.name }, `Network ready: ${cfg.name}`), "network-ok");
            if (dom.switchNetworkBtn) dom.switchNetworkBtn.disabled = true;
        } else {
            setTextStatus(
                dom.networkStatus,
                tr("networkMismatch", {
                    currentChainId: state.chainId,
                    target: cfg.name,
                    targetChainId: cfg.chainId,
                }, `Wrong network: chainId=${state.chainId}, target=${cfg.name}(${cfg.chainId})`),
                "network-warn"
            );
            if (dom.switchNetworkBtn) dom.switchNetworkBtn.disabled = false;
        }
        syncActionGuards();
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
            setTextStatus(dom.authStatus, trPage("authStatusIdle", null, "Not connected"), "muted");
            state.isAuthenticated = false;
            syncActionGuards();
            renderNetworkState();
            return;
        }

        setTextStatus(
            dom.walletStatus,
            tr("walletConnected", { address: shortAddress(state.walletAddress), chainId: state.chainId || "-" }, `Wallet connected: ${shortAddress(state.walletAddress)} | chainId=${state.chainId || "-"}`),
            "success"
        );

        state.isAuthenticated = isBaseReady();
        if (state.isAuthenticated) {
            setTextStatus(dom.authStatus, tr("walletAuthReady", null, "Wallet connected and network ready."), "success");
        } else {
            setTextStatus(dom.authStatus, tr("walletAuthNeedNetwork", null, "Wallet connected. Please switch to target network."), "muted");
        }
        syncActionGuards();
        renderNetworkState();
    }

    async function switchToTargetNetwork() {
        const provider = await getEthereumProvider();
        const cfg = getTargetNetworkConfig();
        addActionLog("wallet", "pending", tr("logSwitchingNetwork", { network: cfg.name }, `Switching network to ${cfg.name}`));
        try {
            await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: cfg.chainIdHex }] });
        } catch (error) {
            if (Number(error && error.code) !== 4902) {
                throw error;
            }
            await provider.request({
                method: "wallet_addEthereumChain",
                params: [{
                    chainId: cfg.chainIdHex,
                    chainName: cfg.name,
                    nativeCurrency: cfg.nativeCurrency,
                    rpcUrls: cfg.rpcUrls,
                    blockExplorerUrls: cfg.blockExplorerUrls,
                }],
            });
            await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: cfg.chainIdHex }] });
        }
        await updateWalletState();
        renderWalletState();
        addActionLog("wallet", "success", tr("logNetworkSwitched", { network: cfg.name }, `Network switched: ${cfg.name}`));
    }

    async function connectWalletAndReady() {
        const provider = await getEthereumProvider();
        addActionLog("wallet", "pending", tr("logWalletConnectStart", null, "Requesting wallet connection"));
        await provider.request({ method: "eth_requestAccounts" });
        await updateWalletState();
        if (!isBaseReady()) {
            await switchToTargetNetwork();
        }
        await updateWalletState();
        renderWalletState();
        addActionLog("wallet", "success", tr("logWalletConnected", { address: shortAddress(state.walletAddress) }, `Wallet connected: ${shortAddress(state.walletAddress)}`));
        await refreshOnchainOverview();
    }

    function formatUsdc6(value) {
        const num = Number(value);
        if (!Number.isFinite(num)) return "-";
        return `${(num / 1_000_000).toLocaleString()} USDC`;
    }

    function formatExpiry(unixSeconds) {
        const ts = Number(unixSeconds);
        if (!Number.isFinite(ts) || ts <= 0) return "-";
        return new Date(ts * 1000).toISOString();
    }

    function ensureEthersAvailable() {
        if (!window.ethers) {
            throw new Error("ethers library is not loaded");
        }
        return window.ethers;
    }

    async function getRegistryReadContract() {
        const ethersLib = ensureEthersAvailable();
        const cfg = getTargetNetworkConfig();
        const provider = new ethersLib.JsonRpcProvider(cfg.rpcUrls[0], cfg.chainId);
        return new ethersLib.Contract(cfg.registryAddress, REGISTRY_ABI, provider);
    }

    function renderSupplierList(items) {
        if (!dom.onchainSupplierList) return;
        if (!items || items.length === 0) {
            dom.onchainSupplierList.innerHTML = `<p class="vendor-text muted">${tr("supplierListEmpty", null, "No suppliers found for current wallet.")}</p>`;
            return;
        }
        dom.onchainSupplierList.innerHTML = items.map(function (item) {
            return `
                <div class="manager-item">
                    <div>
                        <div class="manager-wallet">${escapeHtml(item.supplierId || "-")}</div>
                        <div class="manager-meta">hash=${escapeHtml(item.hash)} | profile=${escapeHtml(shortAddress(item.profile))} | expiry=${escapeHtml(item.expiry)}</div>
                        <div class="manager-meta">suspended=${item.suspended ? "true" : "false"} | active=${item.active ? "true" : "false"}</div>
                    </div>
                </div>
            `;
        }).join("");
    }

    async function refreshOnchainOverview() {
        const cfg = getTargetNetworkConfig();
        renderContractStatus();
        setTextStatus(dom.onchainTreasury, `Treasury: ${shortAddress(cfg.registryAddress)}`, "muted");

        try {
            const registry = await getRegistryReadContract();
            const annualFee = await registry.annualFeeUsdc();
            const feeCfg = await registry.getFeeConfig();

            setTextStatus(dom.onchainAnnualFee, formatUsdc6(annualFee), "success");
            setTextStatus(dom.onchainWithdrawFee, `${Number(feeCfg.feePercent)}%`, "success");
            setTextStatus(dom.onchainTreasury, `Treasury: ${shortAddress(feeCfg.feeTreasury)}`, "muted");

            if (!state.walletAddress) {
                setTextStatus(dom.onchainSupplierCount, "My suppliers: -", "muted");
                renderSupplierList([]);
                return;
            }

            const countBn = await registry.getSupplierCountByOwner(state.walletAddress);
            const count = Number(countBn);
            setTextStatus(dom.onchainSupplierCount, `My suppliers: ${count}`, "success");

            if (count === 0) {
                renderSupplierList([]);
                return;
            }

            const hashes = await registry.getSupplierHashesByOwner(state.walletAddress, 0, count);
            const suppliers = [];
            for (let i = 0; i < hashes.length; i++) {
                const hash = hashes[i];
                const rec = await registry.getSupplier(hash);
                const active = await registry.isSupplierActive(hash);
                suppliers.push({
                    hash,
                    supplierId: rec.supplierId,
                    profile: rec.profile,
                    expiry: formatExpiry(rec.expiry),
                    suspended: Boolean(rec.suspended),
                    active: Boolean(active),
                });
            }
            renderSupplierList(suppliers);
            if (dom.supplierSummary) {
                dom.supplierSummary.textContent = `Loaded ${suppliers.length} on-chain suppliers for ${shortAddress(state.walletAddress)}`;
            }
            addActionLog("chain", "success", `Loaded on-chain overview (${count} suppliers)`);
        } catch (error) {
            const message = error && error.message ? error.message : "Failed to load on-chain overview";
            addActionLog("chain", "error", message);
            if (dom.supplierSummary) dom.supplierSummary.textContent = message;
            setTextStatus(dom.onchainSupplierCount, "My suppliers: load failed", "error");
        }
    }

    function setupNonChainButtons() {
        function unsupported(element, statusEl) {
            if (!element) return;
            element.addEventListener("click", function () {
                const msg = tr("chainOnlyHint", null, "Current phase uses chain-native read flow. This action will be wired to contract write methods in next step.");
                setTextStatus(statusEl, msg, "muted");
                addActionLog("app", "pending", msg);
            });
        }

        unsupported(dom.createSupplierBtn, dom.createSupplierStatus);
        unsupported(dom.saveSupplierProfileBtn, dom.supplierProfileStatus);
        unsupported(dom.saveConfigBtn, dom.supplierConfigStatus);
        unsupported(dom.addManagerBtn, dom.supplierManagerStatus);
        if (dom.refreshSupplierBtn) dom.refreshSupplierBtn.addEventListener("click", refreshOnchainOverview);
        if (dom.refreshConfigBtn) dom.refreshConfigBtn.addEventListener("click", refreshOnchainOverview);
    }

    function registerWalletEvents() {
        if (!window.ethereum || !window.ethereum.on) return;
        window.ethereum.on("accountsChanged", async function () {
            await updateWalletState();
            renderWalletState();
            await refreshOnchainOverview();
            addActionLog("wallet", "pending", tr("authAccountChanged", null, "Wallet account changed."));
        });
        window.ethereum.on("chainChanged", async function () {
            await updateWalletState();
            renderWalletState();
            await refreshOnchainOverview();
            addActionLog("wallet", "pending", tr("authChainChanged", null, "Network changed."));
        });
    }

    function bindVendorActions() {
        if (dom.connectSigninBtn) {
            dom.connectSigninBtn.addEventListener("click", async function () {
                try {
                    await connectWalletAndReady();
                } catch (error) {
                    const msg = error && error.message ? error.message : tr("authSignInFailed", null, "Wallet connect failed.");
                    setTextStatus(dom.authStatus, msg, "error");
                    addActionLog("wallet", "error", msg);
                }
            });
        }

        if (dom.switchNetworkBtn) {
            dom.switchNetworkBtn.addEventListener("click", async function () {
                try {
                    await switchToTargetNetwork();
                    await refreshOnchainOverview();
                } catch (error) {
                    const msg = error && error.message ? error.message : tr("networkSwitchFailed", null, "Failed to switch network.");
                    setTextStatus(dom.networkStatus, msg, "error");
                    addActionLog("wallet", "error", msg);
                }
            });
        }

        if (dom.targetNetworkSelect) {
            dom.targetNetworkSelect.addEventListener("change", async function () {
                applyTargetNetworkSelection(dom.targetNetworkSelect.value, true);
                addActionLog("wallet", "pending", tr("networkTargetChanged", null, "Target network changed."));
                await refreshOnchainOverview();
            });
        }

        if (dom.logoutBtn) {
            dom.logoutBtn.addEventListener("click", function () {
                state.walletAddress = "";
                state.chainId = null;
                state.isAuthenticated = false;
                renderWalletState();
                renderSupplierList([]);
                setTextStatus(dom.onchainSupplierCount, "My suppliers: -", "muted");
                addActionLog("wallet", "pending", tr("authSignedOut", null, "Disconnected from local session"));
            });
        }

        if (dom.refreshOnchainBtn) {
            dom.refreshOnchainBtn.addEventListener("click", refreshOnchainOverview);
        }

        if (dom.clearLogBtn) {
            dom.clearLogBtn.addEventListener("click", function () {
                state.actionLogs = [];
                renderActionLogs();
            });
        }

        if (dom.copyErrorBtn) {
            dom.copyErrorBtn.addEventListener("click", async function () {
                const latest = getLatestErrorLog();
                if (!latest) {
                    addActionLog("app", "pending", tr("logNoErrorToCopy", null, "No error log to copy"));
                    return;
                }
                try {
                    await navigator.clipboard.writeText(`[${latest.time}] [${latest.type}] ${latest.message}`);
                    addActionLog("app", "success", tr("logCopiedLatestError", null, "Copied latest error log"));
                } catch {
                    addActionLog("app", "error", tr("logCopyFailed", null, "Failed to copy log"));
                }
            });
        }

        setupNonChainButtons();
    }

    async function initializeVendorConsole() {
        dom.connectSigninBtn = document.getElementById("connect-signin-btn");
        dom.targetNetworkSelect = document.getElementById("target-network-select");
        dom.switchNetworkBtn = document.getElementById("switch-network-btn");
        dom.networkStatus = document.getElementById("network-status");
        dom.contractStatus = document.getElementById("contract-status");
        dom.walletStatus = document.getElementById("wallet-status");
        dom.authStatus = document.getElementById("auth-status");
        dom.logoutBtn = document.getElementById("logout-btn");

        dom.onchainAnnualFee = document.getElementById("onchain-annual-fee");
        dom.onchainWithdrawFee = document.getElementById("onchain-withdraw-fee");
        dom.onchainTreasury = document.getElementById("onchain-treasury");
        dom.onchainSupplierCount = document.getElementById("onchain-supplier-count");
        dom.refreshOnchainBtn = document.getElementById("refresh-onchain-btn");
        dom.onchainSupplierList = document.getElementById("onchain-supplier-list");

        dom.supplierManageCard = document.getElementById("supplier-manage-card");
        dom.supplierSummary = document.getElementById("supplier-summary");
        dom.supplierCreateCard = document.getElementById("supplier-create-card");
        dom.createSupplierBtn = document.getElementById("create-supplier-btn");
        dom.createSupplierStatus = document.getElementById("create-supplier-status");
        dom.refreshSupplierBtn = document.getElementById("refresh-supplier-btn");
        dom.saveSupplierProfileBtn = document.getElementById("save-supplier-profile-btn");
        dom.supplierProfileStatus = document.getElementById("supplier-profile-status");
        dom.refreshConfigBtn = document.getElementById("refresh-config-btn");
        dom.saveConfigBtn = document.getElementById("save-config-btn");
        dom.supplierConfigStatus = document.getElementById("supplier-config-status");
        dom.addManagerBtn = document.getElementById("add-manager-btn");
        dom.supplierManagerStatus = document.getElementById("supplier-manager-status");

        dom.logList = document.getElementById("vendor-log-list");
        dom.clearLogBtn = document.getElementById("clear-log-btn");
        dom.copyErrorBtn = document.getElementById("copy-error-btn");

        if (dom.supplierManageCard) dom.supplierManageCard.classList.remove("hidden");
        if (dom.supplierCreateCard) dom.supplierCreateCard.classList.remove("hidden");

        applyTargetNetworkSelection(state.targetNetworkKey, false);
        renderActionLogs();
        addActionLog("app", "pending", tr("logConsoleInit", null, "Vendor console initialized"));

        bindVendorActions();
        registerWalletEvents();

        try {
            await updateWalletState();
        } catch {
            // No wallet connected yet.
        }
        renderWalletState();
        await refreshOnchainOverview();
    }

    window.MeshVendorConsole = {
        initializeVendorConsole,
    };
})();
