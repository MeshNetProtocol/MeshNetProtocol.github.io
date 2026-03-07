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
                <button class="btn-add-root" onclick="window.LabsTree.addRootNode()">
                    <span>+</span> 添加根节点
                </button>
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

        const nodeElement = document.createElement('div');
        nodeElement.className = 'select-none';

        const nodeRow = document.createElement('div');
        nodeRow.className = `flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[#1a1b2e]/30 transition-all cursor-pointer group ${isSelected ? 'bg-[#2a2b3e]' : ''}`;
        nodeRow.style.marginLeft = `${level * 24}px`;
        nodeRow.dataset.nodeId = node.id;

        nodeRow.innerHTML = `
            ${canHaveChildren ? `
                <button
                    onClick="(e) => { e.stopPropagation(); window.LabsTree.toggleExpand('${node.id}') }"
                    className="w-5 h-5 flex items-center justify-center hover:bg-[#00d9ff]/20 rounded transition-all"
                >
                    <span className="toggle-icon ${isExpanded ? 'expanded' : ''}">▶</span>
                </button>
            ` : '<div className="w-5"></div>'}
            
            <div class="flex-1 flex items-center gap-2" onclick="window.LabsTree.selectNode('${node.id}')">
                <span class="text-[#00d9ff] font-mono">${node.name}</span>
                <span class="text-xs text-gray-500 font-mono">${node.type}</span>
                ${node.value !== undefined && node.type !== 'object' && node.type !== 'array' ? `
                    <span class="text-sm text-gray-400 font-mono">= ${JSON.stringify(node.value)}</span>
                ` : ''}
            </div>

            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                ${canHaveChildren ? `
                    <button
                        onClick="(e) => { e.stopPropagation(); window.LabsTree.addChild('${node.id}') }"
                        className="p-1.5 hover:bg-[#00d9ff]/20 rounded transition-all"
                        title="添加子节点"
                    >
                        <span class="text-[#00d9ff]">+</span>
                    </button>
                ` : ''}
                <button
                    onClick="(e) => { e.stopPropagation(); window.LabsTree.editNode('${node.id}') }"
                    className="p-1.5 hover:bg-[#00d9ff]/20 rounded transition-all"
                    title="编辑"
                >
                    <span class="text-[#00d9ff]">✏️</span>
                </button>
                <button
                    onClick="(e) => { e.stopPropagation(); window.LabsTree.deleteNode('${node.id}') }"
                    className="p-1.5 hover:bg-red-500/20 rounded transition-all"
                    title="删除"
                >
                    <span class="text-red-400">🗑️</span>
                </button>
            </div>
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
     * Add a root node
     */
    function addRootNode() {
        const newNode = {
            id: `root-${Date.now()}`,
            name: 'new_section',
            type: 'object',
            children: [],
            expanded: false
        };
        state.config.push(newNode);
        render();
        notifyConfigChange();
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
     * Edit a node
     */
    function editNode(nodeId) {
        const node = findNodeById(state.config, nodeId);
        if (node) {
            const newName = prompt('Edit node name:', node.name);
            if (newName !== null) {
                node.name = newName;
                render();
                notifyConfigChange();
            }
        }
    }

    /**
     * Delete a node
     */
    function deleteNode(nodeId) {
        if (!confirm('确定要删除这个节点吗？')) return;

        // Try to delete from root level
        const rootIndex = state.config.findIndex(n => n.id === nodeId);
        if (rootIndex !== -1) {
            state.config.splice(rootIndex, 1);
            render();
            notifyConfigChange();
            return;
        }

        // Search in children
        deleteNodeRecursive(state.config, nodeId);
        render();
        notifyConfigChange();
    }

    /**
     * Delete node recursively
     */
    function deleteNodeRecursive(nodes, nodeId) {
        for (const node of nodes) {
            if (node.children) {
                const index = node.children.findIndex(n => n.id === nodeId);
                if (index !== -1) {
                    node.children.splice(index, 1);
                    return true;
                }
                if (deleteNodeRecursive(node.children, nodeId)) {
                    return true;
                }
            }
        }
        return false;
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
        addRootNode,
        addChild,
        editNode,
        deleteNode
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
