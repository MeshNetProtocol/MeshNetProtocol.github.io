(function () {
    "use strict";

    const STORAGE_KEYS = {
        targetNetwork: "vendor_console_target_network_v3",
        privateProfiles: "vendor_console_private_profiles_v3",
    };

    const DEFAULT_TARGET_NETWORK_KEY = "base-mainnet";

    const MACHINE_STATES = {
        INIT: "INIT",
        WALLET_CONNECTED: "WALLET_CONNECTED",
        BASE_READY: "BASE_READY",
        AUTHENTICATED: "AUTHENTICATED",
        COMMERCIAL_DATA_READY: "COMMERCIAL_DATA_READY",
        TX_PENDING: "TX_PENDING",
        TX_CONFIRMED: "TX_CONFIRMED",
        TX_FAILED: "TX_FAILED",
    };

    const NETWORK_CONFIGS = {
        "base-mainnet": {
            key: "base-mainnet",
            name: "Base Mainnet",
            chainId: 8453,
            chainIdHex: "0x2105",
            rpcUrls: ["https://mainnet.base.org"],
            blockExplorerUrls: ["https://basescan.org"],
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
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
            registryAddress: "0x068277480caa9d395ac130a4c5ea7b0f314251d8",
            usdcAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
        },
    };

    // Registry read mapping: getSupplierCountByOwner/getSupplierHashesByOwner/getSupplier/isSupplierActive/getFeeConfig
    const REGISTRY_READ_ABI = [
        "function annualFeeUsdc() view returns (uint256)",
        "function getFeeConfig() view returns (address feeTreasury, uint16 feePercent)",
        "function getSupplierCountByOwner(address supplierOwner) view returns (uint256)",
        "function getSupplierHashesByOwner(address supplierOwner, uint256 offset, uint256 limit) view returns (bytes32[])",
        "function getSupplier(bytes32 supplierIdHash) view returns (string supplierId, address profile, uint64 expiry, bool suspended)",
        "function isSupplierActive(bytes32 supplierIdHash) view returns (bool)",
    ];

    // Registry write mapping: registerCommercialWithAuthorization/renewCommercialWithAuthorization
    const REGISTRY_WRITE_ABI = [
        "function registerCommercialWithAuthorization(string supplierId, string metadataURI, bytes authorization)",
        "function renewCommercialWithAuthorization(bytes32 supplierHash, bytes authorization)",
    ];

    const PROFILE_READ_ABI = [
        "function owner() view returns (address)",
        "function metadataURI() view returns (string)",
    ];

    // SupplierProfile write mapping: setMetadataURI/transferOwner/withdraw/withdrawAll
    const PROFILE_WRITE_ABI = [
        "function setMetadataURI(string newMetadataURI)",
        "function transferOwner(address newOwner)",
        "function withdraw(address to, uint256 amount)",
        "function withdrawAll()",
    ];

    const dom = {};

    const state = {
        machine: MACHINE_STATES.INIT,
        targetNetworkKey: localStorage.getItem(STORAGE_KEYS.targetNetwork) || DEFAULT_TARGET_NETWORK_KEY,
        walletAddress: "",
        chainId: null,
        baseReady: false,
        authenticated: false,
        commercialDataReady: false,
        txPending: false,
        selectedView: "overview",
        commercialSuppliers: [],
        selectedSupplierHash: "",
        selectedSupplier: null,
        annualFeeUsdc: null,
        feePercentRaw: null,
        treasury: "",
        signature: "",
        authNonce: "",
        lastTxHash: "",
        privateProfiles: loadPrivateProfilesFromStorage(),
        selectedPrivateId: "",
    };

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

    function tPage(key, vars, fallback) {
        const page = getLanguageBucket("vendorPage");
        const template = page[key];
        if (typeof template === "string") return formatText(template, vars);
        return fallback || key;
    }

    function tRuntime(key, vars, fallback) {
        const runtime = getLanguageBucket("vendorRuntime");
        const template = runtime[key];
        if (typeof template === "string") return formatText(template, vars);
        return fallback || key;
    }

    function ensureEthers() {
        if (!window.ethers) {
            throw new Error(tRuntime("errorEthersMissing", null, "ethers library is missing. Reload this page and try again."));
        }
        return window.ethers;
    }

    async function getEthereumProvider() {
        if (!window.ethereum) {
            throw new Error(tRuntime("walletMissingProvider", null, "MetaMask not detected. Install MetaMask and refresh."));
        }
        return window.ethereum;
    }

    function parseError(error) {
        if (error && Number(error.code) === 4001) {
            return tRuntime("errorUserRejected", null, "Request rejected in wallet. Approve and retry.");
        }
        if (typeof error?.shortMessage === "string" && error.shortMessage.trim()) return error.shortMessage.trim();
        if (typeof error?.reason === "string" && error.reason.trim()) return error.reason.trim();
        if (typeof error?.message === "string" && error.message.trim()) return error.message.trim();
        return tRuntime("errorUnknown", null, "Unknown error. Check wallet popup and network settings, then retry.");
    }

    function parseChainHex(chainHex) {
        if (!chainHex || typeof chainHex !== "string") return null;
        const parsed = Number.parseInt(chainHex, 16);
        return Number.isFinite(parsed) ? parsed : null;
    }

    function getTargetNetworkConfig() {
        return NETWORK_CONFIGS[state.targetNetworkKey] || NETWORK_CONFIGS[DEFAULT_TARGET_NETWORK_KEY];
    }

    function getCurrentNetworkName(chainId) {
        if (chainId === NETWORK_CONFIGS["base-mainnet"].chainId) return NETWORK_CONFIGS["base-mainnet"].name;
        if (chainId === NETWORK_CONFIGS["base-sepolia"].chainId) return NETWORK_CONFIGS["base-sepolia"].name;
        return tRuntime("networkUnknown", null, "Unknown network");
    }

    function shortAddress(address) {
        const text = String(address || "").trim();
        if (text.length < 12) return text || "-";
        return `${text.slice(0, 6)}...${text.slice(-4)}`;
    }

    function shortHash(hash) {
        const text = String(hash || "").trim();
        if (text.length < 16) return text || "-";
        return `${text.slice(0, 10)}...${text.slice(-8)}`;
    }

    function escapeHtml(input) {
        return String(input || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function formatExpiry(unixSeconds) {
        const ts = Number(unixSeconds);
        if (!Number.isFinite(ts) || ts <= 0) return "-";
        return new Date(ts * 1000).toLocaleString();
    }

    function formatUsdc(bigintValue) {
        if (bigintValue === null || bigintValue === undefined) return "-";
        try {
            const ethersLib = ensureEthers();
            return `${ethersLib.formatUnits(bigintValue, 6)} USDC`;
        } catch {
            return "-";
        }
    }

    function formatFeePercent(raw) {
        const value = Number(raw);
        if (!Number.isFinite(value)) return "-";
        if (value > 100) return `${(value / 100).toFixed(2)}%`;
        return `${value.toFixed(2)}%`;
    }

    function feeRateDecimal(raw) {
        const value = Number(raw);
        if (!Number.isFinite(value)) return 0;
        if (value > 100) return value / 10000;
        return value / 100;
    }

    function setStatusText(element, message, level) {
        if (!element) return;
        const normalizedLevel = level || "muted";
        element.textContent = message;
        element.classList.remove("muted", "success", "warning", "error", "pending");
        element.classList.add(normalizedLevel);
        element.setAttribute("data-level", normalizedLevel);
    }

    function setBadge(element, text, levelClass) {
        if (!element) return;
        const normalizedLevelClass = levelClass || "status-muted";
        element.textContent = text;
        element.classList.remove("status-muted", "status-success", "status-warning", "status-error");
        element.classList.add(normalizedLevelClass);
        element.setAttribute("data-level", normalizedLevelClass.replace("status-", ""));
    }

    function setNotice(level, message) {
        setStatusText(dom.consoleNotice, message, level || "muted");
    }

    function transitionState(nextState) {
        if (!nextState || nextState === state.machine) return;
        state.machine = nextState;
        renderTopStatus();
    }

    function updateBaseReady() {
        const cfg = getTargetNetworkConfig();
        state.baseReady = Boolean(state.walletAddress) && state.chainId === cfg.chainId;
    }

    function renderTopStatus() {
        const cfg = getTargetNetworkConfig();
        const walletText = state.walletAddress ? shortAddress(state.walletAddress) : tRuntime("badgeDisconnected", null, "Disconnected");
        setBadge(dom.badgeWallet, walletText, state.walletAddress ? "status-success" : "status-muted");

        const currentNetwork = getCurrentNetworkName(state.chainId);
        const readyText = state.baseReady ? tRuntime("readyYes", null, "Ready") : tRuntime("readyNo", null, "Not Ready");
        const chainLine = `${currentNetwork} -> ${cfg.name} (${readyText})`;

        if (!state.walletAddress) {
            setBadge(dom.badgeChain, `${cfg.name} (${tRuntime("readyNo", null, "Not Ready")})`, "status-muted");
        } else if (state.baseReady) {
            setBadge(dom.badgeChain, chainLine, "status-success");
        } else {
            setBadge(dom.badgeChain, chainLine, "status-warning");
        }

        if (!state.walletAddress) {
            setStatusText(dom.textAuthStatus, tRuntime("authStatusDisconnected", null, "Wallet not connected."), "muted");
            return;
        }

        if (state.txPending) {
            setStatusText(dom.textAuthStatus, tRuntime("authStatusTxPending", null, "Transaction pending. Confirm in wallet and wait for chain confirmation."), "pending");
            return;
        }

        if (!state.baseReady) {
            setStatusText(dom.textAuthStatus, tRuntime("authStatusNeedBase", { target: cfg.name }, `Wallet connected. Switch to ${cfg.name} and sign in again.`), "warning");
            return;
        }

        if (!state.authenticated) {
            setStatusText(dom.textAuthStatus, tRuntime("authStatusNeedSign", null, "Network ready. Click sign-in to authenticate this session."), "warning");
            return;
        }

        setStatusText(dom.textAuthStatus, tRuntime("authStatusAuthenticated", {
            address: shortAddress(state.walletAddress),
            state: state.machine,
        }, `Authenticated: ${shortAddress(state.walletAddress)} (${state.machine})`), "success");
    }

    function updateActionGuards() {
        const chainWriteEnabled = state.authenticated && state.baseReady && !state.txPending;
        const authEnabled = state.authenticated && !state.txPending;

        document.querySelectorAll("[data-chain-write='true']").forEach(function (button) {
            if (!(button instanceof HTMLButtonElement)) return;
            button.disabled = !chainWriteEnabled;
        });

        document.querySelectorAll("[data-requires-auth='true']").forEach(function (button) {
            if (!(button instanceof HTMLButtonElement)) return;
            if (!button.hasAttribute("data-chain-write")) {
                button.disabled = !authEnabled;
            }
        });

        if (dom.commercialLockOverlay) {
            dom.commercialLockOverlay.classList.toggle("hidden", state.authenticated);
        }
    }

    function switchView(viewKey) {
        const target = viewKey || "overview";
        state.selectedView = target;

        document.querySelectorAll(".console-nav-btn").forEach(function (button) {
            button.classList.toggle("active", button.getAttribute("data-view-target") === target);
        });

        document.querySelectorAll(".console-view").forEach(function (panel) {
            panel.classList.toggle("active", panel.getAttribute("data-view-panel") === target);
        });
    }

    function toggleRegisterForm(forceOpen) {
        if (!dom.registerModal) return;
        const shouldOpen = typeof forceOpen === "boolean"
            ? forceOpen
            : dom.registerModal.classList.contains("hidden");

        dom.registerModal.classList.toggle("hidden", !shouldOpen);
        dom.registerModal.setAttribute("aria-hidden", shouldOpen ? "false" : "true");

        if (dom.btnOpenRegisterForm) {
            dom.btnOpenRegisterForm.textContent = shouldOpen
                ? tPage("closeRegisterFormButton", null, "Close Register")
                : tPage("openRegisterFormButton", null, "Register New Supplier");
        }
    }

    function closeRegisterFormIfOpen() {
        if (dom.registerModal && !dom.registerModal.classList.contains("hidden")) {
            toggleRegisterForm(false);
        }
    }

    function setTargetNetworkSelection(networkKey, persist) {
        state.targetNetworkKey = NETWORK_CONFIGS[networkKey] ? networkKey : DEFAULT_TARGET_NETWORK_KEY;
        if (persist) {
            localStorage.setItem(STORAGE_KEYS.targetNetwork, state.targetNetworkKey);
        }
        if (dom.selectTargetNetwork) {
            dom.selectTargetNetwork.value = state.targetNetworkKey;
        }
        updateBaseReady();
        renderTopStatus();
        updateActionGuards();
    }

    async function syncWalletStateFromProvider() {
        const provider = await getEthereumProvider();
        const accounts = await provider.request({ method: "eth_accounts" });
        const chainHex = await provider.request({ method: "eth_chainId" });

        const prevAddress = state.walletAddress;
        state.walletAddress = Array.isArray(accounts) && accounts[0] ? String(accounts[0]).toLowerCase() : "";
        state.chainId = parseChainHex(chainHex);

        updateBaseReady();

        if (!prevAddress && state.walletAddress) {
            transitionState(MACHINE_STATES.WALLET_CONNECTED);
        }

        if (state.walletAddress && state.baseReady) {
            transitionState(MACHINE_STATES.BASE_READY);
        }

        if (prevAddress && !state.walletAddress) {
            state.authenticated = false;
            state.commercialDataReady = false;
            state.commercialSuppliers = [];
            resetSelectedSupplier();
            transitionState(MACHINE_STATES.INIT);
            renderCommercialList();
            renderSelectedSupplier();
        }

        if (!state.baseReady && state.authenticated) {
            state.authenticated = false;
            state.commercialDataReady = false;
            transitionState(MACHINE_STATES.WALLET_CONNECTED);
        }

        renderTopStatus();
        updateActionGuards();
    }

    async function handleSwitchBaseNetwork(skipNotice) {
        const cfg = getTargetNetworkConfig();
        try {
            const provider = await getEthereumProvider();

            if (!skipNotice) {
                setNotice("pending", tRuntime("activitySwitchNetworkStart", { network: cfg.name }, `Switching network to ${cfg.name}.`));
            }

            try {
                await provider.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: cfg.chainIdHex }],
                });
            } catch (switchError) {
                if (Number(switchError?.code) !== 4902) {
                    throw switchError;
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

                await provider.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: cfg.chainIdHex }],
                });
            }

            await syncWalletStateFromProvider();
            if (state.baseReady) {
                transitionState(MACHINE_STATES.BASE_READY);
            }
            setNotice("success", tRuntime("activitySwitchNetworkSuccess", { network: cfg.name }, `Network switched to ${cfg.name}.`));
        } catch (error) {
            const message = parseError(error);
            setNotice("error", tRuntime("activitySwitchNetworkFailed", { error: message }, `Network switch failed: ${message}`));
            setStatusText(dom.textAuthStatus, tRuntime("networkSwitchFailed", null, "Failed to switch network. Open wallet and retry."), "error");
        }
    }

    async function handleConnectAndSignIn() {
        try {
            const provider = await getEthereumProvider();
            setNotice("pending", tRuntime("logWalletConnectStart", null, "Requesting wallet connection"));

            await provider.request({ method: "eth_requestAccounts" });
            await syncWalletStateFromProvider();

            if (!state.walletAddress) {
                throw new Error(tRuntime("errorWalletNotConnected", null, "Wallet not connected. Unlock MetaMask and retry."));
            }

            if (!state.baseReady) {
                await handleSwitchBaseNetwork(true);
                await syncWalletStateFromProvider();
            }

            if (!state.baseReady) {
                throw new Error(tRuntime("errorNeedBaseReady", { target: getTargetNetworkConfig().name }, "Base target network is required. Switch and retry."));
            }

            transitionState(MACHINE_STATES.BASE_READY);

            const ethersLib = ensureEthers();
            const browserProvider = new ethersLib.BrowserProvider(provider);
            const signer = await browserProvider.getSigner();
            const cfg = getTargetNetworkConfig();

            state.authNonce = String(Date.now());
            const message = tRuntime("signInMessage", {
                address: state.walletAddress,
                network: cfg.name,
                nonce: state.authNonce,
                timestamp: new Date().toISOString(),
            }, `MeshNetProtocol Supplier Console\nAddress: ${state.walletAddress}\nNetwork: ${cfg.name}\nNonce: ${state.authNonce}`);

            setNotice("pending", tRuntime("activitySignStart", null, "Awaiting signature in wallet."));
            state.signature = await signer.signMessage(message);

            state.authenticated = true;
            transitionState(MACHINE_STATES.AUTHENTICATED);
            updateActionGuards();
            renderTopStatus();

            setNotice("success", tRuntime("activitySignSuccess", { address: shortAddress(state.walletAddress) }, "Sign-in completed."));
            await loadCommercialSuppliers();
        } catch (error) {
            state.authenticated = false;
            state.commercialDataReady = false;
            updateActionGuards();
            renderTopStatus();

            const msg = parseError(error);
            setNotice("error", tRuntime("authSignInFailedWithAction", { error: msg }, `Sign-in failed: ${msg}`));
        }
    }

    function handleDisconnect() {
        state.walletAddress = "";
        state.chainId = null;
        state.baseReady = false;
        state.authenticated = false;
        state.commercialDataReady = false;
        state.txPending = false;
        state.signature = "";
        state.commercialSuppliers = [];
        resetSelectedSupplier();

        transitionState(MACHINE_STATES.INIT);
        renderTopStatus();
        renderCommercialList();
        renderSelectedSupplier();
        updateActionGuards();
        closeRegisterFormIfOpen();

        if (dom.textCommercialCount) dom.textCommercialCount.textContent = "0";
        setNotice("muted", tRuntime("activityDisconnected", null, "Disconnected local session."));
    }

    function resetSelectedSupplier() {
        state.selectedSupplierHash = "";
        state.selectedSupplier = null;
    }

    function renderCommercialList() {
        if (!dom.listCommercialSuppliers || !dom.emptyCommercialState) return;

        if (!state.commercialSuppliers.length) {
            dom.listCommercialSuppliers.innerHTML = "";
            dom.emptyCommercialState.classList.remove("hidden");
            return;
        }

        dom.emptyCommercialState.classList.add("hidden");

        dom.listCommercialSuppliers.innerHTML = state.commercialSuppliers.map(function (item) {
            const activeClass = item.hash === state.selectedSupplierHash ? "active" : "";
            return `
                <button class="supplier-item ${activeClass}" type="button" data-supplier-hash="${escapeHtml(item.hash)}">
                    <span class="supplier-item-title mono">${escapeHtml(item.supplierId || "-")}</span>
                    <span class="supplier-item-meta mono">${escapeHtml(shortHash(item.hash))}</span>
                    <span class="supplier-item-meta">${escapeHtml(tRuntime("supplierExpiryLine", { expiry: formatExpiry(item.expiry) }, `Expiry: ${formatExpiry(item.expiry)}`))}</span>
                    <span class="supplier-item-meta">${escapeHtml(tRuntime("supplierActiveLine", { active: item.active ? tRuntime("yes", null, "Yes") : tRuntime("no", null, "No") }, `Active: ${item.active ? "Yes" : "No"}`))}</span>
                </button>
            `;
        }).join("");

        dom.listCommercialSuppliers.querySelectorAll("[data-supplier-hash]").forEach(function (button) {
            button.addEventListener("click", function () {
                const hash = String(button.getAttribute("data-supplier-hash") || "");
                state.selectedSupplierHash = hash;
                state.selectedSupplier = state.commercialSuppliers.find(function (item) {
                    return item.hash === hash;
                }) || null;
                renderCommercialList();
                renderSelectedSupplier();
            });
        });
    }

    function renderSelectedSupplier() {
        const selected = state.selectedSupplier;

        if (!selected) {
            if (dom.textSelectedSupplierId) dom.textSelectedSupplierId.textContent = "-";
            if (dom.textSelectedOwner) dom.textSelectedOwner.textContent = "-";
            if (dom.textSelectedProfileAddress) dom.textSelectedProfileAddress.textContent = "-";
            if (dom.textSelectedExpiry) dom.textSelectedExpiry.textContent = "-";
            if (dom.textSelectedActiveStatus) dom.textSelectedActiveStatus.textContent = "-";
            if (dom.inputMetadataURI) dom.inputMetadataURI.value = "";
            return;
        }

        if (dom.textSelectedSupplierId) dom.textSelectedSupplierId.textContent = selected.supplierId || "-";
        if (dom.textSelectedOwner) dom.textSelectedOwner.textContent = selected.owner || "-";
        if (dom.textSelectedProfileAddress) dom.textSelectedProfileAddress.textContent = selected.profileAddress || "-";
        if (dom.textSelectedExpiry) dom.textSelectedExpiry.textContent = formatExpiry(selected.expiry);

        if (dom.textSelectedActiveStatus) {
            const activeText = selected.active ? tRuntime("yes", null, "Yes") : tRuntime("no", null, "No");
            dom.textSelectedActiveStatus.textContent = activeText;
            dom.textSelectedActiveStatus.classList.remove("success", "warning", "muted");
            dom.textSelectedActiveStatus.classList.add(selected.active ? "success" : "warning");
        }

        if (dom.inputMetadataURI) dom.inputMetadataURI.value = selected.metadataURI || "";
    }

    async function getRegistryReadContract() {
        const ethersLib = ensureEthers();
        const cfg = getTargetNetworkConfig();
        const provider = new ethersLib.JsonRpcProvider(cfg.rpcUrls[0], cfg.chainId);
        return new ethersLib.Contract(cfg.registryAddress, REGISTRY_READ_ABI, provider);
    }

    async function getRegistryWriteContract() {
        const ethersLib = ensureEthers();
        const provider = await getEthereumProvider();
        const browserProvider = new ethersLib.BrowserProvider(provider);
        const signer = await browserProvider.getSigner();
        const cfg = getTargetNetworkConfig();
        return new ethersLib.Contract(cfg.registryAddress, REGISTRY_WRITE_ABI, signer);
    }

    async function getProfileReadContract(profileAddress) {
        const ethersLib = ensureEthers();
        const cfg = getTargetNetworkConfig();
        const provider = new ethersLib.JsonRpcProvider(cfg.rpcUrls[0], cfg.chainId);
        return new ethersLib.Contract(profileAddress, PROFILE_READ_ABI, provider);
    }

    async function getProfileWriteContract(profileAddress) {
        const ethersLib = ensureEthers();
        const provider = await getEthereumProvider();
        const browserProvider = new ethersLib.BrowserProvider(provider);
        const signer = await browserProvider.getSigner();
        return new ethersLib.Contract(profileAddress, PROFILE_WRITE_ABI, signer);
    }

    async function refreshFeeConfig(registryRead) {
        try {
            const feeConfig = await registryRead.getFeeConfig();
            state.treasury = feeConfig.feeTreasury || feeConfig[0] || "";
            state.feePercentRaw = Number(feeConfig.feePercent !== undefined ? feeConfig.feePercent : feeConfig[1]);

            try {
                state.annualFeeUsdc = await registryRead.annualFeeUsdc();
            } catch {
                state.annualFeeUsdc = null;
            }

            if (dom.textAnnualFee) dom.textAnnualFee.textContent = formatUsdc(state.annualFeeUsdc);
            if (dom.textWithdrawFee) dom.textWithdrawFee.textContent = formatFeePercent(state.feePercentRaw);
            if (dom.textTreasury) dom.textTreasury.textContent = state.treasury || "-";
        } catch (error) {
            const msg = parseError(error);
            setNotice("warning", tRuntime("activityFeeConfigFailed", { error: msg }, `Fee config read failed: ${msg}`));
        }
    }

    async function enrichSupplierWithProfile(record) {
        if (!record?.profileAddress) return record;

        try {
            const profileRead = await getProfileReadContract(record.profileAddress);
            const [owner, metadataURI] = await Promise.all([
                profileRead.owner().catch(function () { return record.owner || ""; }),
                profileRead.metadataURI().catch(function () { return record.metadataURI || ""; }),
            ]);

            return {
                ...record,
                owner: owner || record.owner || "",
                metadataURI: metadataURI || record.metadataURI || "",
            };
        } catch {
            return record;
        }
    }

    async function loadCommercialSuppliers() {
        if (!state.authenticated) {
            setNotice("warning", tRuntime("errorNeedAuthAction", null, "Sign in first to continue commercial management."));
            return;
        }

        if (!state.baseReady) {
            setNotice("warning", tRuntime("errorNeedBaseReady", { target: getTargetNetworkConfig().name }, "Switch to selected Base network first."));
            return;
        }

        try {
            setNotice("pending", tRuntime("activityCommercialLoadStart", null, "Loading commercial suppliers from ProtocolRegistry."));

            const registryRead = await getRegistryReadContract();
            await refreshFeeConfig(registryRead);

            const countRaw = await registryRead.getSupplierCountByOwner(state.walletAddress);
            const count = Number(countRaw);

            if (dom.textCommercialCount) {
                dom.textCommercialCount.textContent = Number.isFinite(count) ? String(count) : "0";
            }

            const suppliers = [];
            if (Number.isFinite(count) && count > 0) {
                const hashes = await registryRead.getSupplierHashesByOwner(state.walletAddress, 0, count);
                for (let i = 0; i < hashes.length; i += 1) {
                    const hash = hashes[i];
                    const supplier = await registryRead.getSupplier(hash);
                    const active = await registryRead.isSupplierActive(hash);

                    const record = {
                        hash: String(hash),
                        supplierId: supplier.supplierId || supplier[0] || "",
                        profileAddress: supplier.profile || supplier[1] || "",
                        expiry: Number(supplier.expiry || supplier[2] || 0),
                        suspended: Boolean(supplier.suspended || supplier[3]),
                        active: Boolean(active),
                        owner: state.walletAddress,
                        metadataURI: "",
                    };

                    suppliers.push(await enrichSupplierWithProfile(record));
                }
            }

            state.commercialSuppliers = suppliers;
            state.commercialDataReady = true;
            transitionState(MACHINE_STATES.COMMERCIAL_DATA_READY);

            if (suppliers.length) {
                const existing = suppliers.find(function (item) {
                    return item.hash === state.selectedSupplierHash;
                });
                state.selectedSupplier = existing || suppliers[0];
                state.selectedSupplierHash = state.selectedSupplier.hash;
            } else {
                resetSelectedSupplier();
            }

            renderCommercialList();
            renderSelectedSupplier();
            setNotice("success", tRuntime("activityCommercialLoadSuccess", { count: suppliers.length }, `Commercial supplier list loaded: ${suppliers.length}`));
        } catch (error) {
            const message = parseError(error);
            state.commercialDataReady = false;
            state.commercialSuppliers = [];
            resetSelectedSupplier();
            renderCommercialList();
            renderSelectedSupplier();
            setNotice("error", tRuntime("commercialLoadFailed", { error: message }, `Commercial supplier load failed: ${message}`));
            if (dom.textCommercialCount) dom.textCommercialCount.textContent = "0";
        }
    }

    function setButtonLoading(button, loading) {
        if (!(button instanceof HTMLButtonElement)) return;
        button.classList.toggle("loading", Boolean(loading));
    }

    async function runTransaction(scope, button, statusElement, startKey, successKey, failedKey, action) {
        if (!state.authenticated) {
            setStatusText(statusElement, tRuntime("errorNeedAuthAction", null, "Sign in first to continue commercial management."), "warning");
            return;
        }

        if (!state.baseReady) {
            setStatusText(statusElement, tRuntime("errorNeedBaseReady", { target: getTargetNetworkConfig().name }, "Switch to selected Base network first."), "warning");
            return;
        }

        try {
            state.txPending = true;
            transitionState(MACHINE_STATES.TX_PENDING);
            updateActionGuards();
            renderTopStatus();

            setButtonLoading(button, true);
            setStatusText(statusElement, tRuntime(startKey, null, "Submitting transaction..."), "pending");
            setNotice("pending", tRuntime(startKey, null, "Submitting transaction..."));

            const txResponse = await action();
            if (txResponse?.hash) {
                state.lastTxHash = txResponse.hash;
                setNotice("pending", tRuntime("activityTxSubmitted", { hash: shortHash(txResponse.hash) }, `Transaction submitted: ${shortHash(txResponse.hash)}`));
            }

            if (txResponse && typeof txResponse.wait === "function") {
                await txResponse.wait();
            }

            transitionState(MACHINE_STATES.TX_CONFIRMED);
            setStatusText(statusElement, tRuntime(successKey, { hash: shortHash(state.lastTxHash) }, "Transaction confirmed."), "success");
            setNotice("success", tRuntime("activityTxConfirmed", { scope: scope }, `${scope} confirmed.`));
        } catch (error) {
            transitionState(MACHINE_STATES.TX_FAILED);
            const message = parseError(error);
            setStatusText(statusElement, tRuntime(failedKey, { error: message }, `Transaction failed: ${message}`), "error");
            setNotice("error", tRuntime("activityTxFailed", { scope: scope, error: message }, `${scope} failed: ${message}`));
        } finally {
            state.txPending = false;
            setButtonLoading(button, false);

            if (state.authenticated) {
                transitionState(state.commercialDataReady ? MACHINE_STATES.COMMERCIAL_DATA_READY : MACHINE_STATES.AUTHENTICATED);
            }

            updateActionGuards();
            renderTopStatus();
        }
    }

    async function handleRegisterCommercialSupplier(event) {
        if (event && typeof event.preventDefault === "function") {
            event.preventDefault();
        }

        const supplierId = String(dom.inputRegisterSupplierId?.value || "").trim();
        const metadataURI = String(dom.inputRegisterMetadataURI?.value || "").trim();

        if (!supplierId) {
            setStatusText(dom.textRegisterStatus, tRuntime("registerSupplierIdRequired", null, "Supplier ID is required. Fill it and retry."), "error");
            return;
        }

        if (!metadataURI) {
            setStatusText(dom.textRegisterStatus, tRuntime("registerMetadataRequired", null, "Metadata URI is required. Fill it and retry."), "error");
            return;
        }

        await runTransaction(
            "register-commercial",
            dom.btnRegisterSignSubmit,
            dom.textRegisterStatus,
            "registerStart",
            "registerSuccess",
            "registerFailed",
            async function () {
                const registryWrite = await getRegistryWriteContract();
                // Keep authorization placeholder for integration with backend signer service.
                return registryWrite.registerCommercialWithAuthorization(supplierId, metadataURI, "0x");
            }
        );

        if (!state.txPending && state.machine !== MACHINE_STATES.TX_FAILED) {
            toggleRegisterForm(false);
            await loadCommercialSuppliers();
            switchView("commercial");
        }
    }

    async function handleRenewCommercialSupplier() {
        if (!state.selectedSupplier?.hash) {
            setStatusText(dom.textRenewStatus, tRuntime("errorNoSelectedSupplier", null, "Select a commercial supplier from list first."), "warning");
            return;
        }

        await runTransaction(
            "renew-commercial",
            dom.btnRenewOneYear,
            dom.textRenewStatus,
            "renewStart",
            "renewSuccess",
            "renewFailed",
            async function () {
                const registryWrite = await getRegistryWriteContract();
                return registryWrite.renewCommercialWithAuthorization(state.selectedSupplier.hash, "0x");
            }
        );

        if (!state.txPending && state.machine !== MACHINE_STATES.TX_FAILED) {
            await loadCommercialSuppliers();
        }
    }

    async function handleSaveMetadataURI() {
        if (!state.selectedSupplier?.profileAddress) {
            setStatusText(dom.textMetadataStatus, tRuntime("errorNoSelectedSupplier", null, "Select a commercial supplier from list first."), "warning");
            return;
        }

        const metadataURI = String(dom.inputMetadataURI?.value || "").trim();
        if (!metadataURI) {
            setStatusText(dom.textMetadataStatus, tRuntime("registerMetadataRequired", null, "Metadata URI is required. Fill it and retry."), "error");
            return;
        }

        await runTransaction(
            "save-metadata",
            dom.btnSaveMetadata,
            dom.textMetadataStatus,
            "metadataSaveStart",
            "metadataSaveSuccess",
            "metadataSaveFailed",
            async function () {
                const profileWrite = await getProfileWriteContract(state.selectedSupplier.profileAddress);
                return profileWrite.setMetadataURI(metadataURI);
            }
        );

        if (!state.txPending && state.machine !== MACHINE_STATES.TX_FAILED) {
            await loadCommercialSuppliers();
        }
    }

    async function handleTransferOwner() {
        if (!state.selectedSupplier?.profileAddress) {
            setStatusText(dom.textTransferOwnerStatus, tRuntime("errorNoSelectedSupplier", null, "Select a commercial supplier from list first."), "warning");
            return;
        }

        const newOwner = String(dom.inputNewOwner?.value || "").trim();
        if (!newOwner) {
            setStatusText(dom.textTransferOwnerStatus, tRuntime("transferOwnerAddressRequired", null, "New owner address is required."), "error");
            return;
        }

        try {
            const ethersLib = ensureEthers();
            if (!ethersLib.isAddress(newOwner)) {
                throw new Error(tRuntime("errorInvalidAddress", null, "Address format is invalid. Check and retry."));
            }
        } catch (error) {
            setStatusText(dom.textTransferOwnerStatus, parseError(error), "error");
            return;
        }

        await runTransaction(
            "transfer-owner",
            dom.btnTransferOwner,
            dom.textTransferOwnerStatus,
            "transferOwnerStart",
            "transferOwnerSuccess",
            "transferOwnerFailed",
            async function () {
                const profileWrite = await getProfileWriteContract(state.selectedSupplier.profileAddress);
                return profileWrite.transferOwner(newOwner);
            }
        );

        if (!state.txPending && state.machine !== MACHINE_STATES.TX_FAILED) {
            await loadCommercialSuppliers();
        }
    }

    function handlePreviewWithdraw() {
        const amount = Number.parseFloat(String(dom.inputWithdrawAmount?.value || "").trim());
        if (!Number.isFinite(amount) || amount <= 0) {
            setStatusText(dom.textWithdrawStatus, tRuntime("withdrawAmountInvalid", null, "Enter valid positive USDC amount."), "error");
            return;
        }

        const rate = feeRateDecimal(state.feePercentRaw);
        const fee = amount * rate;
        const net = Math.max(amount - fee, 0);

        if (dom.textWithdrawPreviewFee) dom.textWithdrawPreviewFee.textContent = `${fee.toFixed(6)} USDC`;
        if (dom.textWithdrawPreviewNet) dom.textWithdrawPreviewNet.textContent = `${net.toFixed(6)} USDC`;

        setStatusText(dom.textWithdrawStatus, tRuntime("withdrawPreviewDone", {
            fee: fee.toFixed(6),
            net: net.toFixed(6),
        }, `Preview done. Fee ${fee.toFixed(6)} USDC, net ${net.toFixed(6)} USDC.`), "pending");
    }

    async function handleWithdraw() {
        if (!state.selectedSupplier?.profileAddress) {
            setStatusText(dom.textWithdrawStatus, tRuntime("errorNoSelectedSupplier", null, "Select a commercial supplier from list first."), "warning");
            return;
        }

        const rawAmount = String(dom.inputWithdrawAmount?.value || "").trim();
        const toAddress = String(dom.inputWithdrawTo?.value || "").trim();
        const numericAmount = Number.parseFloat(rawAmount);

        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            setStatusText(dom.textWithdrawStatus, tRuntime("withdrawAmountInvalid", null, "Enter valid positive USDC amount."), "error");
            return;
        }

        if (!toAddress) {
            setStatusText(dom.textWithdrawStatus, tRuntime("withdrawToRequired", null, "Withdraw destination address is required."), "error");
            return;
        }

        let amountUnits;
        try {
            const ethersLib = ensureEthers();
            if (!ethersLib.isAddress(toAddress)) {
                throw new Error(tRuntime("errorInvalidAddress", null, "Address format is invalid. Check and retry."));
            }
            amountUnits = ethersLib.parseUnits(rawAmount, 6);
        } catch (error) {
            setStatusText(dom.textWithdrawStatus, parseError(error), "error");
            return;
        }

        await runTransaction(
            "withdraw",
            dom.btnWithdraw,
            dom.textWithdrawStatus,
            "withdrawStart",
            "withdrawSuccess",
            "withdrawFailed",
            async function () {
                const profileWrite = await getProfileWriteContract(state.selectedSupplier.profileAddress);
                return profileWrite.withdraw(toAddress, amountUnits);
            }
        );
    }

    async function handleWithdrawAll() {
        if (!state.selectedSupplier?.profileAddress) {
            setStatusText(dom.textWithdrawStatus, tRuntime("errorNoSelectedSupplier", null, "Select a commercial supplier from list first."), "warning");
            return;
        }

        await runTransaction(
            "withdraw-all",
            dom.btnWithdrawAll,
            dom.textWithdrawStatus,
            "withdrawAllStart",
            "withdrawAllSuccess",
            "withdrawAllFailed",
            async function () {
                const profileWrite = await getProfileWriteContract(state.selectedSupplier.profileAddress);
                return profileWrite.withdrawAll();
            }
        );
    }

    function normalizePrivateProfile(rawProfile, source) {
        if (!rawProfile || typeof rawProfile !== "object" || Array.isArray(rawProfile)) {
            throw new Error(tRuntime("privateProfileInvalid", null, "Profile JSON must be an object."));
        }

        const supplierId = String(rawProfile.supplierId || rawProfile.id || `private-${Date.now()}`);
        const metadataURI = String(rawProfile.metadataURI || rawProfile.metadata_uri || "");

        return {
            supplierId,
            metadataURI,
            source: source || "local",
            updatedAt: new Date().toISOString(),
            raw: rawProfile,
        };
    }

    function persistPrivateProfiles() {
        localStorage.setItem(STORAGE_KEYS.privateProfiles, JSON.stringify(state.privateProfiles));
    }

    function loadPrivateProfilesFromStorage() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.privateProfiles);
            if (!saved) return [];
            const parsed = JSON.parse(saved);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    function renderPrivateEditor() {
        if (!dom.textareaPrivateLocal) return;

        if (!state.selectedPrivateId && state.privateProfiles.length) {
            state.selectedPrivateId = state.privateProfiles[0].supplierId;
        }

        const selected = state.privateProfiles.find(function (item) {
            return item.supplierId === state.selectedPrivateId;
        });

        if (!selected) {
            dom.textareaPrivateLocal.value = "";
            return;
        }

        try {
            dom.textareaPrivateLocal.value = JSON.stringify(selected.raw, null, 2);
        } catch {
            dom.textareaPrivateLocal.value = "";
        }
    }

    function upsertPrivateProfile(profile, source) {
        const normalized = normalizePrivateProfile(profile, source);
        const index = state.privateProfiles.findIndex(function (item) {
            return item.supplierId === normalized.supplierId;
        });

        if (index >= 0) {
            state.privateProfiles[index] = normalized;
        } else {
            state.privateProfiles.unshift(normalized);
        }

        state.selectedPrivateId = normalized.supplierId;
        persistPrivateProfiles();
        renderPrivateEditor();

        setStatusText(dom.textPrivateStatus, tRuntime("privateProfileSaved", {
            id: normalized.supplierId,
            count: state.privateProfiles.length,
            source: normalized.source,
        }, `Private profile saved: ${normalized.supplierId}`), "success");

        setNotice("success", tRuntime("activityPrivateProfileSaved", {
            id: normalized.supplierId,
            source: normalized.source,
        }, `Private profile saved: ${normalized.supplierId}`));
    }

    async function handleImportPrivateFile() {
        const file = dom.filePrivateProfile?.files ? dom.filePrivateProfile.files[0] : null;
        if (!file) {
            setStatusText(dom.textPrivateStatus, tRuntime("privateFileRequired", null, "Select a JSON file first."), "warning");
            return;
        }

        try {
            const content = await file.text();
            const parsed = JSON.parse(content);
            upsertPrivateProfile(parsed, `file:${file.name}`);
        } catch (error) {
            const msg = parseError(error);
            setStatusText(dom.textPrivateStatus, tRuntime("privateImportFailed", { error: msg }, `Import failed: ${msg}`), "error");
            setNotice("error", tRuntime("privateImportFailed", { error: msg }, `Import failed: ${msg}`));
        }
    }

    async function handleImportPrivateUrl() {
        const url = String(dom.inputPrivateProfileUrl?.value || "").trim();
        if (!url) {
            setStatusText(dom.textPrivateStatus, tRuntime("privateUrlRequired", null, "Enter profile URL first."), "warning");
            return;
        }

        try {
            const response = await fetch(url, { cache: "no-store" });
            if (!response.ok) {
                throw new Error(tRuntime("errorHttpStatus", { status: response.status }, `HTTP ${response.status}`));
            }
            const parsed = await response.json();
            upsertPrivateProfile(parsed, `url:${url}`);
        } catch (error) {
            const msg = parseError(error);
            setStatusText(dom.textPrivateStatus, tRuntime("privateImportFailed", { error: msg }, `Import failed: ${msg}`), "error");
            setNotice("error", tRuntime("privateImportFailed", { error: msg }, `Import failed: ${msg}`));
        }
    }

    function handleUpdatePrivateProfile() {
        const rawText = String(dom.textareaPrivateLocal?.value || "").trim();
        if (!rawText) {
            setStatusText(dom.textPrivateStatus, tRuntime("privateLocalRequired", null, "Paste profile JSON in local editor first."), "warning");
            return;
        }

        try {
            const parsed = JSON.parse(rawText);
            upsertPrivateProfile(parsed, "local-edit");
        } catch (error) {
            const msg = parseError(error);
            setStatusText(dom.textPrivateStatus, tRuntime("privateUpdateFailed", { error: msg }, `Update failed: ${msg}`), "error");
            setNotice("error", tRuntime("privateUpdateFailed", { error: msg }, `Update failed: ${msg}`));
        }
    }

    function clearActivityTimeline() {
        // Activity timeline was intentionally removed in v3 product redesign.
        return;
    }

    async function copyFromElement(sourceId) {
        const source = document.getElementById(sourceId);
        if (!source) return;
        const value = String(source.textContent || "").trim();
        if (!value || value === "-") return;

        try {
            await navigator.clipboard.writeText(value);
            setNotice("success", tRuntime("activityCopied", { text: shortAddress(value) }, "Copied to clipboard."));
        } catch {
            setNotice("error", tRuntime("activityCopyFailed", null, "Copy failed. Check browser clipboard permission."));
        }
    }

    function bindCopyButtons() {
        document.querySelectorAll("[data-copy-source]").forEach(function (button) {
            button.addEventListener("click", function () {
                const sourceId = String(button.getAttribute("data-copy-source") || "");
                if (sourceId) copyFromElement(sourceId);
            });
        });
    }

    function registerWalletEvents() {
        if (!window.ethereum || typeof window.ethereum.on !== "function") return;

        window.ethereum.on("accountsChanged", async function () {
            const previous = state.walletAddress;
            await syncWalletStateFromProvider();
            if (previous && previous !== state.walletAddress) {
                state.authenticated = false;
                state.commercialDataReady = false;
                state.commercialSuppliers = [];
                resetSelectedSupplier();
                renderCommercialList();
                renderSelectedSupplier();
                transitionState(MACHINE_STATES.WALLET_CONNECTED);
                setNotice("warning", tRuntime("authAccountChanged", null, "Account changed. Please sign in again."));
            }
        });

        window.ethereum.on("chainChanged", async function () {
            await syncWalletStateFromProvider();
            if (!state.baseReady) {
                state.authenticated = false;
                state.commercialDataReady = false;
                setNotice("warning", tRuntime("authChainChanged", null, "Network changed. Switch target Base network and sign in again."));
            }
            updateActionGuards();
            renderTopStatus();
        });
    }

    function bindViewNav() {
        document.querySelectorAll(".console-nav-btn").forEach(function (button) {
            button.addEventListener("click", function () {
                const view = String(button.getAttribute("data-view-target") || "overview");
                switchView(view);
            });
        });

        if (dom.btnGoCommercialView) {
            dom.btnGoCommercialView.addEventListener("click", function () {
                switchView("commercial");
            });
        }
    }

    function bindActions() {
        if (dom.btnConnectSignIn) dom.btnConnectSignIn.addEventListener("click", handleConnectAndSignIn);
        if (dom.btnSwitchBase) dom.btnSwitchBase.addEventListener("click", function () {
            handleSwitchBaseNetwork(false);
        });
        if (dom.btnDisconnect) dom.btnDisconnect.addEventListener("click", handleDisconnect);

        if (dom.selectTargetNetwork) {
            dom.selectTargetNetwork.addEventListener("change", async function () {
                setTargetNetworkSelection(dom.selectTargetNetwork.value, true);
                setNotice("pending", tRuntime("networkTargetChanged", null, "Target network changed. Switch network and sign in again."));
                if (state.authenticated && state.baseReady) {
                    await loadCommercialSuppliers();
                }
            });
        }

        if (dom.btnRefreshCommercial) dom.btnRefreshCommercial.addEventListener("click", loadCommercialSuppliers);
        if (dom.btnOpenRegisterForm) dom.btnOpenRegisterForm.addEventListener("click", function () {
            toggleRegisterForm();
        });
        if (dom.btnCloseRegisterModal) dom.btnCloseRegisterModal.addEventListener("click", function () {
            toggleRegisterForm(false);
        });

        document.querySelectorAll("[data-close-register-modal='true']").forEach(function (el) {
            el.addEventListener("click", function () {
                toggleRegisterForm(false);
            });
        });

        if (dom.formCommercialRegister) dom.formCommercialRegister.addEventListener("submit", handleRegisterCommercialSupplier);

        if (dom.btnRenewOneYear) dom.btnRenewOneYear.addEventListener("click", handleRenewCommercialSupplier);
        if (dom.btnSaveMetadata) dom.btnSaveMetadata.addEventListener("click", handleSaveMetadataURI);
        if (dom.btnTransferOwner) dom.btnTransferOwner.addEventListener("click", handleTransferOwner);

        if (dom.btnPreviewWithdraw) dom.btnPreviewWithdraw.addEventListener("click", handlePreviewWithdraw);
        if (dom.btnWithdraw) dom.btnWithdraw.addEventListener("click", handleWithdraw);
        if (dom.btnWithdrawAll) dom.btnWithdrawAll.addEventListener("click", handleWithdrawAll);

        if (dom.btnImportPrivateFile) dom.btnImportPrivateFile.addEventListener("click", handleImportPrivateFile);
        if (dom.btnImportPrivateUrl) dom.btnImportPrivateUrl.addEventListener("click", handleImportPrivateUrl);
        if (dom.btnUpdatePrivateLocal) dom.btnUpdatePrivateLocal.addEventListener("click", handleUpdatePrivateProfile);

        bindViewNav();
        bindCopyButtons();

        window.addEventListener("languageChanged", function () {
            renderTopStatus();
            renderCommercialList();
            renderSelectedSupplier();
            toggleRegisterForm(false);
            setNotice("muted", tRuntime("logConsoleInit", null, "Vendor console initialized"));
            if (dom.btnOpenRegisterForm) {
                dom.btnOpenRegisterForm.textContent = tPage("openRegisterFormButton", null, "Register New Supplier");
            }
        });
    }

    function cacheDom() {
        dom.btnConnectSignIn = document.getElementById("btn-connect-signin");
        dom.btnSwitchBase = document.getElementById("btn-switch-base");
        dom.btnDisconnect = document.getElementById("btn-disconnect");
        dom.selectTargetNetwork = document.getElementById("select-target-network");
        dom.badgeWallet = document.getElementById("badge-wallet");
        dom.badgeChain = document.getElementById("badge-chain");
        dom.textAuthStatus = document.getElementById("text-auth-status");
        dom.consoleNotice = document.getElementById("console-notice");

        dom.textCommercialCount = document.getElementById("text-commercial-count");
        dom.btnRefreshCommercial = document.getElementById("btn-refresh-commercial");
        dom.btnOpenRegisterForm = document.getElementById("btn-open-register-form");
        dom.listCommercialSuppliers = document.getElementById("list-commercial-suppliers");
        dom.emptyCommercialState = document.getElementById("empty-commercial-state");

        dom.registerModal = document.getElementById("register-modal");
        dom.btnCloseRegisterModal = document.getElementById("btn-close-register-modal");
        dom.formCommercialRegister = document.getElementById("form-commercial-register");
        dom.inputRegisterSupplierId = document.getElementById("input-register-supplier-id");
        dom.inputRegisterMetadataURI = document.getElementById("input-register-metadata-uri");
        dom.textAnnualFee = document.getElementById("text-annual-fee");
        dom.textWithdrawFee = document.getElementById("text-withdraw-fee");
        dom.textTreasury = document.getElementById("text-treasury");
        dom.btnRegisterSignSubmit = document.getElementById("btn-register-sign-submit");
        dom.textRegisterStatus = document.getElementById("text-register-status");

        dom.textSelectedSupplierId = document.getElementById("text-selected-supplier-id");
        dom.textSelectedOwner = document.getElementById("text-selected-owner");
        dom.textSelectedProfileAddress = document.getElementById("text-selected-profile-address");
        dom.textSelectedExpiry = document.getElementById("text-selected-expiry");
        dom.textSelectedActiveStatus = document.getElementById("text-selected-active-status");
        dom.btnRenewOneYear = document.getElementById("btn-renew-one-year");
        dom.textRenewStatus = document.getElementById("text-renew-status");

        dom.inputMetadataURI = document.getElementById("input-metadata-uri");
        dom.btnSaveMetadata = document.getElementById("btn-save-metadata");
        dom.textMetadataStatus = document.getElementById("text-metadata-status");
        dom.inputNewOwner = document.getElementById("input-new-owner");
        dom.btnTransferOwner = document.getElementById("btn-transfer-owner");
        dom.textTransferOwnerStatus = document.getElementById("text-transfer-owner-status");

        dom.inputWithdrawAmount = document.getElementById("input-withdraw-amount");
        dom.inputWithdrawTo = document.getElementById("input-withdraw-to");
        dom.btnPreviewWithdraw = document.getElementById("btn-preview-withdraw");
        dom.textWithdrawPreviewFee = document.getElementById("text-withdraw-preview-fee");
        dom.textWithdrawPreviewNet = document.getElementById("text-withdraw-preview-net");
        dom.btnWithdraw = document.getElementById("btn-withdraw");
        dom.btnWithdrawAll = document.getElementById("btn-withdraw-all");
        dom.textWithdrawStatus = document.getElementById("text-withdraw-status");

        dom.filePrivateProfile = document.getElementById("file-private-profile");
        dom.btnImportPrivateFile = document.getElementById("btn-import-private-file");
        dom.inputPrivateProfileUrl = document.getElementById("input-private-profile-url");
        dom.btnImportPrivateUrl = document.getElementById("btn-import-private-url");
        dom.textareaPrivateLocal = document.getElementById("textarea-private-local");
        dom.btnUpdatePrivateLocal = document.getElementById("btn-update-private-local");
        dom.textPrivateStatus = document.getElementById("text-private-status");

        dom.commercialLockOverlay = document.getElementById("commercial-lock-overlay");
        dom.btnGoCommercialView = document.getElementById("btn-go-commercial-view");
    }

    async function initializeVendorConsole() {
        cacheDom();
        setTargetNetworkSelection(state.targetNetworkKey, false);

        if (dom.textCommercialCount) dom.textCommercialCount.textContent = "0";
        if (dom.textAnnualFee) dom.textAnnualFee.textContent = "-";
        if (dom.textWithdrawFee) dom.textWithdrawFee.textContent = "-";
        if (dom.textTreasury) dom.textTreasury.textContent = "-";

        setStatusText(dom.textRegisterStatus, tPage("registerStatusIdle", null, "No register transaction submitted."), "muted");
        setStatusText(dom.textRenewStatus, tPage("renewStatusIdle", null, "No renewal submitted."), "muted");
        setStatusText(dom.textMetadataStatus, tPage("metadataStatusIdle", null, "No metadata update yet."), "muted");
        setStatusText(dom.textTransferOwnerStatus, tPage("transferOwnerStatusIdle", null, "No owner transfer yet."), "muted");
        setStatusText(dom.textWithdrawStatus, tPage("withdrawStatusIdle", null, "No withdraw transaction yet."), "muted");
        setStatusText(dom.textPrivateStatus, tPage("privateStatusIdle", null, "No private profile imported yet."), "muted");
        setNotice("muted", tRuntime("logConsoleInit", null, "Vendor console initialized"));

        switchView("overview");
        toggleRegisterForm(false);
        renderPrivateEditor();
        renderCommercialList();
        renderSelectedSupplier();
        renderTopStatus();
        updateActionGuards();

        bindActions();
        registerWalletEvents();

        try {
            await syncWalletStateFromProvider();
        } catch {
            renderTopStatus();
        }
    }

    window.MeshVendorConsole = {
        initializeVendorConsole,
        handleConnectAndSignIn,
        handleSwitchBaseNetwork,
        handleDisconnect,
        loadCommercialSuppliers,
        toggleRegisterForm,
        handleRegisterCommercialSupplier,
        handleRenewCommercialSupplier,
        handleSaveMetadataURI,
        handleTransferOwner,
        handlePreviewWithdraw,
        handleWithdraw,
        handleWithdrawAll,
        handleImportPrivateFile,
        handleImportPrivateUrl,
        handleUpdatePrivateProfile,
        clearActivityTimeline,
    };
})();
