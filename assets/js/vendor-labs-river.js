/**
 * MeshNetProtocol - Sing-Box Configuration Lab
 * River Flow Visualization Module
 */

(function() {
    "use strict";

    console.log("[Labs] Loading River Flow Module...");

    const svg = document.getElementById('river-flow-svg');
    const container = document.getElementById('river-flow-container');
    
    // River state
    const riverState = {
        packets: [],
        nodes: {},
        paths: {},
        config: null,
        animationFrame: null
    };

    // Node positions (percentage-based)
    const nodePositions = {
        local: { x: 5, y: 50, label: 'Local', icon: '💻' },
        dns: { x: 20, y: 20, label: 'DNS', icon: '🌐' },
        route: { x: 35, y: 50, label: 'Route', icon: '🛣️' },
        direct: { x: 60, y: 70, label: 'Direct', icon: '➡️' },
        proxy: { x: 60, y: 30, label: 'Proxy', icon: '🔀' },
        outbounds: { x: 80, y: 30, label: 'Outbounds', icon: '' },
        destination: { x: 95, y: 50, label: 'Internet', icon: '🎯' }
    };

    // Packet colors
    const packetColors = {
        dns: '#3b82f6',    // Blue
        proxy: '#22c55e',  // Green
        direct: '#ef4444'  // Red
    };

    /**
     * Initialize river flow visualization
     */
    function init() {
        if (!svg || !container) {
            console.warn("[River] SVG container not found");
            return;
        }

        // Set SVG size
        resizeSVG();
        window.addEventListener('resize', resizeSVG);

        // Start animation loop
        startAnimationLoop();

        // Spawn packets periodically
        startPacketSpawner();

        console.log("[River] Initialized!");
    }

    /**
     * Resize SVG to container
     */
    function resizeSVG() {
        if (!container) return;
        const rect = container.getBoundingClientRect();
        svg.setAttribute('width', rect.width);
        svg.setAttribute('height', rect.height);
    }

    /**
     * Draw the river flow diagram
     */
    function drawRiverFlow() {
        // Clear SVG
        svg.innerHTML = '';

        // Draw background grid
        drawBackgroundGrid();

        // Draw paths
        drawAllPaths();

        // Draw nodes
        drawAllNodes();

        // Draw packets
        riverState.packets.forEach(packet => drawPacket(packet));
    }

    /**
     * Draw background grid
     */
    function drawBackgroundGrid() {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
        pattern.setAttribute('id', 'gridPattern');
        pattern.setAttribute('width', '40');
        pattern.setAttribute('height', '40');
        pattern.setAttribute('patternUnits', 'userSpaceOnUse');

        const patternRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        patternRect.setAttribute('width', '40');
        patternRect.setAttribute('height', '40');
        patternRect.setAttribute('fill', 'rgba(148, 163, 184, 0.05)');
        pattern.appendChild(patternRect);

        const patternPath1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        patternPath1.setAttribute('d', 'M 40 0 L 0 0 0 40');
        patternPath1.setAttribute('fill', 'none');
        patternPath1.setAttribute('stroke', 'rgba(148, 163, 184, 0.1)');
        patternPath1.setAttribute('stroke-width', '1');
        pattern.appendChild(patternPath1);

        defs.appendChild(pattern);
        svg.appendChild(defs);

        const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bgRect.setAttribute('width', '100%');
        bgRect.setAttribute('height', '100%');
        bgRect.setAttribute('fill', 'url(#gridPattern)');
        svg.appendChild(bgRect);
    }

    /**
     * Draw all flow paths
     */
    function drawAllPaths() {
        // Local → Route
        drawPath(nodePositions.local, nodePositions.route, 'direct');
        
        // Route → DNS
        drawPath(nodePositions.route, nodePositions.dns, 'dns');
        
        // Route → Direct
        drawPath(nodePositions.route, nodePositions.direct, 'direct');
        
        // Route → Proxy
        drawPath(nodePositions.route, nodePositions.proxy, 'proxy');
        
        // Proxy → Outbounds
        drawPath(nodePositions.proxy, nodePositions.outbounds, 'proxy');
        
        // Direct → Destination
        drawPath(nodePositions.direct, nodePositions.destination, 'direct');
        
        // Outbounds → Destination
        drawPath(nodePositions.outbounds, nodePositions.destination, 'proxy');
        
        // DNS → Destination
        drawPath(nodePositions.dns, nodePositions.destination, 'dns');
    }

    /**
     * Draw a single path between two nodes
     */
    function drawPath(from, to, type) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        // Calculate control point for curved path
        const midX = (from.x + to.x) / 2;
        const controlY = type === 'dns' ? Math.min(from.y, to.y) - 10 : Math.max(from.y, to.y) + 10;
        
        const d = `M ${from.x} ${from.y} Q ${midX} ${controlY} ${to.x} ${to.y}`;
        
        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', packetColors[type]);
        path.setAttribute('stroke-width', type === 'proxy' ? '3' : '2');
        path.setAttribute('stroke-opacity', '0.6');
        path.setAttribute('stroke-dasharray', type === 'proxy' ? '5,5' : 'none');
        
        // Add arrow marker
        const markerId = `arrow-${type}`;
        if (!document.getElementById(markerId)) {
            createArrowMarker(markerId, packetColors[type]);
        }
        path.setAttribute('marker-end', `url(#${markerId})`);
        
        svg.appendChild(path);
        
        // Store path for animation
        riverState.paths[`${from.label}-${to.label}`] = {
            element: path,
            from: from,
            to: to,
            type: type,
            d: d
        };
    }

    /**
     * Create arrow marker
     */
    function createArrowMarker(id, color) {
        const defs = document.querySelector('defs');
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', id);
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '10');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3');
        marker.setAttribute('orient', 'auto');
        marker.setAttribute('markerUnits', 'strokeWidth');
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M0,0 L0,6 L9,3 z');
        path.setAttribute('fill', color);
        
        marker.appendChild(path);
        defs.appendChild(marker);
    }

    /**
     * Draw all nodes
     */
    function drawAllNodes() {
        Object.values(nodePositions).forEach(node => {
            drawNode(node);
        });
    }

    /**
     * Draw a single node
     */
    function drawNode(node) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // Node circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', node.x);
        circle.setAttribute('cy', node.y);
        circle.setAttribute('r', '25');
        circle.setAttribute('fill', '#1e293b');
        circle.setAttribute('stroke', '#667eea');
        circle.setAttribute('stroke-width', '2');
        
        // Node icon
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', node.x);
        text.setAttribute('y', node.y);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('font-size', '16');
        text.textContent = node.icon;
        
        // Node label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', node.x);
        label.setAttribute('y', node.y + 40);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('font-size', '10');
        label.setAttribute('fill', '#94a3b8');
        label.textContent = node.label;
        
        g.appendChild(circle);
        g.appendChild(text);
        g.appendChild(label);
        
        // Make node clickable
        g.style.cursor = 'pointer';
        g.onclick = () => onNodeClick(node);
        
        svg.appendChild(g);
        
        // Store node reference
        riverState.nodes[node.label] = node;
    }

    /**
     * Handle node click
     */
    function onNodeClick(node) {
        console.log('[River] Node clicked:', node);
        
        // Dispatch event to highlight related config in tree/form
        window.dispatchEvent(new CustomEvent('labs-river-node-clicked', {
            detail: { node }
        }));
    }

    /**
     * Draw a packet
     */
    function drawPacket(packet) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', packet.x);
        circle.setAttribute('cy', packet.y);
        circle.setAttribute('r', '5');
        circle.setAttribute('fill', packetColors[packet.type]);
        circle.setAttribute('stroke', '#fff');
        circle.setAttribute('stroke-width', '1');
        
        // Glow effect
        circle.style.filter = `drop-shadow(0 0 4px ${packetColors[packet.type]})`;
        
        svg.appendChild(circle);
    }

    /**
     * Start animation loop
     */
    function startAnimationLoop() {
        function animate(currentTime) {
            updatePackets(currentTime);
            drawRiverFlow();
            riverState.animationFrame = requestAnimationFrame(animate);
        }
        
        riverState.animationFrame = requestAnimationFrame(animate);
    }

    /**
     * Update packet positions
     */
    function updatePackets(currentTime) {
        for (let i = riverState.packets.length - 1; i >= 0; i--) {
            const packet = riverState.packets[i];
            
            // Move packet along path
            const dx = packet.targetX - packet.x;
            const dy = packet.targetY - packet.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < packet.speed) {
                // Reached target
                if (packet.viaProxy && !packet.reachedProxy) {
                    // Continue to next hop
                    packet.reachedProxy = true;
                    const nextHop = getNextHop(packet);
                    if (nextHop) {
                        packet.targetX = nextHop.x;
                        packet.targetY = nextHop.y;
                    } else {
                        // Remove packet
                        riverState.packets.splice(i, 1);
                    }
                } else {
                    // Remove packet
                    riverState.packets.splice(i, 1);
                }
            } else {
                // Move towards target
                packet.x += (dx / distance) * packet.speed;
                packet.y += (dy / distance) * packet.speed;
            }
        }
    }

    /**
     * Get next hop for packet
     */
    function getNextHop(packet) {
        if (packet.currentHop === 'proxy') {
            return nodePositions.outbounds;
        }
        if (packet.currentHop === 'outbounds') {
            return nodePositions.destination;
        }
        return null;
    }

    /**
     * Spawn a packet
     */
    function spawnPacket(type, viaProxy = false) {
        const startNode = nodePositions.local;
        const firstHop = nodePositions.route;
        
        const packet = {
            x: startNode.x,
            y: startNode.y,
            targetX: firstHop.x,
            targetY: firstHop.y,
            speed: 0.3,
            type: type,
            viaProxy: viaProxy,
            reachedProxy: false,
            currentHop: 'route'
        };
        
        riverState.packets.push(packet);
    }

    /**
     * Start packet spawner
     */
    function startPacketSpawner() {
        setInterval(() => {
            if (!riverState.config) return;
            
            // Analyze config to determine packet types
            const routeRules = riverState.config.route?.rules || [];
            const hasProxyRules = routeRules.some(r => r.outbound === 'proxy');
            const hasDirectRules = routeRules.some(r => r.outbound === 'direct');
            
            // Random packet type based on config
            const rand = Math.random();
            
            if (rand < 0.2) {
                // DNS packet
                spawnPacket('dns', false);
            } else if (rand < 0.5 && hasDirectRules) {
                // Direct packet
                spawnPacket('direct', false);
            } else if (hasProxyRules) {
                // Proxy packet
                spawnPacket('proxy', true);
            }
        }, 1500); // New packet every 1.5 seconds
    }

    /**
     * Update river flow with new config
     */
    function updateConfig(config) {
        riverState.config = config;
        
        // Analyze config and update visualization
        analyzeConfig(config);
    }

    /**
     * Analyze config to update visualization
     */
    function analyzeConfig(config) {
        console.log('[River] Analyzing config...');
        
        // Clear existing packets
        riverState.packets = [];
        
        // Analyze route rules
        const rules = config.route?.rules || [];
        
        // Count proxy vs direct rules
        const proxyRules = rules.filter(r => r.outbound === 'proxy');
        const directRules = rules.filter(r => r.outbound === 'direct');
        
        console.log('[River] Proxy rules:', proxyRules.length, 'Direct rules:', directRules.length);
        
        // Update node highlights based on config
        highlightActivePaths(proxyRules, directRules);
    }

    /**
     * Highlight active paths based on config
     */
    function highlightActivePaths(proxyRules, directRules) {
        // This could be enhanced to show/hide paths based on config
        console.log('[River] Active paths - Proxy:', proxyRules.length, 'Direct:', directRules.length);
    }

    /**
     * Cleanup
     */
    function cleanup() {
        if (riverState.animationFrame) {
            cancelAnimationFrame(riverState.animationFrame);
        }
        window.removeEventListener('resize', resizeSVG);
    }

    // Listen for config updates
    window.addEventListener('labs-form-updated', (e) => {
        if (e.detail && e.detail.config) {
            updateConfig(e.detail.config.config || e.detail.config);
        }
    });

    // Expose API
    window.LabsRiver = {
        init,
        updateConfig,
        cleanup,
        spawnPacket
    };

    console.log("[Labs] River Flow Module ready!");
})();
