/**
 * MeshNetProtocol Vendor Console - Main App Entry
 */
(function () {
    "use strict";

    const { Constants, State, DOM, Utils, Private, Commercial, Session } = window.MeshVendor;

    function bindEvents() {
        if (DOM.selectTargetNetwork) DOM.selectTargetNetwork.addEventListener("change", async () => {
            State.targetNetwork = DOM.selectTargetNetwork.value;
            await Commercial.syncChain(); Commercial.renderAuthGate();
        });
        if (DOM.btnConnectSignin) DOM.btnConnectSignin.addEventListener("click", Commercial.connectAndSignIn);
        if (DOM.btnEnterPrivate) DOM.btnEnterPrivate.addEventListener("click", () => {
            if (DOM.entryStage) DOM.entryStage.classList.add("hidden");
            if (DOM.privateArea) DOM.privateArea.classList.remove("hidden");
            Utils.switchSubView("main", "Private Workspace / Menu");
        });
        if (DOM.btnPrivateBack) DOM.btnPrivateBack.addEventListener("click", () => {
            if (DOM.subviews.main && !DOM.subviews.main.classList.contains("hidden")) {
                if (DOM.privateArea) DOM.privateArea.classList.add("hidden");
                if (DOM.entryStage) DOM.entryStage.classList.remove("hidden");
            } else { Utils.switchSubView("main", "Private Workspace / Menu"); }
        });
        document.querySelectorAll(".btn-cancel").forEach(btn => btn.addEventListener("click", () => Utils.switchSubView("main", "Private Workspace / Menu")));

        const gotoConfigBtn = document.getElementById("btn-goto-config");
        if (gotoConfigBtn) gotoConfigBtn.addEventListener("click", () => {
            Utils.switchSubView("config", "生成配置文件 (Wizard)");
            if (DOM.serverList) DOM.serverList.innerHTML = "";
            State.userDomains = []; Private.renderDomainChips();
        });
        const gotoVpsBtn = document.getElementById("btn-goto-vps");
        if (gotoVpsBtn) gotoVpsBtn.addEventListener("click", () => Utils.switchSubView("vps", "部署节点教程 (VPS Setup Guide)"));
        const gotoImportBtn = document.getElementById("btn-goto-import");
        if (gotoImportBtn) gotoImportBtn.addEventListener("click", () => Utils.switchSubView("import", "导入 APP 教程"));
        const gotoAdvancedBtn = document.getElementById("btn-goto-advanced");
        if (gotoAdvancedBtn) gotoAdvancedBtn.addEventListener("click", () => {
            Utils.switchSubView("advanced", "高级 JSON 编辑器");
            if (DOM.jsonEditor) DOM.jsonEditor.value = JSON.stringify(Constants.SINGBOX_TEMPLATE, null, 2);
        });

        // VPS Guide specific
        const btnGotoServerHelp = document.getElementById("btn-goto-server-help");
        if (btnGotoServerHelp) btnGotoServerHelp.addEventListener("click", () => Utils.switchSubView("vps", "部署节点教程 (VPS Setup Guide)"));
        const btnVpsToConfig = document.getElementById("btn-vps-to-config");
        if (btnVpsToConfig) btnVpsToConfig.addEventListener("click", () => document.getElementById("btn-goto-config")?.click());

        const genIdBtn = document.getElementById("btn-gen-id");
        if (genIdBtn) genIdBtn.addEventListener("click", () => {
            const idInput = document.getElementById("config-id");
            if (idInput) idInput.value = `com.mesh.${Math.random().toString(36).slice(2, 7)}.${Date.now().toString(36).slice(-4)}.v1`;
            const fields = document.getElementById("wizard-main-fields");
            if (fields) fields.classList.add("config-unlocked");
        });

        const openParserBtn = document.getElementById("btn-open-parser");
        if (openParserBtn) openParserBtn.addEventListener("click", () => DOM.parserModal.classList.add("shown"));
        const closeParserBtn = document.getElementById("btn-close-parser");
        if (closeParserBtn) closeParserBtn.addEventListener("click", () => DOM.parserModal.classList.remove("shown"));

        const doParseBtn = document.getElementById("btn-do-parse");
        if (doParseBtn) doParseBtn.addEventListener("click", () => {
            const area = document.getElementById("import-json-textarea");
            try {
                const data = JSON.parse(area.value);
                const resolvedId = data.provider_id || data.id;
                if (!resolvedId) throw new Error("缺少标识符字段 (provider_id)");

                document.getElementById("config-id").value = resolvedId;
                document.getElementById("config-name").value = data.name || "";
                document.getElementById("config-desc").value = data.description || "";

                DOM.serverList.innerHTML = "";
                let rawServers = [];
                if (Array.isArray(data.servers)) {
                    rawServers = data.servers;
                } else {
                    const config = data.config || data;
                    const outbounds = config.outbounds || [];
                    rawServers = outbounds.filter(o => o.server && (o.server_port || o.port));
                }

                rawServers.forEach(s => Private.addServerItem(s.ip || s.server, s.port || s.server_port, s.pass || s.password || s.pass));

                State.userDomains = [];
                const mandatory = ["githubusercontent.com", "workers.dev"];
                let suffixes = [];

                if (data.config && data.config.route && Array.isArray(data.config.route.rules)) {
                    const proxyRule = data.config.route.rules.find(r => r.domain_suffix && r.outbound === 'proxy');
                    if (proxyRule && Array.isArray(proxyRule.domain_suffix)) {
                        suffixes = proxyRule.domain_suffix;
                    }
                }

                // Fallback for the old custom format
                if (suffixes.length === 0 && data.routing_rules && Array.isArray(data.routing_rules.domain_suffix)) {
                    suffixes = data.routing_rules.domain_suffix;
                }

                suffixes.forEach(ds => {
                    const clean = ds.startsWith('.') ? ds.slice(1) : ds;
                    if (!mandatory.includes(clean)) State.userDomains.push(clean);
                });

                Private.renderDomainChips();
                document.getElementById("wizard-main-fields")?.classList.add("config-unlocked");
                DOM.parserModal.classList.remove("shown");
                area.value = "";
                Utils.notify("回填成功", "解析完成");
            } catch (e) {
                Utils.notify("解析失败: " + e.message, "格式错误");
            }
        });

        const addServerBtn = document.getElementById("btn-add-server");
        if (addServerBtn) addServerBtn.addEventListener("click", () => Private.addServerItem());
        const addDomainBtn = document.getElementById("btn-do-add-domain");
        if (addDomainBtn) addDomainBtn.addEventListener("click", () => {
            const input = document.getElementById("input-quick-add-domain");
            let val = input.value.trim().toLowerCase();
            if (!val) return;
            State.userDomains.push(val); Private.renderDomainChips(); input.value = "";
        });

        const generateBtn = document.getElementById("btn-generate-json");
        if (generateBtn) generateBtn.addEventListener("click", () => {
            const nameInput = document.getElementById("config-name");
            const name = nameInput ? nameInput.value.trim() : "";
            if (!name) return Utils.notify("请输入供应商名称", "校验未通过");
            const userServers = Array.from(DOM.serverList.children).map(item => {
                const inputs = item.querySelectorAll("input");
                return { ip: inputs[0].value.trim(), port: parseInt(inputs[1].value), pass: inputs[2].value.trim() };
            }).filter(s => s.ip && s.port);
            if (userServers.length === 0) return Utils.notify("尚未配置节点。", "缺少配置");

            const final = JSON.parse(JSON.stringify(Constants.SINGBOX_TEMPLATE));
            final.provider_id = document.getElementById("config-id").value || final.provider_id;
            final.name = name;
            final.description = document.getElementById("config-desc").value.trim();
            final.updated_at = new Date().toISOString();
            const nodes = userServers.map((s, i) => ({ type: "shadowsocks", tag: `node-${i + 1}`, server: s.ip, server_port: s.port, method: "aes-256-gcm", password: s.pass }));
            const proxyGroup = { tag: "proxy", type: "selector", outbounds: nodes.map(n => n.tag), default: nodes[0].tag };
            final.config.outbounds = [...nodes, proxyGroup, { type: "direct", tag: "direct", domain_strategy: "ipv4_only", fallback_delay: "300ms" }];

            const domains = [...Constants.CORE_DOMAIN_PRESETS];
            State.userDomains.forEach(d => {
                const clean = d.startsWith('.') ? d.slice(1) : d;
                if (!domains.includes(clean)) domains.push(clean);
            });
            const manualProxySet = [...new Set(domains)];

            // SmartRouting V2: Inject high-priority proxy override rule at index 2
            final.config.route.rules.splice(2, 0, {
                domain_suffix: manualProxySet,
                outbound: "proxy"
            });

            // Ensure the deprecated field explicitly remains completely empty like V2 shell
            final.routing_rules = {
                version: 2,
                proxy: {
                    domain: [],
                    domain_suffix: []
                }
            };
            Utils.switchSubView("advanced", "JSON 预览与导出");
            if (DOM.jsonEditor) DOM.jsonEditor.value = JSON.stringify(final, null, 2);
        });

        const checkJsonBtn = document.getElementById("btn-check-json");
        if (checkJsonBtn) checkJsonBtn.addEventListener("click", () => { try { JSON.parse(DOM.jsonEditor.value); Utils.notify("语法正确。", "校验成功"); } catch (e) { Utils.notify("格式错误: " + e.message, "失败"); } });
        const copyJsonBtn = document.getElementById("btn-copy-json");
        if (copyJsonBtn) copyJsonBtn.addEventListener("click", () => { navigator.clipboard.writeText(DOM.jsonEditor.value); Utils.notify("已复制", "成功"); });
        const saveFileBtn = document.getElementById("btn-save-file");
        if (saveFileBtn) saveFileBtn.addEventListener("click", () => {
            const blob = new Blob([DOM.jsonEditor.value], { type: "application/json" });
            const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "mesh-config.json"; a.click();
        });

        if (Utils.hasMetaMask()) {
            window.ethereum.on("chainChanged", (cid) => { State.chainIdHex = String(cid || ""); Commercial.renderNetworkStatusDot(); Commercial.renderAuthGate(); });
            window.ethereum.on("accountsChanged", (accs) => { State.address = accs[0] || ""; State.connected = Boolean(State.address); State.signedIn = false; Commercial.renderAuthGate(); });
        }
    }

    async function bootstrap() {
        console.log(`[MeshNet] Bootstrap started... v${Constants.MESH_CONSOLE_VERSION}`);
        Utils.initDomMap();
        bindEvents();

        try {
            await Commercial.syncChain();
            if (Utils.hasMetaMask()) {
                const accounts = await window.ethereum.request({ method: "eth_accounts" });
                State.address = accounts[0] || "";
                State.connected = Boolean(State.address);
                if (State.connected && Session.hasValid(State.address)) State.signedIn = true;
            }
        } catch (e) {
            console.error("[MeshNet] MetaMask init failed/blocked:", e);
        }

        Commercial.renderAuthGate();
        window.MESH_CONSOLE_V = Constants.MESH_CONSOLE_VERSION;
        console.log(`[MeshNet] Console v${Constants.MESH_CONSOLE_VERSION} ready.`);
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootstrap); else bootstrap();
})();
