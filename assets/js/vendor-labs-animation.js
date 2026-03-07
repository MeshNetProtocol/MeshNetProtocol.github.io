/**
 * MeshNetProtocol - Sing-Box Configuration Lab
 * Network Topology Animation Module
 */

(function() {
    "use strict";

    console.log("[Labs] Loading Animation Module...");

    const canvas = document.getElementById('topology-canvas');
    const ctx = canvas.getContext('2d');
    
    // Animation state
    const animationState = {
        packets: [],
        lastTime: 0,
        config: null
    };

    // Node positions
    const nodes = {
        local: { x: 80, y: 200, label: '本地电脑', icon: '💻' },
        route: { x: 250, y: 200, label: '路由决策', icon: '🛣️' },
        firewall: { x: 350, y: 200, label: '防火墙', icon: '🔥' },
        proxy: { x: 500, y: 100, label: 'VPN 服务器', icon: '🌐' },
        destination: { x: 500, y: 300, label: '目标服务器', icon: '🎯' }
    };

    // ===== Drawing Functions =====
    function drawNode(node) {
        ctx.save();
        
        // Draw node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, 35, 0, Math.PI * 2);
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw icon
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'white';
        ctx.fillText(node.icon, node.x, node.y);
        
        // Draw label
        ctx.font = '12px Arial';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(node.label, node.x, node.y + 55);
        
        ctx.restore();
    }

    function drawPath(from, to, isProxy) {
        ctx.save();
        
        // Create gradient
        const gradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
        if (isProxy) {
            gradient.addColorStop(0, '#22c55e');
            gradient.addColorStop(1, '#16a34a');
        } else {
            gradient.addColorStop(0, '#ef4444');
            gradient.addColorStop(1, '#dc2626');
        }
        
        // Draw path line
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        
        // Add control point for curved path
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        ctx.quadraticCurveTo(midX, midY - 20, to.x, to.y);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = isProxy ? 4 : 3;
        ctx.setLineDash(isProxy ? [5, 5] : []);
        ctx.stroke();
        
        // Draw arrow
        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        const arrowLength = 10;
        const arrowX = to.x - 35 * Math.cos(angle);
        const arrowY = to.y - 35 * Math.sin(angle);
        
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(
            arrowX - arrowLength * Math.cos(angle - Math.PI / 6),
            arrowY - arrowLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            arrowX - arrowLength * Math.cos(angle + Math.PI / 6),
            arrowY - arrowLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = isProxy ? '#22c55e' : '#ef4444';
        ctx.fill();
        
        ctx.restore();
    }

    function drawPacket(packet) {
        ctx.save();
        
        // Draw packet circle
        ctx.beginPath();
        ctx.arc(packet.x, packet.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24';
        ctx.fill();
        
        // Glow effect
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 10;
        ctx.fill();
        
        ctx.restore();
    }

    function drawNetworkTopology() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background grid
        drawBackgroundGrid();
        
        // Draw paths first (behind nodes)
        drawPath(nodes.local, nodes.route, false);
        drawPath(nodes.route, nodes.firewall, false);
        
        // Proxy path
        drawPath(nodes.firewall, nodes.proxy, true);
        drawPath(nodes.proxy, nodes.destination, true);
        
        // Direct path
        drawPath(nodes.firewall, nodes.destination, false);
        
        // Draw nodes
        Object.values(nodes).forEach(node => drawNode(node));
        
        // Draw packets
        animationState.packets.forEach(packet => drawPacket(packet));
    }

    function drawBackgroundGrid() {
        ctx.save();
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
        ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x < canvas.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < canvas.height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        ctx.restore();
    }

    // ===== Packet Animation System =====
    function spawnPacket(startNode, endNode, viaProxy = false) {
        const packet = {
            x: startNode.x,
            y: startNode.y,
            targetX: endNode.x,
            targetY: endNode.y,
            speed: 2,
            progress: 0,
            viaProxy: viaProxy,
            reachedProxy: false
        };
        animationState.packets.push(packet);
    }

    function updatePackets(deltaTime) {
        for (let i = animationState.packets.length - 1; i >= 0; i--) {
            const packet = animationState.packets[i];
            
            if (packet.viaProxy && !packet.reachedProxy) {
                // First go to proxy server
                packet.targetX = nodes.proxy.x;
                packet.targetY = nodes.proxy.y;
                
                if (Math.abs(packet.x - nodes.proxy.x) < 5 && Math.abs(packet.y - nodes.proxy.y) < 5) {
                    packet.reachedProxy = true;
                    packet.targetX = nodes.destination.x;
                    packet.targetY = nodes.destination.y;
                }
            }
            
            // Move packet
            const dx = packet.targetX - packet.x;
            const dy = packet.targetY - packet.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < packet.speed) {
                // Reached target
                if (packet.viaProxy && !packet.reachedProxy) {
                    // Continue to final destination
                    packet.reachedProxy = true;
                    packet.targetX = nodes.destination.x;
                    packet.targetY = nodes.destination.y;
                } else {
                    // Remove packet
                    animationState.packets.splice(i, 1);
                    continue;
                }
            } else {
                // Move towards target
                packet.x += (dx / distance) * packet.speed;
                packet.y += (dy / distance) * packet.speed;
            }
        }
    }

    function startAnimationLoop(currentTime) {
        const deltaTime = currentTime - animationState.lastTime;
        animationState.lastTime = currentTime;
        
        updatePackets(deltaTime);
        drawNetworkTopology();
        
        requestAnimationFrame(startAnimationLoop);
    }

    // Spawn packets periodically based on config
    function startPacketSpawner() {
        setInterval(() => {
            // Simulate traffic to different destinations
            const isProxyTraffic = Math.random() > 0.5;
            
            if (isProxyTraffic) {
                // Traffic that goes through proxy (e.g., google.com)
                spawnPacket(nodes.local, nodes.destination, true);
            } else {
                // Direct traffic (e.g., local resources)
                spawnPacket(nodes.local, nodes.destination, false);
            }
        }, 2000); // New packet every 2 seconds
    }

    // ===== Config-based Route Highlighting =====
    function analyzeRoutes(config) {
        if (!config || !config.config || !config.config.route) return;
        
        const rules = config.config.route.rules || [];
        
        // Analyze which domains use proxy vs direct
        rules.forEach(rule => {
            if (rule.domain_suffix && rule.outbound === 'proxy') {
                console.log('[Animation] Proxy domains:', rule.domain_suffix);
            }
        });
    }

    // ===== Event Listeners =====
    window.addEventListener('labs-config-updated', (e) => {
        console.log("[Animation] Config updated, analyzing routes...");
        animationState.config = e.detail.config;
        analyzeRoutes(animationState.config);
    });

    // ===== Initialization =====
    function init() {
        console.log("[Labs] Initializing Animation Module...");
        
        // Set canvas size
        const panel = canvas.parentElement;
        canvas.width = panel.clientWidth;
        canvas.height = 400;
        
        // Start animation loop
        requestAnimationFrame(startAnimationLoop);
        
        // Start packet spawner
        startPacketSpawner();
        
        // Handle resize
        window.addEventListener('resize', () => {
            canvas.width = panel.clientWidth;
        });
        
        console.log("[Labs] Animation Module ready!");
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose API to window
    window.LabsAnimation = {
        init
    };
})();
