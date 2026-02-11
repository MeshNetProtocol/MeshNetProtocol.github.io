// 平滑滚动导航
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Copy Seed URL functionality
document.querySelectorAll('.copy-seed-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        const seedBox = this.closest('.seed-box');
        const urlText = seedBox.querySelector('.seed-url-text').innerText;
        const btnText = this.querySelector('.btn-text');
        const originalText = btnText.innerText;

        navigator.clipboard.writeText(urlText).then(() => {
            this.style.backgroundColor = '#10b981'; // Success green
            btnText.innerText = '已复制!';

            setTimeout(() => {
                this.style.backgroundColor = '';
                btnText.innerText = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            btnText.innerText = '失败';
            setTimeout(() => {
                btnText.innerText = originalText;
            }, 2000);
        });
    });
});

// Seed Modal Logic
const seedModal = document.getElementById('seed-modal');
const seedContentDisplay = document.getElementById('seed-content-display');
const copyContentBtn = document.getElementById('copy-content-btn');
const closeModalBtns = document.querySelectorAll('.close-modal, .close-modal-btn, .modal-overlay');

document.querySelectorAll('.view-seed-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        const seedBox = this.closest('.seed-box');
        const url = seedBox.querySelector('.seed-url-text').innerText;

        seedModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        seedContentDisplay.innerHTML = `<code>加载中... ${url}</code>`;

        // Fetch seed content
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                seedContentDisplay.innerHTML = `<code>${JSON.stringify(data, null, 2)}</code>`;
            })
            .catch(err => {
                let errorMessage = err.message;
                if (window.location.protocol === 'https:' && url.startsWith('http:')) {
                    errorMessage = "安全限制: 无法从 HTTPS 页面加载 HTTP 资源 (Mixed Content)。请尝试手动访问该链接。";
                }
                seedContentDisplay.innerHTML = `<code style="color: #ef4444;">加载失败: ${errorMessage}</code>`;
            });
    });
});

if (seedModal) {
    // Close modal logic
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            seedModal.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        });
    });

    // Copy Content Logic
    if (copyContentBtn) {
        copyContentBtn.addEventListener('click', function () {
            const content = seedContentDisplay.innerText;
            const originalBtnText = this.innerText;

            navigator.clipboard.writeText(content).then(() => {
                this.innerText = '内容已复制到剪贴板!';
                this.classList.add('btn-success');
                setTimeout(() => {
                    this.innerText = originalBtnText;
                    this.classList.remove('btn-success');
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy content: ', err);
            });
        });
    }
}

// 页面滚动时导航栏效果
let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', function () {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > 100) {
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
    }

    lastScrollTop = scrollTop;
});

// 按钮点击效果
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function () {
        // 创建涟漪效果
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        this.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// 交互的 FAQ 部分
document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('click', function () {
        this.classList.toggle('active');
    });
});

// 添加加载动画
window.addEventListener('load', function () {
    document.body.style.opacity = '1';
});

// 监听元素进入视口时的动画
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// 观察所有特性卡片和步骤
document.querySelectorAll('.feature-card, .step, .faq-item').forEach(element => {
    element.style.opacity = '0';
    observer.observe(element);
});

// 添加 CSS 动画
const style = document.createElement('style');
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
