/**
 * ============================================================================
 * CYRPTIX — Cipher Translation Engines
 * ============================================================================
 *
 * Six decoupled, bidirectional translation engines that translate raw
 * ciphertext (Base64 string) into distinct visual aesthetics and back.
 *
 * Every module strictly implements:
 *   encode(base64String: string) -> string
 *   decode(encodedString: string) -> string (throws on invalid/corrupt input)
 *
 * Modules:
 *   1. EmojiMatrix       - 65 vibrant mystical/elemental emojis
 *   2. ZeroWidth         - 100% invisible Unicode characters (bits -> ZW chars)
 *   3. RunicScript       - Elder Futhark & ancient Norse runes
 *   4. OccultEsoteric    - Arcane hieroglyphs, alchemical marks, amogus & symbols
 *   5. AestheticFraktur  - Mathematical Fraktur & Double-Struck typography
 *   6. KaomojiCipher     - Expressive Japanese ASCII / Kaomoji glyphs
 * ============================================================================
 */

"use strict";

const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

/**
 * Universal Grapheme-Aware Bijective Codec Builder
 * Maps each of the 65 Base64 characters to a unique visual grapheme cluster.
 */
function createBijectiveCodec(glyphs, name, id) {
  if (glyphs.length !== 65) {
    throw new Error(`${name}: glyph dictionary must have exactly 65 entries (got ${glyphs.length})`);
  }

  const charToGlyph = {};
  const glyphToChar = {};

  for (let i = 0; i < BASE64_ALPHABET.length; i++) {
    const b64Char = BASE64_ALPHABET[i];
    const glyph = glyphs[i];
    charToGlyph[b64Char] = glyph;
    glyphToChar[glyph] = b64Char;
  }

  function encode(b64) {
    if (typeof b64 !== "string") throw new Error(`${name}: encode expects string input`);
    let output = "";
    for (let i = 0; i < b64.length; i++) {
      const ch = b64[i];
      const g = charToGlyph[ch];
      if (g === undefined) {
        throw new Error(`${name}: illegal character '${ch}' in base64 stream`);
      }
      output += g;
    }
    return output;
  }

  function decode(encoded) {
    if (!encoded || typeof encoded !== "string") {
      throw new Error(`${name}: empty or non-string input`);
    }

    // Segment input by user-perceived grapheme clusters
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    const segments = [...segmenter.segment(encoded)].map(s => s.segment);

    let output = "";
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const ch = glyphToChar[seg];
      if (ch === undefined) {
        throw new Error(`${name}: unrecognized glyph '${seg}' at position ${i + 1}`);
      }
      output += ch;
    }
    return output;
  }

  return { id, name, encode, decode, glyphs };
}


/* ── 1. Emoji Matrix ─────────────────────────────────────────────────────── */

const EmojiMatrix = (() => {
  const GLYPHS = [
    "🔮", "⚡", "🌀", "🔥", "💎", "🌙", "✨", "🎭",
    "🗝️", "🛡️", "⚔️", "🏴", "🌌", "💀", "🐉", "👁️",
    "🦅", "🔱", "🌊", "⏳", "🔒", "🧿", "🪬", "❄️",
    "🫀", "🧬",
    "🍎", "🍋", "🍇", "🍊", "🌶️", "🍒", "🍀", "🌸",
    "🌻", "🍄", "🌿", "🍂", "🌰", "🪨", "🐚", "🦋",
    "🐍", "🦎", "🕷️", "🦂", "🐝", "🐞", "🦀", "🐙",
    "🦑", "🐬",
    "0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣",
    "➕", "➗",
    "⬛"
  ];

  return createBijectiveCodec(GLYPHS, "Emoji Matrix", "emoji");
})();


/* ── 2. Zero-Width Invisible ─────────────────────────────────────────────── */

