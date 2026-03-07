/**
 * MeshNetProtocol - Sing-Box Configuration Lab
 * Configuration Tree View Module
 */

(function() {
    "use strict";

    console.log("[Labs] Loading Tree View Module...");

    // Tree state
    const treeState = {
        expandedNodes: ['log', 'dns', 'inbounds', 'outbounds', 'route'],
        selectedNode: null,
        configData: null
    };

    // Tree node icons
    const nodeIcons = {
        log: '📝',
        dns: '🌐',
        ntp: '⏰',
        certificate: '📜',
        endpoints: '🔗',
        inbounds: '🔌',
        outbounds: '🚀',
        route: '🛣️',
        services: '⚙️',
        experimental: '🧪',
        server: '📡',
        rule: '🎯',
        ruleSet: '📦',
        inbound: '📥',
        outbound: '🌊',
        selector: '🔀',
        direct: '➡️',
        block: '🚫'
    };

    // Status colors
    const statusColors = {
        valid: '#22c55e',    // Green
        warning: '#eab308',  // Yellow
        error: '#ef4444'     // Red
    };

    /**
     * Render the entire configuration tree
     */
    function renderTree(configData) {
        const container = document.getElementById('config-tree-container');
        if (!container) return;

        treeState.configData = configData;
        container.innerHTML = '';

        const treeRoot = document.createElement('div');
        treeRoot.className = 'tree-root';

        // Build tree structure
        const sections = buildTreeSections(configData);
        sections.forEach(section => {
            treeRoot.appendChild(renderTreeNode(section));
        });

        container.appendChild(treeRoot);
    }

    /**
     * Build tree sections from config data
     */
    function buildTreeSections(configData) {
        const sections = [];

        // Log section
        if (configData.log) {
            sections.push({
                id: 'log',
                title: 'Log',
                icon: nodeIcons.log,
                type: 'section',
                children: [
                    { id: 'log.level', title: `level: ${configData.log.level}`, type: 'leaf', value: configData.log.level },
                    { id: 'log.timestamp', title: `timestamp: ${configData.log.timestamp}`, type: 'leaf', value: configData.log.timestamp, checked: configData.log.timestamp },
                    ...(configData.log.output ? [{ id: 'log.output', title: `output: ${configData.log.output}`, type: 'leaf', value: configData.log.output }] : [])
                ]
            });
        }

        // DNS section
        if (configData.dns) {
            const dnsChildren = [];
            
            // DNS Servers
            if (configData.dns.servers && configData.dns.servers.length > 0) {
                const serversNode = {
                    id: 'dns.servers',
                    title: `servers (${configData.dns.servers.length})`,
                    icon: nodeIcons.server,
                    type: 'group',
                    children: configData.dns.servers.map((server, idx) => ({
                        id: `dns.servers.${idx}`,
                        title: `${server.tag} → ${server.address}`,
                        type: 'leaf',
                        status: getServerStatus(server),
                        outbound: server.detour
                    }))
                };
                dnsChildren.push(serversNode);
            }

            // DNS Rules
            if (configData.dns.rules && configData.dns.rules.length > 0) {
                const rulesNode = {
                    id: 'dns.rules',
                    title: `rules (${configData.dns.rules.length})`,
                    icon: nodeIcons.rule,
                    children: configData.dns.rules.map((rule, idx) => ({
                        id: `dns.rules.${idx}`,
                        title: `${getRuleDescription(rule)} → ${rule.server}`,
                        type: 'leaf',
                        status: 'valid'
                    }))
                };
                dnsChildren.push(rulesNode);
            }

            // DNS Final and Strategy
            dnsChildren.push({ id: 'dns.final', title: `final: ${configData.dns.final}`, type: 'leaf', value: configData.dns.final });
            if (configData.dns.strategy) {
                dnsChildren.push({ id: 'dns.strategy', title: `strategy: ${configData.dns.strategy}`, type: 'leaf', value: configData.dns.strategy });
            }

            sections.push({
                id: 'dns',
                title: 'DNS',
                icon: nodeIcons.dns,
                type: 'section',
                children: dnsChildren
            });
        }

        // Inbounds section
        if (configData.inbounds && configData.inbounds.length > 0) {
            sections.push({
                id: 'inbounds',
                title: `Inbounds (${configData.inbounds.length})`,
                icon: nodeIcons.inbounds,
                type: 'section',
                children: configData.inbounds.map((inbound, idx) => ({
                    id: `inbounds.${idx}`,
                    title: `${inbound.tag} (${inbound.type})`,
                    icon: nodeIcons.inbound,
                    type: 'leaf',
                    status: 'valid'
                }))
            });
        }

        // Outbounds section
        if (configData.outbounds && configData.outbounds.length > 0) {
            const outboundsChildren = configData.outbounds.map((outbound, idx) => {
                const icon = getOutboundIcon(outbound.type);
                return {
                    id: `outbounds.${idx}`,
                    title: `${outbound.tag} (${outbound.type})`,
                    icon: icon,
                    type: 'leaf',
                    status: getOutboundStatus(outbound),
                    outboundType: outbound.type
                };
            });

            sections.push({
                id: 'outbounds',
                title: `Outbounds (${configData.outbounds.length})`,
                icon: nodeIcons.outbounds,
                type: 'section',
                children: outboundsChildren
            });
        }

        // Route section
        if (configData.route) {
            const routeChildren = [];

            // Route Rules
            if (configData.route.rules && configData.route.rules.length > 0) {
                const rulesNode = {
                    id: 'route.rules',
                    title: `rules (${configData.route.rules.length})`,
                    icon: nodeIcons.rule,
                    children: configData.route.rules.map((rule, idx) => ({
                        id: `route.rules.${idx}`,
                        title: getRouteRuleDescription(rule),
                        type: 'leaf',
                        status: 'valid'
                    }))
                };
                routeChildren.push(rulesNode);
            }

            // Rule Sets
            if (configData.route.rule_sets && configData.route.rule_sets.length > 0) {
                const ruleSetsNode = {
                    id: 'route.rule_sets',
                    title: `rule_sets (${configData.route.rule_sets.length})`,
                    icon: nodeIcons.ruleSet,
                    children: configData.route.rule_sets.map((ruleSet, idx) => ({
                        id: `route.rule_sets.${idx}`,
                        title: `${ruleSet.tag} (${ruleSet.type})`,
                        type: 'leaf',
                        status: 'valid'
                    }))
                };
                routeChildren.push(ruleSetsNode);
            }

            // Route Final
            routeChildren.push({ id: 'route.final', title: `final: ${configData.route.final}`, type: 'leaf', value: configData.route.final });

            sections.push({
                id: 'route',
                title: 'Route',
                icon: nodeIcons.route,
                type: 'section',
                children: routeChildren
            });
        }

        return sections;
    }

    /**
     * Render a tree node
     */
    function renderTreeNode(node, level = 0) {
        const nodeEl = document.createElement('div');
        nodeEl.className = `tree-node tree-node-${node.type}`;
        nodeEl.style.paddingLeft = `${level * 16}px`;
        nodeEl.dataset.nodeId = node.id;

        const nodeContent = document.createElement('div');
        nodeContent.className = 'tree-node-content';

        // Expand/collapse button for non-leaf nodes
        if (node.type === 'section' || node.type === 'group') {
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'tree-node-toggle';
            toggleBtn.innerHTML = treeState.expandedNodes.includes(node.id) ? '▼' : '▶';
            toggleBtn.onclick = (e) => {
                e.stopPropagation();
                toggleNode(node.id);
            };
            nodeContent.appendChild(toggleBtn);
        } else {
            const spacer = document.createElement('span');
            spacer.className = 'tree-node-spacer';
            spacer.style.width = '20px';
            spacer.style.display = 'inline-block';
            nodeContent.appendChild(spacer);
        }

        // Icon
        if (node.icon) {
            const icon = document.createElement('span');
            icon.className = 'tree-node-icon';
            icon.textContent = node.icon;
            nodeContent.appendChild(icon);
        }

        // Title
        const title = document.createElement('span');
        title.className = 'tree-node-title';
        title.textContent = node.title;
        nodeContent.appendChild(title);

        // Status indicator
        if (node.status) {
            const status = document.createElement('span');
            status.className = 'tree-node-status';
            status.style.backgroundColor = statusColors[node.status];
            nodeContent.appendChild(status);
        }

        // Outbound type indicator
        if (node.outbound || node.outboundType) {
            const typeIndicator = document.createElement('span');
            typeIndicator.className = 'tree-node-type-indicator';
            typeIndicator.textContent = node.outbound || node.outboundType;
            typeIndicator.style.cssText = 'font-size: 0.7em; color: #64748b; margin-left: 0.5rem;';
            nodeContent.appendChild(typeIndicator);
        }

        nodeEl.appendChild(nodeContent);

        // Click to select/edit
        nodeContent.onclick = () => selectNode(node);

        // Render children
        if (node.children && treeState.expandedNodes.includes(node.id)) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'tree-node-children';
            node.children.forEach(child => {
                childrenContainer.appendChild(renderTreeNode(child, level + 1));
            });
            nodeEl.appendChild(childrenContainer);
        }

        return nodeEl;
    }

    /**
     * Toggle node expand/collapse
     */
    function toggleNode(nodeId) {
        const index = treeState.expandedNodes.indexOf(nodeId);
        if (index > -1) {
            treeState.expandedNodes.splice(index, 1);
        } else {
            treeState.expandedNodes.push(nodeId);
        }
        renderTree(treeState.configData);
    }

    /**
     * Select a node for editing
     */
    function selectNode(node) {
        // Remove previous selection
        const previous = document.querySelector('.tree-node-content.selected');
        if (previous) previous.classList.remove('selected');

        // Add selection to current
        const nodeEl = document.querySelector(`[data-node-id="${node.id}"] .tree-node-content`);
        if (nodeEl) nodeEl.classList.add('selected');

        treeState.selectedNode = node;

        // Dispatch event for form editor to scroll to relevant section
        window.dispatchEvent(new CustomEvent('labs-tree-node-selected', {
            detail: { node }
        }));

        console.log('[Tree] Node selected:', node);
    }

    /**
     * Get icon for outbound type
     */
    function getOutboundIcon(type) {
        return nodeIcons[type] || nodeIcons.outbound;
    }

    /**
     * Get status for server
     */
    function getServerStatus(server) {
        if (!server.address || server.address === '<IP>') return 'warning';
        if (!server.tag) return 'error';
        return 'valid';
    }

    /**
     * Get status for outbound
     */
    function getOutboundStatus(outbound) {
        if (outbound.type === 'shadowsocks') {
            if (!outbound.server || outbound.server === '<IP>') return 'warning';
            if (!outbound.password) return 'error';
        }
        if (outbound.type === 'selector' && (!outbound.outbounds || outbound.outbounds.length === 0)) {
            return 'warning';
        }
        return 'valid';
    }

    /**
     * Get rule description
     */
    function getRuleDescription(rule) {
        if (rule.rule_set) return `rule_set: ${rule.rule_set}`;
        if (rule.domain_suffix) return `domain: ${Array.isArray(rule.domain_suffix) ? rule.domain_suffix[0] : rule.domain_suffix}`;
        if (rule.domain_keyword) return `keyword: ${rule.domain_keyword}`;
        if (rule.ip_cidr) return `ip: ${rule.ip_cidr}`;
        if (rule.protocol) return `protocol: ${rule.protocol}`;
        return 'rule';
    }

    /**
     * Get route rule description
     */
    function getRouteRuleDescription(rule) {
        if (rule.protocol && rule.action) return `${rule.protocol} → ${rule.action}`;
        if (rule.domain_suffix) {
            const domains = Array.isArray(rule.domain_suffix) ? rule.domain_suffix : [rule.domain_suffix];
            return `${domains[0]} → ${rule.outbound}`;
        }
        if (rule.rule_set) return `${rule.rule_set} → ${rule.outbound}`;
        if (rule.ip_is_private) return `private IP → ${rule.outbound}`;
        return `rule → ${rule.outbound}`;
    }

    /**
     * Update tree when config changes
     */
    function updateTree(configData) {
        renderTree(configData);
    }

    // Listen for config updates
    window.addEventListener('labs-form-updated', (e) => {
        if (e.detail && e.detail.config) {
            updateTree(e.detail.config.config || e.detail.config);
        }
    });

    // Expose API
    window.LabsTree = {
        render: renderTree,
        update: updateTree,
        selectNode: selectNode,
        getState: () => treeState
    };

    console.log("[Labs] Tree View Module ready!");
})();
