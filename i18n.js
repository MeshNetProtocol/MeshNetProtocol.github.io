// 国际化翻译配置
const i18n = {
    en: {
        // 导航栏
        nav: {
            features: "Features",
            howItWorks: "How It Works",
            tokenomics: "Tokenomics",
            supplierConsole: "Supplier Console",
            faq: "FAQ"
        },
        // 英雄部分
        hero: {
            title: "Decentralized VPN Network",
            subtitle: "Real-time settlement via blockchain wallets, everyone can participate in traffic mining"
        },
        // 按钮
        buttons: {
            getStarted: "Get Started",
            learnMore: "Learn More"
        },
        businessEntry: {
            title: "Supplier Business Console",
            subtitle: "Move from the product overview into wallet-authenticated supplier operations.",
            button: "Open Console"
        },
        // 特性
        features: {
            title: "Core Features",
            realtime: {
                name: "Real-time Settlement",
                desc: "Settle each traffic block in real-time through HTTP 402 payment protocol without waiting"
            },
            blockchain: {
                name: "Blockchain Wallet Support",
                desc: "Integrated blockchain wallet for secure and efficient traffic settlement and revenue withdrawal"
            },
            mining: {
                name: "Traffic Mining",
                desc: "All users can participate in traffic mining by contributing network bandwidth and earn digital tokens"
            },
            multichain: {
                name: "Multi-chain Settlement",
                desc: "Support USDC stablecoin settlement, and also support custom token settlement solutions"
            },
            decentralized: {
                name: "Decentralized",
                desc: "Fully decentralized network architecture, no single point of failure, users have complete control"
            },
            performance: {
                name: "High Performance",
                desc: "Optimized network protocol providing low latency and high-speed VPN services"
            }
        },
        // 工作原理
        howItWorks: {
            title: "How It Works",
            step1: {
                name: "Connect to Nodes",
                desc: "Users connect to nodes in the MeshNetProtocol network and choose the optimal network path"
            },
            step2: {
                name: "Traffic Transfer",
                desc: "Data is transmitted through the distributed network, each traffic block is recorded and verified in real-time"
            },
            step3: {
                name: "Real-time Settlement",
                desc: "Settle each traffic block in real-time through HTTP 402 protocol on the blockchain"
            },
            step4: {
                name: "Earn Rewards",
                desc: "Node operators earn token rewards through bandwidth contribution, users enjoy privacy network services"
            }
        },
        // 代币经济
        tokenomics: {
            title: "Tokenomics",
            settlement: {
                name: "Settlement Mechanism",
                supportedTokens: "Supported Tokens:",
                customTokens: "Custom Tokens:",
                cycle: "Settlement Cycle:",
                rewards: "Mining Rewards:"
            },
            participation: {
                name: "How to Participate",
                users: "Users:",
                nodes: "Node Operators:",
                liquidity: "Liquidity Providers:",
                governance: "Community Governance:"
            }
        },
        // FAQ
        faq: {
            title: "Frequently Asked Questions",
            q1: {
                question: "What is MeshNetProtocol?",
                answer: "MeshNetProtocol is a blockchain-based distributed VPN protocol that allows users to obtain network services and earn income simultaneously through real-time settlement and traffic mining mechanisms."
            },
            q2: {
                question: "How to get started?",
                answer: "Connect to the MeshNetProtocol network, configure your blockchain wallet, and you can start enjoying VPN services and participate in traffic mining."
            },
            q3: {
                question: "How does traffic mining work?",
                answer: "By running nodes and contributing network bandwidth, you can earn traffic mining rewards. The system calculates rewards in real-time based on the amount of bandwidth you contribute."
            },
            q4: {
                question: "What payment methods are supported?",
                answer: "Currently supports USDC stablecoin settlement, and also supports project custom token settlement solutions."
            },
            q5: {
                question: "Is it secure and private?",
                answer: "MeshNetProtocol uses end-to-end encryption and decentralized architecture to ensure user privacy and data security."
            },
            q6: {
                question: "What is HTTP 402 Payment Protocol?",
                answer: "HTTP 402 is an internet standard payment protocol that allows real-time and granular payment settlement for network resources, ideal for traffic-based settlement scenarios."
            }
        },
        // 页脚
        footer: {
            tagline: "Next Generation Distributed VPN Protocol",
            links: "Quick Links",
            docs: "Documentation",
            github: "GitHub",
            community: "Community",
            contact: "Contact Us",
            twitter: "Twitter",
            discord: "Discord",
            email: "Email",
            copyright: "© 2026 MeshNetProtocol. All rights reserved."
        },
        vendorPage: {
            title: "Supplier Console",
            subtitle: "Manage supplier profile, config and manager wallets via MetaMask authentication.",
            backHome: "Back to Landing",
            sectionApiTitle: "1) API Connection",
            sectionApiHelp: "Fill in market-api base URL (without trailing slash).",
            sectionApiLabel: "Market API Base URL",
            saveApiButton: "Save URL",
            apiStatusIdle: "Not connected yet",
            sectionAuthTitle: "2) Wallet and Auth",
            sectionAuthHelp: "Use one button to connect wallet and finish SIWE sign-in.",
            targetNetworkLabel: "Target Network",
            networkStatusLabel: "Network Status",
            connectSignInButton: "Connect Wallet & Sign In",
            switchNetworkButton: "Switch to Target Network",
            logoutButton: "Sign Out",
            walletStatusIdle: "Wallet not connected",
            authStatusIdle: "Not signed in",
            sectionCreateTitle: "3) Create Supplier",
            sectionCreateHelp: "Only available for wallet first binding; creator becomes owner.",
            supplierNameLabel: "Supplier Name",
            supplierDescLabel: "Description",
            createSupplierButton: "Create Supplier",
            sectionManageTitle: "4) Supplier Profile",
            supplierSummaryIdle: "Supplier data not loaded",
            supplierStatusLabel: "Status",
            supplierDescTextareaLabel: "Supplier Description",
            refreshSupplierButton: "Refresh Supplier",
            saveSupplierButton: "Save Profile",
            sectionConfigTitle: "5) Config Management",
            sectionConfigHelp: "Only JSON object is accepted. Example: {\"webhook_url\":\"https://example.com/hook\"}",
            refreshConfigButton: "Refresh Config",
            saveConfigButton: "Save Config",
            sectionManagerTitle: "6) Manager Wallets (Owner)",
            sectionManagerHelp: "Owner can add or remove manager wallets.",
            managerWalletLabel: "Manager Wallet Address",
            managerRoleLabel: "Role",
            addManagerButton: "Add Manager",
            removeManagerButton: "Remove",
            managerEmpty: "No managers yet"
        },
        vendorRuntime: {
            apiInvalid: "API URL is invalid, please input a full URL.",
            apiCurrent: "Current API: {url}",
            apiNeedConfig: "Please configure API URL first.",
            walletMissingProvider: "MetaMask not detected (window.ethereum missing).",
            walletConnected: "Wallet connected: {address} | chainId={chainId}",
            walletDisconnected: "Wallet not connected",
            chainNotAllowed: "Current chain {chainId} is not in allowed list: {allowed}.",
            chainTargetNotAllowed: "Target chain {targetChainId} is not in backend allowed list: {allowed}.",
            networkNeedWallet: "Wallet not connected. Target network: {target}",
            networkReady: "Network ready: {current}",
            networkMismatch: "Wrong network: current chainId={currentChainId}, target={target} ({targetChainId})",
            networkSwitchFailed: "Failed to switch network.",
            networkTargetChanged: "Target network changed. Please switch network and sign in again.",
            networkSwitchedNeedSignIn: "Network switched. Please sign in again.",
            contractConfigLine: "Target={network} | Registry={registry} | USDC={usdc}",
            authNeedSign: "Wallet connected, click sign-in button to continue.",
            authSignInFailed: "Sign-in failed.",
            authSignedOut: "Signed out.",
            authSignedIn: "Signed in: {address} ({expires}s)",
            authTokenValid: "Signed in: {address}, token expires at {time}",
            authTokenExpired: "Local token expired, please sign in again.",
            authAccountChanged: "Wallet account changed, please sign in again.",
            authChainChanged: "Network changed, please sign in again.",
            supplierNone: "Current wallet has no supplier yet. Please create one.",
            supplierSummaryLine: "supplier_id={id} | role={role}{managerRole} | owner={owner}",
            supplierRefreshed: "Supplier profile refreshed.",
            supplierRefreshFailed: "Failed to refresh supplier profile.",
            supplierCreateNameRequired: "Supplier name is required.",
            supplierCreateSuccess: "Supplier created successfully.",
            supplierCreateFailed: "Failed to create supplier.",
            supplierProfileNoData: "No supplier available to update.",
            supplierProfileSaveSuccess: "Supplier profile updated.",
            supplierProfileSaveFailed: "Failed to update supplier profile.",
            supplierConfigRefreshed: "Config refreshed. Last updated: {time}",
            supplierConfigRefreshFailed: "Failed to refresh config.",
            supplierConfigEmpty: "Config cannot be empty.",
            supplierConfigInvalid: "Config must be a JSON object.",
            supplierConfigSaveSuccess: "Config saved successfully.",
            supplierConfigSaveFailed: "Failed to save config.",
            managerNeedWallet: "Please input manager wallet address.",
            managerMeta: "role={role} · created={created}",
            managerAddSuccess: "Manager added successfully.",
            managerAddFailed: "Failed to add manager.",
            managerRemoveSuccess: "Manager removed.",
            managerRemoveFailed: "Failed to remove manager.",
            legacyApiMigrated: "Legacy API URL detected. Auto-switched to: {url}",
            localApiMigrated: "Local API URL detected. Auto-switched to: {url}"
        }
    },
    zh: {
        // 导航栏
        nav: {
            features: "特性",
            howItWorks: "工作原理",
            tokenomics: "代币经济",
            supplierConsole: "供应商控制台",
            faq: "常见问题"
        },
        // 英雄部分
        hero: {
            title: "去中心化的VPN网络",
            subtitle: "通过区块链钱包实时结算，让每个人都可以参与流量挖矿"
        },
        // 按钮
        buttons: {
            getStarted: "立即开始",
            learnMore: "了解更多"
        },
        businessEntry: {
            title: "供应商业务控制台",
            subtitle: "从宣传页进入钱包鉴权后的供应商业务管理界面。",
            button: "进入控制台"
        },
        // 特性
        features: {
            title: "核心特性",
            realtime: {
                name: "实时结算",
                desc: "通过 HTTP 402 支付协议，实时为每个流量块进行结算，无需等待"
            },
            blockchain: {
                name: "区块链钱包支持",
                desc: "集成区块链钱包，安全高效地进行流量结算和收益提取"
            },
            mining: {
                name: "流量挖矿",
                desc: "所有用户都可以通过贡献网络带宽进行流量挖矿，获得数字代币奖励"
            },
            multichain: {
                name: "多链结算",
                desc: "支持 USDC 稳定币结算，同时支持自定义代币结算方案"
            },
            decentralized: {
                name: "去中心化",
                desc: "完全去中心化的网络架构，无单点故障，用户拥有完全控制权"
            },
            performance: {
                name: "高性能",
                desc: "优化的网络协议，提供低延迟、高速度的VPN服务"
            }
        },
        // 工作原理
        howItWorks: {
            title: "工作原理",
            step1: {
                name: "连接节点",
                desc: "用户连接到 MeshNetProtocol 网络中的节点，选择最优的网络路径"
            },
            step2: {
                name: "流量传输",
                desc: "数据通过分布式网络传输，每个流量块被实时记录和验证"
            },
            step3: {
                name: "实时结算",
                desc: "通过 HTTP 402 协议，为每个流量块实时进行区块链结算"
            },
            step4: {
                name: "获得奖励",
                desc: "节点运营者通过贡献带宽获得代币奖励，用户享受隐私网络服务"
            }
        },
        // 代币经济
        tokenomics: {
            title: "代币经济",
            settlement: {
                name: "结算机制",
                supportedTokens: "支持的代币：",
                customTokens: "自定义代币：",
                cycle: "结算周期：",
                rewards: "挖矿奖励："
            },
            participation: {
                name: "参与方式",
                users: "使用者：",
                nodes: "节点运营者：",
                liquidity: "流动性提供者：",
                governance: "社区治理："
            }
        },
        // FAQ
        faq: {
            title: "常见问题",
            q1: {
                question: "MeshNetProtocol 是什么？",
                answer: "MeshNetProtocol 是一个基于区块链的分布式 VPN 协议，通过实时结算和流量挖矿机制，让用户可以获得网络服务同时赚取收益。"
            },
            q2: {
                question: "如何开始使用？",
                answer: "连接到 MeshNetProtocol 网络，配置您的区块链钱包，即可开始享受 VPN 服务并参与流量挖矿。"
            },
            q3: {
                question: "流量挖矿如何工作？",
                answer: "通过运行节点并贡献网络带宽，您可以获得流量挖矿奖励。系统会根据您贡献的带宽量实时计算奖励。"
            },
            q4: {
                question: "支持哪些支付方式？",
                answer: "目前支持 USDC 稳定币结算，同时支持项目自定义的代币结算方案。"
            },
            q5: {
                question: "是否安全隐私？",
                answer: "MeshNetProtocol 采用端对端加密和去中心化架构，确保用户的隐私和数据安全。"
            },
            q6: {
                question: "什么是 HTTP 402 支付协议？",
                answer: "HTTP 402 是一个互联网标准支付协议，允许对网络资源进行实时、粒度化的支付结算，非常适合按流量结算的场景。"
            }
        },
        // 页脚
        footer: {
            tagline: "下一代分布式 VPN 协议",
            links: "快速链接",
            docs: "文档",
            github: "GitHub",
            community: "社区",
            contact: "联系我们",
            twitter: "Twitter",
            discord: "Discord",
            email: "Email",
            copyright: "© 2026 MeshNetProtocol. 版权所有"
        },
        vendorPage: {
            title: "供应商控制台",
            subtitle: "通过 MetaMask 鉴权后管理供应商资料、配置与 manager 钱包。",
            backHome: "返回宣传页",
            sectionApiTitle: "1) API 连接",
            sectionApiHelp: "填写 market-api 根地址（不带末尾斜杠）。",
            sectionApiLabel: "Market API Base URL",
            saveApiButton: "保存地址",
            apiStatusIdle: "尚未连接",
            sectionAuthTitle: "2) 钱包与鉴权",
            sectionAuthHelp: "使用一个按钮完成连接钱包与 SIWE 签名登录。",
            targetNetworkLabel: "目标网络",
            networkStatusLabel: "网络状态",
            connectSignInButton: "连接钱包并签名登录",
            switchNetworkButton: "切换到目标网络",
            logoutButton: "退出登录",
            walletStatusIdle: "钱包未连接",
            authStatusIdle: "未登录",
            sectionCreateTitle: "3) 创建供应商",
            sectionCreateHelp: "仅钱包首次绑定时可创建，成功后该钱包成为 owner。",
            supplierNameLabel: "供应商名称",
            supplierDescLabel: "简介",
            createSupplierButton: "创建供应商",
            sectionManageTitle: "4) 供应商管理",
            supplierSummaryIdle: "尚未加载供应商信息",
            supplierStatusLabel: "状态",
            supplierDescTextareaLabel: "供应商简介",
            refreshSupplierButton: "刷新供应商信息",
            saveSupplierButton: "保存资料",
            sectionConfigTitle: "5) 配置管理",
            sectionConfigHelp: "仅支持 JSON 对象，示例：{\"webhook_url\":\"https://example.com/hook\"}",
            refreshConfigButton: "刷新配置",
            saveConfigButton: "保存配置",
            sectionManagerTitle: "6) Manager 管理（Owner）",
            sectionManagerHelp: "owner 可增加或移除 manager 钱包。",
            managerWalletLabel: "Manager 钱包地址",
            managerRoleLabel: "角色",
            addManagerButton: "添加 Manager",
            removeManagerButton: "移除",
            managerEmpty: "暂无 manager"
        },
        vendorRuntime: {
            apiInvalid: "API 地址无效，请输入完整 URL。",
            apiCurrent: "当前 API：{url}",
            apiNeedConfig: "请先配置 API 地址。",
            walletMissingProvider: "未检测到 MetaMask（window.ethereum 不存在）。",
            walletConnected: "已连接钱包：{address} | chainId={chainId}",
            walletDisconnected: "钱包未连接",
            chainNotAllowed: "当前链 {chainId} 不在允许列表 {allowed} 中。",
            chainTargetNotAllowed: "目标链 {targetChainId} 不在后端允许列表 {allowed} 中。",
            networkNeedWallet: "钱包未连接。目标网络：{target}",
            networkReady: "网络已就绪：{current}",
            networkMismatch: "网络不匹配：当前 chainId={currentChainId}，目标={target}（{targetChainId}）",
            networkSwitchFailed: "切换网络失败。",
            networkTargetChanged: "目标网络已变更，请切换网络后重新登录。",
            networkSwitchedNeedSignIn: "网络已切换，请重新登录。",
            contractConfigLine: "目标={network} | Registry={registry} | USDC={usdc}",
            authNeedSign: "钱包已连接，请点击登录按钮。",
            authSignInFailed: "签名登录失败。",
            authSignedOut: "已退出登录。",
            authSignedIn: "登录成功：{address}（{expires}s）",
            authTokenValid: "已登录：{address}，token 到期 {time}",
            authTokenExpired: "本地 token 已失效，请重新签名登录。",
            authAccountChanged: "检测到钱包账户变化，请重新签名登录。",
            authChainChanged: "检测到网络变化，请重新签名登录。",
            supplierNone: "当前钱包尚未绑定供应商，请先创建。",
            supplierSummaryLine: "supplier_id={id} | role={role}{managerRole} | owner={owner}",
            supplierRefreshed: "供应商信息已刷新。",
            supplierRefreshFailed: "刷新供应商信息失败。",
            supplierCreateNameRequired: "供应商名称不能为空。",
            supplierCreateSuccess: "供应商创建成功。",
            supplierCreateFailed: "创建供应商失败。",
            supplierProfileNoData: "当前无可更新的供应商。",
            supplierProfileSaveSuccess: "供应商资料更新成功。",
            supplierProfileSaveFailed: "更新供应商资料失败。",
            supplierConfigRefreshed: "配置已刷新，最近更新：{time}",
            supplierConfigRefreshFailed: "刷新配置失败。",
            supplierConfigEmpty: "配置不能为空。",
            supplierConfigInvalid: "配置必须是 JSON 对象。",
            supplierConfigSaveSuccess: "配置保存成功。",
            supplierConfigSaveFailed: "保存配置失败。",
            managerNeedWallet: "请输入 manager 钱包地址。",
            managerMeta: "角色={role} · 创建时间={created}",
            managerAddSuccess: "Manager 添加成功。",
            managerAddFailed: "添加 manager 失败。",
            managerRemoveSuccess: "Manager 已移除。",
            managerRemoveFailed: "移除 manager 失败。",
            legacyApiMigrated: "检测到旧地址，已自动切换到：{url}",
            localApiMigrated: "检测到本地 API 地址，已自动切换到：{url}"
        }
    }
};

