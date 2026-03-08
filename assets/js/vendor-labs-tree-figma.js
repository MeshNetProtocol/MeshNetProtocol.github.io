/**
 * MeshNetProtocol - Sing-Box Configuration Lab
 * Professional Tree Component (Figma Design)
 * Fully editable tree with nodes, types, values, and actions
 */

(function() {
    "use strict";

    console.log("[Labs] Loading Professional Tree Module (Figma Design)...");

    // Module state
    const state = {
        config: null,
        selectedNode: null,
        container: null,
        initialized: false
    };

    /**
     * Initialize tree module
     */
    function init() {
        if (state.initialized) {
            console.log("[Labs] Tree Module already initialized");
            return;
        }
        
        state.container = document.getElementById('config-tree-container');
        if (!state.container) {
            console.warn("[Labs] Tree container not found");
            return;
        }

        // Listen to config updates
        window.addEventListener('config-updated', handleConfigUpdate);
        
        state.initialized = true;
        console.log("[Labs] Tree Module ready!");
    }

    /**
     * Handle config update event
     */
    function handleConfigUpdate(event) {
        const config = event.detail;
        console.log("[Labs Tree] Received config:", config);
        state.config = convertToTreeNodes(config);
        console.log("[Labs Tree] Converted to tree nodes:", state.config);
        render();
    }

    /**
     * Convert flat config to tree nodes
     */
    function convertToTreeNodes(config) {
        if (!config) return [];

        const nodes = [];
        for (const [key, value] of Object.entries(config)) {
            nodes.push(convertValueToNode(key, value));
        }
        return nodes;
    }

    /**
     * Convert a value to a tree node
     */
    function convertValueToNode(name, value) {
        const node = {
            id: `node-${name}-${Date.now()}-${Math.random()}`,
            name: name,
            type: getValueType(value),
            expanded: false
        };

        if (Array.isArray(value)) {
            node.type = 'array';
            node.children = value.map((item, index) => {
                const childNode = convertValueToNode(`${index}`, item);
                return childNode;
            });
        } else if (typeof value === 'object' && value !== null) {
            node.type = 'object';
            node.children = [];
            for (const [key, val] of Object.entries(value)) {
                node.children.push(convertValueToNode(key, val));
            }
        } else {
            node.value = value;
        }

        return node;
    }

    /**
     * Get type string for a value
     */
    function getValueType(value) {
        if (Array.isArray(value)) return 'array';
        if (value === null) return 'null';
        return typeof value;
    }

    /**
     * Render the tree
     */
    function render() {
        if (!state.container || !state.config) return;

        state.container.innerHTML = `
            <div class="tree-header">
                <h3 class="tree-title">配置结构</h3>
            </div>
            <div class="tree-content"></div>
        `;

        const treeContent = state.container.querySelector('.tree-content');
        state.config.forEach((node, index) => {
            treeContent.appendChild(renderNode(node, 0, [index]));
        });
    }

    /**
     * Render a tree node
     */
    function renderNode(node, level, path) {
        const hasChildren = node.children && node.children.length > 0;
        const canHaveChildren = node.type === 'object' || node.type === 'array';
        const isExpanded = node.expanded;
        const isSelected = state.selectedNode === node.id;
        const isRootLevel = level === 0;

        const nodeElement = document.createElement('div');
        nodeElement.className = 'select-none';

        const nodeRow = document.createElement('div');
        nodeRow.className = `tree-node-row ${isSelected ? 'selected' : ''}`;
        nodeRow.style.marginLeft = `${level * 24}px`;
        nodeRow.dataset.nodeId = node.id;

        nodeRow.innerHTML = `
            ${canHaveChildren ? `
                <button class="btn-toggle" onclick="event.stopPropagation(); window.LabsTree.toggleExpand('${node.id}')">
                    <span class="toggle-icon ${isExpanded ? 'expanded' : ''}">▶</span>
                </button>
            ` : '<div class="spacer"></div>'}
            
            <div class="node-content" onclick="window.LabsTree.selectNode('${node.id}')">
                <span class="node-name">${node.name}</span>
                <span class="node-type">${node.type}</span>
                ${node.value !== undefined && node.type !== 'object' && node.type !== 'array' ? `
                    <span class="node-separator">=</span>
                    <span class="node-value">${JSON.stringify(node.value)}</span>
                ` : ''}
            </div>

            ${!isRootLevel && canHaveChildren ? `
                <div class="node-actions ${isSelected ? 'visible' : ''}">
                    <button class="btn-action btn-add" onclick="event.stopPropagation(); window.LabsTree.addChild('${node.id}')" title="添加子节点">
                        <span>+</span>
                    </button>
                    <button class="btn-action btn-edit" onclick="event.stopPropagation(); window.LabsTree.editNode('${node.id}')" title="编辑">
                        <span>✏️</span>
                    </button>
                    <button class="btn-action btn-delete" onclick="event.stopPropagation(); window.LabsTree.deleteNode('${node.id}')" title="删除">
                        <span>🗑️</span>
                    </button>
                </div>
            ` : ''}
        `;

        nodeElement.appendChild(nodeRow);

        // Render children if expanded
        if (isExpanded && hasChildren) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'tree-children';
            node.children.forEach((child, index) => {
                childrenContainer.appendChild(renderNode(child, level + 1, [...path, index]));
            });
            nodeElement.appendChild(childrenContainer);
        }

        return nodeElement;
    }

    /**
     * Toggle node expand/collapse
     */
    function toggleExpand(nodeId) {
        const node = findNodeById(state.config, nodeId);
        if (node) {
            node.expanded = !node.expanded;
            render();
            notifyConfigChange();
        }
    }

    /**
     * Select a node
     */
    function selectNode(nodeId) {
        state.selectedNode = nodeId;
        render();
    }

    /**
     * Add a child node
     */
    function addChild(parentId) {
        const parent = findNodeById(state.config, parentId);
        if (parent) {
            if (!parent.children) {
                parent.children = [];
            }
            const newNode = {
                id: `node-${Date.now()}`,
                name: 'new_field',
                type: 'string',
                value: '',
                expanded: false
            };
            parent.children.push(newNode);
            parent.expanded = true;
            render();
            notifyConfigChange();
        }
    }

    /**
     * Find node by ID
     */
    function findNodeById(nodes, nodeId) {
        for (const node of nodes) {
            if (node.id === nodeId) {
                return node;
            }
            if (node.children) {
                const found = findNodeById(node.children, nodeId);
                if (found) return found;
            }
        }
        return null;
    }

    /**
     * Notify config change
     */
    function notifyConfigChange() {
        const flatConfig = convertTreeToFlat(state.config);
        window.dispatchEvent(new CustomEvent('config-updated', {
            detail: flatConfig
        }));
    }

    /**
     * Convert tree back to flat config
     */
    function convertTreeToFlat(nodes) {
        const result = {};
        nodes.forEach(node => {
            result[node.name] = nodeToValue(node);
        });
        return result;
    }

    /**
     * Convert node to value
     */
    function nodeToValue(node) {
        if (node.type === 'object' && node.children) {
            const obj = {};
            node.children.forEach(child => {
                obj[child.name] = nodeToValue(child);
            });
            return obj;
        } else if (node.type === 'array' && node.children) {
            return node.children.map(child => nodeToValue(child));
        } else {
            return node.value;
        }
    }

    // Expose public API
    window.LabsTree = {
        init,
        render,
        toggleExpand,
        selectNode,
        addChild
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
