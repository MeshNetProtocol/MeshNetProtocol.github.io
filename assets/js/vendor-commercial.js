/**
 * MeshNetProtocol Vendor Console - Commercial & Web3 Auth
 */
window.MeshVendor = window.MeshVendor || {};
const Commercial = {};

Commercial.syncChain = async () => {
    const utils = window.MeshVendor.Utils;
    const state = window.MeshVendor.State;
    if (!utils.hasMetaMask()) return;
    try {
        state.chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
    } catch { state.chainIdHex = ""; }
    Commercial.renderNetworkStatusDot();
};

Commercial.renderNetworkStatusDot = () => {
    const dom = window.MeshVendor.DOM;
    const utils = window.MeshVendor.Utils;
    if (!dom.networkDot) return;
    const ready = utils.isBaseReady();
    dom.networkDot.classList.remove("ready", "not-ready");
    dom.networkDot.classList.add(ready ? "ready" : "not-ready");
};

Commercial.renderAuthGate = () => {
    const dom = window.MeshVendor.DOM;
    const utils = window.MeshVendor.Utils;
    const state = window.MeshVendor.State;

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
};

Commercial.connectAndSignIn = async () => {
    const utils = window.MeshVendor.Utils;
    const state = window.MeshVendor.State;
    const session = window.MeshVendor.Session;
    const consts = window.MeshVendor.Constants;

    if (!utils.hasMetaMask()) return Commercial.renderAuthGate();
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
                params: [{ chainId: consts.NETWORKS[state.targetNetwork].chainIdHex }]
            });
            await Commercial.syncChain();
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
        Commercial.renderAuthGate();
    } catch (e) {
        state.signedIn = false;
        utils.setStatus("error", "Auth failed.");
    }
};

window.MeshVendor.Commercial = Commercial;
