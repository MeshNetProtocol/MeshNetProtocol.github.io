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

    // Enum definitions for sing-box configuration
    const ENUM_DEFINITIONS = {
        'log.level': {
            values: ['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'panic'],
            title: 'Log Level'
        }
    };

    // Schema definitions for sing-box configuration
    const SCHEMA_DEFINITIONS = {
        'log': {
            type: 'object',
            fields: {
                'disabled': {
                    type: 'boolean',
                    default: false,
                    description: 'Disable logging'
                },
                'level': {
                    type: 'enum',
                    default: 'info',
                    values: ['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'panic'],
                    description: 'Log level'
                },
                'output': {
                    type: 'string',
                    default: 'box.log',
                    description: 'Output file path'
                },
                'timestamp': {
                    type: 'boolean',
                    default: true,
                    description: 'Add timestamp to each line'
                }
            }
        }
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
    function convertValueToNode(name, value, parentPath = '') {
        const currentPath = parentPath ? `${parentPath}.${name}` : name;
        
        const node = {
            id: `node-${name}-${Date.now()}-${Math.random()}`,
            name: name,
            type: getValueType(value),
            expanded: false,
            path: currentPath  // Store full path for enum lookup
        };

        if (Array.isArray(value)) {
            node.type = 'array';
            node.children = value.map((item, index) => {
                const childNode = convertValueToNode(`${index}`, item, currentPath);
                childNode.type = 'array-index';  // Mark as array item
                childNode.arrayIndex = index;    // Store index for display
                return childNode;
            });
        } else if (typeof value === 'object' && value !== null) {
            node.type = 'object';
            node.children = [];
            for (const [key, val] of Object.entries(value)) {
                node.children.push(convertValueToNode(key, val, currentPath));
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
        
        // Check for IP address pattern
        if (typeof value === 'string') {
            const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
            if (ipRegex.test(value)) {
                return 'ip';
            }
        }
        
        return typeof value;
    }

    /**
     * Get type icon
     */
    function getTypeIcon(type) {
        const icons = {
            'string': '🔤 ',
            'number': '🔢 ',
            'boolean': '✅ ',
            'object': '📦 ',
            'array': '📋 ',
            'ip': '🌐 ',
            'null': '⚪ ',
            'enum': '🔀 '  // For enum types
        };
        return icons[type] || '';
    }

    /**
     * Format value for display
     */
    function formatValue(value, type) {
        if (type === 'boolean') {
            return value ? 'true' : 'false';
        } else if (type === 'null') {
            return 'null';
        } else if (type === 'ip') {
            return value || '0.0.0.0';
        }
        return value;
    }

    /**
     * Render the tree
     */
    function render() {
        if (!state.container || !state.config) return;

        state.container.innerHTML = `
            <div class="tree-content"></div>
        `;

        const treeContent = state.container.querySelector('.tree-content');
        state.config.forEach((node, index) => {
            treeContent.appendChild(renderNode(node, 0, [index]));
        });
    }

    /**
     * Render add field button for a parent node
     */
    function renderAddFieldButton(parentNode, level) {
        const buttonRow = document.createElement('div');
        buttonRow.className = 'tree-node-row add-field-row';
        buttonRow.style.marginLeft = `${level * 24}px`;
        
        buttonRow.innerHTML = `
            <div class="spacer"></div>
            <button class="btn-add-field" onclick="event.stopPropagation(); window.LabsTree.showAddFieldMenu('${parentNode.id}', '${parentNode.path}')">
                <span>+</span> Add Field
            </button>
        `;
        
        return buttonRow;
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
        const isArrayItem = node.type === 'array-index';

        const nodeElement = document.createElement('div');
        nodeElement.className = 'select-none';

        const nodeRow = document.createElement('div');
        nodeRow.className = `tree-node-row ${isSelected ? 'selected' : ''}`;
        nodeRow.style.marginLeft = `${level * 24}px`;
        nodeRow.dataset.nodeId = node.id;

        nodeRow.innerHTML = `
            ${canHaveChildren ? `
                <button class="btn-toggle" onclick="event.stopPropagation(); console.log('Button clicked for node:', '${node.id}'); window.LabsTree.toggleExpand('${node.id}')">
                    <span class="toggle-icon ${isExpanded ? 'expanded' : ''}">▶</span>
                </button>
            ` : '<div class="spacer"></div>'}
            
            <div class="node-content" onclick="window.LabsTree.selectNode('${node.id}')">
                ${isArrayItem ? `
                    <span class="node-array-index">[${node.arrayIndex}]</span>
                ` : ''}
                <span class="node-name">${node.name}</span>
                <span class="node-type">${getTypeIcon(node.type)}${node.type}</span>
                ${node.editing ? `
                    <input 
                        type="${node.type === 'number' ? 'number' : node.type === 'boolean' ? 'text' : 'text'}" 
                        class="node-value-input" 
                        value="${node.value}"
                        data-node-id="${node.id}"
                        onclick="event.stopPropagation()"
                        onchange="window.LabsTree.updateNodeValue('${node.id}', this.value)"
                        onblur="window.LabsTree.finishEditing('${node.id}')"
                        onkeydown="if(event.key === 'Enter') this.blur()"
                        autofocus
                    />
                ` : (node.value !== undefined && node.type !== 'object' && node.type !== 'array' ? `
                    <span class="node-separator">=</span>
                    <span class="node-value ${node.type === 'boolean' ? 'boolean-value' : ''} ${node.type === 'enum' ? 'enum-value' : ''}" 
                          onclick="${node.type === 'enum' ? `window.LabsTree.editEnumValue('${node.id}')` : ''}">
                        ${formatValue(node.value, node.type)}
                        ${node.type === 'enum' ? ' ▼' : ''}
                    </span>
                ` : '')}
            </div>

            ${!isRootLevel && canHaveChildren ? `
                <div class="node-actions ${isSelected ? 'visible' : ''}">
                    <button class="btn-action btn-add" onclick="event.stopPropagation(); window.LabsTree.addChild('${node.id}')" title="Add child">
                        <span>+</span>
                    </button>
                    <button class="btn-action btn-edit" onclick="event.stopPropagation(); window.LabsTree.editNode('${node.id}')" title="Edit">
                        <span>✏️</span>
                    </button>
                    <button class="btn-action btn-delete" onclick="event.stopPropagation(); window.LabsTree.deleteNode('${node.id}')" title="Delete">
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
            
            // Add "Add Field" button for object nodes with schema (after children)
            if (node.type === 'object' && SCHEMA_DEFINITIONS[node.name]) {
                childrenContainer.appendChild(renderAddFieldButton(node, level + 1));
            }
            
            nodeElement.appendChild(childrenContainer);
        } else if (isExpanded && node.type === 'object' && SCHEMA_DEFINITIONS[node.name]) {
            // Show "Add Field" button even when empty
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'tree-children';
            childrenContainer.appendChild(renderAddFieldButton(node, level + 1));
            nodeElement.appendChild(childrenContainer);
        }

        return nodeElement;
    }

    /**
     * Toggle node expand/collapse
     */
    function toggleExpand(nodeId) {
        console.log('[Labs Tree] toggleExpand called for:', nodeId);
        const node = findNodeById(state.config, nodeId);
        if (node) {
            console.log('[Labs Tree] Found node, current expanded state:', node.expanded);
            node.expanded = !node.expanded;
            console.log('[Labs Tree] New expanded state:', node.expanded);
            render();
            console.log('[Labs Tree] Render complete');
            // Don't notify config change - expand/collapse is UI only
        } else {
            console.warn('[Labs Tree] Node not found:', nodeId);
        }
    }

    /**
     * Select a node
     */
    function selectNode(nodeId) {
        state.selectedNode = nodeId;
        render();
        // Don't notify config change - selection is UI only
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
                expanded: false,
                editing: false
            };
            parent.children.push(newNode);
            parent.expanded = true;
            render();
            notifyConfigChange();
            
            // Auto-focus the new node for editing
            setTimeout(() => {
                const input = document.querySelector(`input[data-node-id="${newNode.id}"]`);
                if (input) {
                    input.focus();
                    input.select();
                }
            }, 100);
        }
    }

    /**
     * Show add field menu
     */
    function showAddFieldMenu(parentId, parentPath) {
        const parentNode = findNodeById(state.config, parentId);
        if (!parentNode) return;

        const schema = SCHEMA_DEFINITIONS[parentPath];
        if (!schema) {
            console.warn('[Labs Tree] Schema not found for:', parentPath);
            return;
        }

        // Get existing field names
        const existingFields = new Set(parentNode.children ? parentNode.children.map(c => c.name) : []);

        // Create dropdown menu
        const menu = document.createElement('div');
        menu.className = 'add-field-menu';
        menu.style.position = 'absolute';
        menu.style.background = 'rgba(26, 27, 46, 0.98)';
        menu.style.border = '1px solid #00d9ff';
        menu.style.borderRadius = '0.5rem';
        menu.style.padding = '0.5rem';
        menu.style.zIndex = '1000';
        menu.style.minWidth = '200px';
        menu.style.boxShadow = '0 4px 12px rgba(0, 217, 255, 0.3)';

        const title = document.createElement('div');
        title.textContent = `Add field to ${parentPath}`;
        title.style.padding = '0.5rem 0.75rem';
        title.style.color = '#94a3b8';
        title.style.fontSize = '0.75rem';
        title.style.marginBottom = '0.5rem';
        title.style.borderBottom = '1px solid rgba(0, 217, 255, 0.1)';
        menu.appendChild(title);

        // Create menu items for available fields
        Object.entries(schema.fields).forEach(([fieldName, fieldDef]) => {
            if (existingFields.has(fieldName)) {
                return; // Skip existing fields
            }

            const item = document.createElement('div');
            item.className = 'menu-item';
            item.style.padding = '0.5rem 0.75rem';
            item.style.cursor = 'pointer';
            item.style.borderRadius = '0.25rem';
            item.style.marginBottom = '0.25rem';
            item.style.display = 'flex';
            item.style.justifyContent = 'space-between';
            item.style.alignItems = 'center';
            item.style.transition = 'all 0.2s';

            const left = document.createElement('div');
            left.style.display = 'flex';
            left.style.alignItems = 'center';
            left.style.gap = '0.5rem';

            const icon = document.createElement('span');
            icon.textContent = getTypeIcon(fieldDef.type);
            left.appendChild(icon);

            const name = document.createElement('span');
            name.textContent = fieldName;
            name.style.color = '#00d9ff';
            name.style.fontFamily = 'IBM Plex Mono, monospace';
            name.style.fontSize = '0.875rem';
            left.appendChild(name);

            const type = document.createElement('span');
            type.textContent = fieldDef.type;
            type.style.color = '#64748b';
            type.style.fontSize = '0.75rem';
            type.style.fontFamily = 'IBM Plex Mono, monospace';
            left.appendChild(type);

            item.appendChild(left);

            item.addEventListener('mouseenter', () => {
                item.style.background = 'rgba(0, 217, 255, 0.1)';
            });

            item.addEventListener('mouseleave', () => {
                item.style.background = 'transparent';
            });

            item.addEventListener('click', () => {
                addFieldToNode(parentNode, fieldName, fieldDef);
                menu.remove();
            });

            menu.appendChild(item);
        });

        // If no fields available
        if (menu.children.length === 1) { // Only title
            const noFields = document.createElement('div');
            noFields.textContent = 'All fields added';
            noFields.style.padding = '0.5rem 0.75rem';
            noFields.style.color = '#64748b';
            noFields.style.fontSize = '0.875rem';
            menu.appendChild(noFields);
        }

        // Position menu
        const buttonElement = document.querySelector(`[onclick*="showAddFieldMenu('${parentId}'"]`);
        if (buttonElement) {
            const rect = buttonElement.getBoundingClientRect();
            menu.style.left = `${rect.left}px`;
            menu.style.top = `${rect.bottom + 5}px`;
            document.body.appendChild(menu);

            // Close menu when clicking outside
            setTimeout(() => {
                document.addEventListener('click', function closeMenu(e) {
                    if (!menu.contains(e.target)) {
                        menu.remove();
                        document.removeEventListener('click', closeMenu);
                    }
                });
            }, 100);
        }
    }

    /**
     * Add field to node
     */
    function addFieldToNode(parentNode, fieldName, fieldDef) {
        if (!parentNode.children) {
            parentNode.children = [];
        }

        const newNode = {
            id: `node-${fieldName}-${Date.now()}`,
            name: fieldName,
            type: fieldDef.type,
            value: fieldDef.default,
            expanded: false,
            editing: false,
            path: `${parentNode.path}.${fieldName}`
        };

        parentNode.children.push(newNode);
        parentNode.expanded = true;
        render();
        notifyConfigChange();

        // Auto-focus for editing if it's a simple type
        if (fieldDef.type !== 'object' && fieldDef.type !== 'array') {
            setTimeout(() => {
                editNode(newNode.id);
            }, 100);
        }
    }

    /**
     * Edit enum value (show dropdown)
     */
    function editEnumValue(nodeId) {
        const node = findNodeById(state.config, nodeId);
        if (!node) return;

        // Find enum definition
        const enumKey = `${node.path}`;
        const enumDef = ENUM_DEFINITIONS[enumKey];
        
        if (!enumDef) {
            console.warn('[Labs Tree] Enum definition not found for:', enumKey);
            return;
        }

        // Create dropdown UI
        showEnumDropdown(node, enumDef);
    }

    /**
     * Show enum dropdown
     */
    function showEnumDropdown(node, enumDef) {
        // Remove existing dropdown if any
        const existingDropdown = document.querySelector('.enum-dropdown');
        if (existingDropdown) {
            existingDropdown.remove();
        }

        // Create dropdown element
        const dropdown = document.createElement('div');
        dropdown.className = 'enum-dropdown';
        dropdown.style.position = 'absolute';
        dropdown.style.background = 'rgba(26, 27, 46, 0.98)';
        dropdown.style.border = '1px solid #00d9ff';
        dropdown.style.borderRadius = '0.5rem';
        dropdown.style.padding = '0.5rem';
        dropdown.style.zIndex = '1000';
        dropdown.style.minWidth = '150px';
        dropdown.style.boxShadow = '0 4px 12px rgba(0, 217, 255, 0.3)';

        // Create options
        enumDef.values.forEach(value => {
            const option = document.createElement('div');
            option.className = 'enum-option';
            option.textContent = value;
            option.style.padding = '0.5rem 0.75rem';
            option.style.cursor = 'pointer';
            option.style.borderRadius = '0.25rem';
            option.style.marginBottom = '0.25rem';
            option.style.color = value === node.value ? '#00d9ff' : '#94a3b8';
            option.style.background = value === node.value ? 'rgba(0, 217, 255, 0.1)' : 'transparent';
            
            option.addEventListener('mouseenter', () => {
                option.style.background = 'rgba(0, 217, 255, 0.2)';
            });
            
            option.addEventListener('mouseleave', () => {
                if (value !== node.value) {
                    option.style.background = 'transparent';
                }
            });
            
            option.addEventListener('click', () => {
                node.value = value;
                render();
                notifyConfigChange();
                dropdown.remove();
            });
            
            dropdown.appendChild(option);
        });

        // Position dropdown near the node
        const nodeElement = document.querySelector(`[data-node-id="${node.id}"]`);
        if (nodeElement) {
            const rect = nodeElement.getBoundingClientRect();
            dropdown.style.left = `${rect.left}px`;
            dropdown.style.top = `${rect.bottom + 5}px`;
            document.body.appendChild(dropdown);

            // Close dropdown when clicking outside
            setTimeout(() => {
                document.addEventListener('click', function closeDropdown(e) {
                    if (!dropdown.contains(e.target)) {
                        dropdown.remove();
                        document.removeEventListener('click', closeDropdown);
                    }
                });
            }, 100);
        }
    }

    /**
     * Edit a node (start editing mode)
     */
    function editNode(nodeId) {
        const node = findNodeById(state.config, nodeId);
        if (node) {
            node.editing = true;
            render();
            
            // Focus the input
            setTimeout(() => {
                const input = document.querySelector(`input[data-node-id="${nodeId}"]`);
                if (input) {
                    input.focus();
                    input.select();
                }
            }, 100);
        }
    }

    /**
     * Update node value
     */
    function updateNodeValue(nodeId, value) {
        const node = findNodeById(state.config, nodeId);
        if (node) {
            // Type conversion
            if (node.type === 'number') {
                node.value = Number(value);
            } else if (node.type === 'boolean') {
                node.value = value === 'true' || value === 'yes';
            } else if (node.type === 'ip') {
                // Basic IP validation
                const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
                node.value = ipRegex.test(value) ? value : '0.0.0.0';
            } else {
                node.value = value;
            }
            notifyConfigChange();
        }
    }

    /**
     * Finish editing
     */
    function finishEditing(nodeId) {
        const node = findNodeById(state.config, nodeId);
        if (node) {
            node.editing = false;
            render();
            // Don't notify config change - already notified in updateNodeValue
        }
    }

    /**
     * Delete a node
     */
    function deleteNode(nodeId) {
        if (!confirm('Are you sure you want to delete this node?')) return;

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
        addChild,
        showAddFieldMenu,
        editNode,
        updateNodeValue,
        finishEditing,
        deleteNode,
        editEnumValue
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
