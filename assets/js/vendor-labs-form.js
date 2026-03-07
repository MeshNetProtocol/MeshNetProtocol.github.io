/**
 * MeshNetProtocol - Sing-Box Configuration Lab
 * Form Handler Module
 */

(function() {
    "use strict";

    console.log("[Labs] Loading Form Handler...");

    // ===== State Management =====
    const state = {
        formData: {
            basic: {
                provider_id: "com.meshnetprotocol.profile.v2.smart",
                name: "启动种子",
                description: "官方引导配置文件",
                author: "OpenMesh Team",
                tags: ["Official", "SmartRouting", "V2"],
                visibility: "public",
                status: "active"
            },
            log: {
                level: "info",
                timestamp: true,
                output: ""
            },
            dns: {
                servers: [
                    { tag: "local-dns", address: "<IP>", detour: "direct" },
                    { tag: "google-dns", address: "https://dns.google/dns-query", detour: "proxy" }
                ],
                rules: [
                    { rule_set: "geosite-geolocation-cn", server: "local-dns" }
                ],
                final: "google-dns",
                strategy: "prefer_ipv4"
            },
            inbounds: [
                {
                    type: "tun",
                    tag: "tun-in",
                    address: ["172.18.0.1/30", "fd00::1/126"],
                    auto_route: true,
                    sniff: true,
                    sniff_override_destination: true
                }
            ],
            outbounds: [
                {
                    type: "shadowsocks",
                    tag: "meshflux168",
                    server: "<IP>",
                    server_port: "<PORT>",
                    method: "aes-256-gcm",
                    password: "<PASSWORD>",
                    udp: true
                },
                {
                    type: "shadowsocks",
                    tag: "meshflux150",
                    server: "<IP>",
                    server_port: "<PORT>",
                    method: "aes-256-gcm",
                    password: "<PASSWORD>",
                    udp: true
                },
                {
                    type: "shadowsocks",
                    tag: "meshflux224",
                    server: "<IP>",
                    server_port: "<PORT>",
                    method: "aes-256-gcm",
                    password: "<PASSWORD>",
                    udp: true
                },
                {
                    type: "selector",
                    tag: "proxy",
                    outbounds: ["meshflux168", "meshflux150", "meshflux224"],
                    default: "meshflux168"
                },
                {
                    type: "direct",
                    tag: "direct"
                }
            ],
            route: {
                rules: [
                    { protocol: "dns", action: "hijack-dns" },
                    { domain_suffix: ["google.com", "youtube.com"], outbound: "proxy" },
                    { rule_set: "geosite-geolocation-cn", outbound: "direct" },
                    { ip_is_private: true, outbound: "direct" }
                ],
                final: "proxy",
                auto_detect_interface: true,
                rule_sets: [
                    {
                        type: "remote",
                        tag: "geosite-geolocation-cn",
                        format: "binary",
                        url: "https://raw.githubusercontent.com/SagerNet/sing-geoip/rule-set/geoip-cn.srs",
                        download_detour: "proxy",
                        update_interval: "1d"
                    }
                ]
            }
        },
        dom: {}
    };

    // ===== DOM Initialization =====
    function initDom() {
        state.dom = {
            form: document.getElementById('config-form'),
            // Basic Info
            providerId: document.getElementById('provider-id'),
            configName: document.getElementById('config-name'),
            configDesc: document.getElementById('config-desc'),
            configAuthor: document.getElementById('config-author'),
            tagsInput: document.querySelector('.tag-input'),
            tagsList: document.querySelector('.tags-list'),
            visibility: document.getElementById('visibility'),
            status: document.getElementById('status'),
            // Log
            logLevel: document.getElementById('log-level'),
            logTimestamp: document.getElementById('log-timestamp'),
            logOutput: document.getElementById('log-output'),
            // DNS
            dnsServersContainer: document.getElementById('dns-servers-container')?.querySelector('.list-items'),
            btnAddDns: document.getElementById('btn-add-dns'),
            dnsRulesContainer: document.getElementById('dns-rules-container')?.querySelector('.list-items'),
            btnAddDnsRule: document.getElementById('btn-add-dns-rule'),
            dnsFinal: document.getElementById('dns-final'),
            dnsStrategy: document.getElementById('dns-strategy'),
            // Inbounds
            inboundsContainer: document.getElementById('inbounds-container')?.querySelector('.list-items'),
            btnAddInbound: document.getElementById('btn-add-inbound'),
            // Outbounds
            outboundsContainer: document.getElementById('outbounds-container')?.querySelector('.list-items'),
            btnAddOutbound: document.getElementById('btn-add-outbound'),
            // Route
            routeRulesContainer: document.getElementById('route-rules-container')?.querySelector('.list-items'),
            btnAddRoute: document.getElementById('btn-add-route'),
            routeFinal: document.getElementById('route-final'),
            autoDetectInterface: document.getElementById('auto-detect-interface'),
            routeRuleSetsContainer: document.getElementById('route-rule-sets-container')?.querySelector('.list-items'),
            btnAddRuleSet: document.getElementById('btn-add-rule-set')
        };
    }

    // ===== Tags Input Handler =====
    function initTagsInput() {
        const { tagsInput, tagsList } = state.dom;
        
        function renderTags() {
            tagsList.innerHTML = '';
            state.formData.basic.tags.forEach((tag, index) => {
                const chip = document.createElement('div');
                chip.className = 'tag-chip';
                chip.innerHTML = `
                    <span>${tag}</span>
                    <button type="button" onclick="window.LabsForm.removeTag(${index})">×</button>
                `;
                tagsList.appendChild(chip);
            });
        }

        tagsInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const value = tagsInput.value.trim();
                if (value && !state.formData.basic.tags.includes(value)) {
                    state.formData.basic.tags.push(value);
                    state.formData.basic.tags = [...state.formData.basic.tags]; // trigger update
                    tagsInput.value = '';
                    renderTags();
                    window.dispatchEvent(new CustomEvent('labs-form-updated'));
                }
            }
        });

        window.LabsForm.removeTag = (index) => {
            state.formData.basic.tags.splice(index, 1);
            renderTags();
            window.dispatchEvent(new CustomEvent('labs-form-updated'));
        };

        return renderTags;
    }

    // ===== Dynamic List Renderers =====
    function renderDNSServers() {
        const container = state.dom.dnsServersContainer;
        container.innerHTML = '';
        
        state.formData.dns.servers.forEach((server, index) => {
            const item = document.createElement('div');
            item.className = 'item-card';
            item.innerHTML = `
                <div class="item-card-header">
                    <div class="item-card-title">DNS Server #${index + 1}</div>
                    <div class="item-actions">
                        ${index > 0 ? `<button type="button" class="btn-icon up" title="上移" onclick="window.LabsForm.moveDNSServer(${index}, -1)">↑</button>` : ''}
                        ${index < state.formData.dns.servers.length - 1 ? `<button type="button" class="btn-icon down" title="下移" onclick="window.LabsForm.moveDNSServer(${index}, 1)">↓</button>` : ''}
                        <button type="button" class="btn-icon delete" title="删除" onclick="window.LabsForm.removeDNSServer(${index})">🗑️</button>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Tag *</label>
                        <input type="text" class="form-control" value="${server.tag}" 
                               onchange="window.LabsForm.updateDNSServer(${index}, 'tag', this.value)" required>
                    </div>
                    <div class="form-group">
                        <label>Address *</label>
                        <input type="text" class="form-control" value="${server.address}" 
                               onchange="window.LabsForm.updateDNSServer(${index}, 'address', this.value)" placeholder="<DNS IP>" required>
                    </div>
                    <div class="form-group">
                        <label>Detour</label>
                        <select class="form-control" onchange="window.LabsForm.updateDNSServer(${index}, 'detour', this.value)">
                            <option value="direct" ${server.detour === 'direct' ? 'selected' : ''}>Direct</option>
                            <option value="proxy" ${server.detour === 'proxy' ? 'selected' : ''}>Proxy</option>
                        </select>
                    </div>
                </div>
            `;
            container.appendChild(item);
        });

        // Update final DNS dropdown
        state.dom.dnsFinal.innerHTML = '';
        state.formData.dns.servers.forEach(server => {
            const option = document.createElement('option');
            option.value = server.tag;
            option.textContent = server.tag;
            option.selected = server.tag === state.formData.dns.final;
            state.dom.dnsFinal.appendChild(option);
        });
    }

    window.LabsForm.addDNSServer = () => {
        state.formData.dns.servers.push({ tag: `dns-${state.formData.dns.servers.length + 1}`, address: '', detour: 'direct' });
        renderDNSServers();
        window.dispatchEvent(new CustomEvent('labs-form-updated'));
    };

    window.LabsForm.removeDNSServer = (index) => {
        state.formData.dns.servers.splice(index, 1);
        renderDNSServers();
        window.dispatchEvent(new CustomEvent('labs-form-updated'));
    };

    window.LabsForm.moveDNSServer = (index, direction) => {
        const newIndex = index + direction;
        if (newIndex >= 0 && newIndex < state.formData.dns.servers.length) {
            [state.formData.dns.servers[index], state.formData.dns.servers[newIndex]] = 
            [state.formData.dns.servers[newIndex], state.formData.dns.servers[index]];
            renderDNSServers();
            window.dispatchEvent(new CustomEvent('labs-form-updated'));
        }
    };

    window.LabsForm.updateDNSServer = (index, field, value) => {
        state.formData.dns.servers[index][field] = value;
        if (field === 'tag') {
            renderDNSServers(); // refresh dropdown
        }
        window.dispatchEvent(new CustomEvent('labs-form-updated'));
    };

    // Initialize DNS button
    state.dom.btnAddDns.addEventListener('click', window.LabsForm.addDNSServer);
    state.dom.dnsFinal.addEventListener('change', (e) => {
        state.formData.dns.final = e.target.value;
        window.dispatchEvent(new CustomEvent('labs-form-updated'));
    });
    state.dom.dnsStrategy.addEventListener('change', (e) => {
        state.formData.dns.strategy = e.target.value;
        window.dispatchEvent(new CustomEvent('labs-form-updated'));
    });

    // ===== DNS Rules Renderer =====
    function renderDnsRules() {
        if (!state.dom.dnsRulesContainer) return;
        
        const container = state.dom.dnsRulesContainer;
        container.innerHTML = '';
        
        state.formData.dns.rules.forEach((rule, index) => {
            const item = document.createElement('div');
            item.className = 'item-card';
            item.innerHTML = `
                <div class="item-card-header">
                    <div class="item-card-title">DNS Rule #${index + 1}</div>
                    <div class="item-actions">
                        ${index > 0 ? `<button type="button" class="btn-icon up" onclick="window.LabsForm.moveDnsRule(${index}, -1)">↑</button>` : ''}
                        ${index < state.formData.dns.rules.length - 1 ? `<button type="button" class="btn-icon down" onclick="window.LabsForm.moveDnsRule(${index}, 1)">↓</button>` : ''}
                        <button type="button" class="btn-icon delete" onclick="window.LabsForm.removeDnsRule(${index})">🗑️</button>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Rule Set / Domain</label>
                        <input type="text" class="form-control" value="${rule.rule_set || rule.domain_suffix || ''}" 
                               onchange="window.LabsForm.updateDnsRule(${index}, 'rule_set', this.value)" 
                               placeholder="geosite-geolocation-cn">
                    </div>
                    <div class="form-group">
                        <label>Server</label>
                        <select class="form-control" onchange="window.LabsForm.updateDnsRule(${index}, 'server', this.value)">
                            ${state.formData.dns.servers.map(server => `
                                <option value="${server.tag}" ${rule.server === server.tag ? 'selected' : ''}>${server.tag}</option>
                            `).join('')}
                        </select>
                    </div>
                </div>
            `;
            container.appendChild(item);
        });
    }

    window.LabsForm.addDnsRule = () => {
        state.formData.dns.rules.push({ rule_set: '', server: state.formData.dns.final });
        renderDnsRules();
        window.dispatchEvent(new CustomEvent('labs-form-updated'));
    };

    window.LabsForm.removeDnsRule = (index) => {
        state.formData.dns.rules.splice(index, 1);
        renderDnsRules();
        window.dispatchEvent(new CustomEvent('labs-form-updated'));
    };

    window.LabsForm.moveDnsRule = (index, direction) => {
        const newIndex = index + direction;
        if (newIndex >= 0 && newIndex < state.formData.dns.rules.length) {
            [state.formData.dns.rules[index], state.formData.dns.rules[newIndex]] = 
            [state.formData.dns.rules[newIndex], state.formData.dns.rules[index]];
            renderDnsRules();
            window.dispatchEvent(new CustomEvent('labs-form-updated'));
        }
    };

    window.LabsForm.updateDnsRule = (index, field, value) => {
        state.formData.dns.rules[index][field] = value;
        window.dispatchEvent(new CustomEvent('labs-form-updated'));
    };

    // Initialize DNS Rule button
    if (state.dom.btnAddDnsRule) {
        state.dom.btnAddDnsRule.addEventListener('click', window.LabsForm.addDnsRule);
    }

    // ===== Route Rule Sets Renderer =====
    function renderRuleSets() {
        if (!state.dom.routeRuleSetsContainer) return;
        
        const container = state.dom.routeRuleSetsContainer;
        container.innerHTML = '';
        
        state.formData.route.rule_sets.forEach((ruleSet, index) => {
            const item = document.createElement('div');
            item.className = 'item-card';
            item.innerHTML = `
                <div class="item-card-header">
                    <div class="item-card-title">Rule Set #${index + 1}</div>
                    <div class="item-actions">
                        ${index > 0 ? `<button type="button" class="btn-icon up" onclick="window.LabsForm.moveRuleSet(${index}, -1)">↑</button>` : ''}
                        ${index < state.formData.route.rule_sets.length - 1 ? `<button type="button" class="btn-icon down" onclick="window.LabsForm.moveRuleSet(${index}, 1)">↓</button>` : ''}
                        <button type="button" class="btn-icon delete" onclick="window.LabsForm.removeRuleSet(${index})">🗑️</button>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Tag *</label>
                        <input type="text" class="form-control" value="${ruleSet.tag}" 
                               onchange="window.LabsForm.updateRuleSet(${index}, 'tag', this.value)" required>
                    </div>
                    <div class="form-group">
                        <label>Type</label>
                        <select class="form-control" onchange="window.LabsForm.updateRuleSet(${index}, 'type', this.value)">
                            <option value="remote" ${ruleSet.type === 'remote' ? 'selected' : ''}>Remote</option>
                            <option value="local" ${ruleSet.type === 'local' ? 'selected' : ''}>Local</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Format</label>
                        <select class="form-control" onchange="window.LabsForm.updateRuleSet(${index}, 'format', this.value)">
                            <option value="binary" ${ruleSet.format === 'binary' ? 'selected' : ''}>Binary</option>
                            <option value="source" ${ruleSet.format === 'source' ? 'selected' : ''}>Source</option>
                        </select>
                    </div>
                    ${ruleSet.type === 'remote' ? `
                    <div class="form-group">
                        <label>URL *</label>
                        <input type="text" class="form-control" value="${ruleSet.url}" 
                               onchange="window.LabsForm.updateRuleSet(${index}, 'url', this.value)" 
                               placeholder="https://..." required>
                    </div>
                    ` : ''}
                </div>
                ${ruleSet.type === 'remote' ? `
                <div class="form-row">
                    <div class="form-group">
                        <label>Download Detour</label>
                        <select class="form-control" onchange="window.LabsForm.updateRuleSet(${index}, 'download_detour', this.value)">
                            ${state.formData.outbounds.filter(o => o.type === 'selector' || o.type === 'direct').map(ob => `
                                <option value="${ob.tag}" ${ruleSet.download_detour === ob.tag ? 'selected' : ''}>${ob.tag}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Update Interval</label>
                        <input type="text" class="form-control" value="${ruleSet.update_interval || '1d'}" 
                               onchange="window.LabsForm.updateRuleSet(${index}, 'update_interval', this.value)" 
                               placeholder="1d">
                    </div>
                </div>
                ` : ''}
            `;
            container.appendChild(item);
        });
    }

    window.LabsForm.addRuleSet = () => {
        state.formData.route.rule_sets.push({
            type: 'remote',
            tag: `rule-set-${state.formData.route.rule_sets.length + 1}`,
            format: 'binary',
            url: '',
            download_detour: 'proxy',
            update_interval: '1d'
        });
        renderRuleSets();
        window.dispatchEvent(new CustomEvent('labs-form-updated'));
    };

    window.LabsForm.removeRuleSet = (index) => {
        state.formData.route.rule_sets.splice(index, 1);
        renderRuleSets();
        window.dispatchEvent(new CustomEvent('labs-form-updated'));
    };

    window.LabsForm.moveRuleSet = (index, direction) => {
        const newIndex = index + direction;
        if (newIndex >= 0 && newIndex < state.formData.route.rule_sets.length) {
            [state.formData.route.rule_sets[index], state.formData.route.rule_sets[newIndex]] = 
            [state.formData.route.rule_sets[newIndex], state.formData.route.rule_sets[index]];
            renderRuleSets();
            window.dispatchEvent(new CustomEvent('labs-form-updated'));
        }
    };

    window.LabsForm.updateRuleSet = (index, field, value) => {
        state.formData.route.rule_sets[index][field] = value;
        renderRuleSets(); // Re-render to show/hide fields based on type
        window.dispatchEvent(new CustomEvent('labs-form-updated'));
    };

    // Initialize Rule Set button
    if (state.dom.btnAddRuleSet) {
        state.dom.btnAddRuleSet.addEventListener('click', window.LabsForm.addRuleSet);
    }

    // ===== Inbounds Renderer =====
    function renderInbounds() {
        const container = state.dom.inboundsContainer;
        container.innerHTML = '';
        
        state.formData.inbounds.forEach((inbound, index) => {
            const item = document.createElement('div');
            item.className = 'item-card';
            item.innerHTML = `
                <div class="item-card-header">
                    <div class="item-card-title">${inbound.type.toUpperCase()} #${index + 1}</div>
                    <div class="item-actions">
                        ${index > 0 ? `<button type="button" class="btn-icon up" title="上移" onclick="window.LabsForm.moveInbound(${index}, -1)">↑</button>` : ''}
                        ${index < state.formData.inbounds.length - 1 ? `<button type="button" class="btn-icon down" title="下移" onclick="window.LabsForm.moveInbound(${index}, 1)">↓</button>` : ''}
                        <button type="button" class="btn-icon delete" title="删除" onclick="window.LabsForm.removeInbound(${index})">🗑️</button>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Type *</label>
                        <select class="form-control" onchange="window.LabsForm.updateInboundType(${index}, this.value)">
                            <option value="tun" ${inbound.type === 'tun' ? 'selected' : ''}>TUN</option>
                            <option value="mixed" ${inbound.type === 'mixed' ? 'selected' : ''}>Mixed</option>
                            <option value="socks" ${inbound.type === 'socks' ? 'selected' : ''}>SOCKS</option>
                            <option value="http" ${inbound.type === 'http' ? 'selected' : ''}>HTTP</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Tag *</label>
                        <input type="text" class="form-control" value="${inbound.tag}" 
                               onchange="window.LabsForm.updateInbound(${index}, 'tag', this.value)" required>
                    </div>
                </div>
                ${inbound.type === 'tun' ? `
                <div class="form-group">
                    <label>Address (CIDR)</label>
                    <input type="text" class="form-control" value="${inbound.address ? inbound.address.join(', ') : ''}" 
                           onchange="window.LabsForm.updateInboundAddress(${index}, this.value)" 
                           placeholder="172.18.0.1/30, fd00::1/126">
                </div>
                ` : ''}
                ${['tun', 'mixed', 'socks'].includes(inbound.type) ? `
                <div class="form-row">
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" ${inbound.auto_route ? 'checked' : ''} 
                                   onchange="window.LabsForm.updateInbound(${index}, 'auto_route', this.checked)">
                            <span>Auto Route</span>
                        </label>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" ${inbound.sniff ? 'checked' : ''} 
                                   onchange="window.LabsForm.updateInbound(${index}, 'sniff', this.checked)">
                            <span>Sniff</span>
                        </label>
                    </div>
                </div>
                ${inbound.type === 'tun' ? `
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" ${inbound.sniff_override_destination ? 'checked' : ''} 
                               onchange="window.LabsForm.updateInbound(${index}, 'sniff_override_destination', this.checked)">
                        <span>Sniff Override Destination</span>
                    </label>
                </div>
                ` : ''}
                ` : ''}
            `;
            container.appendChild(item);
        });
    }

    window.LabsForm.addInbound = () => {
        state.formData.inbounds.push({
            type: 'tun',
            tag: `tun-${state.formData.inbounds.length + 1}`,
            address: ['172.18.0.1/30'],
            auto_route: true,
            sniff: true,
            sniff_override_destination: true
        });
        renderInbounds();
        window.dispatchEvent(new CustomEvent('labs-form-updated'));
    };

    window.LabsForm.removeInbound = (index) => {
        state.formData.inbounds.splice(index, 1);
        renderInbounds();
        window.dispatchEvent(new CustomEvent('labs-form-updated'));
    };

    window.LabsForm.moveInbound = (index, direction) => {
        const newIndex = index + direction;
        if (newIndex >= 0 && newIndex < state.formData.inbounds.length) {
            [state.formData.inbounds[index], state.formData.inbounds[newIndex]] = 
            [state.formData.inbounds[newIndex], state.formData.inbounds[index]];
            renderInbounds();
            window.dispatchEvent(new CustomEvent('labs-form-updated'));
        }
    };

    window.LabsForm.updateInboundType = (index, value) => {
        state.formData.inbounds[index].type = value;
        renderInbounds(); // re-render to show type-specific fields
        window.dispatchEvent(new CustomEvent('labs-form-updated'));
    };

    window.LabsForm.updateInbound = (index, field, value) => {
        state.formData.inbounds[index][field] = value;
        window.dispatchEvent(new CustomEvent('labs-form-updated'));
    };

    window.LabsForm.updateInboundAddress = (index, value) => {
        state.formData.inbounds[index].address = value.split(',').map(s => s.trim()).filter(s => s);
        window.dispatchEvent(new CustomEvent('labs-form-updated'));
    };

    state.dom.btnAddInbound.addEventListener('click', window.LabsForm.addInbound);

    // ===== Outbounds Renderer =====
    function renderOutbounds() {
        const container = state.dom.outboundsContainer;
        container.innerHTML = '';
        
        state.formData.outbounds.forEach((outbound, index) => {
            const isShadowsocks = outbound.type === 'shadowsocks';
            const isSelector = outbound.type === 'selector';
            const isDirect = outbound.type === 'direct';
            
            const item = document.createElement('div');
            item.className = 'item-card';
            item.innerHTML = `
                <div class="item-card-header">
                    <div class="item-card-title">${outbound.type.toUpperCase()} #${index + 1}</div>
                    <div class="item-actions">
                        ${index > 0 ? `<button type="button" class="btn-icon up" title="上移" onclick="window.LabsForm.moveOutbound(${index}, -1)">↑</button>` : ''}
                        ${index < state.formData.outbounds.length - 1 ? `<button type="button" class="btn-icon down" title="下移" onclick="window.LabsForm.moveOutbound(${index}, 1)">↓</button>` : ''}
                        <button type="button" class="btn-icon delete" title="删除" onclick="window.LabsForm.removeOutbound(${index})">🗑️</button>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Type *</label>
                        <select class="form-control" onchange="window.LabsForm.updateOutboundType(${index}, this.value)">
                            <option value="shadowsocks" ${isShadowsocks ? 'selected' : ''}>Shadowsocks</option>
                            <option value="trojan" ${outbound.type === 'trojan' ? 'selected' : ''}>Trojan</option>
                            <option value="vmess" ${outbound.type === 'vmess' ? 'selected' : ''}>VMess</option>
                            <option value="selector" ${isSelector ? 'selected' : ''}>Selector</option>
                            <option value="direct" ${isDirect ? 'selected' : ''}>Direct</option>
                            <option value="block" ${outbound.type === 'block' ? 'selected' : ''}>Block</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Tag *</label>
                        <input type="text" class="form-control" value="${outbound.tag}" 
                               onchange="window.LabsForm.updateOutbound(${index}, 'tag', this.value)" required>
                    </div>
                </div>
                ${isShadowsocks ? `
                <div class="form-row">
                    <div class="form-group">
                        <label>Server *</label>
                        <input type="text" class="form-control" value="${outbound.server}" 
                               onchange="window.LabsForm.updateOutbound(${index}, 'server', this.value)" placeholder="<IP>" required>
                    </div>
                    <div class="form-group">
                        <label>Port *</label>
                        <input type="number" class="form-control" value="${outbound.server_port}" 
                               onchange="window.LabsForm.updateOutbound(${index}, 'server_port', this.value)" placeholder="<PORT>" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Method *</label>
                        <select class="form-control" onchange="window.LabsForm.updateOutbound(${index}, 'method', this.value)">
                            <option value="aes-256-gcm" ${outbound.method === 'aes-256-gcm' ? 'selected' : ''}>AES-256-GCM</option>
                            <option value="aes-128-gcm" ${outbound.method === 'aes-128-gcm' ? 'selected' : ''}>AES-128-GCM</option>
                            <option value="chacha20-ietf-poly1305" ${outbound.method === 'chacha20-ietf-poly1305' ? 'selected' : ''}>ChaCha20-Poly1305</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Password *</label>
                        <input type="text" class="form-control" value="${outbound.password}" 
                               onchange="window.LabsForm.updateOutbound(${index}, 'password', this.value)" placeholder="<PASSWORD>" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" ${outbound.udp !== false ? 'checked' : ''} 
                                   onchange="window.LabsForm.updateOutbound(${index}, 'udp', this.checked)">
                            <span>Enable UDP</span>
                        </label>
                    </div>
                </div>
                ` : ''}
                ${outbound.type === 'trojan' ? `
                <div class="form-row">
                    <div class="form-group">
                        <label>Server *</label>
                        <input type="text" class="form-control" value="${outbound.server || ''}" 
                               onchange="window.LabsForm.updateOutbound(${index}, 'server', this.value)" placeholder="<IP>" required>
                    </div>
                    <div class="form-group">
                        <label>Port *</label>
                        <input type="number" class="form-control" value="${outbound.server_port || ''}" 
                               onchange="window.LabsForm.updateOutbound(${index}, 'server_port', this.value)" placeholder="<PORT>" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Password *</label>
                        <input type="text" class="form-control" value="${outbound.password || ''}" 
                               onchange="window.LabsForm.updateOutbound(${index}, 'password', this.value)" placeholder="<PASSWORD>" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" ${outbound.udp !== false ? 'checked' : ''} 
                                   onchange="window.LabsForm.updateOutbound(${index}, 'udp', this.checked)">
                            <span>Enable UDP</span>
                        </label>
                    </div>
                </div>
                ` : ''}
                ${outbound.type === 'vmess' ? `
                <div class="form-row">
                    <div class="form-group">
                        <label>Server *</label>
                        <input type="text" class="form-control" value="${outbound.server || ''}" 
                               onchange="window.LabsForm.updateOutbound(${index}, 'server', this.value)" placeholder="<IP>" required>
                    </div>
                    <div class="form-group">
                        <label>Port *</label>
                        <input type="number" class="form-control" value="${outbound.server_port || ''}" 
                               onchange="window.LabsForm.updateOutbound(${index}, 'server_port', this.value)" placeholder="<PORT>" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>UUID *</label>
                        <input type="text" class="form-control" value="${outbound.uuid || ''}" 
                               onchange="window.LabsForm.updateOutbound(${index}, 'uuid', this.value)" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" required>
                    </div>
                    <div class="form-group">
                        <label>Security</label>
                        <select class="form-control" onchange="window.LabsForm.updateOutbound(${index}, 'security', this.value)">
                            <option value="auto" ${outbound.security === 'auto' ? 'selected' : ''}>Auto</option>
                            <option value="none" ${outbound.security === 'none' ? 'selected' : ''}>None</option>
                            <option value="zero" ${outbound.security === 'zero' ? 'selected' : ''}>Zero</option>
                            <option value="aes-128-gcm" ${outbound.security === 'aes-128-gcm' ? 'selected' : ''}>AES-128-GCM</option>
                            <option value="chacha20-poly1305" ${outbound.security === 'chacha20-poly1305' ? 'selected' : ''}>ChaCha20-Poly1305</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" ${outbound.udp !== false ? 'checked' : ''} 
                                   onchange="window.LabsForm.updateOutbound(${index}, 'udp', this.checked)">
                            <span>Enable UDP</span>
                        </label>
                    </div>
                </div>
                ` : ''}
                ${isSelector ? `
                <div class="form-group">
                    <label>Outbounds (comma-separated tags)</label>
                    <input type="text" class="form-control" value="${outbound.outbounds ? outbound.outbounds.join(', ') : ''}" 
                           onchange="window.LabsForm.updateSelectorOutbounds(${index}, this.value)">
                </div>
                <div class="form-group">
                    <label>Default Outbound</label>
                    <select class="form-control" onchange="window.LabsForm.updateOutbound(${index}, 'default', this.value)">
                        ${(outbound.outbounds || []).map(tag => `<option value="${tag}" ${outbound.default === tag ? 'selected' : ''}>${tag}</option>`).join('')}
                    </select>
                </div>
                ` : ''}
            `;
            container.appendChild(item);
        });
    }

    window.LabsForm.addOutbound = () => {
        state.formData.outbounds.push({
            type: 'shadowsocks',
            tag: `node-${state.formData.outbounds.length + 1}`,
            server: '<IP>',
            server_port: '<PORT>',
            method: 'aes-256-gcm',
            password: '<PASSWORD>'
        });
        renderOutbounds();
        window.dispatchEvent(new CustomEvent('labs-form-updated'));
    };

    window.LabsForm.removeOutbound = (index) => {
        state.formData.outbounds.splice(index, 1);
        renderOutbounds();
        window.dispatchEvent(new CustomEvent('labs-form-updated'));
    };

    window.LabsForm.moveOutbound = (index, direction) => {
        const newIndex = index + direction;
        if (newIndex >= 0 && newIndex < state.formData.outbounds.length) {
            [state.formData.outbounds[index], state.formData.outbounds[newIndex]] = 
            [state.formData.outbounds[newIndex], state.formData.outbounds[index]];
            renderOutbounds();
            window.dispatchEvent(new CustomEvent('labs-form-updated'));
        }
    };

    window.LabsForm.updateOutboundType = (index, value) => {
        const newOutbound = { type: value, tag: `outbound-${index + 1}` };
        if (value === 'shadowsocks') {
            Object.assign(newOutbound, {
                server: '<IP>',
                server_port: '<PORT>',
                method: 'aes-256-gcm',
                password: '<PASSWORD>',
                udp: true
            });
        } else if (value === 'trojan') {
            Object.assign(newOutbound, {
                server: '<IP>',
                server_port: '<PORT>',
                password: '<PASSWORD>',
                udp: true
            });
        } else if (value === 'vmess') {
            Object.assign(newOutbound, {
                server: '<IP>',
                server_port: '<PORT>',
                uuid: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
                security: 'auto',
                udp: true
            });
        } else if (value === 'selector') {
            Object.assign(newOutbound, {
                outbounds: [],
                default: ''
            });
        }
        state.formData.outbounds[index] = newOutbound;
        renderOutbounds();
        window.dispatchEvent(new CustomEvent('labs-form-updated'));
    };

    window.LabsForm.updateOutbound = (index, field, value) => {
        if (field === 'server_port') {
            value = parseInt(value) || value;
        }
        state.formData.outbounds[index][field] = value;
        window.dispatchEvent(new CustomEvent('labs-form-updated'));
    };

    window.LabsForm.updateSelectorOutbounds = (index, value) => {
        state.formData.outbounds[index].outbounds = value.split(',').map(s => s.trim()).filter(s => s);
        renderOutbounds(); // refresh dropdown
        window.dispatchEvent(new CustomEvent('labs-form-updated'));
    };

    state.dom.btnAddOutbound.addEventListener('click', window.LabsForm.addOutbound);

    // ===== Route Rules Renderer =====
    function renderRouteRules() {
        const container = state.dom.routeRulesContainer;
        container.innerHTML = '';
        
        state.formData.route.rules.forEach((rule, index) => {
            const ruleType = getRuleType(rule);
            const item = document.createElement('div');
            item.className = 'item-card';
            item.innerHTML = `
                <div class="item-card-header">
                    <div class="item-card-title">Rule #${index + 1} (${ruleType})</div>
                    <div class="item-actions">
                        ${index > 0 ? `<button type="button" class="btn-icon up" title="上移" onclick="window.LabsForm.moveRouteRule(${index}, -1)">↑</button>` : ''}
                        ${index < state.formData.route.rules.length - 1 ? `<button type="button" class="btn-icon down" title="下移" onclick="window.LabsForm.moveRouteRule(${index}, 1)">↓</button>` : ''}
                        <button type="button" class="btn-icon delete" title="删除" onclick="window.LabsForm.removeRouteRule(${index})">🗑️</button>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Rule Type *</label>
                        <select class="form-control" onchange="window.LabsForm.updateRouteRuleType(${index}, this.value)">
                            <option value="protocol" ${ruleType === 'protocol' ? 'selected' : ''}>Protocol</option>
                            <option value="domain_suffix" ${ruleType === 'domain_suffix' ? 'selected' : ''}>Domain Suffix</option>
                            <option value="domain_keyword" ${ruleType === 'domain_keyword' ? 'selected' : ''}>Domain Keyword</option>
                            <option value="ip_cidr" ${ruleType === 'ip_cidr' ? 'selected' : ''}>IP CIDR</option>
                            <option value="port" ${ruleType === 'port' ? 'selected' : ''}>Port</option>
                            <option value="ip_is_private" ${ruleType === 'ip_is_private' ? 'selected' : ''}>Private IP</option>
                            <option value="rule_set" ${ruleType === 'rule_set' ? 'selected' : ''}>Rule Set</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Outbound *</label>
                        <select class="form-control" onchange="window.LabsForm.updateRouteRule(${index}, 'outbound', this.value)">
                            <option value="direct" ${rule.outbound === 'direct' ? 'selected' : ''}>Direct</option>
                            <option value="proxy" ${rule.outbound === 'proxy' ? 'selected' : ''}>Proxy</option>
                            ${state.formData.outbounds.filter(o => o.type !== 'selector').map(o => `<option value="${o.tag}" ${rule.outbound === o.tag ? 'selected' : ''}>${o.tag}</option>`).join('')}
                        </select>
                    </div>
                </div>
                ${renderRuleValueInput(rule, index)}
            `;
            container.appendChild(item);
        });
    }

    function renderRuleValueInput(rule, index) {
        const ruleType = getRuleType(rule);
        
        if (ruleType === 'protocol') {
            return `
                <div class="form-group">
                    <label>Protocol *</label>
                    <select class="form-control" onchange="window.LabsForm.updateRouteRule(${index}, 'protocol', this.value)">
                        <option value="dns" ${rule.protocol === 'dns' ? 'selected' : ''}>DNS</option>
                        <option value="http" ${rule.protocol === 'http' ? 'selected' : ''}>HTTP</option>
                        <option value="tls" ${rule.protocol === 'tls' ? 'selected' : ''}>TLS</option>
                        <option value="quic" ${rule.protocol === 'quic' ? 'selected' : ''}>QUIC</option>
                    </select>
                </div>
            `;
        } else if (ruleType === 'domain_suffix') {
            return `
                <div class="form-group">
                    <label>Domain Suffixes (comma-separated) *</label>
                    <textarea class="form-control" rows="2" onchange="window.LabsForm.updateRouteRuleDomainSuffix(${index}, this.value)">${rule.domain_suffix ? rule.domain_suffix.join(', ') : ''}</textarea>
                </div>
            `;
        } else if (ruleType === 'domain_keyword') {
            return `
                <div class="form-group">
                    <label>Domain Keywords (comma-separated) *</label>
                    <input type="text" class="form-control" value="${rule.domain_keyword ? rule.domain_keyword.join(', ') : ''}" 
                           onchange="window.LabsForm.updateRouteRuleDomainKeyword(${index}, this.value)">
                </div>
            `;
        } else if (ruleType === 'ip_cidr') {
            return `
                <div class="form-group">
                    <label>IP CIDR (comma-separated) *</label>
                    <input type="text" class="form-control" value="${rule.ip_cidr ? rule.ip_cidr.join(', ') : ''}" 
                           onchange="window.LabsForm.updateRouteRuleIPCIDR(${index}, this.value)" placeholder="192.168.0.0/16, 10.0.0.0/8">
                </div>
            `;
        } else if (ruleType === 'port') {
            return `
                <div class="form-group">
                    <label>Port *</label>
                    <input type="number" class="form-control" value="${rule.port || ''}" 
                           onchange="window.LabsForm.updateRouteRule(${index}, 'port', parseInt(this.value))">
                </div>
            `;
        } else if (ruleType === 'rule_set') {
            return `
                <div class="form-group">
                    <label>Rule Set Tag *</label>
                    <input type="text" class="form-control" value="${rule.rule_set || ''}" 
                           onchange="window.LabsForm.updateRouteRule(${index}, 'rule_set', this.value)">
                </div>
            `;
        } else if (ruleType === 'ip_is_private') {
            return `
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" ${rule.ip_is_private ? 'checked' : ''} 
                               onchange="window.LabsForm.updateRouteRule(${index}, 'ip_is_private', this.checked)">
                        <span>Match Private IP Addresses</span>
                    </label>
                </div>
            `;
        }
        return '';
    }

    function getRuleType(rule) {
        if (rule.protocol && !rule.domain_suffix && !rule.ip_cidr) return 'protocol';
        if (rule.domain_suffix) return 'domain_suffix';
        if (rule.domain_keyword) return 'domain_keyword';
        if (rule.ip_cidr) return 'ip_cidr';
        if (rule.port) return 'port';
        if (rule.ip_is_private !== undefined) return 'ip_is_private';
        if (rule.rule_set) return 'rule_set';
        return 'protocol';
    }

    window.LabsForm.addRouteRule = () => {
        state.formData.route.rules.push({
            protocol: 'dns',
            action: 'hijack-dns'
        });
        renderRouteRules();
        window.dispatchEvent(new CustomEvent('labs-form-updated'));
    };

    window.LabsForm.removeRouteRule = (index) => {
        state.formData.route.rules.splice(index, 1);
        renderRouteRules();
        window.dispatchEvent(new CustomEvent('labs-form-updated'));
    };

    window.LabsForm.moveRouteRule = (index, direction) => {
        const newIndex = index + direction;
        if (newIndex >= 0 && newIndex < state.formData.route.rules.length) {
            [state.formData.route.rules[index], state.formData.route.rules[newIndex]] = 
            [state.formData.route.rules[newIndex], state.formData.route.rules[index]];
            renderRouteRules();
            window.dispatchEvent(new CustomEvent('labs-form-updated'));
        }
    };

    window.LabsForm.updateRouteRuleType = (index, value) => {
        // Clear existing rule properties
        const newRule = {};
        if (value === 'protocol') {
            newRule.protocol = 'dns';
            newRule.action = 'hijack-dns';
        } else if (value === 'domain_suffix') {
            newRule.domain_suffix = ['example.com'];
            newRule.outbound = 'proxy';
        } else if (value === 'domain_keyword') {
            newRule.domain_keyword = ['keyword'];
            newRule.outbound = 'proxy';
        } else if (value === 'ip_cidr') {
            newRule.ip_cidr = ['192.168.0.0/16'];
            newRule.outbound = 'direct';
        } else if (value === 'port') {
            newRule.port = 443;
            newRule.outbound = 'proxy';
        } else if (value === 'ip_is_private') {
            newRule.ip_is_private = true;
            newRule.outbound = 'direct';
        } else if (value === 'rule_set') {
            newRule.rule_set = 'geosite-geolocation-cn';
            newRule.outbound = 'direct';
        }
        state.formData.route.rules[index] = newRule;
        renderRouteRules();
        window.dispatchEvent(new CustomEvent('labs-form-updated'));
    };

    window.LabsForm.updateRouteRule = (index, field, value) => {
        state.formData.route.rules[index][field] = value;
        window.dispatchEvent(new CustomEvent('labs-form-updated'));
    };

    window.LabsForm.updateRouteRuleDomainSuffix = (index, value) => {
        state.formData.route.rules[index].domain_suffix = value.split(',').map(s => s.trim()).filter(s => s);
        window.dispatchEvent(new CustomEvent('labs-form-updated'));
    };

    window.LabsForm.updateRouteRuleDomainKeyword = (index, value) => {
        state.formData.route.rules[index].domain_keyword = value.split(',').map(s => s.trim()).filter(s => s);
        window.dispatchEvent(new CustomEvent('labs-form-updated'));
    };

    window.LabsForm.updateRouteRuleIPCIDR = (index, value) => {
        state.formData.route.rules[index].ip_cidr = value.split(',').map(s => s.trim()).filter(s => s);
        window.dispatchEvent(new CustomEvent('labs-form-updated'));
    };

    state.dom.btnAddRoute.addEventListener('click', window.LabsForm.addRouteRule);

    // ===== Main Form Bindings =====
    function bindBasicForm() {
        const { providerId, configName, configDesc, configAuthor, visibility, status, 
                logLevel, logTimestamp, logOutput, routeFinal, autoDetectInterface } = state.dom;

        // Basic Info
        providerId.addEventListener('input', (e) => {
            state.formData.basic.provider_id = e.target.value;
            window.dispatchEvent(new CustomEvent('labs-form-updated'));
        });
        configName.addEventListener('input', (e) => {
            state.formData.basic.name = e.target.value;
            window.dispatchEvent(new CustomEvent('labs-form-updated'));
        });
        configDesc.addEventListener('input', (e) => {
            state.formData.basic.description = e.target.value;
            window.dispatchEvent(new CustomEvent('labs-form-updated'));
        });
        configAuthor.addEventListener('input', (e) => {
            state.formData.basic.author = e.target.value;
            window.dispatchEvent(new CustomEvent('labs-form-updated'));
        });
        visibility.addEventListener('change', (e) => {
            state.formData.basic.visibility = e.target.value;
            window.dispatchEvent(new CustomEvent('labs-form-updated'));
        });
        status.addEventListener('change', (e) => {
            state.formData.basic.status = e.target.value;
            window.dispatchEvent(new CustomEvent('labs-form-updated'));
        });

        // Log
        logLevel.addEventListener('change', (e) => {
            state.formData.log.level = e.target.value;
            window.dispatchEvent(new CustomEvent('labs-form-updated'));
        });
        logTimestamp.addEventListener('change', (e) => {
            state.formData.log.timestamp = e.target.checked;
            window.dispatchEvent(new CustomEvent('labs-form-updated'));
        });
        logOutput.addEventListener('input', (e) => {
            state.formData.log.output = e.target.value;
            window.dispatchEvent(new CustomEvent('labs-form-updated'));
        });

        // Route
        routeFinal.addEventListener('change', (e) => {
            state.formData.route.final = e.target.value;
            window.dispatchEvent(new CustomEvent('labs-form-updated'));
        });
        autoDetectInterface.addEventListener('change', (e) => {
            state.formData.route.auto_detect_interface = e.target.checked;
            window.dispatchEvent(new CustomEvent('labs-form-updated'));
        });
    }

    // ===== Public API =====
    window.LabsForm = window.LabsForm || {};
    window.LabsForm.getState = () => state.formData;
    window.LabsForm.setState = (newState) => {
        state.formData = { ...state.formData, ...newState };
    };

    // ===== Initialization =====
    function init() {
        console.log("[Labs] Initializing Form Handler...");
        initDom();
        
        // Generate form sections HTML
        generateFormSections();
        
        const renderTags = initTagsInput();
        renderTags();
        renderDNSServers();
        renderDnsRules();
        renderRuleSets();
        renderInbounds();
        renderOutbounds();
        renderRouteRules();
        bindBasicForm();
        console.log("[Labs] Form Handler ready!");
    }

    // ===== Generate Form Sections HTML =====
    function generateFormSections() {
        if (!state.dom.form) return;
        
        state.dom.form.innerHTML = `
            <!-- Section: Basic Information -->
            <div class="form-section">
                <div class="section-header">
                    <h3>📋 基础信息 (Basic Information)</h3>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>
                            Provider ID *
                            <span class="tooltip-icon" title="配置文件的唯一标识符，格式：com.organization.product.version">ℹ️</span>
                        </label>
                        <input type="text" id="provider-id" class="form-control" value="${state.formData.basic.provider_id}" required>
                    </div>
                    <div class="form-group">
                        <label>
                            Name *
                            <span class="tooltip-icon" title="配置文件的显示名称">ℹ️</span>
                        </label>
                        <input type="text" id="config-name" class="form-control" value="${state.formData.basic.name}" required>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Description</label>
                        <input type="text" id="config-desc" class="form-control" value="${state.formData.basic.description}">
                    </div>
                    <div class="form-group">
                        <label>Author</label>
                        <input type="text" id="config-author" class="form-control" value="${state.formData.basic.author}">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Tags</label>
                        <div class="tag-input-container">
                            <input type="text" class="tag-input form-control" placeholder="输入标签后按回车">
                            <div class="tags-list"></div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Visibility</label>
                        <select id="visibility" class="form-control">
                            <option value="public" ${state.formData.basic.visibility === 'public' ? 'selected' : ''}>Public</option>
                            <option value="private" ${state.formData.basic.visibility === 'private' ? 'selected' : ''}>Private</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Status</label>
                        <select id="status" class="form-control">
                            <option value="active" ${state.formData.basic.status === 'active' ? 'selected' : ''}>Active</option>
                            <option value="inactive" ${state.formData.basic.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                            <option value="deprecated" ${state.formData.basic.status === 'deprecated' ? 'selected' : ''}>Deprecated</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Section: Log Settings -->
            <div class="form-section">
                <div class="section-header">
                    <h3>📝 日志设置 (Log Settings)</h3>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>
                            Log Level
                            <span class="tooltip-icon" title="日志详细程度：trace > debug > info > warn > error">ℹ️</span>
                        </label>
                        <select id="log-level" class="form-control">
                            <option value="trace" ${state.formData.log.level === 'trace' ? 'selected' : ''}>Trace</option>
                            <option value="debug" ${state.formData.log.level === 'debug' ? 'selected' : ''}>Debug</option>
                            <option value="info" ${state.formData.log.level === 'info' ? 'selected' : ''}>Info</option>
                            <option value="warn" ${state.formData.log.level === 'warn' ? 'selected' : ''}>Warn</option>
                            <option value="error" ${state.formData.log.level === 'error' ? 'selected' : ''}>Error</option>
                            <option value="fatal" ${state.formData.log.level === 'fatal' ? 'selected' : ''}>Fatal</option>
                            <option value="panic" ${state.formData.log.level === 'panic' ? 'selected' : ''}>Panic</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="log-timestamp" ${state.formData.log.timestamp ? 'checked' : ''}>
                            <span>Enable Timestamp</span>
                        </label>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>
                            Output File Path
                            <span class="tooltip-icon" title="日志文件输出路径，留空则输出到标准错误">ℹ️</span>
                        </label>
                        <input type="text" id="log-output" class="form-control" value="${state.formData.log.output}" placeholder="/var/log/sing-box.log">
                    </div>
                </div>
            </div>

            <!-- Section: DNS Configuration -->
            <div class="form-section">
                <div class="section-header">
                    <h3>🌐 DNS 配置 (DNS Configuration)</h3>
                </div>
                
                <div class="dns-servers-container" id="dns-servers-container">
                    <div class="list-items"></div>
                    <button type="button" id="btn-add-dns" class="btn btn-secondary btn-sm" style="margin-top: 0.8rem;">+ 添加 DNS 服务器</button>
                </div>

                <div class="dns-rules-container" id="dns-rules-container" style="margin-top: 1.5rem;">
                    <div class="list-items"></div>
                    <button type="button" id="btn-add-dns-rule" class="btn btn-secondary btn-sm" style="margin-top: 0.8rem;">+ 添加 DNS 规则</button>
                </div>

                <div class="form-row" style="margin-top: 1.5rem;">
                    <div class="form-group">
                        <label>
                            Final DNS
                            <span class="tooltip-icon" title="默认 DNS 服务器，用于处理未匹配规则的域名">ℹ️</span>
                        </label>
                        <select id="dns-final" class="form-control"></select>
                    </div>
                    <div class="form-group">
                        <label>
                            IP Strategy
                            <span class="tooltip-icon" title="IP 版本偏好：prefer_ipv4, prefer_ipv6, ipv4_only, ipv6_only">ℹ️</span>
                        </label>
                        <select id="dns-strategy" class="form-control">
                            <option value="prefer_ipv4" ${state.formData.dns.strategy === 'prefer_ipv4' ? 'selected' : ''}>Prefer IPv4</option>
                            <option value="prefer_ipv6" ${state.formData.dns.strategy === 'prefer_ipv6' ? 'selected' : ''}>Prefer IPv6</option>
                            <option value="ipv4_only" ${state.formData.dns.strategy === 'ipv4_only' ? 'selected' : ''}>IPv4 Only</option>
                            <option value="ipv6_only" ${state.formData.dns.strategy === 'ipv6_only' ? 'selected' : ''}>IPv6 Only</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Section: Inbounds -->
            <div class="form-section">
                <div class="section-header">
                    <h3>📥 入站配置 (Inbounds)</h3>
                </div>
                
                <div class="inbounds-container" id="inbounds-container">
                    <div class="list-items"></div>
                    <button type="button" id="btn-add-inbound" class="btn btn-secondary btn-sm" style="margin-top: 0.8rem;">+ 添加入站</button>
                </div>
            </div>

            <!-- Section: Outbounds -->
            <div class="form-section">
                <div class="section-header">
                    <h3>📤 出站配置 (Outbounds)</h3>
                </div>
                
                <div class="outbounds-container" id="outbounds-container">
                    <div class="list-items"></div>
                    <button type="button" id="btn-add-outbound" class="btn btn-secondary btn-sm" style="margin-top: 0.8rem;">+ 添加出站</button>
                </div>
            </div>

            <!-- Section: Route Rules -->
            <div class="form-section">
                <div class="section-header">
                    <h3>🔀 路由规则 (Route Rules)</h3>
                </div>
                
                <div class="route-rules-container" id="route-rules-container">
                    <div class="list-items"></div>
                    <button type="button" id="btn-add-route" class="btn btn-secondary btn-sm" style="margin-top: 0.8rem;">+ 添加路由规则</button>
                </div>

                <div class="route-rule-sets-container" id="route-rule-sets-container" style="margin-top: 1.5rem;">
                    <div class="list-items"></div>
                    <button type="button" id="btn-add-rule-set" class="btn btn-secondary btn-sm" style="margin-top: 0.8rem;">+ 添加规则集</button>
                </div>

                <div class="form-row" style="margin-top: 1.5rem;">
                    <div class="form-group">
                        <label>
                            Final Outbound
                            <span class="tooltip-icon" title="默认出站，用于处理未匹配任何规则的连接">ℹ️</span>
                        </label>
                        <select id="route-final" class="form-control">
                            <option value="proxy" ${state.formData.route.final === 'proxy' ? 'selected' : ''}>Proxy</option>
                            <option value="direct" ${state.formData.route.final === 'direct' ? 'selected' : ''}>Direct</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="auto-detect-interface" ${state.formData.route.auto_detect_interface ? 'checked' : ''}>
                            <span>Auto Detect Interface</span>
                        </label>
                    </div>
                </div>
            </div>
        `;
        
        // Re-initialize DOM references after generating HTML
        initDom();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose API to window
    window.LabsForm = {
        init,
        getState: () => state.formData,
        setState: (newState) => {
            state.formData = { ...state.formData, ...newState };
            // Re-render all
            renderDNSServers();
            renderDnsRules();
            renderRuleSets();
            renderInbounds();
            renderOutbounds();
            renderRouteRules();
            window.dispatchEvent(new CustomEvent('labs-form-updated'));
        },
        addDNSServer,
        removeDNSServer,
        updateDNSServer,
        addDnsRule,
        removeDnsRule,
        moveDnsRule,
        updateDnsRule,
        addRuleSet,
        removeRuleSet,
        moveRuleSet,
        updateRuleSet,
        addInbound,
        removeInbound,
        moveInbound,
        updateInboundType,
        updateInboundAddress,
        updateInbound,
        addOutbound,
        removeOutbound,
        moveOutbound,
        updateOutboundType,
        updateOutbound,
        updateSelectorOutbounds,
        addRouteRule,
        removeRouteRule,
        moveRouteRule,
        updateRouteRuleType,
        updateRouteRule,
        updateRouteRuleDomainSuffix,
        updateRouteRuleDomainKeyword,
        updateRouteRuleIPCIDR,
        removeTag
    };
})();
