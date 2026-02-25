(function () {
  "use strict";

  const NETWORKS = {
    "base-mainnet": { key: "base-mainnet", name: "Base Mainnet", chainId: 8453 },
    "base-sepolia": { key: "base-sepolia", name: "Base Sepolia", chainId: 84532 },
  };

  const MACHINE = {
    INIT: "INIT",
    WALLET_CONNECTED: "WALLET_CONNECTED",
    BASE_READY: "BASE_READY",
    AUTHENTICATED: "AUTHENTICATED",
    COMMERCIAL_DATA_READY: "COMMERCIAL_DATA_READY",
    TX_PENDING: "TX_PENDING",
    TX_CONFIRMED: "TX_CONFIRMED",
    TX_FAILED: "TX_FAILED",
  };

  const dom = {};

  const state = {
    machine: MACHINE.INIT,
    targetNetwork: "base-mainnet",
    currentNetwork: "unknown",
    walletConnected: false,
    walletAddress: "",
    authenticated: false,
    baseReady: false,
    txPending: false,
    walletEthBalance: 0,
    walletUsdcBalance: 0,
    annualFeeUsdc: 120.0,
    withdrawFeePercent: 1.5,
    treasury: "0x7F8A5d2d0A66f4cBC84f2dF9d015A1c3F734eA95",
    commercialSuppliers: [
      {
        hash: "0xA1fd09b8a2C2B700B5aC4f1800188890AcDdf110",
        supplierId: "mesh.bandwidth.alpha",
        owner: "0x52c53C0e6fA6f38DEb87c34E627E7E31D132D34b",
        profileAddress: "0x2037b9e53f4f4E61D1D88A3f6Ab80B99f2A108D5",
        expiry: "2027-08-12T12:00:00.000Z",
        active: true,
        metadataURI: "ipfs://QmAlphaProfile",
        balanceUsdc: 1368.452122,
      },
      {
        hash: "0xB3cd72f90BfCB5f8B1E450001D8D800A44e97aa2",
        supplierId: "mesh.gateway.orbit",
        owner: "0x3e1836f66A6D51e32A440e6fA95DBf67Cef6E10c",
        profileAddress: "0x880A4bD89CCd75A5fA090dAcf0fA03b8aB2a6b1E",
        expiry: "2026-11-01T00:00:00.000Z",
        active: true,
        metadataURI: "ipfs://QmOrbitProfile",
        balanceUsdc: 420.102011,
      },
      {
        hash: "0xC7e5007a0A5e2A8D0298a31bf31e5D5bBe4E4B12",
        supplierId: "mesh.relay.delta",
        owner: "0xD9A79Dd466B53B04fEF03Da8A72565d54c2b7e26",
        profileAddress: "0x71fDF7D97CC91fd9c4541A334B2d5d5b869Fb2F9",
        expiry: "2026-03-15T08:00:00.000Z",
        active: false,
        metadataURI: "ipfs://QmDeltaProfile",
        balanceUsdc: 42.556,
      },
    ],
    selectedSupplierHash: "",
    privateProfiles: [
      {
        supplierId: "private.lab.mesh",
        metadataURI: "local://private/lab/profile-v2",
        profile: {
          supplierId: "private.lab.mesh",
          endpoints: ["https://edge-01.local", "https://edge-02.local"],
          policy: { visibility: "private", regions: ["us-east", "ap-sg"] },
          auth: { mode: "api_key" },
        },
      },
    ],
  };

  function $(id) {
    return document.getElementById(id);
  }

  function shortAddress(value) {
    if (!value) return "-";
    if (value.length <= 12) return value;
    return `${value.slice(0, 6)}...${value.slice(-4)}`;
  }

  function isAddress(value) {
    return /^0x[a-fA-F0-9]{40}$/.test(String(value || "").trim());
  }

  function setMachine(next) {
    state.machine = next;
    renderMachineBadge();
  }

  function setTextLevel(el, level, text) {
    if (!el) return;
    el.textContent = text;
    el.classList.remove("muted", "success", "warning", "error", "pending");
    el.classList.add(level || "muted");
  }

  function setChipLevel(el, level, text) {
    if (!el) return;
    el.textContent = text;
    el.classList.remove("muted", "success", "warning", "error");
    el.classList.add(level || "muted");
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function selectedSupplier() {
    return state.commercialSuppliers.find((item) => item.hash === state.selectedSupplierHash) || null;
  }

  function formatAmount(value, decimals) {
    return Number(value || 0).toFixed(decimals);
  }

  function setTxPending(on) {
    state.txPending = on;
    document.querySelectorAll(
      "#btn-register-sign-submit, #btn-renew-one-year, #btn-save-metadata, #btn-transfer-owner, #btn-withdraw, #btn-withdraw-all"
    ).forEach((btn) => {
      btn.disabled = on || !state.authenticated || !state.baseReady;
    });
  }

  function setReadinessStep(id, done, active) {
    const el = $(id);
    if (!el) return;
    el.classList.toggle("done", Boolean(done));
    el.classList.toggle("active", Boolean(active));
  }

  function renderReadinessTrack() {
    const walletDone = state.walletConnected;
    const baseDone = state.baseReady;
    const authDone = state.authenticated && state.baseReady;
    const commercialDone = state.machine === MACHINE.COMMERCIAL_DATA_READY
      || state.machine === MACHINE.TX_PENDING
      || state.machine === MACHINE.TX_CONFIRMED;

    const activeWallet = !walletDone;
    const activeBase = walletDone && !baseDone;
    const activeAuth = baseDone && !authDone;
    const activeCommercial = authDone && !commercialDone;

    setReadinessStep("step-wallet", walletDone, activeWallet);
    setReadinessStep("step-base", baseDone, activeBase);
    setReadinessStep("step-auth", authDone, activeAuth);
    setReadinessStep("step-commercial", commercialDone, activeCommercial);
  }

  function updateCommercialLock() {
    const locked = !(state.authenticated && state.baseReady);
    dom.commercialLockOverlay.classList.toggle("hidden", !locked);

    [dom.btnRefreshCommercial, dom.btnOpenRegisterForm].forEach((btn) => {
      btn.disabled = locked || state.txPending;
    });
  }

  function renderMachineBadge() {
    const el = dom.badgeMachine;
    if (!el) return;
    let level = "muted";
    if (state.machine === MACHINE.TX_PENDING) level = "warning";
    if (state.machine === MACHINE.TX_CONFIRMED || state.machine === MACHINE.COMMERCIAL_DATA_READY) level = "success";
    if (state.machine === MACHINE.TX_FAILED) level = "error";
    setChipLevel(el, level, state.machine);
  }

  function renderWalletChain() {
    setChipLevel(dom.badgeWallet, state.walletConnected ? "success" : "muted", state.walletConnected ? shortAddress(state.walletAddress) : "Disconnected");
    if (dom.tileWalletSub) {
      dom.tileWalletSub.textContent = state.walletConnected
        ? (state.authenticated ? "Owner session active" : "Wallet connected, sign-in required")
        : "Sign-in required";
    }

    const targetName = NETWORKS[state.targetNetwork].name;
    const currentName = NETWORKS[state.currentNetwork]?.name || "Unknown";
    if (!state.walletConnected) {
      setChipLevel(dom.badgeChain, "muted", `${targetName} / Not Ready`);
      setChipLevel(dom.topReadyIndicator, "muted", "Base Not Ready");
      if (dom.tileNetworkSub) dom.tileNetworkSub.textContent = `Current: ${currentName} | Target: ${targetName}`;
      return;
    }

    if (state.baseReady) {
      setChipLevel(dom.badgeChain, "success", `${targetName} / Ready`);
      setChipLevel(dom.topReadyIndicator, "success", `${targetName} Ready`);
    } else {
      setChipLevel(dom.badgeChain, "warning", `${targetName} / Not Ready`);
      setChipLevel(dom.topReadyIndicator, "warning", `${targetName} Not Ready`);
    }
    if (dom.tileNetworkSub) dom.tileNetworkSub.textContent = `Current: ${currentName} | Target: ${targetName}`;
  }

  function renderTopStatus() {
    if (!state.walletConnected) {
      setTextLevel(dom.textAuthStatus, "muted", "Connect wallet to unlock Base network checks and supplier operations.");
      return;
    }

    if (state.txPending) {
      setTextLevel(dom.textAuthStatus, "pending", "Transaction pending in simulation. Wait before sending another operation.");
      return;
    }

    if (!state.baseReady) {
      setTextLevel(dom.textAuthStatus, "warning", "Target network changed. Keep wallet on the selected Base network to continue.");
      return;
    }

    if (!state.authenticated) {
      setTextLevel(dom.textAuthStatus, "warning", "Base is ready. Complete sign-in to unlock Commercial workspace.");
      return;
    }

    setTextLevel(dom.textAuthStatus, "success", `Authenticated as ${shortAddress(state.walletAddress)}.`);
  }

  function renderMetrics() {
    dom.textCommercialCount.textContent = String(state.commercialSuppliers.length);
    dom.textAnnualFee.textContent = `${state.annualFeeUsdc.toFixed(2)} USDC`;
    dom.textWithdrawFee.textContent = `${state.withdrawFeePercent.toFixed(2)}%`;
    dom.textTreasury.textContent = state.treasury;
  }

  function renderBalances() {
    if (dom.textBalanceEth) dom.textBalanceEth.textContent = formatAmount(state.walletEthBalance, 4);
    if (dom.textBalanceUsdc) dom.textBalanceUsdc.textContent = formatAmount(state.walletUsdcBalance, 2);
  }

  function renderSupplierList() {
    dom.listCommercialSuppliers.innerHTML = "";

    if (!state.commercialSuppliers.length) {
      dom.emptyCommercialState.classList.remove("hidden");
      return;
    }

    dom.emptyCommercialState.classList.add("hidden");

    state.commercialSuppliers.forEach((item) => {
      const node = document.createElement("button");
      node.type = "button";
      node.className = `supplier-item ${item.hash === state.selectedSupplierHash ? "active" : ""}`;
      node.innerHTML = `
        <span class="supplier-title mono">${item.supplierId}</span>
        <span class="supplier-meta mono">${shortAddress(item.hash)}</span>
        <span class="supplier-meta">Expiry: ${new Date(item.expiry).toLocaleString()}</span>
        <span class="supplier-meta">Active: ${item.active ? "Yes" : "No"}</span>
      `;
      node.addEventListener("click", function () {
        state.selectedSupplierHash = item.hash;
        renderSupplierList();
        renderSelectedSupplier();
        setTextLevel(dom.consoleNotice, "muted", `Selected ${item.supplierId}.`);
      });
      dom.listCommercialSuppliers.appendChild(node);
    });
  }

  function renderSelectedSupplier() {
    const selected = selectedSupplier();
    if (!selected) {
      dom.textSelectedSupplierId.textContent = "-";
      dom.textSelectedOwner.textContent = "-";
      dom.textSelectedProfileAddress.textContent = "-";
      dom.textSelectedExpiry.textContent = "-";
      dom.textSelectedActiveStatus.textContent = "-";
      if (dom.textSelectedProfileBalance) dom.textSelectedProfileBalance.textContent = "-";
      if (dom.textSelectedBalanceUsdc) dom.textSelectedBalanceUsdc.textContent = "-";
      if (dom.tileSupplierSub) dom.tileSupplierSub.textContent = "Select supplier in Commercial workspace";
      dom.inputMetadataURI.value = "";
      return;
    }

    dom.textSelectedSupplierId.textContent = selected.supplierId;
    dom.textSelectedOwner.textContent = selected.owner;
    dom.textSelectedProfileAddress.textContent = selected.profileAddress;
    dom.textSelectedExpiry.textContent = new Date(selected.expiry).toLocaleString();
    dom.textSelectedActiveStatus.textContent = selected.active ? "Yes" : "No";
    if (dom.textSelectedProfileBalance) dom.textSelectedProfileBalance.textContent = `${selected.balanceUsdc.toFixed(6)} USDC`;
    if (dom.textSelectedBalanceUsdc) dom.textSelectedBalanceUsdc.textContent = `${selected.balanceUsdc.toFixed(2)} USDC`;
    if (dom.tileSupplierSub) dom.tileSupplierSub.textContent = `Supplier: ${selected.supplierId}`;
    dom.inputMetadataURI.value = selected.metadataURI;
  }

  function renderPrivateEditor() {
    if (!state.privateProfiles.length) {
      dom.textareaPrivateLocal.value = "";
      return;
    }
    dom.textareaPrivateLocal.value = JSON.stringify(state.privateProfiles[0].profile, null, 2);
  }

  function renderAll() {
    renderMachineBadge();
    renderWalletChain();
    renderReadinessTrack();
    renderTopStatus();
    renderMetrics();
    renderBalances();
    renderSupplierList();
    renderSelectedSupplier();
    renderPrivateEditor();
    updateCommercialLock();
    setTxPending(state.txPending);
  }

  function switchView(view) {
    document.querySelectorAll(".nav-item").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-view") === view);
    });
    document.querySelectorAll(".view").forEach((panel) => {
      panel.classList.toggle("active", panel.getAttribute("data-panel") === view);
    });
  }

  function openRegisterModal(open) {
    dom.registerModal.classList.toggle("hidden", !open);
    dom.registerModal.setAttribute("aria-hidden", open ? "false" : "true");
  }

  async function simulateTx(statusEl, startText, successText, action) {
    if (!(state.authenticated && state.baseReady)) {
      setTextLevel(statusEl, "warning", "Action locked. Connect wallet + Base Ready + Sign-In required.");
      return false;
    }

    setMachine(MACHINE.TX_PENDING);
    setTxPending(true);
    setTextLevel(statusEl, "pending", startText);
    setTextLevel(dom.consoleNotice, "pending", "Simulating on-chain transaction...");
    renderTopStatus();

    await sleep(850);

    try {
      action();
      setMachine(MACHINE.TX_CONFIRMED);
      setTextLevel(statusEl, "success", successText);
      setTextLevel(dom.consoleNotice, "success", "Simulation success. No real transaction was sent.");
      await sleep(280);
      setMachine(MACHINE.COMMERCIAL_DATA_READY);
      return true;
    } catch (error) {
      setMachine(MACHINE.TX_FAILED);
      setTextLevel(statusEl, "error", error?.message || "Simulation failed.");
      setTextLevel(dom.consoleNotice, "error", "Simulation failed. Check fields and retry.");
      return false;
    } finally {
      setTxPending(false);
      renderAll();
    }
  }

  async function handleConnectAndSignIn() {
    if (state.walletConnected && state.authenticated) {
      setTextLevel(dom.consoleNotice, "muted", "Already connected and authenticated.");
      return;
    }

    setTextLevel(dom.consoleNotice, "pending", "Simulating wallet connection...");
    setMachine(MACHINE.WALLET_CONNECTED);
    await sleep(450);

    state.walletConnected = true;
    state.walletAddress = "0x82C0fA4A96891b0Aec4BC3774Da0Aa0E7f6106f8";
    state.currentNetwork = state.targetNetwork;
    state.baseReady = true;
    state.walletEthBalance = 2.8463;
    state.walletUsdcBalance = 1486.24;
    setMachine(MACHINE.BASE_READY);
    renderAll();

    await sleep(450);
    state.authenticated = true;
    setMachine(MACHINE.AUTHENTICATED);
    setTextLevel(dom.consoleNotice, "success", "Sign-in simulated successfully.");

    await sleep(320);
    setMachine(MACHINE.COMMERCIAL_DATA_READY);
    renderAll();
  }

  function handleDisconnect() {
    state.walletConnected = false;
    state.walletAddress = "";
    state.authenticated = false;
    state.baseReady = false;
    state.currentNetwork = "unknown";
    state.walletEthBalance = 0;
    state.walletUsdcBalance = 0;
    setMachine(MACHINE.INIT);
    renderAll();
    setTextLevel(dom.consoleNotice, "muted", "Disconnected. Prototype state reset.");
  }

  async function handleRefreshCommercial() {
    if (!(state.authenticated && state.baseReady)) {
      setTextLevel(dom.consoleNotice, "warning", "Commercial workspace is locked.");
      return;
    }

    setTextLevel(dom.consoleNotice, "pending", "Refreshing supplier list (simulated)...");
    await sleep(520);

    state.commercialSuppliers = state.commercialSuppliers.map((item, idx) => {
      if (idx === 0) {
        return { ...item, active: true };
      }
      return item;
    });

    renderAll();
    setTextLevel(dom.consoleNotice, "success", "Supplier list refreshed.");
  }

  async function handleRegister(event) {
    event.preventDefault();

    const supplierId = dom.inputRegisterSupplierId.value.trim();
    const metadataURI = dom.inputRegisterMetadataURI.value.trim();

    if (!supplierId) {
      setTextLevel(dom.textRegisterStatus, "error", "Supplier ID is required.");
      return;
    }

    if (!metadataURI) {
      setTextLevel(dom.textRegisterStatus, "error", "Metadata URI is required.");
      return;
    }

    const ok = await simulateTx(
      dom.textRegisterStatus,
      "Submitting registration simulation...",
      "Registration simulated successfully.",
      function () {
        const fakeHash = `0x${Math.random().toString(16).slice(2).padEnd(40, "0").slice(0, 40)}`;
        state.commercialSuppliers.unshift({
          hash: fakeHash,
          supplierId,
          owner: state.walletAddress,
          profileAddress: `0x${Math.random().toString(16).slice(2).padEnd(40, "0").slice(0, 40)}`,
          expiry: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
          active: true,
          metadataURI,
          balanceUsdc: 0,
        });
      }
    );

    if (ok) {
      state.selectedSupplierHash = state.commercialSuppliers[0].hash;
      openRegisterModal(false);
      switchView("commercial");
      renderAll();
    }
  }

  async function handleRenew() {
    const selected = selectedSupplier();
    if (!selected) {
      setTextLevel(dom.textRenewStatus, "warning", "Select a supplier first.");
      return;
    }

    await simulateTx(
      dom.textRenewStatus,
      "Submitting renewal simulation...",
      "Renewed for 1 year (simulated).",
      function () {
        const next = new Date(selected.expiry);
        next.setFullYear(next.getFullYear() + 1);
        selected.expiry = next.toISOString();
        selected.active = true;
      }
    );

    renderAll();
  }

  async function handleSaveMetadata() {
    const selected = selectedSupplier();
    if (!selected) {
      setTextLevel(dom.textMetadataStatus, "warning", "Select a supplier first.");
      return;
    }

    const metadataURI = dom.inputMetadataURI.value.trim();
    if (!metadataURI) {
      setTextLevel(dom.textMetadataStatus, "error", "Metadata URI is required.");
      return;
    }

    await simulateTx(
      dom.textMetadataStatus,
      "Submitting metadata update simulation...",
      "Metadata updated (simulated).",
      function () {
        selected.metadataURI = metadataURI;
      }
    );

    renderAll();
  }

  async function handleTransferOwner() {
    const selected = selectedSupplier();
    if (!selected) {
      setTextLevel(dom.textTransferOwnerStatus, "warning", "Select a supplier first.");
      return;
    }

    const newOwner = dom.inputNewOwner.value.trim();
    if (!isAddress(newOwner)) {
      setTextLevel(dom.textTransferOwnerStatus, "error", "Invalid owner address format.");
      return;
    }

    await simulateTx(
      dom.textTransferOwnerStatus,
      "Submitting owner transfer simulation...",
      "Owner transferred (simulated).",
      function () {
        selected.owner = newOwner;
      }
    );

    renderAll();
  }

  function handlePreviewWithdraw() {
    const selected = selectedSupplier();
    if (!selected) {
      setTextLevel(dom.textWithdrawStatus, "warning", "Select a supplier first.");
      return;
    }

    const amount = Number.parseFloat(dom.inputWithdrawAmount.value || "0");
    if (!Number.isFinite(amount) || amount <= 0) {
      setTextLevel(dom.textWithdrawStatus, "error", "Enter a valid positive amount.");
      return;
    }

    const fee = amount * (state.withdrawFeePercent / 100);
    const net = Math.max(amount - fee, 0);

    dom.textWithdrawPreviewFee.textContent = `${fee.toFixed(6)} USDC`;
    dom.textWithdrawPreviewNet.textContent = `${net.toFixed(6)} USDC`;
    setTextLevel(dom.textWithdrawStatus, "pending", "Preview computed from mock fee config.");
  }

  async function handleWithdraw() {
    const selected = selectedSupplier();
    if (!selected) {
      setTextLevel(dom.textWithdrawStatus, "warning", "Select a supplier first.");
      return;
    }

    const amount = Number.parseFloat(dom.inputWithdrawAmount.value || "0");
    const to = dom.inputWithdrawTo.value.trim();

    if (!Number.isFinite(amount) || amount <= 0) {
      setTextLevel(dom.textWithdrawStatus, "error", "Enter a valid positive amount.");
      return;
    }

    if (!isAddress(to)) {
      setTextLevel(dom.textWithdrawStatus, "error", "Invalid recipient address.");
      return;
    }

    await simulateTx(
      dom.textWithdrawStatus,
      "Submitting withdraw simulation...",
      `Withdraw simulated: ${amount.toFixed(6)} USDC.`,
      function () {
        if (amount > selected.balanceUsdc) {
          throw new Error("Insufficient simulated balance.");
        }
        const net = amount * (1 - state.withdrawFeePercent / 100);
        selected.balanceUsdc = Number((selected.balanceUsdc - amount).toFixed(6));
        state.walletUsdcBalance = Number((state.walletUsdcBalance + net).toFixed(2));
      }
    );
    renderAll();
  }

  async function handleWithdrawAll() {
    const selected = selectedSupplier();
    if (!selected) {
      setTextLevel(dom.textWithdrawStatus, "warning", "Select a supplier first.");
      return;
    }

    await simulateTx(
      dom.textWithdrawStatus,
      "Submitting withdraw-all simulation...",
      "Withdraw all simulated successfully.",
      function () {
        const net = selected.balanceUsdc * (1 - state.withdrawFeePercent / 100);
        state.walletUsdcBalance = Number((state.walletUsdcBalance + net).toFixed(2));
        selected.balanceUsdc = 0;
      }
    );
    renderAll();
  }

  async function handleImportFile() {
    const file = dom.filePrivateProfile.files ? dom.filePrivateProfile.files[0] : null;
    if (!file) {
      setTextLevel(dom.textPrivateStatus, "warning", "Select a JSON file first.");
      return;
    }

    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("JSON must be an object.");
      }
      state.privateProfiles[0] = {
        supplierId: parsed.supplierId || "private.uploaded.profile",
        metadataURI: parsed.metadataURI || "local://imported/file",
        profile: parsed,
      };
      renderPrivateEditor();
      setTextLevel(dom.textPrivateStatus, "success", "Private profile imported from file (simulated).");
      setTextLevel(dom.consoleNotice, "success", "File imported into local prototype state.");
    } catch (error) {
      setTextLevel(dom.textPrivateStatus, "error", `File import failed: ${error.message}`);
    }
  }

  async function handleImportUrl() {
    const url = dom.inputPrivateProfileUrl.value.trim();
    if (!url) {
      setTextLevel(dom.textPrivateStatus, "warning", "Enter URL first.");
      return;
    }

    setTextLevel(dom.textPrivateStatus, "pending", "Simulating URL import...");
    await sleep(500);

    const fakeProfile = {
      supplierId: "private.url.profile",
      metadataURI: "local://imported/url",
      sourceUrl: url,
      endpoints: ["https://mock-edge-a.mesh", "https://mock-edge-b.mesh"],
      policy: { visibility: "private", regions: ["eu-fr", "us-west"] },
      auth: { mode: "jwt" },
    };

    state.privateProfiles[0] = {
      supplierId: fakeProfile.supplierId,
      metadataURI: fakeProfile.metadataURI,
      profile: fakeProfile,
    };

    renderPrivateEditor();
    setTextLevel(dom.textPrivateStatus, "success", "Private profile imported from URL (simulated).");
    setTextLevel(dom.consoleNotice, "success", "URL import simulation completed.");
  }

  function handleUpdatePrivateLocal() {
    const raw = dom.textareaPrivateLocal.value.trim();
    if (!raw) {
      setTextLevel(dom.textPrivateStatus, "warning", "Paste JSON first.");
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("JSON must be an object.");
      }

      state.privateProfiles[0] = {
        supplierId: parsed.supplierId || "private.local.edited",
        metadataURI: parsed.metadataURI || "local://edited",
        profile: parsed,
      };

      setTextLevel(dom.textPrivateStatus, "success", "Local private profile updated (simulated).");
      setTextLevel(dom.consoleNotice, "success", "Local JSON validated and saved in memory.");
    } catch (error) {
      setTextLevel(dom.textPrivateStatus, "error", `Invalid JSON: ${error.message}`);
    }
  }

  function bindViewNav() {
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", function () {
        const view = item.getAttribute("data-view") || "overview";
        switchView(view);
      });
    });

    dom.btnGoCommercialView.addEventListener("click", function () {
      switchView("commercial");
    });
  }

  function bindCopyButtons() {
    document.querySelectorAll("[data-copy]").forEach((button) => {
      button.addEventListener("click", async function () {
        const id = button.getAttribute("data-copy");
        const node = document.getElementById(id || "");
        if (!node) return;

        const text = String(node.textContent || "").trim();
        if (!text || text === "-") return;

        try {
          await navigator.clipboard.writeText(text);
          setTextLevel(dom.consoleNotice, "success", "Copied to clipboard.");
        } catch {
          setTextLevel(dom.consoleNotice, "error", "Clipboard permission denied.");
        }
      });
    });
  }

  function bindActions() {
    dom.selectTargetNetwork.addEventListener("change", async function () {
      state.targetNetwork = dom.selectTargetNetwork.value;
      if (!state.walletConnected) {
        state.baseReady = false;
        renderAll();
        setTextLevel(dom.consoleNotice, "muted", "Target network updated. Connect wallet to continue.");
        return;
      }

      state.baseReady = false;
      setMachine(MACHINE.WALLET_CONNECTED);
      renderAll();
      setTextLevel(dom.consoleNotice, "pending", "Auto switching to selected Base network (simulated)...");
      await sleep(420);
      state.currentNetwork = state.targetNetwork;
      state.baseReady = true;
      setMachine(state.authenticated ? MACHINE.AUTHENTICATED : MACHINE.BASE_READY);
      renderAll();
      setTextLevel(dom.consoleNotice, "success", "Network aligned with target selection.");
    });

    dom.btnConnectSignIn.addEventListener("click", handleConnectAndSignIn);
    dom.btnDisconnect.addEventListener("click", handleDisconnect);

    dom.btnRefreshCommercial.addEventListener("click", handleRefreshCommercial);
    dom.btnOpenRegisterForm.addEventListener("click", function () {
      openRegisterModal(true);
    });
    dom.btnCloseRegisterModal.addEventListener("click", function () {
      openRegisterModal(false);
    });

    document.querySelectorAll("[data-close-modal='true']").forEach((node) => {
      node.addEventListener("click", function () {
        openRegisterModal(false);
      });
    });

    dom.formCommercialRegister.addEventListener("submit", handleRegister);
    dom.btnRenewOneYear.addEventListener("click", handleRenew);
    dom.btnSaveMetadata.addEventListener("click", handleSaveMetadata);
    dom.btnTransferOwner.addEventListener("click", handleTransferOwner);
    dom.btnPreviewWithdraw.addEventListener("click", handlePreviewWithdraw);
    dom.btnWithdraw.addEventListener("click", handleWithdraw);
    dom.btnWithdrawAll.addEventListener("click", handleWithdrawAll);

    dom.btnImportPrivateFile.addEventListener("click", handleImportFile);
    dom.btnImportPrivateUrl.addEventListener("click", handleImportUrl);
    dom.btnUpdatePrivateLocal.addEventListener("click", handleUpdatePrivateLocal);

    bindViewNav();
    bindCopyButtons();
  }

  function cacheDom() {
    dom.selectTargetNetwork = $("select-target-network");
    dom.topReadyIndicator = $("top-ready-indicator");
    dom.badgeWallet = $("badge-wallet");
    dom.badgeChain = $("badge-chain");
    dom.badgeMachine = $("badge-machine");

    dom.btnConnectSignIn = $("btn-connect-signin");
    dom.btnDisconnect = $("btn-disconnect");

    dom.textAuthStatus = $("text-auth-status");
    dom.consoleNotice = $("console-notice");

    dom.textCommercialCount = $("text-commercial-count");
    dom.textAnnualFee = $("text-annual-fee");
    dom.textWithdrawFee = $("text-withdraw-fee");
    dom.textTreasury = $("text-treasury");
    dom.textBalanceEth = $("text-balance-eth");
    dom.textBalanceUsdc = $("text-balance-usdc");
    dom.tileWalletSub = $("tile-wallet-sub");
    dom.tileNetworkSub = $("tile-network-sub");

    dom.textSelectedSupplierId = $("text-selected-supplier-id");
    dom.textSelectedOwner = $("text-selected-owner");
    dom.textSelectedProfileAddress = $("text-selected-profile-address");
    dom.textSelectedExpiry = $("text-selected-expiry");
    dom.textSelectedActiveStatus = $("text-selected-active-status");
    dom.textSelectedProfileBalance = $("text-selected-profile-balance");
    dom.textSelectedBalanceUsdc = $("text-selected-balance-usdc");
    dom.tileSupplierSub = $("tile-supplier-sub");

    dom.btnGoCommercialView = $("btn-go-commercial-view");

    dom.btnRefreshCommercial = $("btn-refresh-commercial");
    dom.btnOpenRegisterForm = $("btn-open-register-form");
    dom.listCommercialSuppliers = $("list-commercial-suppliers");
    dom.emptyCommercialState = $("empty-commercial-state");

    dom.btnRenewOneYear = $("btn-renew-one-year");
    dom.textRenewStatus = $("text-renew-status");
    dom.inputMetadataURI = $("input-metadata-uri");
    dom.btnSaveMetadata = $("btn-save-metadata");
    dom.textMetadataStatus = $("text-metadata-status");
    dom.inputNewOwner = $("input-new-owner");
    dom.btnTransferOwner = $("btn-transfer-owner");
    dom.textTransferOwnerStatus = $("text-transfer-owner-status");

    dom.inputWithdrawAmount = $("input-withdraw-amount");
    dom.inputWithdrawTo = $("input-withdraw-to");
    dom.btnPreviewWithdraw = $("btn-preview-withdraw");
    dom.textWithdrawPreviewFee = $("text-withdraw-preview-fee");
    dom.textWithdrawPreviewNet = $("text-withdraw-preview-net");
    dom.btnWithdraw = $("btn-withdraw");
    dom.btnWithdrawAll = $("btn-withdraw-all");
    dom.textWithdrawStatus = $("text-withdraw-status");

    dom.filePrivateProfile = $("file-private-profile");
    dom.btnImportPrivateFile = $("btn-import-private-file");
    dom.inputPrivateProfileUrl = $("input-private-profile-url");
    dom.btnImportPrivateUrl = $("btn-import-private-url");
    dom.textareaPrivateLocal = $("textarea-private-local");
    dom.btnUpdatePrivateLocal = $("btn-update-private-local");
    dom.textPrivateStatus = $("text-private-status");

    dom.commercialLockOverlay = $("commercial-lock-overlay");

    dom.registerModal = $("register-modal");
    dom.btnCloseRegisterModal = $("btn-close-register-modal");
    dom.formCommercialRegister = $("form-commercial-register");
    dom.inputRegisterSupplierId = $("input-register-supplier-id");
    dom.inputRegisterMetadataURI = $("input-register-metadata-uri");
    dom.btnRegisterSignSubmit = $("btn-register-sign-submit");
    dom.textRegisterStatus = $("text-register-status");
  }

  function bootstrap() {
    cacheDom();

    state.selectedSupplierHash = state.commercialSuppliers[0]?.hash || "";
    dom.selectTargetNetwork.value = state.targetNetwork;

    renderAll();
    bindActions();
  }

  document.addEventListener("DOMContentLoaded", bootstrap);
})();
