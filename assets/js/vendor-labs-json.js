/**
 * MeshNetProtocol - Sing-Box Configuration Lab
 * JSON Display Module - View, Copy, and Download Configuration
 */

(function() {
    "use strict";

    console.log("[Labs] Loading JSON Display Module...");

    // Module state
    const state = {
        config: null,
        previewElement: null,
        copyButton: null,
        downloadButton: null
    };

    /**
     * Initialize JSON display module
     */
    function init() {
        console.log("[Labs] Initializing JSON Display Module...");
        
        state.previewElement = document.getElementById('json-preview');
        state.copyButton = document.getElementById('btn-copy-json');
        state.downloadButton = document.getElementById('btn-download-json');
        
        if (!state.previewElement) {
            console.warn("[Labs] JSON preview element not found");
            return;
        }
        
        // Bind button events
        if (state.copyButton) {
            state.copyButton.addEventListener('click', copyToClipboard);
        }
        
        if (state.downloadButton) {
            state.downloadButton.addEventListener('click', downloadJson);
        }
        
        // Initial render with empty config
        render({
            log: { level: 'info', timestamp: true },
            dns: { servers: [], final: 'local' },
            inbounds: [],
            outbounds: [],
            route: { rules: [], final: 'direct' }
        });
        
        console.log("[Labs] JSON Display Module ready!");
    }

    /**
     * Render JSON configuration with syntax highlighting
     */
    function render(config) {
        state.config = config;
        
        if (!state.previewElement) return;
        
        try {
            // Format JSON with indentation
            const jsonString = JSON.stringify(config, null, 2);
            
            // Apply syntax highlighting
            const highlighted = syntaxHighlight(jsonString);
            
            state.previewElement.innerHTML = highlighted;
            
            // Update stats
            updateStats(jsonString, config);
        } catch (error) {
            console.error("[Labs] Error rendering JSON:", error);
            state.previewElement.textContent = 'Error rendering JSON configuration';
        }
    }
    
    /**
     * Update JSON stats display
     */
    function updateStats(jsonString, config) {
        const sizeElement = document.getElementById('json-size');
        const linesElement = document.getElementById('json-lines');
        const nodesElement = document.getElementById('json-nodes');
        
        if (sizeElement) {
            sizeElement.textContent = new Blob([jsonString]).size;
        }
        
        if (linesElement) {
            linesElement.textContent = jsonString.split('\n').length;
        }
        
        if (nodesElement && config) {
            // Count top-level nodes
            nodesElement.textContent = Object.keys(config).length;
        }
    }

    /**
     * Apply syntax highlighting to JSON string
     */
    function syntaxHighlight(json) {
        // Escape HTML characters
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        // Apply syntax highlighting
        return json.replace(
            /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
            function(match) {
                let cls = 'json-number';
                
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'json-key';
                    } else {
                        cls = 'json-string';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'json-boolean';
                } else if (/null/.test(match)) {
                    cls = 'json-null';
                }
                
                return '<span class="' + cls + '">' + match + '</span>';
            }
        );
    }

    /**
     * Copy JSON to clipboard
     */
    async function copyToClipboard() {
        if (!state.config) {
            alert('No configuration to copy');
            return;
        }
        
        try {
            const jsonString = JSON.stringify(state.config, null, 2);
            
            // Modern clipboard API
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(jsonString);
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = jsonString;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }
            
            // Show success feedback
            showFeedback('✅ 已复制到剪贴板!');
        } catch (error) {
            console.error("[Labs] Error copying to clipboard:", error);
            showFeedback('❌ 复制失败');
        }
    }

    /**
     * Download JSON as file
     */
    function downloadJson() {
        if (!state.config) {
            alert('No configuration to download');
            return;
        }
        
        try {
            const jsonString = JSON.stringify(state.config, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            // Create download link
            const a = document.createElement('a');
            a.href = url;
            a.download = generateFilename();
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showFeedback('✅ 下载已开始');
        } catch (error) {
            console.error("[Labs] Error downloading JSON:", error);
            showFeedback('❌ 下载失败');
        }
    }

    /**
     * Generate filename based on config name and timestamp
     */
    function generateFilename() {
        const name = state.config.basic?.name || 'config';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        return `${name}-${timestamp}.json`;
    }

    /**
     * Show feedback message to user
     */
    function showFeedback(message) {
        // Create feedback element
        const feedback = document.createElement('div');
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #1e293b;
            color: #e2e8f0;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            border: 1px solid #334155;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(feedback);
        
        // Remove after 2 seconds
        setTimeout(() => {
            feedback.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(feedback);
            }, 300);
        }, 2000);
    }

    // Expose API
    window.LabsJson = {
        init,
        render
    };
})();
