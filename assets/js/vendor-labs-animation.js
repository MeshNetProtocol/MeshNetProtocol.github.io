/**
 * MeshNetProtocol - Sing-Box Configuration Lab
 * Traffic Flow Animation Module - Pipe Flow Visualization
 */

(function() {
    "use strict";

    console.log("[Labs] Loading Animation Module...");

    // Animation state
    const state = {
        canvas: null,
        ctx: null,
        animationId: null,
        config: null,
        particles: [],
        trafficStats: {
            local: 0,
            proxy: 0,
            direct: 0
        }
    };

    // Traffic colors - Figma Design
    const COLORS = {
        direct: '#00ff88',   // Green - Direct connection
        proxy: '#00d9ff',    // Cyan - VPN/Proxy
        blocked: '#ff4757',  // Red - Blocked
        inactive: '#475569'  // Gray - Inactive
    };

    /**
     * Initialize animation module
     */
    function init() {
        console.log("[Labs] Initializing Animation Module...");
        
        state.canvas = document.getElementById('flow-animation-canvas');
        if (!state.canvas) {
            console.warn("[Labs] Animation canvas not found");
            return;
        }
        
        state.ctx = state.canvas.getContext('2d');
        resizeCanvas();
        
        // Initial empty state
        state.config = null;
        state.trafficStats = { direct: 0, proxy: 0, blocked: 0 };
        
        // Start animation loop
        animate();
        
        // Handle resize
        window.addEventListener('resize', resizeCanvas);
        
        console.log("[Labs] Animation Module ready!");
    }

    /**
     * Update animation with new config
     */
    function updateConfig(config) {
        state.config = config;
        analyzeTraffic(config);
        resetParticles();
    }

    /**
     * Analyze config to determine traffic distribution
     */
    function analyzeTraffic(config) {
        if (!config || !config.route || !config.route.rules) {
            state.trafficStats = { direct: 0, proxy: 0, blocked: 0 };
            return;
        }

        const rules = config.route.rules;
        
        // Count rules by outbound type
        let directCount = 0;
        let proxyCount = 0;
        let blockedCount = 0;

        rules.forEach(rule => {
            const outbound = rule.outbound || '';
            if (outbound === 'direct' || outbound === 'local') {
                directCount++;
            } else if (outbound === 'proxy' || outbound.includes('proxy')) {
                proxyCount++;
            } else if (outbound === 'block' || outbound === 'reject') {
                blockedCount++;
            }
        });

        // Calculate percentages
        const total = directCount + proxyCount + blockedCount || 1;
        state.trafficStats = {
            direct: Math.round((directCount / total) * 100),
            proxy: Math.round((proxyCount / total) * 100),
            blocked: Math.round((blockedCount / total) * 100)
        };
    }

    /**
     * Reset particles based on traffic stats
     */
    function resetParticles() {
        state.particles = [];
        
        // Create particles for each traffic type
        const createParticles = (type, count, yOffset) => {
            for (let i = 0; i < count; i++) {
                state.particles.push({
                    type,
                    x: 80 + Math.random() * 20,
                    y: yOffset + Math.random() * 20,
                    speed: 2 + Math.random() * 2,
                    size: 3 + Math.random() * 2,
                    alpha: 0.6 + Math.random() * 0.4
                });
            }
        };

        // Adjust particle count based on stats
        const baseCount = 5;
        if (state.trafficStats.local > 0) {
            createParticles('local', Math.max(2, Math.floor(state.trafficStats.local / 10)), 100);
        }
        if (state.trafficStats.proxy > 0) {
            createParticles('proxy', Math.max(2, Math.floor(state.trafficStats.proxy / 10)), 180);
        }
        if (state.trafficStats.direct > 0) {
            createParticles('direct', Math.max(2, Math.floor(state.trafficStats.direct / 10)), 260);
        }
    }

    /**
     * Resize canvas to fit container
     */
    function resizeCanvas() {
        const container = state.canvas.parentElement;
        if (!container) return;
        
        // Get the actual display size
        const rect = state.canvas.getBoundingClientRect();
        state.canvas.width = rect.width;
        state.canvas.height = rect.height;
        
        console.log(`[Animation] Canvas resized: ${state.canvas.width}x${state.canvas.height}`);
    }

    /**
     * Main animation loop
     */
    function animate() {
        if (!state.ctx) return;
        
        const ctx = state.ctx;
        const width = state.canvas.width;
        const height = state.canvas.height;

        // Clear canvas
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        // Draw pipes
        drawPipes(ctx, width, height);

        // Update and draw particles
        updateParticles(ctx, width, height);

        // Draw labels
        drawLabels(ctx, width, height);

        state.animationId = requestAnimationFrame(animate);
    }

    /**
     * Draw the three pipes
     */
    function drawPipes(ctx, width, height) {
        const pipePositions = [100, 180, 260];
        const pipeTypes = ['local', 'proxy', 'direct'];
        const pipeLabels = ['本地配置', '代理路由', '直连路由'];

        pipePositions.forEach((y, index) => {
            const type = pipeTypes[index];
            const isActive = state.trafficStats[type] > 0;
            
            // Pipe background
            ctx.beginPath();
            ctx.moveTo(80, y);
            ctx.lineTo(width - 80, y);
            ctx.strokeStyle = isActive ? COLORS[type] : COLORS.inactive;
            ctx.lineWidth = 20;
            ctx.lineCap = 'round';
            ctx.stroke();

            // Pipe border
            ctx.beginPath();
            ctx.moveTo(80, y);
            ctx.lineTo(width - 80, y);
            ctx.strokeStyle = isActive ? 'rgba(255,255,255,0.3)' : 'rgba(100,116,139,0.3)';
            ctx.lineWidth = 22;
            ctx.stroke();
        });
    }

    /**
     * Update and draw particles
     */
    function updateParticles(ctx, width, height) {
        state.particles.forEach((particle, index) => {
            // Move particle
            particle.x += particle.speed;
            
            // Reset particle when it goes off screen
            if (particle.x > width - 80) {
                particle.x = 80 + Math.random() * 20;
            }

            // Draw particle
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = COLORS[particle.type];
            ctx.globalAlpha = particle.alpha;
            ctx.fill();
            ctx.globalAlpha = 1.0;

            // Glow effect
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size + 2, 0, Math.PI * 2);
            ctx.fillStyle = COLORS[particle.type];
            ctx.globalAlpha = particle.alpha * 0.3;
            ctx.fill();
            ctx.globalAlpha = 1.0;
        });
    }

    /**
     * Draw labels and stats
     */
    function drawLabels(ctx, width, height) {
        // Input label (left side)
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 14px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('用户设备', 40, height / 2);
        ctx.font = '12px -apple-system, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('流量入口', 40, height / 2 + 20);

        // Output label (right side)
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 14px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('互联网', width - 40, height / 2);
        ctx.font = '12px -apple-system, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('流量出口', width - 40, height / 2 + 20);

        // Pipe labels
        const pipeLabels = [
            { type: 'local', label: '本地配置', y: 100 },
            { type: 'proxy', label: '代理路由', y: 180 },
            { type: 'direct', label: '直连路由', y: 260 }
        ];

        pipeLabels.forEach(({ type, label, y }) => {
            const stats = state.trafficStats[type];
            const isActive = stats > 0;
            
            ctx.fillStyle = isActive ? COLORS[type] : COLORS.inactive;
            ctx.font = 'bold 12px -apple-system, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`${label} (${stats}%)`, 90, y - 12);
        });

        // Arrows
        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('▶', width / 2, 60);
    }

    /**
     * Cleanup
     */
    function destroy() {
        if (state.animationId) {
            cancelAnimationFrame(state.animationId);
        }
        window.removeEventListener('resize', resizeCanvas);
    }

    // Expose API
    window.LabsAnimation = {
        init,
        updateConfig,
        destroy
    };
})();
