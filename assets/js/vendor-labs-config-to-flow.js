/**
 * MeshNetProtocol - Configuration to Data Flow Converter
 * Converts sing-box configuration into visual data flow representations
 * 
 * This module:
 * 1. Reads configuration from the tree structure
 * 2. Analyzes routing rules and outbound paths
 * 3. Generates static data flow diagrams based on actual config
 * 4. Updates in real-time when configuration changes
 */

(function() {
    'use strict';

    // Module state
    const state = {
        config: null,
        container: null,
        flows: [],
        initialized: false
    };

    // Data flow types based on configuration analysis
    const FLOW_TYPES = {
        geo: { 
            color: '#00ff88', 
            label: 'Geo Data',
            description: 'Geolocation-based routing'
        },
        domain: { 
            color: '#ff6b35', 
            label: 'Domain Suffix',
            description: 'Domain suffix-based routing'
        },
        undefined: { 
            color: '#a855f7', 
            label: 'Undefined',
            description: 'Undefined or default routing'
        }
    };

    /**
     * Initialize the data flow converter
     */
    function init() {
        if (state.initialized) {
            console.log('[Config To Flow] Already initialized');
            return;
        }
        
        state.container = document.querySelector('.animation-wrapper-figma');
        if (!state.container) {
            console.warn('[Config To Flow] Animation wrapper not found');
            return;
        }

        console.log('[Config To Flow] Module initialized');

        // Listen to config updates
        window.addEventListener('config-updated', handleConfigUpdate);
        
        state.initialized = true;

        // Initial render if config already exists
        if (state.config) {
            render();
        }
    }

    /**
     * Handle config update event
     * @param {CustomEvent} event - Config update event with detail containing config object
     */
    function handleConfigUpdate(event) {
        const config = event.detail;
        state.config = config;
        console.log('[Config To Flow] Config updated:', config);
        
        // Analyze config and generate flows
        analyzeConfiguration(config);
        
        // Render the flow visualization
        render();
    }

    /**
     * Analyze configuration and extract data flows
     * @param {Object} config - sing-box configuration object
     */
    function analyzeConfiguration(config) {
        if (!config) {
            console.warn('[Config To Flow] No configuration to analyze');
            state.flows = [];
            return;
        }

        console.log('[Config To Flow] Analyzing configuration...');
        
        // Clear existing flows
        state.flows = [];

        // Analyze DNS configuration
        if (config.dns) {
            analyzeDNSConfig(config.dns);
        }

        // Analyze routing rules
        if (config.route) {
            analyzeRoutingConfig(config.route);
        }

        // Analyze inbounds
        if (config.inbounds) {
            analyzeInboundsConfig(config.inbounds);
        }

        // Analyze outbounds
        if (config.outbounds) {
            analyzeOutboundsConfig(config.outbounds);
        }

        console.log('[Config To Flow] Analysis complete. Found', state.flows.length, 'flows');
    }

    /**
     * Analyze DNS configuration
     * @param {Object} dnsConfig - DNS configuration object
     */
    function analyzeDNSConfig(dnsConfig) {
        console.log('[Config To Flow] Analyzing DNS config:', dnsConfig);
        
        // Add DNS data flow
        state.flows.push({
            type: 'domain',
            source: 'DNS Client',
            destination: 'DNS Server',
            path: ['client', 'router', 'dns'],
            disabled: false
        });
    }

    /**
     * Analyze routing configuration
     * @param {Object} routeConfig - Route configuration object
     */
    function analyzeRoutingConfig(routeConfig) {
        console.log('[Config To Flow] Analyzing routing config:', routeConfig);

        // Analyze route rules
        if (routeConfig.rules) {
            routeConfig.rules.forEach((rule, index) => {
                const flow = analyzeRouteRule(rule, index);
                if (flow) {
                    state.flows.push(flow);
                }
            });
        }
    }

    /**
     * Analyze a single route rule
     * @param {Object} rule - Route rule object
     * @param {number} index - Rule index
     * @returns {Object|null} Flow object or null
     */
    function analyzeRouteRule(rule, index) {
        // Determine flow type based on rule characteristics
        let flowType = 'undefined';

        // Check for geosite rules
        if (rule.geosite || rule.geoip) {
            flowType = 'geo';
        }
        // Check for domain suffix rules
        else if (rule.domain_suffix || rule.domain) {
            flowType = 'domain';
        }

        return {
            type: flowType,
            source: 'Router',
            destination: rule.outbound || 'default',
            path: ['client', 'router', 'firewall', rule.outbound || 'default'],
            rule: rule,
            ruleIndex: index
        };
    }

    /**
     * Analyze outbounds configuration
     * @param {Array} outbounds - Array of outbound configurations
     */
    function analyzeOutboundsConfig(outbounds) {
        console.log('[Config To Flow] Analyzing outbounds:', outbounds);
        
        outbounds.forEach((outbound, index) => {
            let flowType = 'undefined';
            
            // Determine type based on outbound type
            if (outbound.type === 'direct') {
                flowType = 'geo';
            } else if (outbound.type === 'block') {
                flowType = 'domain';
            }

            state.flows.push({
                type: flowType,
                source: 'Router',
                destination: `Outbound ${outbound.tag || index}`,
                path: ['client', 'router', 'firewall', `outbound-${index}`],
                outbound: outbound
            });
        });
    }

    /**
     * Render the data flow visualization
     */
    function render() {
        if (!state.container) {
            console.warn('[Config To Flow] Container not found');
            return;
        }

        console.log('[Config To Flow] Rendering flow visualization...');
        console.log('[Config To Flow] Flows to render:', state.flows);

        // Clear container
        state.container.innerHTML = '';

        // Render background grid
        const backgroundGrid = document.createElement('div');
        backgroundGrid.className = 'flow-background-grid';
        state.container.appendChild(backgroundGrid);

        // Render network nodes container
        const nodesContainer = document.createElement('div');
        nodesContainer.className = 'network-nodes-container';
        state.container.appendChild(nodesContainer);

        // Render nodes
        nodesContainer.innerHTML = renderNodes();

        // Render connection lines based on active flows
        nodesContainer.innerHTML += renderConnectionLines();

        // Render legend
        const legend = document.createElement('div');
        legend.className = 'flow-legend-figma';
        legend.innerHTML = renderLegend();
        state.container.appendChild(legend);

        console.log('[Config To Flow] Rendering complete');
    }

    /**
     * Render network nodes
     * @returns {string} HTML string of nodes
     */
    function renderNodes() {
        const NODES = [
            { id: 'client', name: '客户端', x: 10, y: 50, icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>' },
            { id: 'router', name: '路由器', x: 30, y: 50, icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="2" y1="6" x2="22" y2="6"/><line x1="2" y1="18" x2="22" y2="18"/></svg>' },
            { id: 'firewall', name: '防火墙', x: 50, y: 50, icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' },
            { id: 'vpn', name: 'VPN 服务器', x: 70, y: 35, icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>' },
            { id: 'destination', name: '目标服务器', x: 90, y: 50, icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>' }
        ];

        return NODES.map(node => {
            let borderColor = '#00d9ff';
            if (node.id === 'firewall') borderColor = '#ff4757';
            if (node.id === 'destination') borderColor = '#00ff88';
    
            return `
                <div class="network-node" style="left: ${node.x}%; top: ${node.y}%">
                    <div class="node-icon" style="border-color: ${borderColor}; box-shadow: 0 4px 12px ${borderColor}33; color: ${borderColor};">
                        ${node.icon}
                    </div>
                    <span class="node-label">${node.name}</span>
                </div>
            `;
        }).join('');
    }

    /**
     * Render connection lines based on active flows
     * @returns {string} HTML string of connection lines
     */
    function renderConnectionLines() {
        // Default lines (no config)
        return `
            <svg class="connection-lines">
                <!-- Computer to Router -->
                <line x1="10%" y1="50%" x2="30%" y2="50%" stroke="#00d9ff" stroke-width="2" stroke-dasharray="5,5" opacity="0.3" />
                
                <!-- Router to Firewall -->
                <line x1="30%" y1="50%" x2="50%" y2="50%" stroke="#00d9ff" stroke-width="2" stroke-dasharray="5,5" opacity="0.3" />
                
                <!-- Firewall to VPN (curved) -->
                <path d="M 50 50 Q 60 40, 70 35" stroke="#00d9ff" stroke-width="2" stroke-dasharray="5,5" opacity="0.3" fill="none" />
                
                <!-- Firewall to Destination (direct) -->
                <line x1="50%" y1="50%" x2="90%" y2="50%" stroke="#00ff88" stroke-width="2" stroke-dasharray="5,5" opacity="0.3" />
                
                <!-- VPN to Destination -->
                <path d="M 70 35 Q 80 42.5, 90 50" stroke="#00d9ff" stroke-width="2" stroke-dasharray="5,5" opacity="0.3" fill="none" />
            </svg>
        `;
    }

    /**
     * Render legend
     * @returns {string} HTML string of legend
     */
    function renderLegend() {
        return `
            <div class="legend-title">数据流向类型：</div>
            <div class="legend-items">
                <div class="legend-item">
                    <div class="legend-dot" style="background: #00ff88;"></div>
                    <span>Geo Data</span>
                </div>
                <div class="legend-item">
                    <div class="legend-dot" style="background: #ff6b35;"></div>
                    <span>Domain Suffix</span>
                </div>
                <div class="legend-item">
                    <div class="legend-dot" style="background: #a855f7;"></div>
                    <span>Undefined</span>
                </div>
            </div>
        `;
    }

    /**
     * Set configuration directly
     * @param {Object} config - sing-box configuration object
     */
    function setConfig(config) {
        state.config = config;
        analyzeConfiguration(config);
        render();
    }

    // Expose API
    window.ConfigToFlow = {
        init,
        setConfig
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
