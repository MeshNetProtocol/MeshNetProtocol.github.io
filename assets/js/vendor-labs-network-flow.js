/**
 * Network Flow Animation - Figma Design
 * Direct copy from Figma's network-flow.tsx
 * Uses DOM elements instead of Canvas for exact visual match
 */

(function() {
    'use strict';

    // Module state
    const state = {
        config: null,
        container: null,
        initialized: false
    };

    const NODES = [
        { id: 'client', name: '客户端', x: 10, y: 50, icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>' },
        { id: 'router', name: '路由器', x: 30, y: 50, icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="2" y1="6" x2="22" y2="6"/><line x1="2" y1="18" x2="22" y2="18"/></svg>' },
        { id: 'firewall', name: '防火墙', x: 50, y: 50, icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' },
        { id: 'vpn', name: 'VPN 服务器', x: 70, y: 35, icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>' },
        { id: 'destination', name: '目标服务器', x: 90, y: 50, icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>' }
    ];

    const PACKET_TYPES = {
        geo: { color: '#00ff88', label: 'Geo Data' },
        domain: { color: '#ff6b35', label: 'Domain Suffix' },
        undefined: { color: '#a855f7', label: 'Undefined' }
    };

    /**
     * Initialize the network flow animation
     */
    function init() {
        if (state.initialized) {
            console.log('[Labs Network Flow] Already initialized');
            return;
        }
        
        state.container = document.querySelector('.animation-wrapper-figma');
        if (!state.container) {
            console.warn('Animation wrapper not found');
            return;
        }

        console.log('[Labs Network Flow] Module initialized');

        // Listen to config updates
        window.addEventListener('config-updated', handleConfigUpdate);
        
        state.initialized = true;

        render();
        // Animation disabled - static display only
        // startPacketGeneration();
        // startPacketAnimation();
    }

    /**
     * Handle config update event
     */
    function handleConfigUpdate(event) {
        const config = event.detail;
        state.config = config;
        console.log('[Labs Network Flow] Config updated:', config);
    }

    /**
     * Render the network flow UI
     */
    function render() {
        state.container.innerHTML = `
            <!-- Background Grid -->
            <div class="flow-background-grid"></div>

            <!-- Network Nodes Container -->
            <div class="network-nodes-container">
                ${renderNodes()}
                ${renderConnectionLines()}
            </div>

            <!-- Animated Data Packets Container -->
            <!-- Disabled - static display only -->
            <!-- <div id="packets-container" class="packets-container"></div> -->

            <!-- Legend -->
            <div class="flow-legend-figma">
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
            </div>
        `;
    }

    /**
     * Render network nodes
     */
    function renderNodes() {
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
     * Render connection lines between nodes
     */
    function renderConnectionLines() {
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
     * Create a new data packet
     * Disabled - static display only
     */
    function createPacket() {
        // Animation disabled
        return;
        
        const types = ['geo', 'domain', 'undefined'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const packet = {
            id: `packet-${Date.now()}-${state.packetIdCounter++}`,
            type: type,
            progress: 0,
            element: null
        };

        state.packets.push(packet);
        renderPacket(packet);
    }

    /**
     * Render a single packet
     * Disabled - static display only
     */
    function renderPacket(packet) {
        // Animation disabled
        return;
        
        const pos = getPacketPath(packet.type, packet.progress);
        const color = PACKET_TYPES[packet.type].color;

        if (!packet.element) {
            const el = document.createElement('div');
            el.className = 'data-packet';
            el.style.backgroundColor = color;
            el.style.boxShadow = `0 0 10px ${color}`;
            state.container.appendChild(el);
            packet.element = el;
        }

        packet.element.style.left = `${pos.x}%`;
        packet.element.style.top = `${pos.y}%`;
    }

    /**
     * Remove a packet from the DOM
     * Disabled - static display only
     */
    function removePacket(packet) {
        if (packet.element) {
            packet.element.remove();
            packet.element = null;
        }
    }

    /**
     * Get packet position based on type and progress
     * Disabled - static display only
     */
    function getPacketPath(type, progress) {
        const stages = [
            { x: 10, y: 50 },  // Computer
            { x: 30, y: 50 },  // Router
            { x: 50, y: 50 },  // Firewall
            { x: 70, y: type === 'vpn' ? 35 : 50 }, // VPN or direct
            { x: 90, y: 50 }   // Destination
        ];

        if (type === 'blocked') {
            // Blocked packets only go to firewall
            const blockedStages = stages.slice(0, 3);
            const index = Math.floor((progress / 100) * (blockedStages.length - 1));
            const nextIndex = Math.min(index + 1, blockedStages.length - 1);
            const segmentProgress = ((progress / 100) * (blockedStages.length - 1)) - index;

            const current = blockedStages[index];
            const next = blockedStages[nextIndex];

            return {
                x: current.x + (next.x - current.x) * segmentProgress,
                y: current.y + (next.y - current.y) * segmentProgress
            };
        }

        const index = Math.floor((progress / 100) * (stages.length - 1));
        const nextIndex = Math.min(index + 1, stages.length - 1);
        const segmentProgress = ((progress / 100) * (stages.length - 1)) - index;

        const current = stages[index];
        const next = stages[nextIndex];

        return {
            x: current.x + (next.x - current.x) * segmentProgress,
            y: current.y + (next.y - current.y) * segmentProgress
        };
    }

    /**
     * Start generating packets at intervals
     * Disabled - static display only
     */
    function startPacketGeneration() {
        // Animation disabled
        return;
        
        setInterval(() => {
            createPacket();

            // Remove completed packets after 3 seconds
            setTimeout(() => {
                const packet = state.packets[state.packets.length - 1];
                if (packet && packet.progress >= 100) {
                    removePacket(packet);
                    state.packets = state.packets.filter(p => p.id !== packet.id);
                }
            }, 3000);
        }, 1500);
    }

    /**
     * Animate all packets
     * Disabled - static display only
     */
    function startPacketAnimation() {
        // Animation disabled
        return;
        
        function animate() {
            state.packets.forEach(packet => {
                packet.progress = Math.min(packet.progress + 2, 100);
                renderPacket(packet);

                // Mark for removal if complete
                if (packet.progress >= 100) {
                    setTimeout(() => {
                        removePacket(packet);
                        state.packets = state.packets.filter(p => p.id !== packet.id);
                    }, 100);
                }
            });

            requestAnimationFrame(animate);
        }

        animate();
    }

    /**
     * Update configuration
     */
    function setConfig(config) {
        state.config = config;
    }

    // Expose API
    window.LabsNetworkFlow = {
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
