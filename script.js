let t="⬡ Cyrptix — 🛡 Steganographic Visual Text Encryption 🔐", i=0; setInterval(() => { document.title = t.substring(0, i+1); i = (i + 1) % t.length; }, 150);
/**
 * ============================================================================
 * CYRPTIX — Application Orchestrator v2.0
 * ============================================================================
 *
 * Coordinates:
 *   - Multiview navigation (Home Page vs. Studio Workspace)
 *   - Six decoupled steganographic translation engines
 *   - Web Crypto API pipeline (PBKDF2 SHA-256 600K iterations -> AES-256-GCM 256-bit)
 *   - Zero-Width Invisible detection, inspection, and high-precision copying
 *   - Shared immutable state across module switching
 *   - Dynamic auto-typing footer for "Made with ❤ by Pranav Aitha"
 * ============================================================================
 */

"use strict";

(() => {
  /* ── Cryptographic Constants ───────────────────────────────────────────── */
  const PBKDF2_ITERATIONS = 600_000;
  const SALT_BYTES        = 16;  // 128-bit random salt
  const IV_BYTES          = 12;  // 96-bit random IV (GCM standard)
  const KEY_BIT_LENGTH    = 256; // AES-256

  /* ── Module Metadata Registry ──────────────────────────────────────────── */
  const MODULE_METADATA = {
    emoji: {
      name: "Emoji Matrix",
      icon: "🔮",
      crumb: "🔮 Emoji Matrix",
      desc: "Translates ciphertext into an eye-catching matrix of 65 emojis. Safe for messaging, social bios, and notes."
    },
    invisible: {
      name: "Zero-Width Invisible",
      icon: "👻",
      crumb: "👻 Zero-Width Invisible",
      desc: "Encodes binary bits as non-printable Unicode characters (ZWSP, ZWNJ, ZWJ, WJ). 100% invisible to human eyes."
    },
    runic: {
      name: "Pseudo-Script / Runic",
      icon: "ᚠ",
      crumb: "ᚠ Pseudo-Script / Runic",
      desc: "Translates cryptograms into Elder Futhark Norse inscriptions and ancient medieval script markings."
    },
    occult: {
      name: "Occult & Esoteric",
      icon: "𓆈",
      crumb: "𓆈 Occult & Esoteric",
      desc: "Encodes using Egyptian hieroglyphs, alchemical marks, amogus, musical clefs, and arcane symbols."
    },
    aesthetic: {
      name: "Aesthetic Fraktur",
      icon: "𝔄",
      crumb: "𝔄 Aesthetic Fraktur",
      desc: "Renders cipher payload in Mathematical Gothic Fraktur and Double-Struck characters for a dark academia aesthetic."
    },
    kaomoji: {
      name: "Kaomoji Secret",
      icon: "꒰♡꒱",
      crumb: "꒰♡꒱ Kaomoji Secret",
      desc: "Encodes messages with expressive Japanese ASCII/Unicode face fragments, stars, and playful emoticons."
    }
  };

  /* ── Shared Application State ──────────────────────────────────────────── */
  const state = {
    currentView:     "home",     // "home" | "studio"
    activeModule:    "emoji",    // "emoji" | "invisible" | "runic" | "occult" | "aesthetic" | "kaomoji"
    inputText:       "",
    password:        "",
    lastOutputRaw:   "",         // Unaltered encoded or decrypted output
    inspectInvisible: false,     // Ghost dot preview mode for zero-width
    isProcessing:    false
  };

  /* ── DOM Cache ─────────────────────────────────────────────────────────── */
  const DOM = {};

  /* ── Lifecycle Initialization ──────────────────────────────────────────── */
  document.addEventListener("DOMContentLoaded", () => {
    cacheDOM();
    bindEvents();
    renderView(state.currentView);
    renderActiveModule(state.activeModule);
    initFooterTypewriter();
  });

  function cacheDOM() {
    // Views
    DOM.viewHome            = document.getElementById("view-home");
    DOM.viewStudio          = document.getElementById("view-studio");

    // Header & Nav
    DOM.brandLogo           = document.getElementById("brand-logo-link");
    DOM.navMenu             = document.getElementById("nav-menu");
    DOM.headerStudioBtn     = document.getElementById("header-studio-btn");

    // Home Hero CTAs
    DOM.heroLaunchBtn       = document.getElementById("hero-launch-btn");
    DOM.heroExploreBtn      = document.getElementById("hero-explore-btn");

    // Studio Header & Tabs
    DOM.studioBackBtn       = document.getElementById("studio-back-btn");
    DOM.activeModuleCrumb   = document.getElementById("active-module-crumb");
    DOM.studioModuleTabs    = document.getElementById("studio-module-tabs");

    // Studio Banner
    DOM.bannerModuleIcon    = document.getElementById("banner-module-icon");
    DOM.bannerModuleTitle   = document.getElementById("banner-module-title");
    DOM.bannerModuleDesc    = document.getElementById("banner-module-desc");

    // Inputs & Password
    DOM.inputArea           = document.getElementById("input-area");
    DOM.inputCharCount      = document.getElementById("input-char-count");
    DOM.btnLoadSample       = document.getElementById("btn-load-sample");
    DOM.btnClearInput       = document.getElementById("btn-clear-input");
    DOM.invisibleDetectorPill = document.getElementById("invisible-detector-pill");
    DOM.invisibleCountText  = document.getElementById("invisible-count-text");

    DOM.passwordField       = document.getElementById("password-field");
    DOM.togglePassword      = document.getElementById("toggle-password");
    DOM.strengthMeter       = document.getElementById("strength-meter");
    DOM.strengthLabel       = document.getElementById("strength-label");

    // Primary Buttons
    DOM.encryptBtn          = document.getElementById("encrypt-btn");
    DOM.decryptBtn          = document.getElementById("decrypt-btn");

    // Status & Output
    DOM.statusBar           = document.getElementById("status-bar");
    DOM.statusMessage       = document.getElementById("status-message");
    DOM.invisibleOutputBanner = document.getElementById("invisible-output-banner");
    DOM.invisibleOutputCount = document.getElementById("invisible-output-count");
    DOM.outputWrapper       = document.getElementById("output-wrapper");
    DOM.outputArea          = document.getElementById("output-area");
    DOM.outputCharCount     = document.getElementById("output-char-count");
    DOM.outputMetaNote      = document.getElementById("output-meta-note");

    // Output Tools
    DOM.btnInspectZW        = document.getElementById("btn-inspect-zw");
    DOM.btnSwapToInput      = document.getElementById("btn-swap-to-input");
    DOM.btnCopyOutput       = document.getElementById("btn-copy-output");
    DOM.btnClearOutput      = document.getElementById("btn-clear-output");

    // Footer
    DOM.footerText          = document.getElementById("footer-text");
  }

  /* ── Event Bindings ────────────────────────────────────────────────────── */
  function bindEvents() {
    // Navigation: Logo
    DOM.brandLogo.addEventListener("click", (e) => {
      e.preventDefault();
      switchView("home");
    });

    // Navigation: Header Nav Items
    DOM.navMenu.addEventListener("click", (e) => {
      const target = e.target.closest("button");
      if (!target) return;

      if (target.dataset.nav === "home") {
        switchView("home");
      } else if (target.dataset.moduleNav) {
        selectModule(target.dataset.moduleNav);
        switchView("studio");
      }
    });

    // Header & Hero CTAs
    DOM.headerStudioBtn.addEventListener("click", () => switchView("studio"));
    DOM.heroLaunchBtn.addEventListener("click", () => switchView("studio"));

    // Home Showcase Card Launch Buttons
    document.querySelectorAll("[data-launch-module]").forEach(btn => {
      btn.addEventListener("click", () => {
        const modId = btn.dataset.launchModule;
        selectModule(modId);
        switchView("studio");
      });
    });

    // Studio Back Button
    DOM.studioBackBtn.addEventListener("click", () => switchView("home"));

    // Studio Tab Bar
    DOM.studioModuleTabs.addEventListener("click", (e) => {
      const tab = e.target.closest(".tab-btn");
      if (!tab) return;
      selectModule(tab.dataset.module);
    });

    // Input text changes & Zero-Width scanning
    DOM.inputArea.addEventListener("input", () => {
      state.inputText = DOM.inputArea.value;
      updateInputMetrics();
    });

    // Password changes & Strength analysis
    DOM.passwordField.addEventListener("input", () => {
      state.password = DOM.passwordField.value;
      updatePasswordStrength(state.password);
    });

    // Password visibility toggle
    DOM.togglePassword.addEventListener("click", togglePasswordVisibility);

    // Cryptographic actions
    DOM.encryptBtn.addEventListener("click", handleEncrypt);
    DOM.decryptBtn.addEventListener("click", handleDecrypt);

    // Keyboard shortcut: Ctrl + Enter
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        if (state.currentView !== "studio") switchView("studio");
        handleEncrypt();
      }
    });

    // Utility actions
    DOM.btnLoadSample.addEventListener("click", loadSampleText);
    DOM.btnClearInput.addEventListener("click", clearInput);
    DOM.btnClearOutput.addEventListener("click", clearOutput);
    DOM.btnCopyOutput.addEventListener("click", copyOutputToClipboard);
    DOM.btnSwapToInput.addEventListener("click", swapOutputToInput);

    // Zero-Width Inspector toggle
    DOM.btnInspectZW.addEventListener("click", toggleInvisibleInspection);
  }

  /* ── View & Navigation Management ──────────────────────────────────────── */
  function switchView(viewName) {
    if (state.currentView === viewName) return;
    state.currentView = viewName;
    renderView(viewName);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderView(viewName) {
    if (viewName === "home") {
      DOM.viewHome.classList.add("view-active");
      DOM.viewStudio.classList.remove("view-active");
    } else {
      DOM.viewHome.classList.remove("view-active");
      DOM.viewStudio.classList.add("view-active");
    }

    // Update Header Active Nav Indicator
    document.querySelectorAll(".nav-item").forEach(item => {
      if (viewName === "home" && item.dataset.nav === "home") {
        item.classList.add("active");
      } else if (viewName === "studio" && item.dataset.moduleNav === state.activeModule) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  }

  /* ── Module Switching ──────────────────────────────────────────────────── */
  function selectModule(moduleId) {
    if (!CipherModules[moduleId]) return;
    state.activeModule = moduleId;
    renderActiveModule(moduleId);
  }

  function renderActiveModule(moduleId) {
    const meta = MODULE_METADATA[moduleId] || {
      name: moduleId,
      icon: "🔒",
      crumb: moduleId,
      desc: ""
    };

    // Update Studio Breadcrumb & Banner
    DOM.activeModuleCrumb.textContent = meta.crumb;
    DOM.bannerModuleIcon.textContent  = meta.icon;
    DOM.bannerModuleTitle.textContent = `${meta.name} Module`;
    DOM.bannerModuleDesc.textContent  = meta.desc;

    // Update Studio Tabs
    DOM.studioModuleTabs.querySelectorAll(".tab-btn").forEach(tab => {
      tab.classList.toggle("active", tab.dataset.module === moduleId);
    });

    // Update Header Nav
    document.querySelectorAll("[data-module-nav]").forEach(item => {
      item.classList.toggle("active", item.dataset.moduleNav === moduleId && state.currentView === "studio");
    });

    // Toggle Zero-Width Inspector Button visibility
    if (moduleId === "invisible") {
      DOM.btnInspectZW.style.display = "inline-block";
    } else {
      DOM.btnInspectZW.style.display = "none";
      state.inspectInvisible = false;
      DOM.btnInspectZW.classList.remove("active-tool");
    }

    // Refresh output display if module changed
    renderOutputContent();

    setStatus(`Active Module: ${meta.name}`, "ready");
  }

  /* ── Zero-Width Scanner ────────────────────────────────────────────────── */
  function countZeroWidthChars(text) {
    if (!text) return 0;
    const zwRegex = /[\u200B\u200C\u200D\u2060\uFEFF]/g;
    const matches = text.match(zwRegex);
    return matches ? matches.length : 0;
  }

  function updateInputMetrics() {
    const text = DOM.inputArea.value;
    const len  = text.length;
    DOM.inputCharCount.textContent = `${len} character${len !== 1 ? "s" : ""}`;

    // Scan for zero-width characters
    const zwCount = countZeroWidthChars(text);
    if (zwCount > 0) {
      DOM.invisibleDetectorPill.style.display = "flex";
      DOM.invisibleCountText.textContent = `Detected ${zwCount} Zero-Width Invisible characters in input!`;
    } else {
      DOM.invisibleDetectorPill.style.display = "none";
    }
  }

  /* ── Cryptographic Core (Web Crypto API) ────────────────────────────────── */

  /**
   * Derive a 256-bit AES-GCM key from password + salt via PBKDF2 (SHA-256, 600K rounds).
   */
  async function deriveKey(password, salt) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: PBKDF2_ITERATIONS,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: KEY_BIT_LENGTH },
      false,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Encrypt Plaintext -> [Salt (16) + IV (12) + Ciphertext + Tag] -> Base64.
   */
  async function encryptPipeline(plaintext, password) {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
    const iv   = crypto.getRandomValues(new Uint8Array(IV_BYTES));
    const key  = await deriveKey(password, salt);

    const ciphertextBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      encoder.encode(plaintext)
    );

    // Pack: [Salt(16) | IV(12) | Ciphertext+AuthTag]
    const cipherBytes = new Uint8Array(ciphertextBuffer);
    const packed = new Uint8Array(SALT_BYTES + IV_BYTES + cipherBytes.length);
    packed.set(salt, 0);
    packed.set(iv, SALT_BYTES);
    packed.set(cipherBytes, SALT_BYTES + IV_BYTES);

    return bytesToBase64(packed);
  }

  /**
   * Decrypt Base64 -> Unpack [Salt | IV | Ciphertext] -> AES-GCM -> Plaintext.
   * Throws cleanly on authentication failure (wrong key or tampered payload).
   */
  async function decryptPipeline(base64Payload, password) {
    const packed = base64ToBytes(base64Payload);

    if (packed.length < SALT_BYTES + IV_BYTES + 1) {
      throw new Error("Payload too short to contain valid cryptographic Salt and IV headers");
    }

    const salt       = packed.slice(0, SALT_BYTES);
    const iv         = packed.slice(SALT_BYTES, SALT_BYTES + IV_BYTES);
    const ciphertext = packed.slice(SALT_BYTES + IV_BYTES);

    const key = await deriveKey(password, salt);

    try {
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        key,
        ciphertext
      );
      return new TextDecoder().decode(decryptedBuffer);
    } catch (gcmErr) {
      throw new Error("Decryption failed: Incorrect passphrase or tampered ciphertext payload");
    }
  }

  /* ── Base64 Safe Binary Conversion ──────────────────────────────────────── */
  function bytesToBase64(bytes) {
    let binary = "";
    const len = bytes.length;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function base64ToBytes(b64) {
    let cleanB64 = b64.trim();
    const binary = atob(cleanB64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  /* ── Action Handlers: Encrypt & Decrypt ─────────────────────────────────── */
  async function handleEncrypt() {
    if (state.isProcessing) return;

    const text = DOM.inputArea.value.trim();
    const pass = DOM.passwordField.value;

    if (!text) {
      setStatus("Please enter plaintext to encrypt", "error");
      DOM.inputArea.focus();
      return;
    }
    if (!pass) {
      setStatus("Please enter a master passphrase to secure the encryption key", "error");
      DOM.passwordField.focus();
      return;
    }

    state.isProcessing = true;
    setProcessingUI(true);
    setStatus("Deriving AES-256 key via PBKDF2 (600,000 rounds) & encrypting...", "processing");

    try {
      // 1. Run native Web Crypto AES-GCM
      const base64Cipher = await encryptPipeline(text, pass);

      // 2. Translate through active cipher module
      const module = CipherModules[state.activeModule];
      if (!module) throw new Error(`Cipher module '${state.activeModule}' not found`);

      const encodedStream = module.encode(base64Cipher);

      // 3. Update state & UI
      state.lastOutputRaw = encodedStream;
      displayOutput(encodedStream, `Encrypted via ${module.name}`);
      setStatus("Encryption complete ✓ Payload ready for transport", "success");

    } catch (err) {
      setStatus(`Encryption Error: ${err.message}`, "error");
    } finally {
      state.isProcessing = false;
      setProcessingUI(false);
    }
  }

  async function handleDecrypt() {
    if (state.isProcessing) return;

    const inputData = DOM.inputArea.value;
    const pass = DOM.passwordField.value;

    if (!inputData) {
      setStatus("Please paste the encoded stream to decrypt", "error");
      DOM.inputArea.focus();
      return;
    }
    if (!pass) {
      setStatus("Please enter the passphrase that was used to encrypt this payload", "error");
      DOM.passwordField.focus();
      return;
    }

    state.isProcessing = true;
    setProcessingUI(true);
    setStatus("Decoding visual stream & authenticating with AES-256-GCM...", "processing");

    try {
      const module = CipherModules[state.activeModule];
      if (!module) throw new Error(`Cipher module '${state.activeModule}' not found`);

      // 1. Module Decode (converts emojis, runes, invisible chars, etc. back to base64)
      let base64Cipher;
      try {
        base64Cipher = module.decode(inputData.trim());
      } catch (decodeErr) {
        throw new Error(`Visual decoding error in ${module.name}: ${decodeErr.message}. Ensure you selected the correct cipher module.`);
      }

      // 2. Cryptographic pipeline decryption
      const recoveredPlaintext = await decryptPipeline(base64Cipher, pass);

      // 3. Update state & UI
      state.lastOutputRaw = recoveredPlaintext;
      displayOutput(recoveredPlaintext, "Decrypted Plaintext");
      setStatus("Payload successfully decrypted & verified ✓", "success");

    } catch (err) {
      setStatus(err.message, "error");
    } finally {
      state.isProcessing = false;
      setProcessingUI(false);
    }
  }

  /* ── Output Presentation & Zero-Width Inspection ───────────────────────── */
  function displayOutput(text, metaNote = "Output") {
    state.lastOutputRaw = text;
    DOM.outputMetaNote.textContent = metaNote;

    renderOutputContent();

    // Trigger reveal flicker animation
    DOM.outputArea.classList.remove("reveal-flicker");
    void DOM.outputArea.offsetWidth; // Force CSS reflow
    DOM.outputArea.classList.add("reveal-flicker");
  }

  function renderOutputContent() {
    const raw = state.lastOutputRaw;
    if (!raw) {
      DOM.outputArea.textContent = "";
      DOM.outputCharCount.textContent = "0 characters";
      DOM.invisibleOutputBanner.style.display = "none";
      return;
    }

    const zwCount = countZeroWidthChars(raw);

    // If zero-width characters are present, show the explanation banner
    if (zwCount > 0) {
      DOM.invisibleOutputBanner.style.display = "flex";
      DOM.invisibleOutputCount.textContent = `${zwCount} zero-width invisible characters generated.`;
    } else {
      DOM.invisibleOutputBanner.style.display = "none";
    }

    // Render either inspected ghost dots or raw text
    if (state.activeModule === "invisible" && state.inspectInvisible && CipherModules.invisible.inspect) {
      DOM.outputArea.textContent = CipherModules.invisible.inspect(raw);
    } else {
      DOM.outputArea.textContent = raw;
    }

    const len = raw.length;
    DOM.outputCharCount.textContent = `${len} character${len !== 1 ? "s" : ""}${zwCount > 0 ? ` (${zwCount} invisible)` : ""}`;
  }

  function toggleInvisibleInspection() {
    state.inspectInvisible = !state.inspectInvisible;
    DOM.btnInspectZW.classList.toggle("active-tool", state.inspectInvisible);
    DOM.btnInspectZW.textContent = state.inspectInvisible ? "👁️ Hide Invisible Dots" : "👁️ Inspect Invisible Dots";
    renderOutputContent();
  }

  /* ── Utility Actions ───────────────────────────────────────────────────── */
  async function copyOutputToClipboard() {
    const textToCopy = state.lastOutputRaw;
    if (!textToCopy) {
      setStatus("No output to copy", "error");
      return;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      flashCopySuccess();
    } catch {
      // Fallback
      const tempArea = document.createElement("textarea");
      tempArea.value = textToCopy;
      document.body.appendChild(tempArea);
      tempArea.select();
      document.execCommand("copy");
      document.body.removeChild(tempArea);
      flashCopySuccess();
    }
  }

  function flashCopySuccess() {
    const origText = DOM.btnCopyOutput.textContent;
    DOM.btnCopyOutput.textContent = "✓ Copied!";
    DOM.btnCopyOutput.classList.add("active-tool");
    setStatus("Copied exact payload stream to clipboard ✓", "success");
    setTimeout(() => {
      DOM.btnCopyOutput.textContent = origText;
      DOM.btnCopyOutput.classList.remove("active-tool");
    }, 2000);
  }

  function swapOutputToInput() {
    if (!state.lastOutputRaw) {
      setStatus("No output to transfer", "error");
      return;
    }
    DOM.inputArea.value = state.lastOutputRaw;
    state.inputText = state.lastOutputRaw;
    updateInputMetrics();
    clearOutput();
    setStatus("Output transferred to input — ready to test decryption", "info");
    DOM.inputArea.focus();
  }

  function clearInput() {
    DOM.inputArea.value = "";
    state.inputText = "";
    updateInputMetrics();
    setStatus("Input cleared", "ready");
  }

  function clearOutput() {
    DOM.outputArea.textContent = "";
    state.lastOutputRaw = "";
    state.inspectInvisible = false;
    DOM.btnInspectZW.classList.remove("active-tool");
    DOM.outputCharCount.textContent = "0 characters";
    DOM.invisibleOutputBanner.style.display = "none";
    DOM.outputMetaNote.textContent = "Ready";
  }

  function loadSampleText() {
    const samples = [
      "Top-Secret Mission Dossier: Rendezvous at midnight under the chromium spire.",
      "Cyrptix v2.0 authenticated: Zero network footprints, 600K PBKDF2 rounds, AES-256-GCM.",
      "Private seed phrase: galaxy crystal echo vapor phantom crystal quantum matrix horizon."
    ];
    const picked = samples[Math.floor(Math.random() * samples.length)];
    DOM.inputArea.value = picked;
    state.inputText = picked;
    updateInputMetrics();
    setStatus("Sample text inserted into payload stream", "ready");
  }

  function togglePasswordVisibility() {
    const isPass = DOM.passwordField.type === "password";
    DOM.passwordField.type = isPass ? "text" : "password";
    DOM.togglePassword.textContent = isPass ? "🙈" : "👁️";
  }

  /* ── UI Status & Processing Indicators ─────────────────────────────────── */
  function setStatus(msg, type = "ready") {
    DOM.statusMessage.textContent = msg;
    DOM.statusBar.className = "status-indicator";

    if (type === "processing") DOM.statusBar.classList.add("status-processing");
    else if (type === "success") DOM.statusBar.classList.add("status-success");
    else if (type === "error") DOM.statusBar.classList.add("status-error");
    else DOM.statusBar.classList.add("status-ready");
  }

  function setProcessingUI(processing) {
    DOM.encryptBtn.disabled = processing;
    DOM.decryptBtn.disabled = processing;
  }

  /* ── Password Entropy & Strength Meter ─────────────────────────────────── */
  function updatePasswordStrength(password) {
    if (!password) {
      DOM.strengthMeter.className = "strength-meter";
      DOM.strengthLabel.textContent = "No Passphrase";
      DOM.strengthLabel.style.color = "var(--chrome-dim)";
      return;
    }

    let score = 0;
    if (password.length >= 8)  score += 1;
    if (password.length >= 14) score += 1;
    if (password.length >= 20) score += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    DOM.strengthMeter.className = "strength-meter";

    if (score <= 2) {
      DOM.strengthMeter.classList.add("meter-weak");
      DOM.strengthLabel.textContent = "Weak (Crackable in seconds)";
      DOM.strengthLabel.style.color = "var(--status-error)";
    } else if (score <= 3) {
      DOM.strengthMeter.classList.add("meter-fair");
      DOM.strengthLabel.textContent = "Fair Passphrase";
      DOM.strengthLabel.style.color = "var(--status-warn)";
    } else if (score <= 4) {
      DOM.strengthMeter.classList.add("meter-good");
      DOM.strengthLabel.textContent = "Good (Strong Defense)";
      DOM.strengthLabel.style.color = "var(--status-info)";
    } else {
      DOM.strengthMeter.classList.add("meter-strong");
      DOM.strengthLabel.textContent = "Military-Grade Defense";
      DOM.strengthLabel.style.color = "var(--status-success)";
    }
  }

  /* ── Required Auto-Typing Footer Animation ─────────────────────────────── */
  function initFooterTypewriter() {
    const targetText = "Made with ❤ by Pranav Aitha";
    const el = DOM.footerText;
    if (!el) return;
    el.textContent = "";

    let index = 0;
    function typeNextChar() {
      if (index < targetText.length) {
        el.textContent += targetText[index];
        index++;
        const delay = 65 + Math.random() * 45;
        setTimeout(typeNextChar, delay);
      }
    }

    // Begin typing shortly after page load
    setTimeout(typeNextChar, 600);
  }

})();
