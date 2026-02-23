(function () {
    document.addEventListener("DOMContentLoaded", function () {
        if (window.MeshSiteInteractions && typeof window.MeshSiteInteractions.setupBasicInteractions === "function") {
            window.MeshSiteInteractions.setupBasicInteractions();
        }
        if (window.MeshVendorConsole && typeof window.MeshVendorConsole.initializeVendorConsole === "function") {
            window.MeshVendorConsole.initializeVendorConsole();
        }
    });
})();
