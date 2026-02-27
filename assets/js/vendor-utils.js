/**
 * MeshNetProtocol Vendor Console - Utils & DOM Initialization
 */
window.MeshVendor = window.MeshVendor || {};

window.MeshVendor.Utils = {
    hasMetaMask: () => Boolean(window.ethereum && window.ethereum.isMetaMask),
    shortAddress: (value) => {
        if (!value) return "";
        return value.length > 10 ? value.slice(0, 6) + "..." + value.slice(-4) : value;
    },
    setStatus: (level, text) => {
        const dom = window.MeshVendor.DOM;
        if (!dom.textAuthStatus) return;
        dom.textAuthStatus.textContent = text;
        dom.textAuthStatus.classList.remove("success", "warning", "error", "pending");
        if (level) dom.textAuthStatus.classList.add(level);
    },
    isBaseReady: () => {
        const state = window.MeshVendor.State;
        const consts = window.MeshVendor.Constants;
        return Boolean(state.chainIdHex) &&
            state.chainIdHex.toLowerCase() === consts.NETWORKS[state.targetNetwork].chainIdHex;
    },
    getSessionKey: (address) => `mesh_vendor_session_${address.toLowerCase()}`,

    initDomMap: () => {
        Object.assign(window.MeshVendor.DOM, {
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
        });
    },

    switchSubView: (viewKey, title) => {
        const dom = window.MeshVendor.DOM;
        Object.values(dom.subviews).forEach(v => { if (v) v.classList.add("hidden"); });
        if (dom.subviews[viewKey]) dom.subviews[viewKey].classList.remove("hidden");
        if (dom.viewTitle) dom.viewTitle.textContent = title;
    },

    showPrompt: (title, message, buttons = []) => {
        const dom = window.MeshVendor.DOM;
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
    },

    notify: (msg, title = "提示") => {
        return window.MeshVendor.Utils.showPrompt(title, msg, [{ label: "确定", primary: true }]);
    },

    confirmAction: (msg, title = "操作确认") => {
        return window.MeshVendor.Utils.showPrompt(title, msg, [
            { label: "取消", primary: false },
            { label: "确定", primary: true }
        ]);
    }
};

window.MeshVendor.Session = {
    hasValid: (address) => {
        const data = localStorage.getItem(window.MeshVendor.Utils.getSessionKey(address));
        if (!data) return false;
        try {
            const s = JSON.parse(data);
            return (Date.now() - s.timestamp) < 24 * 60 * 60 * 1000;
        } catch { return false; }
    },
    create: (address) => {
        const data = { address: address.toLowerCase(), timestamp: Date.now() };
        localStorage.setItem(window.MeshVendor.Utils.getSessionKey(address), JSON.stringify(data));
    }
};
