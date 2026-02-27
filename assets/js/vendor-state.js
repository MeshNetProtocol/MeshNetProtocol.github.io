/**
 * MeshNetProtocol Vendor Console - State & Constants
 */
window.MeshVendor = window.MeshVendor || {};

window.MeshVendor.Constants = {
    MESH_CONSOLE_VERSION: 17,
    NETWORKS: {
        "base-mainnet": { name: "Base Mainnet", chainIdHex: "0x2105" },
        "base-sepolia": { name: "Base Sepolia", chainIdHex: "0x14a34" }
    },
    AI_DOMAIN_PRESETS: [
        "openai.com", "chatgpt.com", "oaistatic.com", "oaiusercontent.com",
        "anthropic.com", "claude.ai", "perplexity.ai", "mistral.ai",
        "deepseek.com", "google.com", "gemini.google.com", "generativelanguage.googleapis.com",
        "bing.com", "midjourney.com", "runwayml.com", "pika.art", "luma.ai", "sora.com",
        "suno.ai", "udio.com", "elevenlabs.io"
    ],
    SINGBOX_TEMPLATE: {
        "provider_id": "com.meshnetprotocol.profile",
        "name": "启动种子",
        "description": "官方引导配置文件",
        "tags": ["Official", "Online", "Bootstrap"],
        "author": "OpenMesh Team",
        "visibility": "public",
        "status": "active",
        "updated_at": new Date().toISOString(),
        "package_hash": "v17",
        "source_updated_at": new Date().toISOString(),
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
            "outbounds": [],
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
            "version": 17,
            "proxy": {
                "domain": ["openmesh-api.ribencong.workers.dev", "raw.githubusercontent.com"],
                "domain_suffix": ["githubusercontent.com", "workers.dev"]
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
