/**
 * MeshNetProtocol Vendor Console - Private Workspace Logic
 */
window.MeshVendor = window.MeshVendor || {};
const Private = {};

Private.renderDomainChips = () => {
    const dom = window.MeshVendor.DOM;
    const state = window.MeshVendor.State;
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
        chip.innerHTML = `<span>${domain}</span><div class="remove-chip" onclick="window.MeshVendor.Private.removeDomainChip(${idx})">✕</div>`;
        dom.domainChipGrid.appendChild(chip);
    });
};

Private.removeDomainChip = (idx) => {
    window.MeshVendor.State.userDomains.splice(idx, 1);
    Private.renderDomainChips();
};

Private.injectDomainPreset = (type) => {
    const state = window.MeshVendor.State;
    const consts = window.MeshVendor.Constants;
    const list = type === 'ai' ? consts.AI_DOMAIN_PRESETS : ["amazon.com", "ebay.com", "shopify.com"];
    let count = 0;
    list.forEach(d => {
        if (!state.userDomains.includes(d)) {
            state.userDomains.push(d);
            count++;
        }
    });
    Private.renderDomainChips();
    if (count > 0) window.MeshVendor.Utils.notify(`成功注入 ${count} 个核心后缀。`, "注入成功");
};

Private.addServerItem = (ip = "", port = "10086", pass = "") => {
    const dom = window.MeshVendor.DOM;
    const div = document.createElement("div");
    div.className = "server-item";
    div.style.gridTemplateColumns = "1fr 100px 1.2fr auto";
    div.innerHTML = `
    <input type="text" class="form-control" placeholder="IP 地址" value="${ip}" oninput="window.MeshVendor.Private.validateServerIP(this)">
    <input type="number" class="form-control" placeholder="端口" value="${port}">
    <div class="input-group-pass">
    <input type="password" class="form-control" placeholder="密码" value="${pass}">
    <div class="btn-toggle-pass" onclick="window.MeshVendor.Private.togglePassVisibility(this)">👁️</div>
    </div>
    <div class="btn-remove-server" onclick="this.parentElement.remove()" style="padding: 0 0.5rem; cursor:pointer; color:#fca5a5; font-size:1.2rem;">✕</div>
    <div class="server-validation-msg"></div>
`;
    if (dom.serverList) dom.serverList.appendChild(div);
    if (ip) Private.validateServerIP(div.querySelector('input'));
};

Private.validateServerIP = (el) => {
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

Private.togglePassVisibility = (el) => {
    const input = el.parentElement.querySelector('input');
    const isPass = input.type === "password";
    input.type = isPass ? "text" : "password";
    el.textContent = isPass ? "👁️‍🗨️" : "👁️";
};

Private.copyCode = (btn, targetId) => {
    const codeEl = document.getElementById(targetId);
    if (!codeEl) return;
    navigator.clipboard.writeText(codeEl.textContent).then(() => {
        const originalText = btn.textContent;
        btn.textContent = "已复制 Copied!";
        setTimeout(() => { btn.textContent = originalText; }, 2000);
    });
};

window.MeshVendor.Private = Private;

// Expose these globally for inline onclick handlers embedded in vendor-console.html
window.injectDomainPreset = Private.injectDomainPreset;
