/**
 * MeshNetProtocol Vendor Console
 * Main Logic Module (v9 Fix - Flat Routing Rules)
 */

(function () {
    "use strict";

    // --- Constants & Configuration ---
    const NETWORKS = {
        "base-mainnet": { name: "Base Mainnet", chainIdHex: "0x2105" },
        "base-sepolia": { name: "Base Sepolia", chainIdHex: "0x14a34" }
    };

    const SINGBOX_TEMPLATE = {
        "provider_id": "com.meshnetprotocol.profile",
        "name": "启动种子",
        "description": "官方引导配置文件",
        "tags": ["Official", "Online", "Bootstrap"],
        "author": "OpenMesh Team",
        "visibility": "public",
        "status": "active",
        "updated_at": "1970-01-01T00:00:00Z",
        "package_hash": "seed-0",
        "source_updated_at": "2026-02-08T00:00:00Z",
        "config": {
            "dns": {
                "final": "google-dns",
                "reverse_mapping": true,
                "rules": [
                    { "action": "route", "rule_set": "geosite-geolocation-cn", "server": "local-dns", "strategy": "ipv4_only" }
                ],
                "servers": [
                    { "detour": "proxy", "server": "dns.google", "tag": "google-dns", "type": "https" },
                    { "detour": "direct", "server": "223.5.5.5", "tag": "local-dns", "type": "udp" }
                ],
                "strategy": "ipv4_only"
            },
            "inbounds": [
                {
                    "address": ["172.18.0.1/30", "fdfe:dcba:9876::1/126"],
                    "auto_route": true,
                    "route_exclude_address": [
                        "127.0.0.0/8", "10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16", "169.254.0.0/16",
                        "223.5.5.5/32", "::1/128", "fc00::/7", "fe80::/10"
                    ],
                    "route_exclude_address_set": ["geoip-cn"],
                    "strict_route": false,
                    "tag": "tun-in",
                    "type": "tun",
                    "sniff": true,
                    "sniff_override_destination": true
                }
            ],
            "experimental": { "cache_file": { "enabled": true } },
            "log": { "level": "debug" },
            "outbounds": [
                { "type": "shadowsocks", "tag": "meshflux168", "server": "45.32.115.168", "server_port": 10086, "method": "aes-256-gcm", "password": "yourpassword123" },
                { "type": "shadowsocks", "tag": "meshflux252", "server": "45.76.45.252", "server_port": 10086, "method": "aes-256-gcm", "password": "yourpassword123" },
                { "type": "selector", "tag": "proxy", "outbounds": ["meshflux168", "meshflux252"], "default": "meshflux168" },
                { "domain_strategy": "ipv4_only", "fallback_delay": "300ms", "tag": "direct", "type": "direct" }
            ],
            "route": {
                "auto_detect_interface": true,
                "default_domain_resolver": "google-dns",
                "final": "proxy",
                "rule_set": [
                    { "type": "remote", "tag": "geoip-cn", "format": "binary", "url": "https://raw.githubusercontent.com/SagerNet/sing-geoip/rule-set/geoip-cn.srs", "download_detour": "proxy", "update_interval": "1d" },
                    { "type": "remote", "tag": "geosite-geolocation-cn", "format": "binary", "url": "https://raw.githubusercontent.com/SagerNet/sing-geosite/rule-set/geosite-geolocation-cn.srs", "download_detour": "proxy", "update_interval": "1d" }
                ],
                "rules": [
                    { "action": "hijack-dns", "protocol": "dns" },
                    { "action": "sniff" },
                    { "rule_set": "geosite-geolocation-cn", "outbound": "direct" },
                    { "rule_set": "geoip-cn", "outbound": "direct" }
                ]
            }
        },
        "routing_rules": {
            "version": 8,
            "domain": ["openmesh-api.ribencong.workers.dev", "raw.githubusercontent.com"],
            "domain_suffix": ["githubusercontent.com", "workers.dev"]
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
            // Sub-views
            subviews: {
                main: document.getElementById("subview-private-main"),
                config: document.getElementById("subview-private-config"),
                vps: document.getElementById("subview-private-vps"),
                import: document.getElementById("subview-private-import"),
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
            dom.textAuthStatus.textContent = text;
            dom.textAuthStatus.classList.remove("success", "warning", "error", "pending");
            if (level) dom.textAuthStatus.classList.add(level);
        },
        isBaseReady: () => {
            return Boolean(state.chainIdHex) &&
                state.chainIdHex.toLowerCase() === NETWORKS[state.targetNetwork].chainIdHex;
        },
        getSessionKey: (address) => `mesh_vendor_session_${address.toLowerCase()}`
    };

    // --- Session Management ---
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

    // --- UI Components & Modals ---
    function switchSubView(viewKey, title) {
        Object.values(dom.subviews).forEach(v => v.classList.add("hidden"));
        dom.subviews[viewKey].classList.remove("hidden");
        dom.viewTitle.textContent = title;
    }

    function showPrompt(title, message, buttons = []) {
        return new Promise((resolve) => {
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

    // --- Domain & Server Management ---
    function renderDomainChips() {
        const mandatory = ["githubusercontent.com", "workers.dev"];
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
        const presets = {
            ai: [
                "openai.com", "chatgpt.com", "oaistatic.com", "oaiusercontent.com", "anthropic.com", "claude.ai",
                "perplexity.ai", "deepseek.com", "mistral.ai", "groq.com", "cohere.com",
                "gemini.google.com", "ai.google.dev", "aistudio.google.com", "accounts.google.com", "gstatic.com", "googleusercontent.com",
                "github.com", "api.github.com", "githubassets.com", "cursor.com", "cursor.sh", "huggingface.co", "discord.com"
            ],
            shop: ["amazon.com", "ebay.com", "shopify.com", "temu.com", "shein.com", "aliexpress.com", "paypal.com", "etsy.com"]
        };
        const list = presets[type] || [];
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

    function addServerItem(ip = "", port = "10086", pass = "") {
        const div = document.createElement("div");
        div.className = "server-item";
        div.style.gridTemplateColumns = "1fr 100px 1.2fr auto";
        div.innerHTML = `
      <input type="text" class="form-control" placeholder="IP 地址" value="${ip}" oninput="validateServerIP(this)">
      <input type="number" class="form-control" placeholder="端口" value="${port}">
      <div class="input-group-pass">
        <input type="password" class="form-control" placeholder="密码" value="${pass}">
        <div class="btn-toggle-pass" onclick="togglePassVisibility(this)">👁️</div>
      </div>
      <div class="btn-remove-server" onclick="this.parentElement.remove()" style="padding: 0 0.5rem; cursor:pointer; color:#fca5a5; font-size:1.2rem;">✕</div>
      <div class="server-validation-msg"></div>
    `;
        dom.serverList.appendChild(div);
        if (ip) validateServerIP(div.querySelector('input'));
    }

    window.validateServerIP = (el) => {
        const val = el.value.trim();
        const msgEl = el.parentElement.querySelector('.server-validation-msg');
        el.classList.remove('invalid-ip', 'warning-ip');
        msgEl.className = 'server-validation-msg';
        msgEl.textContent = '';
        if (!val) return;

        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        if (!ipv4Regex.test(val)) {
            el.classList.add('invalid-ip');
            msgEl.classList.add('error');
            msgEl.textContent = '❌ 无效的 IP 地址格式';
            return;
        }

        const parts = val.split('.').map(Number);
        const isPrivate = (parts[0] === 10) || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
            (parts[0] === 192 && parts[1] === 168) || (parts[0] === 127) || (parts[0] === 169 && parts[1] === 254);

        if (isPrivate) {
            el.classList.add('warning-ip');
            msgEl.classList.add('warning');
            msgEl.textContent = '⚠️ 这是一个局域网/回环地址，外部可能无法访问';
        }
    };

    window.togglePassVisibility = (el) => {
        const input = el.parentElement.querySelector('input');
        const isPass = input.type === "password";
        input.type = isPass ? "text" : "password";
        el.textContent = isPass ? "👁️‍🗨️" : "👁️";
        el.style.opacity = isPass ? "1" : "0.5";
    };

    // --- MetaMask & Auth ---
    async function syncChain() {
        if (!utils.hasMetaMask()) return;
        try {
            state.chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
        } catch { state.chainIdHex = ""; }
        renderNetworkStatusDot();
    }

    function renderNetworkStatusDot() {
        const ready = utils.isBaseReady();
        dom.networkDot.classList.remove("ready", "not-ready");
        dom.networkDot.classList.add(ready ? "ready" : "not-ready");
    }

    function renderAuthGate() {
        const installed = utils.hasMetaMask();
        dom.btnConnectSignin.classList.toggle("hidden", !installed);
        dom.btnInstallMetaMask.classList.toggle("hidden", installed);

        if (!installed) {
            utils.setStatus("warning", "MetaMask not found.");
            dom.gateDesc.textContent = "浏览器未检测到 MetaMask。";
            return;
        }

        if (!state.connected) {
            utils.setStatus("", "MetaMask detected.");
            dom.gateDesc.textContent = "请选择网络后连接钱包。";
            dom.btnConnectSignin.textContent = "Sign In By MetaMask";
            return;
        }

        if (!state.signedIn) {
            utils.setStatus("warning", "Signature required.");
            dom.btnConnectSignin.textContent = "Sign In & Authorize";
            return;
        }

        if (!utils.isBaseReady()) {
            utils.setStatus("warning", "Network mismatch.");
            dom.btnConnectSignin.textContent = "Switch Network to Enter";
            return;
        }

        utils.setStatus("success", "Commercial session ready");
        dom.btnConnectSignin.textContent = "Enter Workspace";
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

            // Switch Network
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

            // Session / Sign
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

    // --- Events ---
    function bindEvents() {
        dom.selectTargetNetwork.addEventListener("change", async () => {
            state.targetNetwork = dom.selectTargetNetwork.value;
            await syncChain();
            renderAuthGate();
        });

        dom.btnConnectSignin.addEventListener("click", connectAndSignIn);

        dom.btnEnterPrivate.addEventListener("click", () => {
            dom.entryStage.classList.add("hidden");
            dom.privateArea.classList.remove("hidden");
            switchSubView("main", "Private Workspace / Menu");
        });

        dom.btnPrivateBack.addEventListener("click", () => {
            if (!dom.subviews.main.classList.contains("hidden")) {
                dom.privateArea.classList.add("hidden");
                dom.entryStage.classList.remove("hidden");
            } else {
                switchSubView("main", "Private Workspace / Menu");
            }
        });

        document.querySelectorAll(".btn-cancel").forEach(btn => {
            btn.addEventListener("click", () => switchSubView("main", "Private Workspace / Menu"));
        });

        // Modules
        document.getElementById("btn-goto-config").addEventListener("click", () => {
            switchSubView("config", "生成配置文件 (Wizard)");
            dom.serverList.innerHTML = "";
            state.userDomains = [];
            renderDomainChips();
        });

        document.getElementById("btn-goto-vps").addEventListener("click", () => switchSubView("vps", "购买与部署指引"));
        document.getElementById("btn-goto-import").addEventListener("click", () => switchSubView("import", "导入 APP 教程"));
        document.getElementById("btn-goto-advanced").addEventListener("click", () => {
            switchSubView("advanced", "高级 JSON 编辑器");
            dom.jsonEditor.value = JSON.stringify(SINGBOX_TEMPLATE, null, 2);
        });

        // Wizard
        document.getElementById("btn-gen-id").addEventListener("click", () => {
            const rand = Math.random().toString(36).slice(2, 7);
            const ts = Date.now().toString(36).slice(-4);
            document.getElementById("config-id").value = `com.mesh.${rand}.${ts}.v1`;
            document.getElementById("wizard-main-fields").classList.add("config-unlocked");
        });

        document.getElementById("btn-open-parser").addEventListener("click", () => dom.parserModal.classList.add("shown"));
        document.getElementById("btn-close-parser").addEventListener("click", () => dom.parserModal.classList.remove("shown"));

        document.getElementById("btn-do-parse").addEventListener("click", () => {
            const area = document.getElementById("import-json-textarea");
            try {
                const data = JSON.parse(area.value);
                const resolvedId = data.provider_id || data.id;
                if (!resolvedId) throw new Error("缺少标识符字段");

                document.getElementById("config-id").value = resolvedId;
                document.getElementById("config-name").value = data.name || "";
                document.getElementById("config-desc").value = data.description || "";
                dom.serverList.innerHTML = "";

                let rawServers = Array.isArray(data.servers) ? data.servers : [];
                if (rawServers.length === 0) {
                    const outbounds = (data.config && data.config.outbounds) || data.outbounds || [];
                    rawServers = outbounds.filter(o => o.server && (o.server_port || o.port));
                }
                rawServers.forEach(s => addServerItem(s.ip || s.server, s.port || s.server_port, s.pass || s.password));

                state.userDomains = [];
                const mandatory = ["githubusercontent.com", "workers.dev"];
                let suffixes = (data.routing_rules && data.routing_rules.domain_suffix) ||
                    (data.routing_rules && data.routing_rules.proxy && data.routing_rules.proxy.domain_suffix) || [];
                suffixes.forEach(ds => { if (!mandatory.includes(ds)) state.userDomains.push(ds); });
                renderDomainChips();

                document.getElementById("wizard-main-fields").classList.add("config-unlocked");
                dom.parserModal.classList.remove("shown");
                area.value = "";
                notify("回填成功", "解析完成");
            } catch (e) { notify("解析失败: " + e.message, "格式错误"); }
        });

        document.getElementById("btn-add-server").addEventListener("click", () => addServerItem());

        document.getElementById("btn-do-add-domain").addEventListener("click", () => {
            const input = document.getElementById("input-quick-add-domain");
            let val = input.value.trim().toLowerCase();
            if (!val) return;
            try { if (val.includes("://")) val = new URL(val).hostname; } catch (e) { }
            const parts = val.split(".");
            if (parts.length >= 2) val = parts.slice(-2).join(".");
            if (state.userDomains.includes(val)) {
                notify("已在列表中。", "重复添加");
            } else {
                state.userDomains.push(val);
                renderDomainChips();
            }
            input.value = "";
        });

        document.getElementById("btn-generate-json").addEventListener("click", () => {
            const name = document.getElementById("config-name").value.trim();
            if (!name) return notify("请输入供应商名称", "校验未通过");

            const userServers = Array.from(dom.serverList.children).map(item => {
                const inputs = item.querySelectorAll("input");
                return { ip: inputs[0].value.trim(), port: parseInt(inputs[1].value), pass: inputs[2].value.trim() };
            }).filter(s => s.ip && s.port);

            if (userServers.length === 0) return confirmAction("尚未配置节点。是否前往部署教程？", "缺失配置").then(ok => ok && switchSubView("vps", "部署指引"));

            const final = JSON.parse(JSON.stringify(SINGBOX_TEMPLATE));
            final.provider_id = document.getElementById("config-id").value || final.provider_id;
            final.name = name;
            final.description = document.getElementById("config-desc").value.trim();
            final.updated_at = new Date().toISOString();

            const otherOutbounds = final.config.outbounds.filter(o => o.type !== "shadowsocks");
            const selector = otherOutbounds.find(o => o.tag === "proxy" && o.type === "selector");
            const newNodes = userServers.map((s, i) => ({ type: "shadowsocks", tag: `node-${i + 1}`, server: s.ip, server_port: s.port, method: "aes-256-gcm", password: s.pass }));

            if (selector) {
                selector.outbounds = newNodes.map(n => n.tag);
                selector.default = newNodes[0].tag;
            }
            final.config.outbounds = [...newNodes, ...otherOutbounds];

            // 彻底重定向生成逻辑，确保不经过任何中间层级
            final.routing_rules = {
                version: 8,
                domain: ["openmesh-api.ribencong.workers.dev", "raw.githubusercontent.com"],
                domain_suffix: [...new Set(["githubusercontent.com", "workers.dev", ...state.userDomains])]
            };

            // 删除可能存在的旧嵌套层级（防御性代码）
            if (final.routing_rules.proxy) delete final.routing_rules.proxy;

            switchSubView("advanced", "JSON 预览与导出");
            dom.jsonEditor.value = JSON.stringify(final, null, 2);
        });

        // VPS Help
        document.getElementById("btn-goto-server-help").addEventListener("click", () => notify("Ubuntu 22.04+ \nsudo bash <(curl -sL install.sh)", "部署指引"));

        // Tabs
        document.querySelectorAll(".tab-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                const docs = {
                    win: "Windows: 下载 MeshNet-Win 导入 JSON。",
                    mac: "macOS: 下载 MeshNet-Mac 拖入 JSON。",
                    ios: "iOS: 通过 iCloud 发送并导入。",
                    android: "Android: 扫描二维码或直接打开。"
                };
                document.getElementById("import-docs").innerHTML = `<p>${docs[btn.dataset.tab]}</p>`;
            });
        });

        // Editor
        document.getElementById("btn-check-json").addEventListener("click", () => {
            try { JSON.parse(dom.jsonEditor.value); notify("语法正确。", "校验成功"); } catch (e) { notify("格式错误: " + e.message, "失败"); }
        });
        document.getElementById("btn-copy-json").addEventListener("click", () => {
            navigator.clipboard.writeText(dom.jsonEditor.value); notify("已复制", "成功");
        });
        document.getElementById("btn-save-file").addEventListener("click", () => {
            const blob = new Blob([dom.jsonEditor.value], { type: "application/json" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "mesh-config.json";
            a.click();
        });

        if (utils.hasMetaMask()) {
            window.ethereum.on("chainChanged", (cid) => {
                state.chainIdHex = String(cid || "");
                renderNetworkStatusDot(); renderAuthGate();
            });
            window.ethereum.on("accountsChanged", (accs) => {
                state.address = accs[0] || ""; state.connected = Boolean(state.address); state.signedIn = false;
                renderAuthGate();
            });
        }
    }

    // --- Initialize ---
    async function bootstrap() {
        initDomMap();
        bindCardMotion();
        bindEvents();
        await syncChain();
        // Check local session
        if (utils.hasMetaMask()) {
            const accounts = await window.ethereum.request({ method: "eth_accounts" });
            state.address = accounts[0] || "";
            state.connected = Boolean(state.address);
            if (state.connected && session.hasValid(state.address)) state.signedIn = true;
        }
        renderAuthGate();
        window.MESH_CONSOLE_V = 9;
        console.log("%c MeshNet Console Loaded: v" + window.MESH_CONSOLE_V + " %c", "background:#2dd4bf; color:#0c111d; font-weight:bold; border-radius:4px; padding:2px 6px;", "");
    }

    function bindCardMotion() {
        document.querySelectorAll(".card-hover").forEach((card) => {
            card.addEventListener("pointermove", (e) => {
                const rect = card.getBoundingClientRect();
                const px = (e.clientX - rect.left) / rect.width;
                const py = (e.clientY - rect.top) / rect.height;
                card.style.setProperty("--mx", (px * 100).toFixed(2) + "%");
                card.style.setProperty("--my", (py * 100).toFixed(2) + "%");
                card.style.transform = `rotateX(${(0.5 - py) * 5}deg) rotateY(${(px - 0.5) * 5}deg) translateY(-2px)`;
            });
            card.addEventListener("pointerleave", () => card.style.transform = "none");
        });
    }

    document.addEventListener("DOMContentLoaded", bootstrap);
})();