const ZeroWidth = (() => {
  // Purely zero-width invisible characters - absolutely no standard spaces.
  // 4 distinct invisible characters represent 2-bit dibits (00, 01, 10, 11).
  const ZW_DIBITS = [
    "\u200B", // 00 -> Zero Width Space
    "\u200C", // 01 -> Zero Width Non-Joiner
    "\u200D", // 10 -> Zero Width Joiner
    "\u2060"  // 11 -> Word Joiner
  ];
  const ZW_DELIM = "\uFEFF"; // Zero Width No-Break Space (Byte delimiter)

  const zwToVal = {};
  ZW_DIBITS.forEach((ch, idx) => { zwToVal[ch] = idx; });

  function encode(b64) {
    if (typeof b64 !== "string") throw new Error("Zero-Width: input must be a string");
    const bytes = new TextEncoder().encode(b64);
    const parts = [];
    for (let i = 0; i < bytes.length; i++) {
      const byte = bytes[i];
      let dibitStr = "";
      dibitStr += ZW_DIBITS[(byte >> 6) & 0x03];
      dibitStr += ZW_DIBITS[(byte >> 4) & 0x03];
      dibitStr += ZW_DIBITS[(byte >> 2) & 0x03];
      dibitStr += ZW_DIBITS[byte & 0x03];
      parts.push(dibitStr);
    }
    return parts.join(ZW_DELIM);
  }

  function decode(encoded) {
    if (!encoded || typeof encoded !== "string") {
      throw new Error("Zero-Width: empty input");
    }
    const byteTokens = encoded.split(ZW_DELIM);
    const bytes = new Uint8Array(byteTokens.length);

    for (let i = 0; i < byteTokens.length; i++) {
      const chars = [...byteTokens[i]];
      if (chars.length !== 4) {
        throw new Error(`Zero-Width: corrupted byte token at position ${i + 1} (expected 4 bits, got ${chars.length})`);
      }
      let byte = 0;
      for (let j = 0; j < 4; j++) {
        const val = zwToVal[chars[j]];
        if (val === undefined) {
          throw new Error(`Zero-Width: foreign non-invisible character detected at position ${i + 1}:${j + 1}`);
        }
        byte = (byte << 2) | val;
      }
      bytes[i] = byte;
    }
    return new TextDecoder().decode(bytes);
  }

  /**
   * Helper to inspect invisible characters as luminous visual markers
   */
  function inspect(encoded) {
    if (!encoded) return "";
    let visual = "";
    for (const ch of encoded) {
      if (ch === ZW_DIBITS[0]) visual += "◦"; // 00
      else if (ch === ZW_DIBITS[1]) visual += "•"; // 01
      else if (ch === ZW_DIBITS[2]) visual += "∙"; // 10
      else if (ch === ZW_DIBITS[3]) visual += "·"; // 11
      else if (ch === ZW_DELIM) visual += " | ";
      else visual += ch;
    }
    return visual;
  }

  return { id: "invisible", name: "Zero-Width Invisible", encode, decode, inspect };
})();


/* ── 3. Pseudo-Script / Runic ─────────────────────────────────────────────── */

const RunicScript = (() => {
  const GLYPHS = [
    "ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ",
    "ᚺ", "ᚻ", "ᚼ", "ᚽ", "ᚾ", "ᛁ", "ᛂ", "ᛃ",
    "ᛄ", "ᛅ", "ᛆ", "ᛇ", "ᛈ", "ᛉ", "ᛊ", "ᛋ",
    "ᛌ", "ᛍ",
    "ᛎ", "ᛏ", "ᛐ", "ᛑ", "ᛒ", "ᛓ", "ᛔ", "ᛕ",
    "ᛖ", "ᛗ", "ᛘ", "ᛙ", "ᛚ", "ᛛ", "ᛜ", "ᛝ",
    "ᛞ", "ᛟ", "ᛠ", "ᛡ", "ᛢ", "ᛣ", "ᛤ", "ᛥ",
    "ᛦ", "ᛧ",
    "ᛨ", "ᛩ", "ᛪ", "᛫", "᛬", "᛭", "ᛮ", "ᛯ", "ᛰ", "ᜀ",
    "ᜁ", "ᜂ",
    "ᜃ"
  ];
  return createBijectiveCodec(GLYPHS, "Pseudo-Script / Runic", "runic");
})();


/* ── 4. Occult & Esoteric Glyphs ─────────────────────────────────────────── */

