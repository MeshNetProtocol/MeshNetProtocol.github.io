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
            sectionAuthHelp: "Connect wallet and switch to target Base network for chain-native operations.",
            targetNetworkLabel: "Target Network",
            networkStatusLabel: "Network Status",
            connectSignInButton: "Connect Wallet",
            switchNetworkButton: "Switch to Target Network",
            logoutButton: "Sign Out",
            walletStatusIdle: "Wallet not connected",
            authStatusIdle: "Not signed in",
            privateModeTitle: "Private Supplier",
            privateModeDesc: "Import/update profile locally only. No on-chain registration and no public listing.",
            commercialModeTitle: "Commercial Supplier",
            commercialModeDesc: "On-chain registration and renewal, publicly discoverable, settlement by protocol fee rules.",
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
            managerEmpty: "No managers yet",
            observabilityTitle: "7) System Status and Action Logs",
            observabilityHelp: "Show latest 20 wallet, signature, API and transaction events.",
            clearLogButton: "Clear Logs",
            copyErrorButton: "Copy Latest Error",
            consoleWalletTitle: "1) Wallet Connection and Sign-in",
            walletBadgeLabel: "Wallet",
            chainBadgeLabel: "Network",
            businessModelTitle: "2) Supplier Business Modes",
            businessModelPrivate: "Private Supplier: local import only, free, private, and off-chain.",
            businessModelCommercial: "Commercial Supplier: registration fee, public discoverability, on-chain management, and withdraw support.",
            businessModelBaseUsdc: "Only Base Mainnet / Base Sepolia are supported. Fee settlement uses USDC.",
            commercialListTitle: "3) Commercial Supplier List",
            refreshCommercialButton: "Refresh List",
            openRegisterFormButton: "Open Register Form",
            closeRegisterFormButton: "Hide Register Form",
            emptyCommercialState: "No commercial suppliers found for the connected wallet.",
            commercialRegisterTitle: "4) Commercial Supplier Registration",
            registerSupplierIdLabel: "Supplier ID",
            registerSupplierIdPlaceholder: "mesh.vendor.alpha",
            registerMetadataUriLabel: "Metadata URI",
            registerMetadataUriPlaceholder: "ipfs://...",
            annualFeeLabel: "Annual Fee",
            withdrawFeeLabel: "Withdraw Fee",
            treasuryLabel: "Treasury",
            copyButton: "Copy",
            registerSubmitButton: "Sign and Register Commercial Supplier",
            registerStatusIdle: "No register transaction submitted.",
            commercialDetailTitle: "5) Commercial Supplier Detail",
            selectedSupplierIdLabel: "Supplier ID",
            selectedOwnerLabel: "Owner",
            selectedProfileAddressLabel: "Profile Contract",
            selectedExpiryLabel: "Expiry",
            selectedActiveStatusLabel: "Active",
            renewOneYearButton: "Renew for 1 Year",
            renewStatusIdle: "No renewal submitted.",
            profileManageTitle: "6) Profile Management",
            metadataUriLabel: "Metadata URI",
            saveMetadataButton: "Save Metadata URI",
            metadataStatusIdle: "No metadata update submitted.",
            newOwnerLabel: "New Owner Address",
            transferOwnerButton: "Transfer Owner",
            transferOwnerStatusIdle: "No owner transfer submitted.",
            withdrawTitle: "7) Withdraw",
            withdrawAmountLabel: "Withdraw Amount (USDC)",
            withdrawToLabel: "Withdraw To",
            previewWithdrawButton: "Preview Fee",
            withdrawButton: "Withdraw",
            withdrawAllButton: "Withdraw All",
            withdrawPreviewFeeLabel: "Estimated Fee",
            withdrawPreviewNetLabel: "Estimated Net",
            withdrawStatusIdle: "No withdraw transaction submitted.",
            privateSupplierTitle: "8) Private Supplier",
            privateSupplierHelp: "Private supplier profiles are local-only and are not registered on-chain or listed publicly.",
            privateFileLabel: "Import profile from file",
            importPrivateFileButton: "Import File",
            privateUrlLabel: "Import profile from URL",
            importPrivateUrlButton: "Import URL",
            privateLocalEditorLabel: "Local Profile JSON",
            updatePrivateLocalButton: "Update Local Profile",
            privateStatusIdle: "No private profile imported yet.",
            activityTitle: "9) Activity Timeline",
            clearActivityButton: "Clear Activity",
            commercialLockedHint: "Complete wallet connection, Base network check, and sign-in before managing commercial suppliers.",
            consoleHeroSubtitle: "A Web3 supplier operations console for wallet auth, Base readiness checks, commercial supplier lifecycle, and private profile handling.",
            consolePriorityNote: "Priority content: network readiness, supplier assets, and transaction-critical actions. Secondary tasks are moved into dedicated workspaces.",
            navOverview: "Overview",
            navCommercial: "Commercial",
            navPrivate: "Private",
            metricCommercialCount: "Commercial Suppliers",
            metricAnnualFee: "Annual Fee (USDC)",
            metricWithdrawFee: "Withdraw Fee",
            metricTreasury: "Treasury",
            selectedSupplierOverviewTitle: "Selected Commercial Supplier",
            goCommercialWorkspaceButton: "Open Commercial Workspace",
            commercialWorkspaceTitle: "Commercial Supplier Workspace",
            commercialWorkspaceHelp: "Primary actions: refresh list, register supplier, then run renew/profile/withdraw operations on the selected supplier.",
            renewPanelTitle: "Renewal",
            privateWorkspaceTitle: "Private Supplier Workspace",
            privateWorkspaceHelp: "Local-only import and maintenance. No on-chain registration and no public marketplace listing.",
            closeButton: "Close"
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
            guardNeedAuth: "Please connect wallet first.",
            walletAuthReady: "Wallet connected and network ready.",
            walletAuthNeedNetwork: "Wallet connected. Please switch to target network.",
            chainOnlyHint: "Current phase uses chain-native read flow. This action will be wired to contract write methods in next step.",
            guardNeedNetwork: "Switch to target Base network first.",
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
            apiCorsLocalHint: "Local preview hit CORS on production API. Set API URL to http://127.0.0.1:8787 or test from github.io.",
            logEmpty: "No logs yet",
            logConsoleInit: "Vendor console initialized",
            logWalletConnectStart: "Requesting wallet connection",
            logWalletConnected: "Wallet connected: {address}",
            logSwitchingNetwork: "Switching network to {network}",
            logNetworkSwitched: "Network switched: {network}",
            logSignInStart: "Starting sign-in flow",
            logSignInOk: "Sign-in success: {address}",
            logSessionValid: "Session token is valid",
            logSessionExpired: "Session expired, please sign in again",
            logSupplierRefreshStart: "Refreshing supplier profile",
            logSupplierRefreshOk: "Supplier profile refreshed",
            logSupplierNotBound: "No supplier bound to current wallet",
            logSupplierCreateStart: "Creating supplier",
            logSupplierCreateOk: "Supplier created successfully",
            logSupplierSaveStart: "Saving supplier profile",
            logSupplierSaveOk: "Supplier profile updated",
            logConfigRefreshStart: "Refreshing supplier config",
            logConfigRefreshOk: "Supplier config refreshed",
            logConfigSaveStart: "Saving supplier config",
            logConfigSaveOk: "Supplier config saved",
            logManagerAddStart: "Adding manager wallet",
            logManagerAddOk: "Manager wallet added",
            logManagerRemoveStart: "Removing manager wallet",
            logManagerRemoveOk: "Manager wallet removed",
            logNoErrorToCopy: "No error log to copy",
            logCopiedLatestError: "Copied latest error log",
            logCopyFailed: "Failed to copy log to clipboard",
            networkUnknown: "Unknown network",
            errorEthersMissing: "ethers library is missing. Reload this page and try again.",
            errorUnknown: "Unknown error. Check wallet popup and network settings, then retry.",
            errorUserRejected: "Request rejected in wallet. Approve and retry.",
            badgeDisconnected: "Disconnected",
            readyYes: "Ready",
            readyNo: "Not Ready",
            authStatusTxPending: "Transaction pending. Confirm in wallet and wait for chain confirmation.",
            authStatusDisconnected: "Wallet not connected.",
            authStatusNeedBase: "Wallet connected. Switch to {target} and sign in again.",
            authStatusNeedSign: "Network ready. Click sign-in to authenticate this session.",
            authStatusAuthenticated: "Authenticated: {address} ({state})",
            activityEmpty: "No activity yet.",
            activityCleared: "Activity cleared.",
            activityStateTransition: "State transition: {from} -> {to} ({reason})",
            activitySwitchNetworkStart: "Switching network to {network}.",
            activitySwitchNetworkFailed: "Network switch failed: {error}. Open wallet and retry.",
            activitySwitchNetworkSuccess: "Network switched to {network}.",
            errorWalletNotConnected: "Wallet not connected. Unlock MetaMask and retry.",
            errorNeedBaseReady: "Base target network is required. Switch to {target} and retry.",
            signInMessage: "MeshNetProtocol Supplier Console\nAddress: {address}\nNetwork: {network}\nNonce: {nonce}\nTimestamp: {timestamp}",
            activitySignStart: "Awaiting signature in wallet.",
            activitySignSuccess: "Sign-in completed for {address}.",
            authSignInFailedWithAction: "Sign-in failed: {error}. Check wallet popup/network and retry.",
            activitySignFailed: "Sign-in failed: {error}.",
            commercialCountLine: "Commercial suppliers: {count}",
            errorNeedAuthAction: "Sign in first to continue commercial management.",
            supplierExpiryLine: "Expiry: {expiry}",
            supplierActiveLine: "Active: {active}",
            activityFeeConfigFailed: "Failed to read fee config: {error}.",
            activityCommercialLoadStart: "Loading commercial suppliers from ProtocolRegistry.",
            activityCommercialLoadSuccess: "Commercial supplier list loaded: {count}.",
            commercialLoadFailed: "Failed to load commercial suppliers: {error}. Check network/contract and retry.",
            activityCommercialLoadFailed: "Commercial supplier load failed: {error}.",
            activityTxSubmitted: "Transaction submitted: {hash}.",
            activityTxConfirmed: "{scope} confirmed on-chain.",
            activityTxFailed: "{scope} failed: {error}.",
            registerSupplierIdRequired: "Supplier ID is required. Fill it and retry.",
            registerMetadataRequired: "Metadata URI is required. Fill it and retry.",
            registerStart: "Submitting registration transaction...",
            registerSuccess: "Registration confirmed. Tx: {hash}",
            registerFailed: "Registration failed: {error}. Verify registry fee/authorization and retry.",
            errorNoSelectedSupplier: "Select a commercial supplier from the list first.",
            renewStart: "Submitting one-year renewal transaction...",
            renewSuccess: "Renewal confirmed. Tx: {hash}",
            renewFailed: "Renewal failed: {error}. Check expiry/authorization and retry.",
            metadataSaveStart: "Submitting metadata update transaction...",
            metadataSaveSuccess: "Metadata update confirmed. Tx: {hash}",
            metadataSaveFailed: "Metadata update failed: {error}. Check profile owner permission and retry.",
            transferOwnerAddressRequired: "New owner address is required.",
            errorInvalidAddress: "Address format is invalid. Check and retry.",
            transferOwnerStart: "Submitting owner transfer transaction...",
            transferOwnerSuccess: "Owner transfer confirmed. Tx: {hash}",
            transferOwnerFailed: "Owner transfer failed: {error}. Check owner permission and retry.",
            withdrawAmountInvalid: "Enter a valid positive USDC amount first.",
            withdrawPreviewDone: "Preview done. Fee {fee} USDC, net {net} USDC.",
            withdrawToRequired: "Withdraw destination address is required.",
            withdrawStart: "Submitting withdraw transaction...",
            withdrawSuccess: "Withdraw confirmed. Tx: {hash}",
            withdrawFailed: "Withdraw failed: {error}. Check amount and profile balance, then retry.",
            withdrawAllStart: "Submitting withdraw-all transaction...",
            withdrawAllSuccess: "Withdraw-all confirmed. Tx: {hash}",
            withdrawAllFailed: "Withdraw-all failed: {error}. Check profile contract permissions and retry.",
            privateProfileInvalid: "Profile JSON must be a non-array object.",
            privateProfileSaved: "Private profile saved: {id} (source: {source}, total: {count}).",
            activityPrivateProfileSaved: "Private profile saved: {id} from {source}.",
            privateFileRequired: "Select a JSON file first.",
            privateImportFailed: "Private profile import failed: {error}. Check JSON format and URL/file access.",
            activityPrivateImportFailed: "Private profile import failed: {error}.",
            privateUrlRequired: "Enter a profile URL first.",
            errorHttpStatus: "Request failed with HTTP status {status}.",
            privateLocalRequired: "Paste profile JSON in local editor first.",
            privateUpdateFailed: "Local private profile update failed: {error}.",
            activityPrivateUpdateFailed: "Private profile local update failed: {error}.",
            activityCopied: "Copied: {text}",
            activityCopyFailed: "Copy failed. Check browser clipboard permission.",
            activityDisconnected: "Disconnected local session.",
            yes: "Yes",
            no: "No"
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
            sectionAuthHelp: "连接钱包并切到目标 Base 网络后进行链上操作。",
            targetNetworkLabel: "目标网络",
            networkStatusLabel: "网络状态",
            connectSignInButton: "连接钱包",
            switchNetworkButton: "切换到目标网络",
            logoutButton: "退出登录",
            walletStatusIdle: "钱包未连接",
            authStatusIdle: "未登录",
            privateModeTitle: "私人供应商",
            privateModeDesc: "仅本地导入/更新 profile，不上链，不进入公开市场。",
            commercialModeTitle: "商业供应商",
            commercialModeDesc: "链上注册与续费，对外可检索，按协议费率提现分账。",
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
            managerEmpty: "暂无 manager",
            observabilityTitle: "7) 系统状态与操作日志",
            observabilityHelp: "显示最近 20 条钱包、签名、API、交易事件。",
            clearLogButton: "清空日志",
            copyErrorButton: "复制最近错误",
            consoleWalletTitle: "1) 钱包连接与签名登录",
            walletBadgeLabel: "钱包",
            chainBadgeLabel: "网络",
            businessModelTitle: "2) 供应商业务模式",
            businessModelPrivate: "私人供应商：本地导入、免费、非公开、不上链。",
            businessModelCommercial: "商业供应商：注册费、公开可检索、链上管理、可提现。",
            businessModelBaseUsdc: "仅支持 Base Mainnet / Base Sepolia，费用按 USDC 结算。",
            commercialListTitle: "3) 商业供应商列表",
            refreshCommercialButton: "刷新列表",
            openRegisterFormButton: "打开注册表单",
            closeRegisterFormButton: "收起注册表单",
            emptyCommercialState: "当前钱包暂无商业供应商。",
            commercialRegisterTitle: "4) 商业供应商注册",
            registerSupplierIdLabel: "Supplier ID",
            registerSupplierIdPlaceholder: "mesh.vendor.alpha",
            registerMetadataUriLabel: "Metadata URI",
            registerMetadataUriPlaceholder: "ipfs://...",
            annualFeeLabel: "年费",
            withdrawFeeLabel: "提现费率",
            treasuryLabel: "Treasury",
            copyButton: "复制",
            registerSubmitButton: "签名并注册商业供应商",
            registerStatusIdle: "尚未提交注册交易。",
            commercialDetailTitle: "5) 商业供应商详情",
            selectedSupplierIdLabel: "Supplier ID",
            selectedOwnerLabel: "Owner",
            selectedProfileAddressLabel: "Profile 合约地址",
            selectedExpiryLabel: "到期时间",
            selectedActiveStatusLabel: "是否有效",
            renewOneYearButton: "续费 1 年",
            renewStatusIdle: "尚未提交续费交易。",
            profileManageTitle: "6) Profile 管理",
            metadataUriLabel: "Metadata URI",
            saveMetadataButton: "保存 Metadata URI",
            metadataStatusIdle: "尚未提交 metadata 更新。",
            newOwnerLabel: "新 Owner 地址",
            transferOwnerButton: "转移 Owner",
            transferOwnerStatusIdle: "尚未提交 owner 转移。",
            withdrawTitle: "7) 提现",
            withdrawAmountLabel: "提现金额 (USDC)",
            withdrawToLabel: "提现到地址",
            previewWithdrawButton: "预览手续费",
            withdrawButton: "提现",
            withdrawAllButton: "全部提现",
            withdrawPreviewFeeLabel: "预计手续费",
            withdrawPreviewNetLabel: "预计到账",
            withdrawStatusIdle: "尚未提交提现交易。",
            privateSupplierTitle: "8) 私人供应商",
            privateSupplierHelp: "私人供应商 profile 仅保存在本地，不上链，不进入公开商业市场。",
            privateFileLabel: "从文件导入 Profile",
            importPrivateFileButton: "导入文件",
            privateUrlLabel: "从 URL 导入 Profile",
            importPrivateUrlButton: "导入 URL",
            privateLocalEditorLabel: "本地 Profile JSON",
            updatePrivateLocalButton: "更新本地 Profile",
            privateStatusIdle: "尚未导入私人供应商 profile。",
            activityTitle: "9) 活动日志",
            clearActivityButton: "清空活动",
            commercialLockedHint: "请先完成钱包连接、Base 网络校验与签名登录后再管理商业供应商。",
            consoleHeroSubtitle: "面向 Web3 供应商的链上运营控制台：钱包鉴权、Base 就绪校验、商业供应商全生命周期管理、私人 profile 维护。",
            consolePriorityNote: "优先内容：网络就绪状态、供应商资产与关键链上操作。次要任务放入独立工作区。",
            navOverview: "总览",
            navCommercial: "商业供应商",
            navPrivate: "私人供应商",
            metricCommercialCount: "商业供应商数量",
            metricAnnualFee: "年费 (USDC)",
            metricWithdrawFee: "提现费率",
            metricTreasury: "Treasury",
            selectedSupplierOverviewTitle: "当前选中商业供应商",
            goCommercialWorkspaceButton: "进入商业管理工作区",
            commercialWorkspaceTitle: "商业供应商工作区",
            commercialWorkspaceHelp: "高频操作：刷新列表、注册新供应商，选中后执行续费/profile/提现。",
            renewPanelTitle: "续费",
            privateWorkspaceTitle: "私人供应商工作区",
            privateWorkspaceHelp: "仅本地导入与维护，不上链，不进入公开商业市场。",
            closeButton: "关闭"
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
            guardNeedAuth: "请先连接钱包。",
            walletAuthReady: "钱包已连接且网络已就绪。",
            walletAuthNeedNetwork: "钱包已连接，请先切换到目标网络。",
            chainOnlyHint: "当前阶段为链上优先读取流程，写操作将在下一步接入合约方法。",
            guardNeedNetwork: "请先切换到目标 Base 网络。",
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
            apiCorsLocalHint: "本地预览访问生产 API 触发 CORS。请将 API 地址设为 http://127.0.0.1:8787，或改用 github.io 域名测试。",
            logEmpty: "暂无日志",
            logConsoleInit: "控制台已初始化",
            logWalletConnectStart: "正在请求钱包连接",
            logWalletConnected: "钱包已连接：{address}",
            logSwitchingNetwork: "正在切换网络到 {network}",
            logNetworkSwitched: "网络已切换：{network}",
            logSignInStart: "开始签名登录流程",
            logSignInOk: "登录成功：{address}",
            logSessionValid: "会话 token 有效",
            logSessionExpired: "会话已过期，请重新登录",
            logSupplierRefreshStart: "正在刷新供应商资料",
            logSupplierRefreshOk: "供应商资料已刷新",
            logSupplierNotBound: "当前钱包未绑定供应商",
            logSupplierCreateStart: "正在创建供应商",
            logSupplierCreateOk: "供应商创建成功",
            logSupplierSaveStart: "正在保存供应商资料",
            logSupplierSaveOk: "供应商资料已更新",
            logConfigRefreshStart: "正在刷新供应商配置",
            logConfigRefreshOk: "供应商配置已刷新",
            logConfigSaveStart: "正在保存供应商配置",
            logConfigSaveOk: "供应商配置已保存",
            logManagerAddStart: "正在添加 manager 钱包",
            logManagerAddOk: "manager 钱包添加成功",
            logManagerRemoveStart: "正在移除 manager 钱包",
            logManagerRemoveOk: "manager 钱包已移除",
            logNoErrorToCopy: "没有可复制的错误日志",
            logCopiedLatestError: "已复制最近错误日志",
            logCopyFailed: "复制日志失败",
            networkUnknown: "未知网络",
            errorEthersMissing: "未检测到 ethers 库，请刷新页面后重试。",
            errorUnknown: "发生未知错误。请检查钱包弹窗与网络配置后重试。",
            errorUserRejected: "你在钱包中拒绝了请求，请确认后重试。",
            badgeDisconnected: "未连接",
            readyYes: "已就绪",
            readyNo: "未就绪",
            authStatusTxPending: "交易处理中。请在钱包确认并等待链上确认。",
            authStatusDisconnected: "钱包未连接。",
            authStatusNeedBase: "钱包已连接。请切换到 {target} 并重新签名登录。",
            authStatusNeedSign: "网络已就绪。请点击签名登录完成鉴权。",
            authStatusAuthenticated: "已鉴权：{address}（{state}）",
            activityEmpty: "暂无活动记录。",
            activityCleared: "活动日志已清空。",
            activityStateTransition: "状态流转：{from} -> {to}（{reason}）",
            activitySwitchNetworkStart: "正在切换网络到 {network}。",
            activitySwitchNetworkFailed: "网络切换失败：{error}。请打开钱包确认后重试。",
            activitySwitchNetworkSuccess: "已切换到 {network}。",
            errorWalletNotConnected: "钱包未连接。请先解锁 MetaMask 后重试。",
            errorNeedBaseReady: "需要切换到目标 Base 网络。请切换到 {target} 后重试。",
            signInMessage: "MeshNetProtocol 供应商控制台\n地址: {address}\n网络: {network}\nNonce: {nonce}\n时间: {timestamp}",
            activitySignStart: "等待钱包签名确认。",
            activitySignSuccess: "{address} 签名登录成功。",
            authSignInFailedWithAction: "签名登录失败：{error}。请检查钱包弹窗与网络后重试。",
            activitySignFailed: "签名登录失败：{error}。",
            commercialCountLine: "商业供应商数量：{count}",
            errorNeedAuthAction: "请先完成签名登录，再执行商业管理操作。",
            supplierExpiryLine: "到期时间：{expiry}",
            supplierActiveLine: "是否有效：{active}",
            activityFeeConfigFailed: "读取费率配置失败：{error}。",
            activityCommercialLoadStart: "正在从 ProtocolRegistry 加载商业供应商。",
            activityCommercialLoadSuccess: "商业供应商列表加载完成：{count} 条。",
            commercialLoadFailed: "加载商业供应商失败：{error}。请检查网络与合约地址后重试。",
            activityCommercialLoadFailed: "商业供应商加载失败：{error}。",
            activityTxSubmitted: "交易已提交：{hash}。",
            activityTxConfirmed: "{scope} 已链上确认。",
            activityTxFailed: "{scope} 失败：{error}。",
            registerSupplierIdRequired: "Supplier ID 不能为空，请填写后重试。",
            registerMetadataRequired: "Metadata URI 不能为空，请填写后重试。",
            registerStart: "正在提交注册交易...",
            registerSuccess: "注册已确认，交易：{hash}",
            registerFailed: "注册失败：{error}。请检查注册费与授权参数后重试。",
            errorNoSelectedSupplier: "请先在列表中选择一个商业供应商。",
            renewStart: "正在提交 1 年续费交易...",
            renewSuccess: "续费已确认，交易：{hash}",
            renewFailed: "续费失败：{error}。请检查到期状态与授权参数后重试。",
            metadataSaveStart: "正在提交 metadata 更新交易...",
            metadataSaveSuccess: "metadata 更新已确认，交易：{hash}",
            metadataSaveFailed: "metadata 更新失败：{error}。请确认 profile owner 权限后重试。",
            transferOwnerAddressRequired: "新 owner 地址不能为空。",
            errorInvalidAddress: "地址格式无效，请检查后重试。",
            transferOwnerStart: "正在提交 owner 转移交易...",
            transferOwnerSuccess: "owner 转移已确认，交易：{hash}",
            transferOwnerFailed: "owner 转移失败：{error}。请确认 owner 权限后重试。",
            withdrawAmountInvalid: "请输入有效的正数 USDC 金额。",
            withdrawPreviewDone: "预览完成：手续费 {fee} USDC，到账 {net} USDC。",
            withdrawToRequired: "提现目标地址不能为空。",
            withdrawStart: "正在提交提现交易...",
            withdrawSuccess: "提现已确认，交易：{hash}",
            withdrawFailed: "提现失败：{error}。请检查金额与 profile 余额后重试。",
            withdrawAllStart: "正在提交全部提现交易...",
            withdrawAllSuccess: "全部提现已确认，交易：{hash}",
            withdrawAllFailed: "全部提现失败：{error}。请检查 profile 权限后重试。",
            privateProfileInvalid: "Profile JSON 必须是对象，不能是数组。",
            privateProfileSaved: "私人 profile 已保存：{id}（来源：{source}，总数：{count}）。",
            activityPrivateProfileSaved: "私人 profile 已保存：{id}（来源：{source}）。",
            privateFileRequired: "请先选择一个 JSON 文件。",
            privateImportFailed: "私人 profile 导入失败：{error}。请检查 JSON 格式和 URL/文件可访问性。",
            activityPrivateImportFailed: "私人 profile 导入失败：{error}。",
            privateUrlRequired: "请先输入 profile URL。",
            errorHttpStatus: "请求失败，HTTP 状态码 {status}。",
            privateLocalRequired: "请先在本地编辑器粘贴 profile JSON。",
            privateUpdateFailed: "本地私人 profile 更新失败：{error}。",
            activityPrivateUpdateFailed: "私人 profile 本地更新失败：{error}。",
            activityCopied: "已复制：{text}",
            activityCopyFailed: "复制失败，请检查浏览器剪贴板权限。",
            activityDisconnected: "本地会话已断开。",
            yes: "是",
            no: "否"
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
