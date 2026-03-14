/**
 * MeshNetProtocol Vendor Console
 * Main Logic Module (v14 - Standardized Domains, Cleaned Versioning)
 */

(function () {
    "use strict";

    const MESH_CONSOLE_VERSION = 18;
    console.log(`[MeshNet] Loading Vendor Console v${MESH_CONSOLE_VERSION}...`);

    // --- Constants & Configuration ---
    const NETWORKS = {
        "base-mainnet": { name: "Base Mainnet", chainIdHex: "0x2105" },
        "base-sepolia": { name: "Base Sepolia", chainIdHex: "0x14a34" }
    };

    const AI_DOMAIN_PRESETS = [
        // Text & General AI
        "openai.com", "chatgpt.com", "oaistatic.com", "oaiusercontent.com",
        "anthropic.com", "claude.ai",
        "perplexity.ai",
        "mistral.ai",
        "deepseek.com",
        "google.com", "gemini.google.com", "generativelanguage.googleapis.com",
        "bing.com",
        // Image & Video AI
        "midjourney.com",
        "runwayml.com",
        "pika.art",
        "luma.ai",
        "sora.com",
        // Audio & Music AI
        "suno.ai",
        "udio.com",
        "elevenlabs.io"
    ];

    const SINGBOX_TEMPLATE = {
        "provider_id": "com.meshnetprotocol.profile.v2.smart",
        "name": "启动种子",
        "description": "官方引导配置文件",
        "tags": ["Official", "SmartRouting", "V2"],
        "author": "OpenMesh Team",
        "visibility": "public",
        "status": "active",
        "updated_at": new Date().toISOString(),
        "package_hash": "seed-v2-smart",
        "source_updated_at": new Date().toISOString(),
        "config": {
            "log": { "level": "debug" },
            "dns": {
                "servers": [
                    { "tag": "local-dns", "address": "223.5.5.5", "detour": "direct" },
                    { "tag": "google-dns", "address": "https://dns.google/dns-query", "detour": "primary-selector" }
                ],
                "rules": [
                    { "rule_set": "geosite-geolocation-cn", "server": "local-dns" }
                ],
                "final": "google-dns",
                "strategy": "ipv4_only"
            },
            "inbounds": [
                {
                    "type": "tun",
                    "tag": "tun-in",
                    "address": ["198.18.0.1/15", "fdfe:dcba::1/126"],
                    "auto_route": true,
                    "sniff": true,
                    "sniff_override_destination": true
                }
            ],
            "outbounds": [],
            "route": {
                "rules": [
                    { "action": "sniff" },
                    { "protocol": "dns", "action": "hijack-dns" },
                    // MANUAL PROXY OVERRIDE GOES HERE (Index 2)
                    { "rule_set": "geosite-geolocation-cn", "outbound": "direct" },
                    { "rule_set": "geoip-cn", "outbound": "direct" },
                    { "ip_is_private": true, "outbound": "direct" }
                ],
                "final": "primary-selector",
                "auto_detect_interface": true,
                "rule_set": [
                    { "type": "remote", "tag": "geoip-cn", "format": "binary", "url": "https://raw.githubusercontent.com/SagerNet/sing-geoip/rule-set/geoip-cn.srs", "download_detour": "primary-selector", "update_interval": "1d" },
                    { "type": "remote", "tag": "geosite-geolocation-cn", "format": "binary", "url": "https://raw.githubusercontent.com/SagerNet/sing-geosite/rule-set/geosite-geolocation-cn.srs", "download_detour": "primary-selector", "update_interval": "1d" }
                ]
            }
        },
        "routing_rules": {
            "version": 2,
            "proxy": {
                "domain": [],
                "domain_suffix": []
            }
        }
    };

    // --- State ---
    const state = {
        targetNetwork: "base-mainnet",
        chainIdHex: "",
        connected: false,
        signedIn: false,
        address: "",
        userDomains: []
    };

    // --- Shared DOM Map ---
    let dom = {};

    function initDomMap() {
        dom = {
            selectTargetNetwork: document.getElementById("select-target-network"),
            networkDot: document.getElementById("network-dot"),
            btnConnectSignin: document.getElementById("btn-connect-signin"),
            btnInstallMetaMask: document.getElementById("btn-install-metamask"),
            gateDesc: document.getElementById("gate-desc"),
            textAuthStatus: document.getElementById("text-auth-status"),
            btnEnterPrivate: document.getElementById("btn-enter-private"),
            btnPrivateBack: document.getElementById("btn-private-back"),
            entryStage: document.getElementById("entry-stage"),
            privateArea: document.getElementById("private-operation-area"),
            subviews: {
                main: document.getElementById("subview-private-main"),
                config: document.getElementById("subview-private-config"),
                vps: document.getElementById("subview-private-vps"),
                import: document.getElementById("subview-private-import"),
                "json-preview": document.getElementById("subview-private-json-preview"),
                advanced: document.getElementById("subview-private-advanced")
            },
            viewTitle: document.getElementById("private-view-title"),
            parserModal: document.getElementById("subview-private-parse"),
            serverList: document.getElementById("server-list-container"),
            domainChipGrid: document.getElementById("domain-chip-grid"),
            jsonEditor: document.getElementById("advanced-json-editor"),
            promptModal: document.getElementById("global-prompt-modal"),
            promptTitle: document.getElementById("prompt-title"),
            promptMsg: document.getElementById("prompt-message"),
            promptActions: document.getElementById("prompt-actions")
        };
    }

    // --- Utility Functions ---
    const utils = {
        hasMetaMask: () => Boolean(window.ethereum && window.ethereum.isMetaMask),
        shortAddress: (value) => {
            if (!value) return "";
            return value.length > 10 ? value.slice(0, 6) + "..." + value.slice(-4) : value;
        },
        setStatus: (level, text) => {
            if (!dom.textAuthStatus) return;
            dom.textAuthStatus.textContent = text;
            dom.textAuthStatus.classList.remove("success", "warning", "error", "pending");
            if (level) dom.textAuthStatus.classList.add(level);
        },
        isBaseReady: () => {
            return Boolean(state.chainIdHex) &&
                state.chainIdHex.toLowerCase() === NETWORKS[state.targetNetwork].chainIdHex;
        },
        getSessionKey: (address) => `mesh_vendor_session_${address.toLowerCase()}`,
        copyCode: (btn, targetId) => {
            const codeEl = document.getElementById(targetId);
            if (!codeEl) return;
            navigator.clipboard.writeText(codeEl.textContent).then(() => {
                const originalText = btn.textContent;
                btn.textContent = "已复制 Copied!";
                setTimeout(() => { btn.textContent = originalText; }, 2000);
            });
        }
    };

    const session = {
        hasValid: (address) => {
            const data = localStorage.getItem(utils.getSessionKey(address));
            if (!data) return false;
            try {
                const s = JSON.parse(data);
                return (Date.now() - s.timestamp) < 24 * 60 * 60 * 1000;
            } catch { return false; }
        },
        create: (address) => {
            const data = { address: address.toLowerCase(), timestamp: Date.now() };
            localStorage.setItem(utils.getSessionKey(address), JSON.stringify(data));
        }
    };

    function switchSubView(viewKey, title) {
        Object.values(dom.subviews).forEach(v => { if (v) v.classList.add("hidden"); });
        if (dom.subviews[viewKey]) dom.subviews[viewKey].classList.remove("hidden");
        if (dom.viewTitle) dom.viewTitle.textContent = title;
        
        // Add/remove advanced lab class on console-shell for width control
        if (dom.privateArea) {
            if (viewKey === "advanced") {
                dom.privateArea.closest(".console-shell").classList.add("advanced-lab-active");
            } else {
                dom.privateArea.closest(".console-shell").classList.remove("advanced-lab-active");
            }
        }
    }

    function showPrompt(title, message, buttons = []) {
        return new Promise((resolve) => {
            if (!dom.promptModal) return resolve(false);
            dom.promptTitle.textContent = title;
            dom.promptMsg.textContent = message;
            dom.promptActions.innerHTML = "";

            buttons.forEach(btn => {
                const b = document.createElement("button");
                b.className = btn.primary ? "btn btn-primary" : "btn ghost";
                b.textContent = btn.label;
                b.onclick = () => {
                    dom.promptModal.classList.remove("shown");
                    resolve(btn.label === "确定");
                };
                dom.promptActions.appendChild(b);
            });
            dom.promptModal.classList.add("shown");
        });
    }

    function notify(msg, title = "提示") {
        return showPrompt(title, msg, [{ label: "确定", primary: true }]);
    }

    function confirmAction(msg, title = "操作确认") {
        return showPrompt(title, msg, [
            { label: "取消", primary: false },
            { label: "确定", primary: true }
        ]);
    }

    function renderDomainChips() {
        const mandatory = ["githubusercontent.com", "workers.dev"];
        if (!dom.domainChipGrid) return;
        dom.domainChipGrid.innerHTML = "";

        mandatory.forEach(domain => {
            const chip = document.createElement("div");
            chip.className = "domain-chip mandatory";
            chip.innerHTML = `<span>${domain}</span><span style="font-size:0.7rem; opacity:0.6;">🛡️</span>`;
            dom.domainChipGrid.appendChild(chip);
        });

        state.userDomains.forEach((domain, idx) => {
            const chip = document.createElement("div");
            chip.className = "domain-chip";
            chip.innerHTML = `<span>${domain}</span><div class="remove-chip" onclick="removeDomainChip(${idx})">✕</div>`;
            dom.domainChipGrid.appendChild(chip);
        });
    }

    window.removeDomainChip = (idx) => {
        state.userDomains.splice(idx, 1);
        renderDomainChips();
    };

    window.injectDomainPreset = (type) => {
        const list = type === 'ai' ? AI_DOMAIN_PRESETS : ["amazon.com", "ebay.com", "shopify.com"];
        let count = 0;
        list.forEach(d => {
            if (!state.userDomains.includes(d)) {
                state.userDomains.push(d);
                count++;
            }
        });
        renderDomainChips();
        if (count > 0) notify(`成功注入 ${count} 个核心后缀。`, "注入成功");
    };

    function addServerItem(ip = "", port = "10086", pass = "", name = "", region = "") {
        const div = document.createElement("div");
        div.className = "server-item";
        div.style.gridTemplateColumns = "120px 80px 1.2fr 80px 1.2fr auto";
        div.innerHTML = `
      <input type="text" class="form-control" placeholder="名称" value="${name}">
      <input type="text" class="form-control" placeholder="地区" value="${region}">
      <input type="text" class="form-control" placeholder="IP 地址" value="${ip}" oninput="validateServerIP(this)">
      <input type="number" class="form-control" placeholder="端口" value="${port}">
      <div class="input-group-pass">
        <input type="password" class="form-control" placeholder="密码" value="${pass}">
        <div class="btn-toggle-pass" onclick="togglePassVisibility(this)">👁️</div>
      </div>
      <div class="btn-remove-server" onclick="this.parentElement.remove()" style="padding: 0 0.5rem; cursor:pointer; color:#fca5a5; font-size:1.2rem;">✕</div>
      <div class="server-validation-msg"></div>
    `;
        if (dom.serverList) dom.serverList.appendChild(div);
        if (ip) validateServerIP(div.querySelector('input[placeholder="IP 地址"]'));
    }

    window.validateServerIP = (el) => {
        const val = el.value.trim();
        const msgEl = el.parentElement.querySelector('.server-validation-msg');
        if (!msgEl) return;
        el.classList.remove('invalid-ip', 'warning-ip');
        msgEl.className = 'server-validation-msg';
        msgEl.textContent = '';
        if (!val) return;
        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        if (!ipv4Regex.test(val)) {
            el.classList.add('invalid-ip');
            msgEl.classList.add('error');
            msgEl.textContent = '❌ 无效的 IP 地址格式';
        }
    };

    window.togglePassVisibility = (el) => {
        const input = el.parentElement.querySelector('input');
        const isPass = input.type === "password";
        input.type = isPass ? "text" : "password";
        el.textContent = isPass ? "👁️‍🗨️" : "👁️";
    };

    async function syncChain() {
        if (!utils.hasMetaMask()) return;
        try {
            state.chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
        } catch { state.chainIdHex = ""; }
        renderNetworkStatusDot();
    }

    function renderNetworkStatusDot() {
        if (!dom.networkDot) return;
        const ready = utils.isBaseReady();
        dom.networkDot.classList.remove("ready", "not-ready");
        dom.networkDot.classList.add(ready ? "ready" : "not-ready");
    }

    function renderAuthGate() {
        const installed = utils.hasMetaMask();
        if (dom.btnConnectSignin) dom.btnConnectSignin.classList.toggle("hidden", !installed);
        if (dom.btnInstallMetaMask) dom.btnInstallMetaMask.classList.toggle("hidden", installed);
        if (!installed) {
            utils.setStatus("warning", "MetaMask not found.");
            if (dom.gateDesc) dom.gateDesc.textContent = "浏览器未检测到 MetaMask。";
            return;
        }
        if (!state.connected) {
            utils.setStatus("", "MetaMask detected.");
            if (dom.gateDesc) dom.gateDesc.textContent = "请选择网络后连接钱包。";
            if (dom.btnConnectSignin) dom.btnConnectSignin.textContent = "Sign In By MetaMask";
            return;
        }
        if (!state.signedIn) {
            utils.setStatus("warning", "Signature required.");
            if (dom.btnConnectSignin) dom.btnConnectSignin.textContent = "Sign In & Authorize";
            return;
        }
        if (!utils.isBaseReady()) {
            utils.setStatus("warning", "Network mismatch.");
            if (dom.btnConnectSignin) dom.btnConnectSignin.textContent = "Switch Network to Enter";
            return;
        }
        utils.setStatus("success", "Commercial session ready");
        if (dom.btnConnectSignin) dom.btnConnectSignin.textContent = "Enter Workspace";
    }

    async function connectAndSignIn() {
        if (!utils.hasMetaMask()) return renderAuthGate();
        if (state.signedIn && utils.isBaseReady()) return;
        try {
            if (!state.connected) {
                utils.setStatus("pending", "Connecting...");
                const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                state.address = accounts[0] || "";
                state.connected = Boolean(state.address);
            }
            try {
                await window.ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: NETWORKS[state.targetNetwork].chainIdHex }]
                });
                await syncChain();
            } catch (e) {
                utils.setStatus("error", "Network switch rejected.");
                return;
            }
            if (session.hasValid(state.address)) {
                state.signedIn = true;
            } else {
                utils.setStatus("pending", "Awaiting signature...");
                await window.ethereum.request({
                    method: "personal_sign",
                    params: ["MeshNetProtocol Vendor Console Sign-In", state.address]
                });
                session.create(state.address);
                state.signedIn = true;
            }
            renderAuthGate();
        } catch (e) {
            state.signedIn = false;
            utils.setStatus("error", "Auth failed.");
        }
    }

    function bindEvents() {
        if (dom.selectTargetNetwork) dom.selectTargetNetwork.addEventListener("change", async () => {
            state.targetNetwork = dom.selectTargetNetwork.value;
            await syncChain(); renderAuthGate();
        });
        if (dom.btnConnectSignin) dom.btnConnectSignin.addEventListener("click", connectAndSignIn);
        // Helper function to get translated title
        function getPrivateWorkspaceTitle() {
            const lang = window.i18n && window.i18n.getCurrentLanguage ? window.i18n.getCurrentLanguage() : 'zh';
            const translations = window.i18n && window.i18n.translations ? window.i18n.translations[lang] : null;
            const titleKey = 'vendorConsole.privateWorkspace.title';
            let title = translations && window.i18n.getTranslation ? window.i18n.getTranslation(translations, titleKey) : null;
            if (!title && lang === 'en') {
                const enTranslations = window.i18n && window.i18n.translations ? window.i18n.translations.en : null;
                title = enTranslations && window.i18n.getTranslation ? window.i18n.getTranslation(enTranslations, 'vendorConsoleEn.privateWorkspace.title') : null;
            }
            return title || (lang === 'zh' ? '私人工作空间' : 'Private Workspace');
        }

        if (dom.btnEnterPrivate) dom.btnEnterPrivate.addEventListener("click", () => {
            console.log("[MeshNet] Entering Private Workspace...");
            if (dom.entryStage) dom.entryStage.classList.add("hidden");
            if (dom.privateArea) dom.privateArea.classList.remove("hidden");
            switchSubView("main", getPrivateWorkspaceTitle());
        });
        if (dom.btnPrivateBack) dom.btnPrivateBack.addEventListener("click", () => {
            console.log("[MeshNet] Back to entry stage...");
            if (dom.subviews.main && !dom.subviews.main.classList.contains("hidden")) {
                if (dom.privateArea) dom.privateArea.classList.add("hidden");
                if (dom.entryStage) dom.entryStage.classList.remove("hidden");
            } else { switchSubView("main", getPrivateWorkspaceTitle()); }
        });
        document.querySelectorAll(".btn-cancel").forEach(btn => btn.addEventListener("click", () => switchSubView("main", getPrivateWorkspaceTitle())));

        const gotoConfigBtn = document.getElementById("btn-goto-config");
        if (gotoConfigBtn) gotoConfigBtn.addEventListener("click", () => {
            const lang = window.i18n && window.i18n.getCurrentLanguage ? window.i18n.getCurrentLanguage() : 'zh';
            const translations = window.i18n && window.i18n.translations ? window.i18n.translations[lang] : null;
            const titleKey = 'vendorConsole.privateWorkspace.modules.config.title';
            let title = translations && window.i18n.getTranslation ? window.i18n.getTranslation(translations, titleKey) : null;
            if (!title && lang === 'en') {
                const enTranslations = window.i18n && window.i18n.translations ? window.i18n.translations.en : null;
                title = enTranslations && window.i18n.getTranslation ? window.i18n.getTranslation(enTranslations, 'vendorConsoleEn.privateWorkspace.modules.config.title') : null;
            }
            if (!title) title = lang === 'zh' ? '生成配置文件 (Wizard)' : 'Generate Configuration (Wizard)';
            switchSubView("config", title);
            if (dom.serverList) dom.serverList.innerHTML = "";
            state.userDomains = []; renderDomainChips();
        });
        const gotoVpsBtn = document.getElementById("btn-goto-vps");
        if (gotoVpsBtn) gotoVpsBtn.addEventListener("click", () => {
            const lang = window.i18n && window.i18n.getCurrentLanguage ? window.i18n.getCurrentLanguage() : 'zh';
            const translations = window.i18n && window.i18n.translations ? window.i18n.translations[lang] : null;
            const titleKey = 'vendorConsole.privateWorkspace.modules.vps.title';
            let title = translations && window.i18n.getTranslation ? window.i18n.getTranslation(translations, titleKey) : null;
            if (!title && lang === 'en') {
                const enTranslations = window.i18n && window.i18n.translations ? window.i18n.translations.en : null;
                title = enTranslations && window.i18n.getTranslation ? window.i18n.getTranslation(enTranslations, 'vendorConsoleEn.privateWorkspace.modules.vps.title') : null;
            }
            if (!title) title = lang === 'zh' ? '购买与部署指引' : 'Purchase & Deploy VPS';
            switchSubView("vps", title);
        });
        const gotoImportBtn = document.getElementById("btn-goto-import");
        if (gotoImportBtn) gotoImportBtn.addEventListener("click", () => {
            const lang = window.i18n && window.i18n.getCurrentLanguage ? window.i18n.getCurrentLanguage() : 'zh';
            const translations = window.i18n && window.i18n.translations ? window.i18n.translations[lang] : null;
            const titleKey = 'vendorConsole.privateWorkspace.modules.import.title';
            let title = translations && window.i18n.getTranslation ? window.i18n.getTranslation(translations, titleKey) : null;
            if (!title && lang === 'en') {
                const enTranslations = window.i18n && window.i18n.translations ? window.i18n.translations.en : null;
                title = enTranslations && window.i18n.getTranslation ? window.i18n.getTranslation(enTranslations, 'vendorConsoleEn.privateWorkspace.modules.import.title') : null;
            }
            if (!title) title = lang === 'zh' ? '导入 APP 教程' : 'Import APP';
            switchSubView("import", title);
        });
        const gotoAdvancedBtn = document.getElementById("btn-goto-advanced");
        if (gotoAdvancedBtn) gotoAdvancedBtn.addEventListener("click", () => {
            // Show the integrated Sing-Box Configuration Lab
            const lang = window.i18n && window.i18n.getCurrentLanguage ? window.i18n.getCurrentLanguage() : 'zh';
            const translations = window.i18n && window.i18n.translations ? window.i18n.translations[lang] : null;
            const titleKey = 'vendorConsole.privateWorkspace.modules.advanced.title';
            let title = translations && window.i18n.getTranslation ? window.i18n.getTranslation(translations, titleKey) : null;
            if (!title && lang === 'en') {
                const enTranslations = window.i18n && window.i18n.translations ? window.i18n.translations.en : null;
                title = enTranslations && window.i18n.getTranslation ? window.i18n.getTranslation(enTranslations, 'vendorConsoleEn.privateWorkspace.modules.advanced.title') : null;
            }
            if (!title) title = lang === 'zh' ? 'Sing-Box 配置实验室' : 'Sing-Box Configuration Lab';
            switchSubView("advanced", title);
            
            // Initialize the lab modules
            setTimeout(() => {
                if (window.LabsForm) window.LabsForm.init();
                if (window.LabsPreview) window.LabsPreview.init();
                // Skip old Animation module - using network-flow instead
                // if (window.LabsAnimation) window.LabsAnimation.init();
            }, 100);
        });

        // Helper function: Show JSON preview modal
        function showJsonPreviewModal(jsonStr) {
            // Create modal if not exists
            let modal = document.getElementById('json-preview-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'json-preview-modal';
                modal.className = 'modal-backdrop';
                modal.innerHTML = `
                    <div class="modal-content" style="max-width: 800px;">
                        <h3 style="margin-top:0;">📄 JSON 配置预览</h3>
                        <p style="font-size:0.9rem; color:#94a3b8; margin-bottom:1rem;">以下是根据当前配置生成的 sing-box 配置文件：</p>
                        <textarea id="modal-json-textarea" class="json-textarea" style="height:400px; font-family:'IBM Plex Mono',monospace; font-size:0.875rem;"></textarea>
                        <div style="display:flex; gap:1rem; justify-content:flex-end; margin-top:1rem;">
                            <button id="modal-copy-json" class="btn btn-primary">📋 复制</button>
                            <button id="modal-download-json" class="btn btn-secondary">💾 下载</button>
                            <button id="modal-close-json" class="btn ghost">关闭</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
                
                // Bind modal events
                modal.querySelector('#modal-close-json').addEventListener('click', () => {
                    modal.classList.remove('shown');
                });
                
                modal.querySelector('#modal-copy-json').addEventListener('click', () => {
                    const textarea = modal.querySelector('#modal-json-textarea');
                    navigator.clipboard.writeText(textarea.value);
                    notify('已复制到剪贴板', '成功');
                });
                
                modal.querySelector('#modal-download-json').addEventListener('click', () => {
                    const textarea = modal.querySelector('#modal-json-textarea');
                    const blob = new Blob([textarea.value], { type: 'application/json' });
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = 'mesh-config.json';
                    a.click();
                    notify('下载已开始', '成功');
                });
                
                // Close on backdrop click
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.classList.remove('shown');
                    }
                });
            }
            
            // Show modal with JSON
            modal.querySelector('#modal-json-textarea').value = jsonStr;
            modal.classList.add('shown');
        }

        // VPS Guide specific - Navigate to config after getting credentials
        const btnVpsToConfig = document.getElementById("btn-vps-to-config");
        if (btnVpsToConfig) btnVpsToConfig.addEventListener("click", () => {
            console.log("[MeshNet] VPS to Config navigation triggered");
            gotoConfigBtn.click();
        });

        const genIdBtn = document.getElementById("btn-gen-id");
        if (genIdBtn) genIdBtn.addEventListener("click", () => {
            const idInput = document.getElementById("config-id");
            if (idInput) idInput.value = `com.mesh.${Math.random().toString(36).slice(2, 7)}.${Date.now().toString(36).slice(-4)}.v1`;
            const fields = document.getElementById("wizard-main-fields");
            if (fields) fields.classList.add("config-unlocked");
        });

        const openParserBtn = document.getElementById("btn-open-parser");
        if (openParserBtn) openParserBtn.addEventListener("click", () => dom.parserModal.classList.add("shown"));
        const closeParserBtn = document.getElementById("btn-close-parser");
        if (closeParserBtn) closeParserBtn.addEventListener("click", () => dom.parserModal.classList.remove("shown"));

        const doParseBtn = document.getElementById("btn-do-parse");
        if (doParseBtn) doParseBtn.addEventListener("click", () => {
            console.log("[MeshNet] Parsing JSON...");
            const area = document.getElementById("import-json-textarea");
            try {
                const data = JSON.parse(area.value);
                const resolvedId = data.provider_id || data.id;
                if (!resolvedId) throw new Error("缺少标识符字段 (provider_id)");

                document.getElementById("config-id").value = resolvedId;
                document.getElementById("config-name").value = data.name || "";
                document.getElementById("config-desc").value = data.description || "";

                dom.serverList.innerHTML = "";
                // 智能检测节点
                let rawServers = [];
                if (Array.isArray(data.servers)) {
                    rawServers = data.servers;
                } else {
                    // 从 sing-box config 中提取
                    const config = data.config || data;
                    const outbounds = config.outbounds || [];
                    rawServers = outbounds.filter(o => o.server && (o.server_port || o.port));
                }

                if (rawServers.length === 0) {
                    console.warn("[MeshNet] No servers found in JSON.");
                }

                rawServers.forEach(s => {
                    let name = s.tag || "";
                    let region = s._region || "";
                    if (!region && name.includes("[") && name.includes("]")) {
                        const match = name.match(/\[(.*?)\]/);
                        if (match) {
                            region = match[1];
                            name = name.replace(` [${region}]`, "").replace(`[${region}]`, "").trim();
                        }
                    }
                    addServerItem(s.ip || s.server, s.port || s.server_port, s.pass || s.password || s.pass || s.password, name, region);
                });

                state.userDomains = [];
                const mandatory = ["githubusercontent.com", "workers.dev"];
                let suffixes = [];

                // SmartRouting V2: Detection priority
                if (data.config && data.config.route && Array.isArray(data.config.route.rules)) {
                    const proxyRule = data.config.route.rules.find(r => r.domain_suffix && (r.outbound === 'primary-selector' || r.outbound === 'proxy'));
                    if (proxyRule && Array.isArray(proxyRule.domain_suffix)) {
                        suffixes = proxyRule.domain_suffix;
                    }
                }

                // Fallback for the old routing_rules format
                if (suffixes.length === 0 && data.routing_rules && Array.isArray(data.routing_rules.domain_suffix)) {
                    suffixes = data.routing_rules.domain_suffix;
                }

                suffixes.forEach(ds => {
                    const clean = ds.startsWith('.') ? ds.slice(1) : ds;
                    if (!mandatory.includes(clean)) state.userDomains.push(clean);
                });

                renderDomainChips();
                document.getElementById("wizard-main-fields")?.classList.add("config-unlocked");
                dom.parserModal.classList.remove("shown");
                area.value = "";
                notify("回填成功", "解析完成");
                console.log("[MeshNet] Parsing complete.");
            } catch (e) {
                console.error("[MeshNet] Parse error:", e);
                notify("解析失败: " + e.message, "格式错误");
            }
        });

        const addServerBtn = document.getElementById("btn-add-server");
        if (addServerBtn) addServerBtn.addEventListener("click", () => addServerItem());
        const addDomainBtn = document.getElementById("btn-do-add-domain");
        if (addDomainBtn) addDomainBtn.addEventListener("click", () => {
            const input = document.getElementById("input-quick-add-domain");
            let val = input.value.trim().toLowerCase();
            if (!val) return;
            state.userDomains.push(val); renderDomainChips(); input.value = "";
        });

        const generateBtn = document.getElementById("btn-generate-json");
        if (generateBtn) generateBtn.addEventListener("click", () => {
            const nameInput = document.getElementById("config-name");
            const name = nameInput ? nameInput.value.trim() : "";
            if (!name) return notify("请输入供应商名称", "校验未通过");
            const userServers = Array.from(dom.serverList.children).map(item => {
                const inputs = item.querySelectorAll("input");
                return {
                    name: inputs[0].value.trim(),
                    region: inputs[1].value.trim(),
                    ip: inputs[2].value.trim(),
                    port: parseInt(inputs[3].value),
                    pass: inputs[4].value.trim()
                };
            }).filter(s => s.ip && s.port);
            if (userServers.length === 0) return notify("尚未配置节点。", "缺少配置");

            const final = JSON.parse(JSON.stringify(SINGBOX_TEMPLATE));
            final.provider_id = document.getElementById("config-id").value || final.provider_id;
            final.name = name;
            final.description = document.getElementById("config-desc").value.trim();
            final.updated_at = new Date().toISOString();
            const nodes = userServers.map((s, i) => {
                let tag = s.name || `node-${i + 1}`;
                if (s.region) tag += ` [${s.region}]`;
                return {
                    type: "shadowsocks",
                    tag: tag,
                    server: s.ip,
                    server_port: s.port,
                    method: "aes-256-gcm",
                    password: s.pass
                };
            });
            const proxyGroup = { tag: "primary-selector", type: "selector", outbounds: nodes.map(n => n.tag), default: nodes[0].tag };
            final.config.outbounds = [...nodes, proxyGroup, { type: "direct", tag: "direct", domain_strategy: "ipv4_only", fallback_delay: "300ms" }];
            // 确保后缀不带点，遵循 standard 规范
            const domains = [...AI_DOMAIN_PRESETS];
            state.userDomains.forEach(d => {
                const clean = d.startsWith('.') ? d.slice(1) : d;
                if (!domains.includes(clean)) domains.push(clean);
            });
            const manualProxySet = [...new Set(domains)];

            // SmartRouting V2: Inject high-priority proxy override rule at index 2
            final.config.route.rules.splice(2, 0, {
                domain_suffix: manualProxySet,
                outbound: "primary-selector"
            });

            final.routing_rules = {
                version: 2,
                proxy: {
                    domain: [],
                    domain_suffix: []
                }
            };
            
            // Switch to new JSON preview sub-view (for generated config)
            switchSubView("json-preview", "JSON 配置预览");
            const previewTextarea = document.getElementById("generated-json-preview");
            if (previewTextarea) {
                previewTextarea.value = JSON.stringify(final, null, 2);
            }
        });

        const checkJsonBtn = document.getElementById("btn-check-json");
        if (checkJsonBtn) checkJsonBtn.addEventListener("click", () => { try { JSON.parse(dom.jsonEditor.value); notify("语法正确。", "校验成功"); } catch (e) { notify("格式错误：" + e.message, "失败"); } });
        const copyJsonBtn = document.getElementById("btn-copy-json");
        if (copyJsonBtn) copyJsonBtn.addEventListener("click", () => { navigator.clipboard.writeText(dom.jsonEditor.value); notify("已复制", "成功"); });
        const saveFileBtn = document.getElementById("btn-save-file");
        if (saveFileBtn) saveFileBtn.addEventListener("click", () => {
            const blob = new Blob([dom.jsonEditor.value], { type: "application/json" });
            const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "mesh-config.json"; a.click();
        });
        
        // Generated JSON Preview buttons
        const copyGeneratedJsonBtn = document.getElementById("btn-copy-generated-json");
        if (copyGeneratedJsonBtn) copyGeneratedJsonBtn.addEventListener("click", () => {
            const textarea = document.getElementById("generated-json-preview");
            if (textarea) {
                navigator.clipboard.writeText(textarea.value);
                notify("已复制到剪贴板", "成功");
            }
        });
                
        const downloadGeneratedJsonBtn = document.getElementById("btn-download-generated-json");
        if (downloadGeneratedJsonBtn) downloadGeneratedJsonBtn.addEventListener("click", () => {
            const textarea = document.getElementById("generated-json-preview");
            if (textarea) {
                const blob = new Blob([textarea.value], { type: "application/json" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "mesh-config.json";
                a.click();
                notify("下载已开始", "成功");
            }
        });

        if (utils.hasMetaMask()) {
            window.ethereum.on("chainChanged", (cid) => { state.chainIdHex = String(cid || ""); renderNetworkStatusDot(); renderAuthGate(); });
            window.ethereum.on("accountsChanged", (accs) => { state.address = accs[0] || ""; state.connected = Boolean(state.address); state.signedIn = false; renderAuthGate(); });
        }
    }

    async function bootstrap() {
        console.log("[MeshNet] Bootstrap started...");
        initDomMap();
        bindEvents();

        try {
            await syncChain();
            if (utils.hasMetaMask()) {
                const accounts = await window.ethereum.request({ method: "eth_accounts" });
                state.address = accounts[0] || "";
                state.connected = Boolean(state.address);
                if (state.connected && session.hasValid(state.address)) state.signedIn = true;
            }
        } catch (e) {
            console.error("[MeshNet] MetaMask init failed/blocked:", e);
        }

        renderAuthGate();
        window.MESH_CONSOLE_V = MESH_CONSOLE_VERSION;

        // Compatibility for inline HTML handlers
        window.MeshVendor = window.MeshVendor || {};
        window.MeshVendor.Private = {
            copyCode: utils.copyCode,
            removeDomainChip: window.removeDomainChip,
            injectDomainPreset: window.injectDomainPreset,
            validateServerIP: window.validateServerIP,
            togglePassVisibility: window.togglePassVisibility
        };

        console.log(`[MeshNet] Console v${MESH_CONSOLE_VERSION} ready.`);
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootstrap); else bootstrap();
})();