const OccultEsoteric = (() => {
  // Rich esoteric glyph set featuring hieroglyphs, alchemical marks, amogus, musical clefs & occult runes
  const GLYPHS = [
    "𝄞", "ཧ", "𓄧", "༝", "ᢉ", "𐭩", "❀", "☠",
    "⤵", "𓆈", "ඞ", "✽", "✶", "♛", "⟡", "ⓘ",
    "༯", "𓆩", "𓆪", "ひ", "𓃶", "✹", "౨", "ৎ",
    "ᨐ", "𓋼", "𓇢", "𓆸", "𓆹", "𓆺", "𓆻", "𓇲",
    "𓆦", "𓆧", "𓆨", "𓆣", "𓆤", "𓆥", "𓃹", "𓃠",
    "𓃟", "𓃱", "𓃰", "𓃲", "𓃭", "𓃮", "𓃯", "𓆙",
    "𓆚", "𓆛", "𓆓", "𓆕", "𓆖", "𓆗", "𓆘", "𓀠",
    "𓁀", "𓆝", "𓆟", "𓆡", "𓆜", "𓆞", "ঌ", "঍",
    "঎"
  ];
  return createBijectiveCodec(GLYPHS, "Occult & Esoteric", "occult");
})();


/* ── 5. Aesthetic Text (Fraktur & Double-Struck) ─────────────────────────── */

const AestheticFraktur = (() => {
  const GLYPHS = [
    "𝔄", "𝔅", "ℭ", "𝔇", "𝔈", "𝔉", "𝔊", "ℌ",
    "ℑ", "𝔍", "𝔎", "𝔏", "𝔐", "𝔑", "𝔒", "𝔓",
    "𝔔", "ℜ", "𝔖", "𝔗", "𝔘", "𝔙", "𝔚", "𝔛",
    "𝔜", "ℨ",
    "𝔞", "𝔟", "𝔠", "𝔡", "𝔢", "𝔣", "𝔤", "𝔥",
    "𝔦", "𝔧", "𝔨", "𝔩", "𝔪", "𝔫", "𝔬", "𝔭",
    "𝔮", "𝔯", "𝔰", "𝔱", "𝔲", "𝔳", "𝔴", "𝔵",
    "𝔶", "𝔷",
    "𝟘", "𝟙", "𝟚", "𝟛", "𝟜", "𝟝", "𝟞", "𝟟", "𝟠", "𝟡",
    "⊕", "⊘",
    "⊜"
  ];
  return createBijectiveCodec(GLYPHS, "Aesthetic Fraktur", "aesthetic");
})();


/* ── 6. Kaomoji Secret Language ─────────────────────────────────────────── */

const KaomojiCipher = (() => {
  const GLYPHS = [
    "꒰", "꒱", "ᵕ", "˘", "⸝", "⸜", "♡", "˶",
    "ɞ", "⌒", "‿", "◞", "◟", "°", "✧", "ˬ",
    "ˋ", "ˊ", "ᗜ", "ω", "ε", "δ", "▿", "△",
    "◠", "◡",
    "ꈍ", "ᴗ", "˙", "₊", "˚", "⊹", "❀", "♪",
    "⋆", "₍", "₎", "ˏ", "ˎ", "ᐢ", "ᐟ", "꒦",
    "꒷", "˖", "ᶻ", "ᵎ", "ᗢ", "꒳", "∀", "≧",
    "≦", "∇",
    "ɷ", "ᘏ", "ᓚ", "ᓗ", "ᕙ", "ᕗ", "ᑎ", "ᑌ", "ᵔ", "ᯅ",
    "♬", "☆",
    "★"
  ];
  return createBijectiveCodec(GLYPHS, "Kaomoji Cipher", "kaomoji");
})();


/* ── Registry ────────────────────────────────────────────────────────────── */

const CipherModules = {
  emoji:      EmojiMatrix,
  invisible:  ZeroWidth,
  runic:      RunicScript,
  occult:     OccultEsoteric,
  aesthetic:  AestheticFraktur,
  kaomoji:    KaomojiCipher
};

if (typeof window !== "undefined") {
  window.CipherModules = CipherModules;
}
