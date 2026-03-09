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
        },
        'dns.strategy': {
            values: ['prefer_ipv4', 'prefer_ipv6', 'ipv4_only', 'ipv6_only'],
            title: 'DNS Strategy'
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
        },
        'dns': {
            type: 'object',
            fields: {
                'final': {
                    type: 'string',
                    default: '',
                    description: 'Default DNS server tag (First server used if empty)'
                    // TODO: Future enhancement - dropdown to select from configured DNS servers
                },
                'strategy': {
                    type: 'enum',
                    default: 'prefer_ipv4',
                    values: ['prefer_ipv4', 'prefer_ipv6', 'ipv4_only', 'ipv6_only'],
                    description: 'Default domain strategy for resolving domain names'
                },
                'disable_cache': {
                    type: 'boolean',
                    default: false,
                    description: 'Disable DNS cache'
                },
                'disable_expire': {
                    type: 'boolean',
                    default: false,
                    description: 'Disable DNS cache expire'
                },
                'independent_cache': {
                    type: 'boolean',
                    default: false,
                    description: 'Independent cache per server'
                },
                'cache_capacity': {
                    type: 'number',
                    default: 0,
                    description: 'LRU cache capacity'
                },
                'reverse_mapping': {
                    type: 'boolean',
                    default: false,
                    description: 'Store reverse IP mappings'
                },
                'client_subnet': {
                    type: 'string',
                    default: '',
                    description: 'EDNS0 client subnet'
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
        
        // Event delegation for delete buttons
        state.container.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.btn-delete');
            if (deleteBtn) {
                e.stopPropagation();
                const nodeId = deleteBtn.dataset.nodeId;
                if (nodeId) {
                    deleteNode(nodeId);
                }
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.custom-select-wrapper')) {
                const activeWrappers = state.container.querySelectorAll('.custom-select-wrapper.active');
                activeWrappers.forEach(wrapper => {
                    wrapper.classList.remove('active');
                });
            }
        });
        
        // Event delegation for custom select options
        state.container.addEventListener('click', (e) => {
            const customOption = e.target.closest('.custom-option');
            if (customOption) {
                e.stopPropagation();
                const wrapper = customOption.closest('.custom-select-wrapper');
                const nodeId = wrapper?.dataset.nodeId;
                const value = customOption.dataset.value;
                
                if (nodeId && value !== undefined) {
                    // Convert string value to appropriate type
                    let actualValue = value;
                    if (value === 'true') actualValue = true;
                    else if (value === 'false') actualValue = false;
                    
                    updateNodeValue(nodeId, actualValue);
                    finishEditing(nodeId, true);
                    
                    // Close dropdown
                    wrapper.classList.remove('active');
                }
            }
        });
        
        state.initialized = true;
        console.log("[Labs] Tree Module ready!");
    }

    /**
     * Handle config update event
     */
    function handleConfigUpdate(event) {
        const config = event.detail;
        console.log("[Labs Tree] Received config:", config);
        
        // Preserve expanded state from old tree
        const oldExpandedState = new Map();
        if (state.config) {
            state.config.forEach(node => {
                console.log('[HandleConfigUpdate] Saving expanded state for node:', node.name, '=', node.expanded);
                oldExpandedState.set(node.name, node.expanded);
            });
        }
        
        // Convert to tree nodes
        const newTree = convertToTreeNodes(config);
        
        // Restore expanded state
        newTree.forEach(node => {
            console.log('[HandleConfigUpdate] Checking node:', node.name, 'has old state:', oldExpandedState.has(node.name));
            if (oldExpandedState.has(node.name)) {
                const oldState = oldExpandedState.get(node.name);
                console.log('[HandleConfigUpdate] Restoring', node.name, 'expanded to:', oldState);
                node.expanded = oldState;
            }
        });
        
        state.config = newTree;
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
        
        // Determine type
        let type;
        if (Array.isArray(value)) {
            type = 'array';
        } else if (value === null) {
            type = 'null';
        } else if (typeof value === 'object') {
            type = 'object';
        } else {
            // Check if it's an enum type
            const enumKey = currentPath;
            console.log('[ConvertValueToNode] Checking enum:', enumKey, 'exists:', !!ENUM_DEFINITIONS[enumKey]);
            if (ENUM_DEFINITIONS[enumKey]) {
                type = 'enum';
                console.log('[ConvertValueToNode] Detected enum type:', enumKey);
            } else {
                // Check for IP address pattern
                if (typeof value === 'string') {
                    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
                    if (ipRegex.test(value)) {
                        type = 'ip';
                    } else {
                        type = typeof value;
                    }
                } else {
                    type = typeof value;
                }
            }
        }
        
        const node = {
            id: `node-${name}-${Date.now()}-${Math.random()}`,
            name: name,
            type: type,
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
     * Generate enum options HTML
     */
    function generateEnumOptions(node) {
        const enumDef = ENUM_DEFINITIONS[node.path];
        if (!enumDef) return '<option value="">Unknown</option>';
        
        return enumDef.values.map(v => 
            `<option value="${v}" ${node.value === v ? 'selected' : ''}>${v}</option>`
        ).join('');
    }

    /**
     * Generate enum custom options HTML (for custom dropdown)
     */
    function generateEnumCustomOptions(node) {
        console.log('[GenerateEnumCustomOptions] node.path:', node.path, 'node.value:', node.value);
        const enumDef = ENUM_DEFINITIONS[node.path];
        console.log('[GenerateEnumCustomOptions] enumDef:', enumDef);
        if (!enumDef) return '<div class="custom-option">Unknown enum</div>';
        
        return enumDef.values.map(v => 
            `<div class="custom-option ${node.value === v ? 'selected' : ''}" data-value="${v}">
                <span class="option-label">${v}</span>
                ${node.value === v ? '<span class="option-check">✓</span>' : ''}
            </div>`
        ).join('');
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
        
        // Note: Delete button events are handled by event delegation in init()
    }

    /**
     * Render add field button for a parent node
     */
    function renderAddFieldButton(parentNode, level) {
        const buttonRow = document.createElement('div');
        buttonRow.className = 'tree-node-row add-field-row';
        buttonRow.style.marginLeft = `${level * 24}px`;
        
        // Check if all fields are already added
        const schema = SCHEMA_DEFINITIONS[parentNode.path];
        if (!schema) {
            return buttonRow;
        }
        
        const existingFields = new Set(parentNode.children ? parentNode.children.map(c => c.name) : []);
        const availableFields = Object.keys(schema.fields).filter(f => !existingFields.has(f));
        
        // Only show button if there are available fields
        if (availableFields.length > 0) {
            buttonRow.innerHTML = `
                <div class="spacer"></div>
                <button class="btn-add-field" onclick="event.stopPropagation(); window.LabsTree.showAddFieldMenu('${parentNode.id}', '${parentNode.path}')">
                    <span>+</span> Add Field
                </button>
            `;
        } else {
            // No available fields, hide button
            buttonRow.style.display = 'none';
        }
        
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
                ${node.editing ? `
                    ${node.type === 'boolean' ? `
                        <div class="custom-select-wrapper" data-node-id="${node.id}">
                            <div class="custom-select-value" onclick="event.stopPropagation(); this.parentElement.classList.toggle('active')">${node.value ? 'true' : 'false'}</div>
                            <div class="custom-select-options">
                                <div class="custom-option ${node.value === true ? 'selected' : ''}" data-value="true">
                                    <span class="option-label">true</span>
                                    ${node.value === true ? '<span class="option-check">✓</span>' : ''}
                                </div>
                                <div class="custom-option ${node.value === false ? 'selected' : ''}" data-value="false">
                                    <span class="option-label">false</span>
                                    ${node.value === false ? '<span class="option-check">✓</span>' : ''}
                                </div>
                            </div>
                        </div>
                    ` : node.type === 'enum' ? `
                        <div class="custom-select-wrapper" data-node-id="${node.id}">
                            <div class="custom-select-value" onclick="event.stopPropagation(); this.parentElement.classList.toggle('active')">${node.value}</div>
                            <div class="custom-select-options">
                                ${generateEnumCustomOptions(node)}
                            </div>
                        </div>
                    ` : `
                        <input 
                            type="${node.type === 'number' ? 'number' : 'text'}" 
                            class="node-value-input" 
                            value="${node.value}"
                            data-node-id="${node.id}"
                            onclick="event.stopPropagation()"
                            onchange="window.LabsTree.updateNodeValue('${node.id}', this.value)"
                            onkeydown="if(event.key === 'Enter') this.blur()"
                            onblur="window.LabsTree.finishEditing('${node.id}', true)"
                            autofocus
                        />
                    `}
                ` : (node.type !== 'object' && node.type !== 'array' ? `
                    <span class="node-separator"> = </span>
                    <span class="node-value ${node.type === 'boolean' ? 'boolean-value' : ''} ${node.type === 'enum' ? 'enum-value' : ''}">
                        ${formatValue(node.value, node.type)}
                    </span>
                ` : `
                    <span class="node-type">${getTypeIcon(node.type)}${node.type}</span>
                `)}
            </div>

            ${!isRootLevel ? `
                <div class="node-actions ${isSelected ? 'visible' : ''}">
                    ${canHaveChildren ? `
                        <button class="btn-action btn-add" onclick="event.stopPropagation(); window.LabsTree.addChild('${node.id}')" title="Add child">
                            <span>+</span>
                        </button>
                    ` : ''}
                    <button class="btn-action btn-edit" onclick="event.stopPropagation(); window.LabsTree.handleEditClick('${node.id}', '${node.type}')" title="Edit">
                        <span>✏️</span>
                    </button>
                    <button class="btn-action btn-delete" data-node-id="${node.id}" title="Delete">
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
                // Remove menu first to avoid interference
                menu.remove();
                // Then add field and render
                addFieldToNode(parentNode, fieldName, fieldDef);
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
        // Keep parent node expanded after adding field
        console.log('[Add Field] Before setting expanded, parentNode:', parentNode.name, 'expanded:', parentNode.expanded);
        parentNode.expanded = true;
        console.log('[Add Field] After setting expanded, parentNode.expanded:', parentNode.expanded);
        
        render();
        console.log('[Add Field] Render complete');
        
        notifyConfigChange();
        console.log('[Add Field] notifyConfigChange called');

        // Auto-focus for editing if it's a simple type
        if (fieldDef.type !== 'object' && fieldDef.type !== 'array') {
            setTimeout(() => {
                editNode(newNode.id);
            }, 100);
        }
    }

    /**
     * Toggle boolean value (true/false)
     */
    function toggleBooleanValue(nodeId) {
        const node = findNodeById(state.config, nodeId);
        if (node && node.type === 'boolean') {
            node.value = !node.value;
            render();
            notifyConfigChange();
        }
    }

    /**
     * Handle edit click - route to appropriate editor
     */
    function handleEditClick(nodeId, nodeType) {
        console.log('[HandleEditClick] Called for nodeId:', nodeId, 'type:', nodeType);
        
        // Both boolean and enum use the same inline dropdown editor now
        if (nodeType === 'enum' || nodeType === 'boolean') {
            editNode(nodeId);
            
            // Auto-open the dropdown for these types
            setTimeout(() => {
                const wrapper = document.querySelector(`.custom-select-wrapper[data-node-id="${nodeId}"]`);
                if (wrapper) {
                    wrapper.classList.add('active');
                }
            }, 150);
        } else {
            // Use text input for other types
            editNode(nodeId);
        }
    }

    /**
     * Edit a node (start editing mode)
     */
    function editNode(nodeId) {
        const node = findNodeById(state.config, nodeId);
        if (node) {
            // For leaf nodes (non-object, non-array), enable editing
            if (node.type !== 'object' && node.type !== 'array') {
                // Store original value for comparison
                node.originalValue = node.value;
                console.log('[EditNode] Setting originalValue for', node.name, '=', node.originalValue);
                
                node.editing = true;
                console.log('[EditNode] Node', node.name, 'editing set to:', node.editing);
                
                render();
                console.log('[EditNode] Render complete');
                
                // Focus the input/select
                setTimeout(() => {
                    const input = document.querySelector(`input[data-node-id="${nodeId}"]`);
                    const select = document.querySelector(`select[data-node-id="${nodeId}"]`);
                    const element = input || select;
                    if (element) {
                        console.log('[EditNode] Focusing element:', element.tagName, 'value:', element.value);
                        element.focus();
                        if (input) element.select();
                    } else {
                        console.warn('[EditNode] Element not found for nodeId:', nodeId);
                    }
                }, 100);
            }
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
                // Handle both string and boolean values
                if (typeof value === 'boolean') {
                    node.value = value;
                } else if (value === 'true') {
                    node.value = true;
                } else if (value === 'false') {
                    node.value = false;
                } else {
                    node.value = value === 'yes' || value === '1';
                }
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
    function finishEditing(nodeId, saveChanges = false) {
        const node = findNodeById(state.config, nodeId);
        console.log('[FinishEditing] Called for nodeId:', nodeId, 'saveChanges:', saveChanges);
        
        if (node) {
            console.log('[FinishEditing] Node found:', node.name, 'current value:', node.value, 'original value:', node.originalValue, 'editing:', node.editing);
            
            // If saveChanges is true and value changed, notify config change
            if (saveChanges && node.originalValue !== undefined && node.originalValue !== node.value) {
                console.log('[FinishEditing] Value changed from', node.originalValue, 'to', node.value, '- saving');
                // Value already updated in updateNodeValue, just notify
            } else if (!saveChanges && node.originalValue !== undefined) {
                console.log('[FinishEditing] Value unchanged or no save - reverting');
                // Revert to original value if not saving
                node.value = node.originalValue;
            }
            
            // Clean up
            node.editing = false;
            console.log('[FinishEditing] Node', node.name, 'editing set to:', node.editing);
            render();
            console.log('[FinishEditing] Render complete');
            // Don't notify config change - already notified in updateNodeValue if changed
        } else {
            console.warn('[FinishEditing] Node NOT found for nodeId:', nodeId);
        }
    }

    /**
     * Show a beautiful confirmation dialog
     */
    function showConfirmDialog(title, message) {
        return new Promise((resolve) => {
            // Create modal backdrop
            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop';
            backdrop.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.75);
                display: flex !important;
                align-items: center;
                justify-content: center;
                z-index: 2147483647 !important;
                opacity: 1;
                pointer-events: auto !important;
            `;
            
            // Create modal content
            const modal = document.createElement('div');
            modal.style.cssText = `
                background: linear-gradient(135deg, rgba(26, 27, 46, 0.98), rgba(15, 16, 32, 0.98));
                border: 1px solid #00d9ff;
                border-radius: 12px;
                padding: 2rem;
                max-width: 400px;
                box-shadow: 0 20px 60px rgba(0, 217, 255, 0.3);
                z-index: 2147483647 !important;
                pointer-events: auto !important;
            `;
            
            // Title
            const titleEl = document.createElement('h3');
            titleEl.textContent = title;
            titleEl.style.cssText = `
                margin: 0 0 1rem 0;
                color: #00d9ff;
                font-size: 1.25rem;
                font-weight: 600;
            `;
            
            // Message
            const messageEl = document.createElement('p');
            messageEl.textContent = message;
            messageEl.style.cssText = `
                margin: 0 0 1.5rem 0;
                color: #94a3b8;
                font-size: 0.95rem;
                line-height: 1.6;
            `;
            
            // Buttons container
            const buttonsEl = document.createElement('div');
            buttonsEl.style.cssText = `
                display: flex;
                gap: 1rem;
                justify-content: flex-end;
            `;
            
            // Cancel button
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Cancel';
            cancelBtn.className = 'btn ghost';
            cancelBtn.style.cssText = `
                padding: 0.625rem 1.25rem;
                border: 1px solid #64748b;
                border-radius: 6px;
                background: transparent;
                color: #94a3b8;
                cursor: pointer;
                font-size: 0.875rem;
                transition: all 0.2s;
            `;
            cancelBtn.onmouseenter = () => {
                cancelBtn.style.background = 'rgba(100, 116, 139, 0.1)';
                cancelBtn.style.borderColor = '#94a3b8';
            };
            cancelBtn.onmouseleave = () => {
                cancelBtn.style.background = 'transparent';
                cancelBtn.style.borderColor = '#64748b';
            };
            
            // Confirm button
            const confirmBtn = document.createElement('button');
            confirmBtn.textContent = 'Delete';
            confirmBtn.className = 'btn btn-danger';
            confirmBtn.style.cssText = `
                padding: 0.625rem 1.25rem;
                border: 1px solid #ef4444;
                border-radius: 6px;
                background: linear-gradient(135deg, #ef4444, #dc2626);
                color: white;
                cursor: pointer;
                font-size: 0.875rem;
                font-weight: 500;
                transition: all 0.2s;
                box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
            `;
            confirmBtn.onmouseenter = () => {
                confirmBtn.style.transform = 'translateY(-1px)';
                confirmBtn.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
            };
            confirmBtn.onmouseleave = () => {
                confirmBtn.style.transform = 'translateY(0)';
                confirmBtn.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
            };
            
            // Button click handlers
            cancelBtn.addEventListener('click', () => {
                console.log('[Dialog] Cancel button clicked!');
                backdrop.style.display = 'none';
                setTimeout(() => {
                    console.log('[Dialog] Removing backdrop, resolving false');
                    backdrop.remove();
                    resolve(false);
                }, 0);
            });
            
            confirmBtn.addEventListener('click', () => {
                console.log('[Dialog] Confirm (Delete) button clicked!');
                backdrop.style.display = 'none';
                setTimeout(() => {
                    console.log('[Dialog] Removing backdrop, resolving true');
                    backdrop.remove();
                    resolve(true);
                }, 0);
            });
            
            // Assemble modal
            buttonsEl.appendChild(cancelBtn);
            buttonsEl.appendChild(confirmBtn);
            modal.appendChild(titleEl);
            modal.appendChild(messageEl);
            modal.appendChild(buttonsEl);
            backdrop.appendChild(modal);
            document.body.appendChild(backdrop);
            
            // Debug: Add global click listener to verify buttons are clickable
            setTimeout(() => {
                console.log('[Dialog] Backdrop in DOM, adding test listener');
                
                // Add document-level click listener to capture all clicks
                document.addEventListener('click', (e) => {
                    console.log('[Dialog] DOCUMENT CLICK DETECTED on:', e.target, 'tagName:', e.target.tagName, 'class:', e.target.className);
                }, { once: true });
                
                cancelBtn.addEventListener('click', (e) => {
                    console.log('[Dialog] TEST: Cancel button IS clickable! Event:', e);
                    e.stopPropagation();
                });
                confirmBtn.addEventListener('click', (e) => {
                    console.log('[Dialog] TEST: Confirm button IS clickable! Event:', e);
                    e.stopPropagation();
                });
                
                // Log button properties
                console.log('[Dialog] Cancel button:', cancelBtn, 'style:', cancelBtn.style.cssText);
                console.log('[Dialog] Confirm button:', confirmBtn, 'style:', confirmBtn.style.cssText);
            }, 50);
            
            // Close on backdrop click
            backdrop.onclick = (e) => {
                if (e.target === backdrop) {
                    backdrop.style.display = 'none';
                    setTimeout(() => {
                        backdrop.remove();
                        resolve(false);
                    }, 0);
                }
            };
            
            // ESC key to close
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    console.log('[Dialog] ESC pressed, closing...');
                    document.removeEventListener('keydown', escHandler);
                    backdrop.style.display = 'none';
                    setTimeout(() => {
                        backdrop.remove();
                        resolve(false);
                    }, 0);
                }
            };
            document.addEventListener('keydown', escHandler);
            
            console.log('[Dialog] Modal created and appended to body');
        });
    }

    /**
     * Delete a node
     */
    async function deleteNode(nodeId) {
        console.log('[Delete] Starting delete for node:', nodeId);
        const confirmed = await showConfirmDialog(
            '🗑️ Delete Configuration Field',
            'Are you sure you want to delete this configuration field? This action cannot be undone.'
        );
        
        console.log('[Delete] User confirmed:', confirmed);
        if (!confirmed) return;

        console.log('[Delete] Proceeding with deletion...');
        // Try to delete from root level
        const rootIndex = state.config.findIndex(n => n.id === nodeId);
        if (rootIndex !== -1) {
            console.log('[Delete] Deleting from root level');
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
        handleEditClick,
        editNode,
        updateNodeValue,
        finishEditing,
        deleteNode,
        toggleBooleanValue
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