/**
 * 检测用户浏览器的语言
 * 返回 'zh' 如果浏览器语言是中文，否则返回 'en'
 */
function detectLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.toLowerCase().startsWith('zh')) {
        return 'zh';
    }
    return 'en';
}

/**
 * 获取当前语言
 * 优先使用 localStorage 保存的设置，如果没有则自动检测浏览器语言
 */
function getCurrentLanguage() {
    // 检查是否有保存的语言设置
    const saved = localStorage.getItem('meshnet_language');
    if (saved && (saved === 'en' || saved === 'zh')) {
        return saved;
    }
    // 如果没有保存，自动检测浏览器语言
    const detected = detectLanguage();
    localStorage.setItem('meshnet_language', detected);
    return detected;
}

/**
 * 设置语言
 */
function setLanguage(lang) {
    if (i18n[lang]) {
        localStorage.setItem('meshnet_language', lang);
        updatePageLanguage(lang);
    }
}

/**
 * 更新整个页面的语言
 */
function updatePageLanguage(lang) {
    const translations = i18n[lang];
    
    // 更新 HTML lang 属性
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    
    // 更新所有带 data-i18n 属性的元素
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const text = getTranslation(translations, key);
        if (text) {
            // 对于 input 和 button 标签，需要同时设置 value 和 textContent
            if (element.tagName === 'INPUT' || element.tagName === 'BUTTON') {
                element.value = text;
                element.textContent = text;
            } else {
                // 对于其他标签，设置 textContent
                element.textContent = text;
            }
        }
    });
    
    // 更新所有带 data-i18n-html 属性的元素（支持 HTML 内容）
    document.querySelectorAll('[data-i18n-html]').forEach(element => {
        const key = element.getAttribute('data-i18n-html');
        const html = getTranslation(translations, key);
        if (html) {
            element.innerHTML = html;
        }
    });

    // 更新带 data-i18n-placeholder 的元素
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        const text = getTranslation(translations, key);
        if (text) {
            element.setAttribute('placeholder', text);
        }
    });
    
    // 触发自定义事件，允许其他脚本响应语言变化
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
}

/**
 * 递归获取嵌套对象中的翻译文本
 * 例如: getTranslation(translations, 'nav.features') 会获取 translations.nav.features
 */
function getTranslation(translations, path) {
    return path.split('.').reduce((obj, key) => obj?.[key], translations);
}

/**
 * 页面加载完毕后初始化语言
 * 根据浏览器语言自动设置页面语言
 */
document.addEventListener('DOMContentLoaded', function() {
    const currentLang = getCurrentLanguage();
    updatePageLanguage(currentLang);
});

/**
 * 将 i18n 函数暴露到全局作用域，以供其他脚本使用
 */
window.i18n = {
    setLanguage,
    getCurrentLanguage,
    detectLanguage,
    translations: i18n
};
