/**
 * MeshNetProtocol Vendor Console - State & Constants
 */
window.MeshVendor = window.MeshVendor || {};

window.MeshVendor.Constants = {
    MESH_CONSOLE_VERSION: 18,
    NETWORKS: {
        "base-mainnet": { name: "Base Mainnet", chainIdHex: "0x2105" },
        "base-sepolia": { name: "Base Sepolia", chainIdHex: "0x14a34" }
    },
    CORE_DOMAIN_PRESETS: [
        // Google & Android Ecosystem
        "google.com", "googleapis.com", "gstatic.com", "googleusercontent.com",
        "gvt1.com", "gvt2.com", "1e100.net", "youtube.com", "ytimg.com", "ggpht.com",
        "android.com", "app-measurement.com",
        // Developer & Global Infra
        "github.com", "githubusercontent.com", "workers.dev",
        // Social Media & Comms
        "twitter.com", "telegram.org", "facebook.com", "fbcdn.net",
        "instagram.com", "whatsapp.com", "whatsapp.net", "tiktok.com", "byteoversea.com",
        // AI Services & Tools
        "openai.com", "chatgpt.com", "oaistatic.com", "oaiusercontent.com",
        "anthropic.com", "claude.ai", "perplexity.ai", "mistral.ai", "deepseek.com",
        "gemini.google.com", "generativelanguage.googleapis.com",
        "midjourney.com", "runwayml.com", "pika.art", "luma.ai", "sora.com",
        "suno.ai", "udio.com", "elevenlabs.io", "deepl.com",
        // Entertainment & Productivity
        "netflix.com", "microsoft.com", "bing.com"
    ],
    SINGBOX_TEMPLATE: {
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
                    { "tag": "google-dns", "address": "https://dns.google/dns-query", "detour": "proxy" }
                ],
                "rules": [
                    { "rule_set": "geosite-geolocation-cn", "server": "local-dns" }
                ],
                "final": "google-dns",
                "strategy": "prefer_ipv4"
            },
            "inbounds": [
                {
                    "type": "tun",
                    "tag": "tun-in",
                    "address": ["172.18.0.1/30"],
                    "auto_route": true,
                    "sniff": true,
                    "sniff_override_destination": true
                }
            ],
            "outbounds": [],
            "route": {
                "rules": [
                    { "protocol": "dns", "action": "hijack-dns" },
                    { "action": "sniff" },
                    // MANUAL PROXY OVERRIDE GOES HERE (Index 2)
                    { "rule_set": "geosite-geolocation-cn", "outbound": "direct" },
                    { "rule_set": "geoip-cn", "outbound": "direct" },
                    { "ip_is_private": true, "outbound": "direct" }
                ],
                "final": "proxy",
                "auto_detect_interface": true,
                "rule_set": [
                    { "type": "remote", "tag": "geoip-cn", "format": "binary", "url": "https://raw.githubusercontent.com/SagerNet/sing-geoip/rule-set/geoip-cn.srs", "download_detour": "proxy", "update_interval": "1d" },
                    { "type": "remote", "tag": "geosite-geolocation-cn", "format": "binary", "url": "https://raw.githubusercontent.com/SagerNet/sing-geosite/rule-set/geosite-geolocation-cn.srs", "download_detour": "proxy", "update_interval": "1d" }
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
    }
};

window.MeshVendor.State = {
    targetNetwork: "base-mainnet",
    chainIdHex: "",
    connected: false,
    signedIn: false,
    address: "",
    userDomains: []
};

window.MeshVendor.DOM = {};
