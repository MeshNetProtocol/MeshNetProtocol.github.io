/**
 * MeshNetProtocol - Sing-Box Configuration Lab
 * Configuration Tree View Module - Editable Tree Structure
 */

(function() {
    "use strict";

    console.log("[Labs] Loading Tree View Module...");

    // Tree state
    const state = {
        config: {},
        expandedNodes: new Set(['dns', 'inbounds', 'outbounds', 'route']),
        editingNode: null
    };

    // Node type icons
    const nodeIcons = {
        root: '⚙️',
        dns: '🌐',
        inbounds: '📥',
        outbounds: '🚀',
        route: '🛣️',
        log: '📝',
        experimental: '🧪',
        array: '📋',
        object: '📦',
        string: '🔤',
        number: '🔢',
        boolean: '✅'
    };

    /**
     * Initialize tree module
     */
    function init() {
        console.log("[Labs] Initializing Tree View...");
        
        // Load initial empty config
        state.config = {
            log: { level: 'info', timestamp: true },
            dns: { servers: [], final: 'local' },
            inbounds: [],
            outbounds: [],
            route: { rules: [], final: 'direct' }
        };
        
        render();
        bindEvents();
        
        console.log("[Labs] Tree View Module ready!");
    }

    /**
     * Update tree with new config
     */
    function update(newConfig) {
        state.config = JSON.parse(JSON.stringify(newConfig));
        render();
    }

    /**
     * Render the tree
     */
    function render() {
        const container = document.getElementById('config-tree-container');
        if (!container) {
            console.warn("[Labs] Tree container not found");
            return;
        }

        container.innerHTML = '';
        
        // Create root node
        const rootNode = createTreeNode('Config', state.config, '', 'root');
        container.appendChild(rootNode);
        
        // Render children
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'tree-children';
        
        Object.keys(state.config).forEach(key => {
            const value = state.config[key];
            const node = createTreeNode(key, value, key, getType(value));
            childrenContainer.appendChild(node);
        });
        
        container.appendChild(childrenContainer);
    }

    /**
     * Create a tree node element
     */
    function createTreeNode(label, value, path, type) {
        const node = document.createElement('div');
        node.className = 'tree-node';
        node.dataset.path = path;
        node.dataset.type = type;

        const content = document.createElement('div');
        content.className = 'tree-node-content';
        
        // Toggle icon (for expandable nodes)
        const toggle = document.createElement('span');
        toggle.className = 'tree-toggle';
        
        const isExpandable = typeof value === 'object' && value !== null;
        const isExpanded = state.expandedNodes.has(path);
        
        if (isExpandable) {
            toggle.textContent = '▶';
            if (isExpanded) {
                toggle.classList.add('expanded');
            }
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleNode(path);
            });
        }
        
        // Icon
        const icon = document.createElement('span');
        icon.className = 'tree-icon';
        icon.textContent = nodeIcons[type] || nodeIcons.object;
        
        // Label
        const labelSpan = document.createElement('span');
        labelSpan.className = 'tree-label';
        labelSpan.textContent = label;
        
        // Value preview (for leaf nodes)
        const valueSpan = document.createElement('span');
        valueSpan.className = 'tree-value';
        if (!isExpandable) {
            valueSpan.textContent = `: ${formatValue(value)}`;
            valueSpan.style.color = getValueColor(type);
            
            // Make editable
            content.addEventListener('dblclick', () => {
                editNode(path, value);
            });
        }
        
        content.appendChild(toggle);
        content.appendChild(icon);
        content.appendChild(labelSpan);
        content.appendChild(valueSpan);
        
        node.appendChild(content);
        
        // Render children if expanded
        if (isExpandable && isExpanded) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'tree-children';
            
            if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    const childPath = `${path}[${index}]`;
                    const childNode = createTreeNode(`[${index}]`, item, childPath, getType(item));
                    childrenContainer.appendChild(childNode);
                });
            } else {
                Object.keys(value).forEach(key => {
                    const childPath = `${path}.${key}`;
                    const childValue = value[key];
                    const childNode = createTreeNode(key, childValue, childPath, getType(childValue));
                    childrenContainer.appendChild(childNode);
                });
            }
            
            node.appendChild(childrenContainer);
        }
        
        return node;
    }

    /**
     * Toggle node expansion
     */
    function toggleNode(path) {
        if (state.expandedNodes.has(path)) {
            state.expandedNodes.delete(path);
        } else {
            state.expandedNodes.add(path);
        }
        render();
    }

    /**
     * Edit node value
     */
    function editNode(path, currentValue) {
        const newValue = prompt(`Edit value for ${path}:`, currentValue);
        if (newValue !== null && newValue !== currentValue) {
            updateNodeValue(path, newValue);
        }
    }

    /**
     * Update node value in config
     */
    function updateNodeValue(path, newValue) {
        const keys = parsePath(path);
        let current = state.config;
        
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        
        const lastKey = keys[keys.length - 1];
        
        // Type conversion
        if (typeof current[lastKey] === 'number') {
            current[lastKey] = Number(newValue);
        } else if (typeof current[lastKey] === 'boolean') {
            current[lastKey] = newValue.toLowerCase() === 'true';
        } else {
            current[lastKey] = newValue;
        }
        
        // Trigger update event
        window.dispatchEvent(new CustomEvent('config-updated', {
            detail: state.config
        }));
        
        render();
    }

    /**
     * Parse path string to array of keys
     */
    function parsePath(path) {
        const keys = [];
        let current = '';
        let i = 0;
        
        while (i < path.length) {
            if (path[i] === '.') {
                if (current) {
                    keys.push(current);
                    current = '';
                }
                i++;
            } else if (path[i] === '[') {
                if (current) {
                    keys.push(current);
                    current = '';
                }
                i++;
                let index = '';
                while (i < path.length && path[i] !== ']') {
                    index += path[i];
                    i++;
                }
                keys.push(parseInt(index, 10));
                i++; // skip ]
            } else {
                current += path[i];
                i++;
            }
        }
        
        if (current) {
            keys.push(current);
        }
        
        return keys;
    }

    /**
     * Get value type
     */
    function getType(value) {
        if (value === null) return 'null';
        if (Array.isArray(value)) return 'array';
        return typeof value;
    }

    /**
     * Format value for display
     */
    function formatValue(value) {
        if (typeof value === 'string') {
            return `"${value}"`;
        }
        return String(value);
    }

    /**
     * Get color based on value type
     */
    function getValueColor(type) {
        const colors = {
            string: '#86efac',
            number: '#fbbf24',
            boolean: '#c084fc',
            null: '#94a3b8'
        };
        return colors[type] || '#e2e8f0';
    }

    /**
     * Bind global events
     */
    function bindEvents() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && state.editingNode) {
                state.editingNode = null;
                render();
            }
        });
    }

    // Expose API
    window.LabsTree = {
        init,
        update
    };
})();
