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
        },
        vendorConsoleEn: {
            // Entry Stage
            entryPrivate: {
                cardKicker: "Private Supplier",
                cardTitle: "Free Tool Access",
                cardDesc: "No wallet login required, directly enter private supplier tools. Used for locally creating and maintaining server connection configurations, without blockchain, public sharing, or data custody.",
                benefits: {
                    quickStart: "Quick Start Tutorial: Configure private supplier from 0 to 1.",
                    local: "Local Configuration Generation: All data processed only in your local browser.",
                    free: "Free to Use: No fees, no on-chain transactions."
                },
                enterButton: "Enter Private Workspace"
            },
            entryCommercial: {
                cardKicker: "Commercial Supplier",
                cardTitle: "On-chain Commercial Access",
                cardDesc: "Connect MetaMask and sign in to authenticate. Commercial suppliers need to select the correct Base network before executing registration, renewal, and withdrawal operations.",
                benefits: {
                    ownership: "On-chain Ownership Verification: Signed supplier profile uniqueness on Base.",
                    settlement: "USDC Revenue Settlement: All commercial transactions settled via USDC on Base.",
                    market: "Protocol Market Access: Once live, your node enters MeshNet index."
                },
                signInButton: "Sign In By MetaMask",
                installMetaMask: "Install MetaMask",
                networkSelect: "Select Network",
                mainnet: "Mainnet",
                sepolia: "Sepolia",
                statusChecking: "Checking wallet environment..."
            },
            // Private Workspace
            privateWorkspace: {
                backButton: "Back",
                title: "Private Workspace",
                modules: {
                    vps: {
                        title: "Purchase & Deploy VPS (Server Setup)",
                        summary: "Connect global computing infrastructure. Choosing the right VPS provider is the beginning of building a high-performance supply node, and with our automation scripts you can become an operator with one click.",
                        features: {
                            vendors: "Vendor Selection: Recommended providers including DigitalOcean (easy), Vultr (global), Hetzner (extreme cost-performance).",
                            script: "Automation Script: Provide sudo bash install.sh one-click installation package, automatically configures kernel forwarding and BBR.",
                            env: "Runtime Environment: Supports Ubuntu 22.04+ and Debian 11+, minimum 512MB RAM for smooth operation.",
                            security: "Security Enhancement: Scripts automatically configure basic firewall and SSH key verification to protect your server from scanning attacks."
                        },
                        actionButton: "Deployment Guide (Deploy)"
                    },
                    config: {
                        title: "Generate Configuration File (Profile Builder)",
                        summary: "Customize decentralized supply node configuration for personal or specific circle use. Generated JSON contains encryption base and x402 payment metadata, supports multi-server aggregation.",
                        features: {
                            easy: "Zero-Threshold Configuration: Simple input of IP, port, password, automatically generates standard sing-box core configuration.",
                            private: "Private Sharing: Configuration stored locally or hosted by you on public Gist, synchronized to friends via URL pull.",
                            direct: "No Intermediaries: Traffic not searched through MeshNet public market, completely your private underground network.",
                            compatible: "Multi-Platform Compatible: One-click generation of unified data structure compliant with full-platform MeshNet App specifications."
                        },
                        actionButton: "Start Configuration (Build)"
                    },
                    import: {
                        title: "Import APP (Client Connect)",
                        summary: "Map configuration to final physical devices. Support Windows, macOS, iOS and Android full-platform MeshNet client quick access solutions.",
                        features: {
                            multi: "Multi-Platform Guide: Detailed installation, import, connection and switching video/illustrated tutorials covering desktop and mobile.",
                            url: "URL Subscription Mode: Demonstration of how to host JSON and achieve permanent configuration synchronization by entering a URL in the client.",
                            monitor: "Real-Time Monitoring: Teach you how to check node latency, traffic load and x402 payment settlement status in the App.",
                            qrcode: "QR Code Quick Share: Generate one-time or persistent configuration QR codes, connect with one scan."
                        },
                        actionButton: "View Tutorial (Tutorial)"
                    },
                    advanced: {
                        title: "Advanced Laboratory (Advanced Labs)",
                        summary: "MeshNet Developer Paradise. If you are proficient in sing-box protocol, you can manually write extremely complex routing rules and traffic splitting logic here.",
                        features: {
                            form: "Form Editing: Each parameter has a dedicated input field, real-time JSON configuration generation",
                            preview: "Real-time Preview: View configuration output while editing, with syntax highlighting support",
                            animation: "Network Animation: Visualize traffic routing, red for direct/green for proxy",
                            docs: "Official Documentation: Built-in sing-box official documentation links, available anytime"
                        },
                        actionButton: "Go to Laboratory (Labs)"
                    }
                },
                // Config Wizard
                config: {
                    parseButton: "📥 Parse Existing JSON",
                    profileId: "Unique Identifier (Profile ID - Pay-Per-Use Commercial Format)",
                    idPlaceholder: "Click generate button on the right",
                    idFormat: "Format: com.mesh.[unique].[version]",
                    generateId: "Generate ID",
                    name: "Supplier Name (Name) *",
                    namePlaceholder: "e.g., MyPrivateNode",
                    description: "Description",
                    descPlaceholder: "Brief description of this node (optional)",
                    servers: "📡 Node Server Configuration (Server Nodes)",
                    addServer: "+ Add Server",
                    buyVps: "☁️ Buy VPS",
                    domains: "🌐 Proxy Domain Suffixes (Domain Suffixes)",
                    domainPlaceholder: "Enter domain or URL, e.g., google.com",
                    addDomain: "Add",
                    domainTip: "Tip: System has forced included official base domains. You can manually add or use presets above.",
                    generatePreview: "Generate and Preview JSON",
                    cancelButton: "Cancel and Return to List"
                },
                // Domain Presets
                domainPresets: {
                    ai: {
                        title: "AI Lab Enhancement",
                        desc: "Support OpenAI, Claude, Google/GitHub Login",
                        icon: "🧠"
                    },
                    shop: {
                        title: "Global E-commerce Acceleration",
                        desc: "Support Amazon, Temu...",
                        icon: "🛍️"
                    }
                },
                // JSON Parser Modal
                parserModal: {
                    title: "Parse JSON Configuration",
                    desc: "Paste your existing JSON text, system will attempt to auto-fill key fields.",
                    placeholder: '{ "id": "com.mesh.xyz.v1", ... }',
                    parseButton: "Parse Now",
                    closeButton: "Close"
                },
                // VPS Guide
                vpsGuide: {
                    title: "Deploy Your Node",
                    subtitle: "Just 4 simple steps, one-click automated construction of your private supply node.",
                    steps: {
                        step1: {
                            title: "Select and Purchase VPS (Purchase VPS)",
                            desc: "Go to your preferred cloud provider to register and deploy a new instance. If no preference, you can choose from our recommended providers below:",
                            providers: {
                                digitalocean: "DigitalOcean",
                                digitaloceanTag: "Easiest Entry-Level VPS",
                                vultr: "Vultr",
                                vultrTag: "Global Data Centers · Hourly Billing",
                                hetzner: "Hetzner",
                                hetznerTag: "Europe's Cost-Performance King"
                            },
                            recommendations: "When purchasing, **recommended** to refer to the following systems and configurations (because our underlying <strong>sing-box</strong> kernel has extremely strong cross-platform compatibility, any mainstream Linux distribution can run perfectly):",
                            os: "OS: Recommended <strong>Debian 11/12</strong> or <strong>Ubuntu 22.04/24.04</strong> (also fully supports CentOS 8+ and other RPM-based systems)",
                            plan: "Plan: Basic Cloud Computing (Basic / Regular Performance is fine)",
                            size: "Size: 512MB RAM or 1GB RAM (about $2.5 - $5/month)",
                            aiPrompt: "💡 Having trouble? Try copying the following prompt to ask AI:",
                            promptText: "\"I need to purchase a VPS for building sing-box nodes. Please help me compare basic plans from DigitalOcean, Vultr and Hetzner. I want Debian 12 system with 1GB RAM. Please give me a detailed beginner-friendly illustrated purchase guide.\""
                        },
                        step2: {
                            title: "Connect to Server via SSH",
                            desc: "After successful purchase, you can find the new server's <strong>IP address</strong> and <strong>Root password</strong> in the VPS console backend. Open Terminal / PowerShell on your computer, enter the following command and press Enter, follow prompts to enter password to connect:",
                            sshCommand: "ssh root@your_server_IP",
                            aiPrompt: "💡 Don't know where Terminal is? Try copying the following prompt to ask AI:",
                            promptText: "\"I'm a complete newbie, I use [Windows 11 / macOS]. I now have a VPS with IP 1.1.1.1 and root password. Please teach me step-by-step how to use built-in [PowerShell / Terminal] to SSH into the server, tell me exactly where to click, what to input, down to every Enter key press.\""
                        },
                        step3: {
                            title: "Run One-Click Installation Script",
                            desc: "After successfully logging into the server, copy and paste the following fully automated installation script to terminal for execution. The script will automatically install kernel enhancements (BBR), configure firewall rules, and deploy sing-box. The entire process takes about 1-2 minutes.",
                            installScript: "bash <(curl -sL https://meshnetprotocol.github.io/install.sh)",
                            forceInstall: "bash <(curl -sL https://meshnetprotocol.github.io/install.sh) --force",
                            forceInstallDesc: "If sing-box already exists on the system, the script will prompt and exit. Execute when needing to force reinstall and overwrite configuration:"
                        },
                        step4: {
                            title: "Get Connection Credentials",
                            desc: "After installation completes, the terminal interface will print a table with green <strong>[SUCCESS]</strong>, containing <b>Server IP</b>, <b>Service Port</b> and <b>Random Password</b>. Please keep these three pieces of information safe.",
                            desc2: "If you forget the port or password, you can execute the following command on the server to view current configuration:",
                            checkCommand: "bash <(curl -sL https://meshnetprotocol.github.io/install.sh) --show"
                        }
                    },
                    footer: {
                        toConfig: "I have the connection credentials, go generate JSON →",
                        back: "Return to List"
                    }
                },
                // Import Guide
                importGuide: {
                    win: "Windows",
                    mac: "macOS",
                    ios: "iOS",
                    android: "Android",
                    selectPlatform: "Please select the corresponding platform to view import instructions.",
                    hosting: "Advanced: Host Configuration via URL",
                    hostingDesc: "You can upload the generated JSON file to GitHub Gist, Pastebin or any public internet object storage (OSS), then directly enter the URL in the APP to achieve multi-terminal synchronous updates.",
                    backButton: "Back"
                },
                // Advanced Editor
                advanced: {
                    desc: "Based on <a href=\"https://sing-box.sagernet.org/\" target=\"_blank\" style=\"color:#6ee7d2;\">sing-box</a> protocol, built-in x402 settlement module. Please modify your original JSON configuration in the editor below.",
                    checkButton: "Check JSON",
                    copyButton: "Copy JSON Data",
                    saveButton: "Save as JSON File",
                    backButton: "Back"
                },
                // Global Prompt Modal
                modal: {
                    notification: "Notification",
                    confirm: "Confirm",
                    cancel: "Cancel"
                }
            }
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
        },
        vendorConsole: {
            // Entry Stage
            entryPrivate: {
                cardKicker: "私人供应商",
                cardTitle: "免费工具入口",
                cardDesc: "无需钱包登录，直接进入私有供应商工具。用于本地创建与维护服务器连接配置，不上链、不公开、不托管任何数据。",
                benefits: {
                    quickStart: "Quick Start 教程：从 0 到 1 配置私有供应商。",
                    local: "本地生成连接配置：所有数据仅在本地浏览器处理。",
                    free: "免费使用，无手续费，无链上写入。"
                },
                enterButton: "进入私人工作空间"
            },
            entryCommercial: {
                cardKicker: "商业供应商",
                cardTitle: "链上商业入口",
                cardDesc: "连接 MetaMask 并签名登录。商业供应商需要选择正确 Base 网络后，才能执行注册、续费与提现操作。",
                benefits: {
                    ownership: "链上权属校验：通过签名的供应商在 Base 上具唯一性。",
                    settlement: "USDC 收益结算：所有商业交易均通过 USDC 在 Base 结算。",
                    market: "协议市场入口：一旦上线，您的节点将进入 MeshNet 索引。"
                },
                signInButton: "通过 MetaMask 登录",
                installMetaMask: "安装 MetaMask",
                networkSelect: "选择网络",
                mainnet: "主网",
                sepolia: "Sepolia 测试网",
                statusChecking: "正在检查钱包环境..."
            },
            // Private Workspace
            privateWorkspace: {
                backButton: "返回",
                title: "私人工作空间",
                modules: {
                    vps: {
                        title: "购买与部署 VPS (Server Setup)",
                        summary: "连接全球算力底座。选择合适的 VPS 服务商是建立高性能供应节点的开端，配合我们的自动化脚本即可一键变身运营商。",
                        features: {
                            vendors: "厂商精选：推荐 DigitalOcean(易用)、Vultr(全球)、Hetzner(极致性价比) 等节点。",
                            script: "自动化脚本：提供 sudo bash install.sh 一键安装包，自动配置内核转发与 BBR。",
                            env: "运行环境：支持 Ubuntu 22.04+ 及 Debian 11+，最小仅需 512MB 内存即可流畅运行。",
                            security: "安全性增强：脚本自动配置基础防火墙与 SSH 密钥校验，保护您的服务器不被扫描攻击。"
                        },
                        actionButton: "部署指引 (Deploy)"
                    },
                    config: {
                        title: "生成配置文件 (Profile Builder)",
                        summary: "为个人或特定圈子定制去中心化供应节点配置。生成的 JSON 包含加密基座与 x402 支付元数据，支持多服务器聚合。",
                        features: {
                            easy: "零门槛配置：傻瓜式输入 IP、端口、密码，自动生成标准 sing-box 核心配置。",
                            private: "私密共享：配置仅存本地或由您托管在公网 Gist，通过 URL 拉取即可同步给好友。",
                            direct: "无中间商：流量不经过 MeshNet 公共市场检索，完全属于您的私有地下网络。",
                            compatible: "多端兼容：一键生成符合全平台 MeshNet App 规范的统一数据结构。"
                        },
                        actionButton: "开始配置 (Build)"
                    },
                    import: {
                        title: "导入 APP (Client Connect)",
                        summary: "将配置映射到最终物理设备。支持 Windows, macOS, iOS 和 Android 全平台 MeshNet 客户端的快速接入方案。",
                        features: {
                            multi: "多平台指引：覆盖桌面端与移动端的详细安装、导入、连接与切换视频/图文教程。",
                            url: "URL 订阅模式：演示如何将 JSON 托管后，在客户端输入一个 URL 实现永久配置同步。",
                            monitor: "状态实时监控：教你如何在 App 中查看节点延迟、流量负荷以及 x402 支付结算状态。",
                            qrcode: "二维码快速共享：生成一次性或持久化的配置二维码，手机一扫即连。"
                        },
                        actionButton: "查看教程 (Tutorial)"
                    },
                    advanced: {
                        title: "高级实验室 (Advanced Labs)",
                        summary: "MeshNet 开发者乐园。如果您精通 sing-box 协议，可以在此手动编写极其复杂的路由规则与分流逻辑。",
                        features: {
                            protocol: "协议深钻：在 sing-box 基础上原生注入 x402 支付协议，支持按量、按时、按次等复杂结算。",
                            routing: "路由自定义：精准控制哪些流量走代理、哪些直连，甚至实现负载均衡与故障切换。",
                            templates: "模板库：内置常用的全平台通用加速模板、流媒体解锁模板等进阶 JSON 片段。",
                            validation: "JSON 语法加固：内置校验引擎，确保您的每一行配置都符合 sing-box / MeshNet 标准。"
                        },
                        actionButton: "前往实验室 (Labs)"
                    }
                },
                // Config Wizard
                config: {
                    parseButton: "📥 解析已有 JSON",
                    profileId: "唯一标识符 (Profile ID - 按量商业格式)",
                    idPlaceholder: "请点击右侧生成按钮",
                    idFormat: "格式：com.mesh.[unique].[version]",
                    generateId: "生成 ID",
                    name: "供应商名称 (Name) *",
                    namePlaceholder: "例如：MyPrivateNode",
                    description: "简介 (Description)",
                    descPlaceholder: "这个节点的简短描述 (可选)",
                    servers: "📡 节点服务器配置 (Server Nodes)",
                    addServer: "+ 增加服务器",
                    buyVps: "☁️ 去购买 VPS",
                    domains: "🌐 代理域名后缀 (Domain Suffixes)",
                    domainPlaceholder: "输入域名或 URL，如 google.com",
                    addDomain: "添加",
                    domainTip: "提示：系统已强制包含官方基础域名。您可以手动添加或使用上方预设。",
                    generatePreview: "生成并预览 JSON",
                    cancelButton: "取消并返回列表"
                },
                // Domain Presets
                domainPresets: {
                    ai: {
                        title: "AI 实验室增强",
                        desc: "支持 OpenAI, Claude, 谷歌/GitHub 登录",
                        icon: "🧠"
                    },
                    shop: {
                        title: "全球电商加速",
                        desc: "支持 Amazon, Temu...",
                        icon: "🛍️"
                    }
                },
                // JSON Parser Modal
                parserModal: {
                    title: "解析 JSON 配置",
                    desc: "粘贴您已有的 JSON 文本，系统将尝试自动回填关键字段。",
                    placeholder: '{ "id": "com.mesh.xyz.v1", ... }',
                    parseButton: "立即解析",
                    closeButton: "关闭"
                },
                // VPS Guide
                vpsGuide: {
                    title: "部署您的节点",
                    subtitle: "只需简单的 4 步，一键自动化构建您的私有供应节点。",
                    steps: {
                        step1: {
                            title: "选择并购买 VPS (Purchase VPS)",
                            desc: "前往您喜欢的云服务商注册并部署一台新实例。如果没有偏好，可以从下方选择我们推荐的厂商：",
                            providers: {
                                digitalocean: "DigitalOcean",
                                digitaloceanTag: "最易用的入门级 VPS",
                                vultr: "Vultr",
                                vultrTag: "全球机房 · 小时计费",
                                hetzner: "Hetzner",
                                hetznerTag: "欧洲性价比之王"
                            },
                            recommendations: "购买时**推荐**参考以下系统与配置（因为我们底层的 <strong>sing-box</strong> 内核拥有极强的跨平台兼容性，只要是主流 Linux 发行版均能完美运行）：",
                            os: "OS (操作系统): 推荐 <strong>Debian 11/12</strong> 或 <strong>Ubuntu 22.04/24.04</strong> （同时也全面支持 CentOS 8+ 等 RPM 系系统）",
                            plan: "Plan: 基础云计算 (Basic / Regular Performance 即可)",
                            size: "Size: 512MB 内存或 1GB 内存 (约 $2.5 - $5/月)",
                            aiPrompt: "💡 遇到困难？尝试复制以下提示词问 AI：",
                            promptText: "\"我需要购买一台用于搭建 sing-box 节点的 VPS。请帮我对比 DigitalOcean, Vultr 和 Hetzner 的基础套餐价格。我希望系统用 Debian 12，内存 1GB。请给我一份具体的新手购买图文步骤指南。\""
                        },
                        step2: {
                            title: "通过 SSH 连接服务器",
                            desc: "购买成功后，在 VPS 控制台后台可以找到新服务器的 <strong>IP 地址</strong> 和 <strong>Root 密码</strong>。打开你电脑上的终端 (Terminal) / PowerShell，输入以下命令并回车，按提示输入密码进行连接：",
                            sshCommand: "ssh root@你的服务器 IP",
                            aiPrompt: "💡 不知道终端在哪里？尝试复制以下提示词问 AI：",
                            promptText: "\"我是一个纯粹的新手小白，我使用的是 [Windows 11 / macOS] 系统。我现在有了一台 VPS，IP 是 1.1.1.1，并且有了 root 密码。请一步步教我如何使用自带的 [PowerShell / 终端] 通过 SSH 登录上这台服务器，请告诉我每一步该点哪里、输入什么，详细到回车键。\""
                        },
                        step3: {
                            title: "运行一键安装脚本",
                            desc: "成功登录服务器后，复制并粘贴下面的全自动安装脚本到终端中执行。脚本会自动安装内核增强 (BBR)、配置防火墙规则，并部署 sing-box。整个过程大约需要 1-2 分钟。",
                            installScript: "bash <(curl -sL https://meshnetprotocol.github.io/install.sh)",
                            forceInstall: "bash <(curl -sL https://meshnetprotocol.github.io/install.sh) --force",
                            forceInstallDesc: "如果系统已存在 sing-box，脚本会提示并退出。需要强制重装并覆盖配置时执行："
                        },
                        step4: {
                            title: "获取连接凭证",
                            desc: "安装完成后，终端界面会打印出一个带有绿色 <strong>[SUCCESS]</strong> 的表格，其中包含 <b>服务器 IP</b>、<b>服务端口 (Port)</b> 和 <b>随机密码 (Password)</b>。请保管好这三个信息。",
                            desc2: "如果忘记了端口或密码，可在服务器上再次执行以下命令查看当前配置：",
                            checkCommand: "bash <(curl -sL https://meshnetprotocol.github.io/install.sh) --show"
                        }
                    },
                    footer: {
                        toConfig: "我已经拿到了连接凭证，去生成 JSON →",
                        back: "返回列表"
                    }
                },
                // Import Guide
                importGuide: {
                    win: "Windows",
                    mac: "macOS",
                    ios: "iOS",
                    android: "Android",
                    selectPlatform: "请选择对应的平台查看导入说明。",
                    hosting: "进阶：通过 URL 托管配置",
                    hostingDesc: "您可以将生成的 JSON 文件上传至 GitHub Gist、Pastebin 或任何公网对象存储（OSS），然后在 APP 中直接输入该 URL 即可实现多端同步更新。",
                    backButton: "返回"
                },
                // Advanced Editor
                advanced: {
                    desc: "基于 <a href=\"https://sing-box.sagernet.org/\" target=\"_blank\" style=\"color:#6ee7d2;\">sing-box</a> 协议，内置 x402 结算模块。请在下方编辑器修改您的原始 JSON 配置。",
                    checkButton: "检查 JSON",
                    copyButton: "复制 JSON 数据",
                    saveButton: "另存为 JSON 文件",
                    backButton: "返回"
                },
                // Global Prompt Modal
                modal: {
                    notification: "Notification",
                    confirm: "确定",
                    cancel: "取消"
                }
            }
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
    console.log('[i18n] Switching to language:', lang);
    const translations = i18n[lang];
    console.log('[i18n] Translations object loaded:', !!translations);
    
    // 检查正确的翻译对象
    const vendorConsoleKey = lang === 'en' ? 'vendorConsoleEn' : 'vendorConsole';
    console.log('[i18n] Using translation key:', vendorConsoleKey, 'exists:', !!translations?.[vendorConsoleKey]);
    
    // 更新 HTML lang 属性
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    
    // 更新所有带 data-i18n 属性的元素
    const elements = document.querySelectorAll('[data-i18n]');
    console.log('[i18n] Found', elements.length, 'elements with data-i18n');
    
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        let text = getTranslation(translations, key);
        
        // 如果找不到翻译，且是英文模式，尝试使用 vendorConsoleEn
        if (!text && lang === 'en' && key.startsWith('vendorConsole.')) {
            const enKey = key.replace('vendorConsole.', 'vendorConsoleEn.');
            console.log('[i18n] Trying English key:', enKey);
            text = getTranslation(translations, enKey);
            if (text) {
                console.log('[i18n] Found translation for:', enKey);
            } else {
                console.warn('[i18n] Still no translation for:', enKey);
            }
        }
        
        if (text) {
            // 对于 input 和 button 标签，需要同时设置 value 和 textContent
            if (element.tagName === 'INPUT' || element.tagName === 'BUTTON') {
                element.value = text;
                element.textContent = text;
            } else {
                // 对于其他标签，设置 textContent
                element.textContent = text;
            }
        } else {
            console.warn('[i18n] Missing translation for key:', key, 'in language:', lang);
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
    
    // 更新语言切换器按钮的激活状态
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.id === `lang-${lang}`) {
            btn.classList.add('active');
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
    
    // 初始化语言切换器按钮事件监听
    const langZhBtn = document.getElementById('lang-zh');
    const langEnBtn = document.getElementById('lang-en');
    
    console.log('[i18n] Language buttons found:', { zh: !!langZhBtn, en: !!langEnBtn });
    
    if (langZhBtn) {
        langZhBtn.addEventListener('click', () => setLanguage('zh'));
    }
    
    if (langEnBtn) {
        langEnBtn.addEventListener('click', () => setLanguage('en'));
    }
});

/**
 * 将 i18n 函数暴露到全局作用域，以供其他脚本使用
 */
window.i18n = {
    setLanguage,
    getCurrentLanguage,
    detectLanguage,
    getTranslation,  // 暴露 getTranslation 函数
    updatePageLanguage,  // 暴露 updatePageLanguage 函数
    translations: i18n
};
