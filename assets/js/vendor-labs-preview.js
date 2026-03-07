/**
 * MeshNetProtocol - Sing-Box Configuration Lab
 * JSON Preview Module
 */

(function() {
    "use strict";

    console.log("[Labs] Loading Preview Module...");

    const dom = {
        preview: document.getElementById('json-preview'),
        code: document.querySelector('#json-preview code'),
        status: document.getElementById('json-status')
    };

    // ===== JSON Generator =====
    function generateConfig() {
        const formData = window.LabsForm ? window.LabsForm.getState() : null;
        
        if (!formData) {
            return getDefaultConfig();
        }

        // Build complete config from form data
        return {
            provider_id: formData.basic.provider_id,
            name: formData.basic.name,
            description: formData.basic.description,
            tags: formData.basic.tags,
            author: formData.basic.author,
            visibility: formData.basic.visibility,
            status: formData.basic.status,
            updated_at: new Date().toISOString(),
            package_hash: "seed-v2-smart",
            source_updated_at: new Date().toISOString(),
            config: {
                log: {
                    level: formData.log.level,
                    timestamp: formData.log.timestamp,
                    output: formData.log.output || undefined
                },
                dns: {
                    servers: formData.dns.servers,
                    rules: formData.dns.rules,
                    final: formData.dns.final,
                    strategy: formData.dns.strategy
                },
                inbounds: formData.inbounds,
                outbounds: formData.outbounds,
                route: {
                    rules: formData.route.rules,
                    rule_sets: formData.route.rule_sets || [],
                    final: formData.route.final,
                    auto_detect_interface: formData.route.auto_detect_interface
                }
            },
            routing_rules: {
                version: 2,
                proxy: {
                    domain: [],
                    domain_suffix: []
                }
            }
        };
    }

    function getDefaultConfig() {
        return {
            provider_id: "com.meshnetprotocol.profile.v2.smart",
            name: "启动种子",
            description: "官方引导配置文件",
            tags: ["Official", "SmartRouting", "V2"],
            author: "OpenMesh Team",
            visibility: "public",
            status: "active",
            updated_at: new Date().toISOString(),
            package_hash: "seed-v2-smart",
            source_updated_at: new Date().toISOString(),
            config: {
                log: { level: "info", timestamp: true, output: undefined },
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
                    { type: "direct", tag: "direct" }
                ],
                route: {
                    rules: [
                        { protocol: "dns", action: "hijack-dns" },
                        { domain_suffix: ["google.com", "youtube.com"], outbound: "proxy" },
                        { rule_set: "geosite-geolocation-cn", outbound: "direct" },
                        { ip_is_private: true, outbound: "direct" }
                    ],
                    rule_sets: [
                        {
                            type: "remote",
                            tag: "geosite-geolocation-cn",
                            format: "binary",
                            url: "https://raw.githubusercontent.com/SagerNet/sing-geoip/rule-set/geoip-cn.srs",
                            download_detour: "proxy",
                            update_interval: "1d"
                        }
                    ],
                    final: "proxy",
                    auto_detect_interface: true
                }
            },
            routing_rules: {
                version: 2,
                proxy: { domain: [], domain_suffix: [] }
            }
        };
    }

    // ===== Syntax Highlighting =====
    function syntaxHighlight(json) {
        if (!json) return '';
        
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
            let cls = 'syntax-number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'syntax-keyword';
                } else {
                    cls = 'syntax-string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'syntax-boolean';
            } else if (/null/.test(match)) {
                cls = 'syntax-null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }

    // ===== Update Preview =====
    function updatePreview() {
        try {
            const config = generateConfig();
            const jsonString = JSON.stringify(config, null, 2);
            
            // Update content with syntax highlighting
            dom.code.innerHTML = syntaxHighlight(jsonString);
            
            // Update status
            dom.status.textContent = '✅ 语法正确';
            dom.status.classList.remove('error');
            
            // Dispatch event for animation module
            window.dispatchEvent(new CustomEvent('labs-config-updated', { 
                detail: { config, jsonString } 
            }));
            
        } catch (error) {
            dom.code.textContent = `Error generating config:\n${error.message}`;
            dom.status.textContent = '❌ 格式错误';
            dom.status.classList.add('error');
        }
    }

    // ===== Copy Functionality =====
    function copyConfig() {
        try {
            const config = generateConfig();
            const jsonString = JSON.stringify(config, null, 2);
            navigator.clipboard.writeText(jsonString).then(() => {
                alert('配置已复制到剪贴板！');
            }).catch(err => {
                console.error('Failed to copy:', err);
                alert('复制失败，请手动选择复制');
            });
        } catch (error) {
            alert('生成配置失败：' + error.message);
        }
    }

    // ===== Load Template =====
    function loadTemplate() {
        const template = {
            basic: {
                provider_id: "com.example.vpn.v1",
                name: "我的配置",
                description: "自定义 sing-box 配置",
                author: "User",
                tags: ["Custom", "V1"],
                visibility: "private",
                status: "active"
            },
            log: {
                level: "debug",
                timestamp: true,
                output: undefined
            },
            dns: {
                servers: [
                    { tag: "local-dns", address: "223.5.5.5", detour: "direct" },
                    { tag: "remote-dns", address: "8.8.8.8", detour: "proxy" }
                ],
                rules: [],
                final: "remote-dns",
                strategy: "prefer_ipv4"
            },
            inbounds: [
                {
                    type: "tun",
                    tag: "tun-in",
                    address: ["172.18.0.1/30"],
                    auto_route: true,
                    sniff: true,
                    sniff_override_destination: true
                }
            ],
            outbounds: [
                {
                    type: "shadowsocks",
                    tag: "my-node",
                    server: "<IP>",
                    server_port: "<PORT>",
                    method: "aes-256-gcm",
                    password: "<PASSWORD>"
                },
                { type: "direct", tag: "direct" }
            ],
            route: {
                rules: [
                    { protocol: "dns", action: "hijack-dns" },
                    { ip_is_private: true, outbound: "direct" }
                ],
                rule_sets: [],
                final: "proxy",
                auto_detect_interface: true
            }
        };

        if (window.LabsForm) {
            window.LabsForm.setState(template);
            updatePreview();
            alert('模板已加载！请根据实际情况修改配置。');
        }
    }

    // ===== Event Listeners =====
    window.addEventListener('labs-form-updated', () => {
        console.log("[Preview] Form updated, refreshing preview...");
        updatePreview();
    });

    document.getElementById('btn-copy-config')?.addEventListener('click', copyConfig);
    document.getElementById('btn-load-template')?.addEventListener('click', loadTemplate);

    // ===== Initialization =====
    function init() {
        console.log("[Labs] Initializing Preview Module...");
        updatePreview();
        console.log("[Labs] Preview Module ready!");
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose API to window
    window.LabsPreview = {
        init,
        updatePreview,
        copyConfig,
        generateConfig
    };
})();
