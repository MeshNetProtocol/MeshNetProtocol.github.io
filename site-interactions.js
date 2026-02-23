(function () {
    function setupBasicInteractions() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener("click", function (e) {
                const href = this.getAttribute("href");
                if (!href || href === "#") return;
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
                }
            });
        });

        document.querySelectorAll(".copy-seed-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                const seedBox = this.closest(".seed-box");
                if (!seedBox) return;
                const urlEl = seedBox.querySelector(".seed-url-text");
                if (!urlEl) return;
                const urlText = urlEl.innerText;
                const btnText = this.querySelector(".btn-text");
                const originalText = btnText ? btnText.innerText : "复制链接";

                navigator.clipboard.writeText(urlText).then(() => {
                    this.style.backgroundColor = "#10b981";
                    if (btnText) btnText.innerText = "已复制!";

                    setTimeout(() => {
                        this.style.backgroundColor = "";
                        if (btnText) btnText.innerText = originalText;
                    }, 2000);
                }).catch(() => {
                    if (btnText) btnText.innerText = "失败";
                    setTimeout(() => {
                        if (btnText) btnText.innerText = originalText;
                    }, 2000);
                });
            });
        });

        const seedModal = document.getElementById("seed-modal");
        const seedContentDisplay = document.getElementById("seed-content-display");
        const copyContentBtn = document.getElementById("copy-content-btn");
        const closeModalBtns = document.querySelectorAll(".close-modal, .close-modal-btn, .modal-overlay");

        document.querySelectorAll(".view-seed-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                const seedBox = this.closest(".seed-box");
                if (!seedBox || !seedModal || !seedContentDisplay) return;
                const urlEl = seedBox.querySelector(".seed-url-text");
                if (!urlEl) return;
                const url = urlEl.innerText;

                seedModal.classList.add("active");
                document.body.style.overflow = "hidden";
                seedContentDisplay.innerHTML = `<code>加载中... ${url}</code>`;

                fetch(url)
                    .then(response => {
                        if (!response.ok) throw new Error(`HTTP ${response.status}`);
                        return response.json();
                    })
                    .then(data => {
                        seedContentDisplay.innerHTML = `<code>${JSON.stringify(data, null, 2)}</code>`;
                    })
                    .catch(err => {
                        seedContentDisplay.innerHTML = `<code style="color: #ef4444;">加载失败: ${err.message}</code>`;
                    });
            });
        });

        if (seedModal) {
            closeModalBtns.forEach(btn => {
                btn.addEventListener("click", function () {
                    seedModal.classList.remove("active");
                    document.body.style.overflow = "";
                });
            });
        }

        if (copyContentBtn && seedContentDisplay) {
            copyContentBtn.addEventListener("click", function () {
                const content = seedContentDisplay.innerText;
                const originalBtnText = this.innerText;
                navigator.clipboard.writeText(content).then(() => {
                    this.innerText = "内容已复制到剪贴板!";
                    this.classList.add("btn-success");
                    setTimeout(() => {
                        this.innerText = originalBtnText;
                        this.classList.remove("btn-success");
                    }, 2000);
                });
            });
        }

        const navbar = document.querySelector(".navbar");
        window.addEventListener("scroll", function () {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (!navbar) return;
            if (scrollTop > 100) {
                navbar.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.1)";
            } else {
                navbar.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.05)";
            }
        });

        document.querySelectorAll(".btn").forEach(button => {
            button.addEventListener("click", function (event) {
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const ripple = document.createElement("span");
                const x = event.clientX - rect.left - size / 2;
                const y = event.clientY - rect.top - size / 2;
                ripple.style.width = ripple.style.height = `${size}px`;
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;
                ripple.classList.add("ripple");
                this.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            });
        });

        document.querySelectorAll(".faq-item").forEach(item => {
            item.addEventListener("click", function () {
                this.classList.toggle("active");
            });
        });

        const observer = new IntersectionObserver(function (entries, instance) {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.style.animation = "fadeInUp 0.6s ease forwards";
                instance.unobserve(entry.target);
            });
        }, {
            threshold: 0.1,
            rootMargin: "0px 0px -100px 0px",
        });

        document.querySelectorAll(".feature-card, .step, .faq-item, .vendor-card").forEach(element => {
            element.style.opacity = "0";
            observer.observe(element);
        });

        const style = document.createElement("style");
        style.textContent = `
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.5);
                transform: scale(0);
                animation: ripple-animation 0.6s ease-out;
                pointer-events: none;
            }
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            body {
                opacity: 0;
                transition: opacity 0.5s ease;
            }
        `;
        document.head.appendChild(style);

        window.addEventListener("load", function () {
            document.body.style.opacity = "1";
        });
    }

    window.MeshSiteInteractions = {
        setupBasicInteractions,
    };
})();
