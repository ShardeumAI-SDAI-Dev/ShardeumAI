import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ═══════════════════════════════════════════════════════════════
// ═══ THEME SYSTEM ═══
// ═══════════════════════════════════════════════════════════════

const THEMES = {
  dark: {
    bg: "#000000", bgSecondary: "#171717", bgTertiary: "#0d0d0d",
    border: "#2d2d2d", borderLight: "#3d3d3d",
    text: "#ececec", textSecondary: "#8e8ea0", textMuted: "#5c5c5c",
    primary: "#10a37f", primaryLight: "#10a37f22",
    inputBg: "#2d2d2d", hoverBg: "#262626", activeBg: "#404040",
    codeBg: "#282c34", userMsgBg: "#3b82f6", assistantMsgBg: "#1e293b",
    error: "#e0746a", success: "#95d5b2", warning: "#f59e0b",
    shadow: "0 8px 32px rgba(0,0,0,0.4)",
    gradient: "linear-gradient(135deg, #10a37f, #22c55e)",
    overlay: "rgba(0,0,0,0.7)",
  },
  light: {
    bg: "#ffffff", bgSecondary: "#f7f7f8", bgTertiary: "#ffffff",
    border: "#e5e5e5", borderLight: "#d9d9e3",
    text: "#343541", textSecondary: "#6e6e80", textMuted: "#acacbe",
    primary: "#10a37f", primaryLight: "#10a37f15",
    inputBg: "#ffffff", hoverBg: "#f0f0f0", activeBg: "#e3e3e3",
    codeBg: "#f6f8fa", userMsgBg: "#3b82f6", assistantMsgBg: "#f7f7f8",
    error: "#ef4444", success: "#22c55e", warning: "#f59e0b",
    shadow: "0 8px 32px rgba(0,0,0,0.08)",
    gradient: "linear-gradient(135deg, #10a37f, #22c55e)",
    overlay: "rgba(0,0,0,0.3)",
  },
};

function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("shardeumai-theme");
    if (saved && ["dark", "light", "auto"].includes(saved)) return saved;
    return "auto";
  });
  const [resolvedTheme, setResolvedTheme] = useState("dark");

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const resolve = () => {
      const t = theme === "auto" ? (mq.matches ? "dark" : "light") : theme;
      setResolvedTheme(t);
      document.documentElement.setAttribute("data-theme", t);
    };
    resolve();
    mq.addEventListener("change", resolve);
    return () => mq.removeEventListener("change", resolve);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("shardeumai-theme", theme);
  }, [theme]);

  return { theme, setTheme, resolvedTheme };
}

// ── Fonts ──
if (typeof document !== "undefined" && !document.getElementById("app-fonts")) {
  const style = document.createElement("style");
  style.id = "app-fonts";
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
    * { font-family: 'Vazirmatn', 'Inter', system-ui, sans-serif; }
    code, pre, .code-block { font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace !important; }
  `;
  document.head.appendChild(style);
}

// ── Responsive Styles ──
if (typeof document !== "undefined" && !document.getElementById("app-responsive")) {
  const respStyle = document.createElement("style");
  respStyle.id = "app-responsive";
  respStyle.textContent = `
    @media (max-width: 768px) {
      .chat-sidebar { width: 0 !important; min-width: 0 !important; }
      .chat-sidebar.open { width: 260px !important; min-width: 260px !important; position: fixed; z-index: 200; height: 100vh; }
      .chat-sidebar-overlay { display: none; }
      .chat-sidebar-overlay.show { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 199; }
      .chat-main { padding: 0 8px !important; }
      .chat-msg-content { padding: 12px 8px !important; }
      .chat-header { padding: 0 8px !important; }
      .chat-header select { font-size: 11px !important; padding: 2px 4px !important; }
      .chat-input-area { padding: 8px 8px 16px !important; }
      .chat-welcome h1 { font-size: 24px !important; }
      .chat-welcome p { font-size: 14px !important; }
      .chat-avatar { width: 24px !important; height: 24px !important; font-size: 10px !important; }
      .chat-msg-text { font-size: 14px !important; }
      .admin-grid { grid-template-columns: 1fr !important; }
    }
    @media (max-width: 480px) {
      .chat-header { flex-wrap: wrap; gap: 4px !important; height: auto !important; padding: 6px 8px !important; }
      .chat-header > div:first-child { width: 100%; }
      .chat-header > div:last-child { width: 100%; justify-content: flex-start; overflow-x: auto; }
      .chat-welcome-icon { width: 48px !important; height: 48px !important; font-size: 24px !important; }
      .chat-msg-content { gap: 10px !important; }
    }
  `;
  document.head.appendChild(respStyle);
}

// ── Animation Styles ──
if (typeof document !== "undefined" && !document.getElementById("app-animations")) {
  const animStyle = document.createElement("style");
  animStyle.id = "app-animations";
  animStyle.textContent = `
    @keyframes welcomeFadeIn {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes welcomeSlideUp {
      from { opacity: 0; transform: translateY(60px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes welcomeScale {
      from { opacity: 0; transform: scale(0.8); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes welcomeGlow {
      0%, 100% { box-shadow: 0 0 20px rgba(16,163,127,0.3); }
      50% { box-shadow: 0 0 40px rgba(16,163,127,0.6); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    .welcome-anim-1 { animation: welcomeFadeIn 0.8s ease-out 0.2s both; }
    .welcome-anim-2 { animation: welcomeFadeIn 0.8s ease-out 0.5s both; }
    .welcome-anim-3 { animation: welcomeFadeIn 0.8s ease-out 0.8s both; }
    .welcome-anim-4 { animation: welcomeSlideUp 0.8s ease-out 1.1s both; }
    .welcome-logo { animation: welcomeScale 0.6s ease-out 0.1s both, welcomeGlow 3s ease-in-out 1s infinite; }
    .welcome-float { animation: float 3s ease-in-out infinite; }
  `;
  document.head.appendChild(animStyle);
}

const SUPABASE_URL = "https://zzolokpbjkrvkyaubcoq.supabase.co";
const ADMIN_EMAIL = "farhad1984crypto@gmail.com";
const SUPABASE_KEY = "sb_publishable_mxVEWWeumrPEedmA4yD0cg_ZMPgwWYU";
const EDGE_FUNCTION_URL = "https://zzolokpbjkrvkyaubcoq.supabase.co/functions/v1/chat";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const UI_LANGUAGES = [
  { code: "fa", label: "Farsi", flag: "🇮🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Espanol", flag: "🇪🇸" },
  { code: "fr", label: "Francais", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "ru", label: "Russkiy", flag: "🇷🇺" },
  { code: "ar", label: "Arabic", flag: "🇸🇦" },
];

const MODEL_LANGUAGES = [
  { code: "auto", label: "Auto", flag: "🌐" },
  { code: "fa", label: "Farsi", flag: "🇮🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Espanol", flag: "🇪🇸" },
  { code: "fr", label: "Francais", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "ru", label: "Russkiy", flag: "🇷🇺" },
  { code: "ar", label: "Arabic", flag: "🇸🇦" },
];

const AI_MODES = [
  { id: "general", label: "General", prompt: "You are ShardeumAI (SDAI), a helpful bilingual AI assistant. Reply ONLY in Persian (Farsi) or English. Never mix other languages like Chinese, Vietnamese, or any other language into your response. If user writes in Persian, reply fully in Persian. If in English, reply fully in English. Be friendly, accurate, and helpful." },
  { id: "crypto", label: "Crypto", prompt: "You are ShardeumAI (SDAI), a crypto and blockchain expert assistant. You specialize in Shardeum, Ethereum, Bitcoin, DeFi, NFTs, Web3, tokenomics, and market analysis. Reply ONLY in Persian or English, never mix other languages. Give accurate, detailed crypto information." },
  { id: "shardeum", label: "Shardeum", prompt: "You are ShardeumAI (SDAI), a specialized Shardeum blockchain assistant. You have deep knowledge of Shardeum's architecture, SHM token, EVM compatibility, dynamic state sharding, validators, and ecosystem. Reply in the same language the user writes in." },
  { id: "defi", label: "DeFi", prompt: "You are ShardeumAI (SDAI), a DeFi (Decentralized Finance) expert. You specialize in liquidity pools, yield farming, DEXs, lending protocols, staking, and DeFi strategies. Reply in the same language the user writes in." },
  { id: "web3", label: "Web3", prompt: "You are ShardeumAI (SDAI), a Web3 and smart contract expert. You specialize in Solidity, dApps, MetaMask, wallets, NFTs, DAOs, and decentralized technologies. Reply in the same language the user writes in." },
];

const MODELS = [
  { id: "llama-3.1-8b-instant", label: "Llama 3.1", desc: "Fast" },
  { id: "llama-3.3-70b", label: "Llama 3.3", desc: "Smart" },
  { id: "qwen-32b", label: "Qwen 32B", desc: "Multilingual" },
];

const translations = {
  fa: {
    title: "ShardeumAI", subtitle: "Dastyar-e Hoshmand-e Chandzabane",
    placeholder: "Payam khod ra benevisid...", send: "Ersal",
    loginTitle: "Vorud", email: "Email", password: "Ramz-e Obur", login: "Vorud", logout: "Khoruj", signup: "Sabt-e Nam",
    newChat: "Goftegu-ye Jadid", recentChats: "Gofteguha-ye Akhir", noChats: "Goftegui vojud nadarad",
    imageTab: "Tolid-e Akk", chatTab: "Goftegu", profileTab: "Profile", adminTab: "Modiriyat",
    imagePlaceholder: "Tozih-e akk ra benevisid...", generate: "Sakht-e Akk", generating: "Dar hale sakht...",
    welcomeTitle: "ShardeumAI", welcomeSubtitle: "Che kari mitavanam baraye shoma anjam daham?",
    share: "Eshtrak-gozari", export: "Khoruji", copy: "Copy", copied: "Copy shod!",
    model: "Model", language: "Zaban", webSearch: "Josteju-ye Web",
    welcomePageTitle: "Welcome to ShardeumAI", welcomePageSubtitle: "A MultiLingual AI Platform", start: "Shoru'",
  },
  en: {
    title: "ShardeumAI", subtitle: "Your Intelligent Assistant",
    placeholder: "Message ShardeumAI...", send: "Send",
    loginTitle: "Login", email: "Email", password: "Password", login: "Login", logout: "Logout", signup: "Sign up",
    newChat: "New chat", recentChats: "Recent chats", noChats: "No conversations yet",
    imageTab: "Image", chatTab: "Chat", profileTab: "Profile", adminTab: "Admin",
    imagePlaceholder: "Describe the image...", generate: "Generate", generating: "Generating...",
    welcomeTitle: "ShardeumAI", welcomeSubtitle: "What can I help you with?",
    share: "Share", export: "Export", copy: "Copy", copied: "Copied!",
    model: "Model", language: "Language", webSearch: "Web search",
    welcomePageTitle: "Welcome to ShardeumAI", welcomePageSubtitle: "A MultiLingual AI Platform", start: "Start",
  },
  es: {
    title: "ShardeumAI", subtitle: "Tu Asistente Inteligente",
    placeholder: "Escribe tu mensaje...", send: "Enviar",
    loginTitle: "Iniciar sesion", email: "Correo", password: "Contrasena", login: "Entrar", logout: "Salir", signup: "Registrarse",
    newChat: "Nuevo chat", recentChats: "Chats recientes", noChats: "Sin conversaciones",
    imageTab: "Imagen", chatTab: "Chat", profileTab: "Perfil", adminTab: "Admin",
    imagePlaceholder: "Describe la imagen...", generate: "Generar", generating: "Generando...",
    welcomeTitle: "ShardeumAI", welcomeSubtitle: "En que puedo ayudarte?",
    share: "Compartir", export: "Exportar", copy: "Copiar", copied: "Copiado!",
    model: "Modelo", language: "Idioma", webSearch: "Busqueda web",
    welcomePageTitle: "Bienvenido a ShardeumAI", welcomePageSubtitle: "Una Plataforma de IA Multilingue", start: "Comenzar",
  },
  fr: {
    title: "ShardeumAI", subtitle: "Votre Assistant Intelligent",
    placeholder: "Tapez votre message...", send: "Envoyer",
    loginTitle: "Connexion", email: "E-mail", password: "Mot de passe", login: "Connexion", logout: "Deconnexion", signup: "S'inscrire",
    newChat: "Nouveau chat", recentChats: "Chats recents", noChats: "Aucune conversation",
    imageTab: "Image", chatTab: "Chat", profileTab: "Profil", adminTab: "Admin",
    imagePlaceholder: "Decrivez l'image...", generate: "Generer", generating: "Generation...",
    welcomeTitle: "ShardeumAI", welcomeSubtitle: "Comment puis-je vous aider?",
    share: "Partager", export: "Exporter", copy: "Copier", copied: "Copie!",
    model: "Modele", language: "Langue", webSearch: "Recherche web",
    welcomePageTitle: "Bienvenue sur ShardeumAI", welcomePageSubtitle: "Une Plateforme IA Multilingue", start: "Commencer",
  },
  de: {
    title: "ShardeumAI", subtitle: "Ihr Intelligenter Assistent",
    placeholder: "Nachricht eingeben...", send: "Senden",
    loginTitle: "Anmelden", email: "E-Mail", password: "Passwort", login: "Anmelden", logout: "Abmelden", signup: "Registrieren",
    newChat: "Neuer Chat", recentChats: "Letzte Chats", noChats: "Keine Gespraeche",
    imageTab: "Bild", chatTab: "Chat", profileTab: "Profil", adminTab: "Admin",
    imagePlaceholder: "Bild beschreiben...", generate: "Erstellen", generating: "Wird erstellt...",
    welcomeTitle: "ShardeumAI", welcomeSubtitle: "Wie kann ich Ihnen helfen?",
    share: "Teilen", export: "Exportieren", copy: "Kopieren", copied: "Kopiert!",
    model: "Modell", language: "Sprache", webSearch: "Websuche",
    welcomePageTitle: "Willkommen bei ShardeumAI", welcomePageSubtitle: "Eine Mehrsprachige KI-Plattform", start: "Starten",
  },
  ru: {
    title: "ShardeumAI", subtitle: "Vash Intellektualnyy Pomoshchnik",
    placeholder: "Vvedite soobshenie...", send: "Otpravit'",
    loginTitle: "Vkhod", email: "Pochta", password: "Parol'", login: "Voyti", logout: "Vyyti", signup: "Registratsiya",
    newChat: "Novyy chat", recentChats: "Nedavnie chaty", noChats: "Net razgovorov",
    imageTab: "Izobrazhenie", chatTab: "Chat", profileTab: "Profil'", adminTab: "Admin",
    imagePlaceholder: "Opishite izobrazhenie...", generate: "Sozdat'", generating: "Sozdanie...",
    welcomeTitle: "ShardeumAI", welcomeSubtitle: "Chem mogu pomoch'?",
    share: "Podelit'sya", export: "Eksport", copy: "Kopirovat'", copied: "Skopirovano!",
    model: "Model'", language: "Yazyk", webSearch: "Veb-poisk",
    welcomePageTitle: "Dobro pozhalovat' v ShardeumAI", welcomePageSubtitle: "Mnogoyazychnaya Platforma Iskusstvennogo Intellekta", start: "Nachat'",
  },
  ar: {
    title: "ShardeumAI", subtitle: "Musa'iduka al-Thakiy",
    placeholder: "Uktub risalatak...", send: "Irsal",
    loginTitle: "Tasjil al-Dukhul", email: "Al-Bareed", password: "Kalimat al-Murur", login: "Dukhul", logout: "Khoruj", signup: "Insha' Hisab",
    newChat: "Muhadatha Jadida", recentChats: "Al-Muhadathat al-Akhira", noChats: "La Muhadathat",
    imageTab: "Sura", chatTab: "Muhadatha", profileTab: "Al-Milaf", adminTab: "Al-Idara",
    imagePlaceholder: "Sif al-Sura...", generate: "Tawlid", generating: "Jari al-Tawlid...",
    welcomeTitle: "ShardeumAI", welcomeSubtitle: "Kayfa Yumkinuni Musa'adatuka?",
    share: "Musharaka", export: "Tasdir", copy: "Nuskh", copied: "Nusikha!",
    model: "Al-Namudhaj", language: "Al-Lugha", webSearch: "Bahth al-Wib",
    welcomePageTitle: "Ahlan wa Sahlan fi ShardeumAI", welcomePageSubtitle: "Minassat Zaka' Istitna'iyya Mutadaddat al-Lughat", start: "Ibdah",
  },
};

// ── Syntax Highlighting ──
const KC = { kw:"#c678dd", str:"#98c379", cmt:"#5c6370", num:"#d19a66", tag:"#e06c75", attr:"#d19a66" };
function sp(color, text) { return '<span style="color:' + color + '">' + text + '</span>'; }
function esc(s) { return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

function applyKw(text, kws, color) {
  let r = text;
  kws.forEach(kw => {
    r = r.split(new RegExp("(\\b" + kw + "\\b)")).map((p,i) => i%2===1 ? sp(color,p) : p).join("");
  });
  return r;
}

function detectLang(code) {
  const t = code.trim();
  if ((t.startsWith("{") || t.startsWith("[")) && (() => { try { JSON.parse(t); return true; } catch(e) { return false; } })()) return "json";
  if (t.includes("def ") || (t.includes("import ") && t.includes(":"))) return "python";
  if (t.includes("function ") || t.includes("const ") || t.includes("=>") || t.includes("let ") || t.includes("var ")) return "javascript";
  if (t.includes("<html") || t.includes("</div>") || t.includes("<!DOCTYPE")) return "html";
  if (t.includes("sudo ") || t.includes("npm ") || t.includes("pip ") || t.startsWith("$ ")) return "shell";
  if (t.includes("{") && t.includes(":") && t.includes(";")) return "css";
  if (t.includes("SELECT ") || t.includes("FROM ") || t.includes("WHERE ")) return "sql";
  return "";
}

function highlightCode(code, lang) {
  const l = (lang || detectLang(code)).toLowerCase();
  const jsKW = ["const","let","var","function","return","if","else","for","while","class","import","export","from","default","async","await","new","this","typeof","true","false","null","undefined","try","catch","throw","switch","case","break","continue","of","in"];
  const pyKW = ["def","class","import","from","return","if","elif","else","for","while","in","not","and","or","True","False","None","try","except","with","as","pass","break","continue","raise","lambda","yield"];
  const shKW = ["echo","cd","ls","mkdir","rm","cp","mv","git","npm","pip","sudo","curl","wget","chmod","export","if","then","fi","for","do","done","function"];

  if (["js","jsx","ts","tsx","javascript","typescript"].includes(l)) {
    return code.split("\n").map(line => {
      let s = esc(line);
      if (s.trimStart().startsWith("//")) return sp(KC.cmt, s);
      s = s.replace(/(\d+\.?\d*)/g, m => sp(KC.num, m));
      s = applyKw(s, jsKW, KC.kw);
      return s;
    }).join("\n");
  }
  if (["py","python"].includes(l)) {
    return code.split("\n").map(line => {
      let s = esc(line);
      if (s.trimStart().startsWith("#")) return sp(KC.cmt, s);
      s = s.replace(/(\d+\.?\d*)/g, m => sp(KC.num, m));
      s = applyKw(s, pyKW, KC.kw);
      return s;
    }).join("\n");
  }
  if (["html","xml"].includes(l)) {
    return esc(code)
      .replace(/(&lt;\/?)([\w][\w-]*)/g, (_, a, b) => a + sp(KC.tag, b))
      .replace(/([\w][\w-]*)(?==)/g, m => sp(KC.attr, m));
  }
  if (["sh","bash","shell"].includes(l)) {
    return code.split("\n").map(line => {
      let s = esc(line);
      if (s.trimStart().startsWith("#")) return sp(KC.cmt, s);
      s = applyKw(s, shKW, KC.kw);
      return s;
    }).join("\n");
  }
  if (["json"].includes(l)) {
    return esc(code)
      .replace(/("(?:[^"\\]|\\.)*")\s*:/g, m => sp(KC.attr, m.slice(0,-1)) + ":")
      .replace(/:\s*("(?:[^"\\]|\\.)*")/g, (_, s) => ": " + sp(KC.str, s))
      .replace(/:\s*(true|false|null)\b/g, (_, v) => ": " + sp(KC.kw, v))
      .replace(/:\s*(-?\d+\.?\d*)/g, (_, n) => ": " + sp(KC.num, n));
  }
  if (["sql"].includes(l)) {
    const sqlKW = ["SELECT","FROM","WHERE","JOIN","LEFT","RIGHT","INNER","ON","INSERT","UPDATE","DELETE","CREATE","TABLE","INDEX","DROP","ALTER","AND","OR","NOT","IN","IS","NULL","ORDER","BY","GROUP","HAVING","LIMIT","OFFSET","AS","DISTINCT","COUNT","SUM","AVG","MAX","MIN"];
    return applyKw(esc(code), sqlKW, KC.kw);
  }
  return esc(code);
}

function CodeBlock({ code, lang }) {
  const [copied, setCopied] = React.useState(false);
  function handleCopy() {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  const highlighted = highlightCode(code, lang);
  return (
    <div style={{ margin: "12px 0", borderRadius: 10, overflow: "hidden", border: "1px solid #3d4451", direction: "ltr" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#21252b", padding: "7px 14px" }}>
        <span style={{ fontSize: 11, color: "#abb2bf", fontFamily: "monospace" }}>{lang || "code"}</span>
        <button onClick={handleCopy}
          style={{ background: copied ? "#2d6a4f" : "#2c313a", border: "1px solid #3d4451", borderRadius: 5, color: copied ? "#95d5b2" : "#abb2bf", cursor: "pointer", fontSize: 11, padding: "3px 10px", transition: "all 0.2s" }}>
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre style={{ margin: 0, background: "#282c34", overflow: "auto" }}>
        <code dangerouslySetInnerHTML={{ __html: highlighted }}
          style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace", fontSize: 13, lineHeight: 1.7, display: "block", padding: "14px 16px", color: "#abb2bf" }} />
      </pre>
    </div>
  );
}

function exportChat(messages, format) {
  if (!messages || messages.length === 0) return;
  const title = "ShardeumAI Chat Export";
  const date = new Date().toLocaleDateString();
  const NL = "\n";
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }
  if (format === "txt") {
    const text = messages.map(m => "[" + (m.role === "user" ? "You" : "ShardeumAI") + "]" + NL + m.content + NL).join(NL + "---" + NL + NL);
    downloadBlob(new Blob([title + NL + date + NL + NL + text], { type: "text/plain" }), "chat.txt");
  } else if (format === "md") {
    const md = messages.map(m => "### " + (m.role === "user" ? "You" : "ShardeumAI") + NL + NL + m.content).join(NL + NL + "---" + NL + NL);
    downloadBlob(new Blob(["# " + title + NL + "_" + date + "_" + NL + NL + md], { type: "text/markdown" }), "chat.md");
  } else if (format === "html") {
    const rows = messages.map(m => {
      const isUser = m.role === "user";
      const bg = isUser ? "#3b82f6" : "#1e293b";
      const align = isUser ? "flex-end" : "flex-start";
      const safe = m.content.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      return '<div style="margin:12px 0;display:flex;justify-content:' + align + '"><div style="max-width:80%;padding:10px 14px;border-radius:12px;background:' + bg + ';color:#fff;font-size:14px;line-height:1.7;white-space:pre-wrap">' + safe + '</div></div>';
    }).join(NL);
    const htmlHead = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + title + '</title><style>body{background:#0b1120;font-family:system-ui,sans-serif;padding:20px;max-width:800px;margin:0 auto}h1{color:#3b82f6}p{color:#9aa4b2}</style></head><body><h1>' + title + '</h1><p>' + date + '</p>';
    downloadBlob(new Blob([htmlHead + rows + '</body></html>'], { type: "text/html" }), "chat.html");
  } else if (format === "pdf") {
    const rows = messages.map(m => {
      const isUser = m.role === "user";
      const bg = isUser ? "#3b82f6" : "#1e293b";
      const align = isUser ? "right" : "left";
      const safe = m.content.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      return '<div style="margin:12px 0;padding:10px 14px;border-radius:8px;background:' + bg + ';color:#fff;text-align:' + align + ';white-space:pre-wrap">' + safe + '</div>';
    }).join(NL);
    const htmlHead = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + title + '</title><style>body{font-family:Arial,sans-serif;padding:20px;max-width:700px;margin:0 auto}h1{color:#3b82f6;border-bottom:2px solid #3b82f6;padding-bottom:8px}</style></head><body><h1>' + title + '</h1><p style="color:#666">' + date + '</p>';
    const win = window.open("", "_blank");
    if (win) { win.document.write(htmlHead + rows + '</body></html>'); win.document.close(); win.print(); }
  }
}

function ImageGenerator({ t, isRTL }) {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate(e) {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true); setError(""); setImageUrl("");
    try {
      const encoded = encodeURIComponent(prompt.trim());
      const seed = Math.floor(Math.random() * 1000000);
      const url = `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&seed=${seed}&nologo=true`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("error");
      const blob = await res.blob();
      setImageUrl(URL.createObjectURL(blob));
    } catch { setError(t.imageError || "Error"); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 16, direction: isRTL ? "rtl" : "ltr", maxWidth: 800, margin: "0 auto", width: "100%", padding: "20px 0" }}>
      <form onSubmit={handleGenerate} style={{ display: "flex", gap: 10 }}>
        <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={t.imagePlaceholder}
          disabled={loading}
          style={{ flex: 1, padding: "12px 16px", borderRadius: 12, border: "1px solid #2d2d2d", background: "#2d2d2d", color: "#ececec", fontSize: 14, outline: "none" }} />
        <button type="submit" disabled={!prompt.trim() || loading}
          style={{ padding: "12px 24px", borderRadius: 12, border: "none", background: "#10a37f", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
          {loading ? t.generating : t.generate}
        </button>
      </form>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 16, border: "1px solid #2d2d2d", background: "#171717", overflow: "hidden", minHeight: 300 }}>
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, color: "#8e8ea0" }}>
            <div style={{ width: 40, height: 40, border: "3px solid #2d2d2d", borderTop: "3px solid #10a37f", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: 13 }}>{t.generating}</span>
          </div>
        )}
        {error && <p style={{ color: "#e0746a", fontSize: 13 }}>{error}</p>}
        {imageUrl && !loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 16 }}>
            <img src={imageUrl} alt="generated" style={{ maxWidth: "100%", maxHeight: 400, borderRadius: 12, boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }} />
            <a href={imageUrl} download="shardeumai-image.png"
              style={{ padding: "8px 20px", borderRadius: 999, background: "#2d2d2d", color: "#ececec", fontSize: 12, textDecoration: "none", border: "1px solid #3d3d3d" }}>
              Download
            </a>
          </div>
        )}
        {!imageUrl && !loading && !error && (
          <p style={{ color: "#5c5c5c", fontSize: 13 }}>{t.imagePlaceholder}</p>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ═══ WELCOME PAGE ═══
// ═══════════════════════════════════════════════════════════════

function WelcomePage({ t, th, theme, setTheme, uiLang, setUiLang, onStart }) {
  const isRTL = uiLang === "fa" || uiLang === "ar";

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: th.bg,
      color: th.text,
      direction: isRTL ? "rtl" : "ltr",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: "10%", left: "10%", width: 300, height: 300,
        borderRadius: "50%", background: th.primary, opacity: 0.03, filter: "blur(80px)",
      }} />
      <div style={{
        position: "absolute", bottom: "10%", right: "10%", width: 400, height: 400,
        borderRadius: "50%", background: th.primary, opacity: 0.02, filter: "blur(100px)",
      }} />

      <div className="welcome-anim-1" style={{
        position: "absolute", top: 24, right: 24,
        display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end",
      }}>
        {UI_LANGUAGES.map(lang => (
          <button key={lang.code} onClick={() => setUiLang(lang.code)}
            style={{
              padding: "4px 10px", borderRadius: 6,
              border: `1px solid ${uiLang === lang.code ? th.primary : th.border}`,
              background: uiLang === lang.code ? th.primaryLight : "transparent",
              color: uiLang === lang.code ? th.primary : th.textSecondary,
              fontSize: 12, cursor: "pointer", transition: "all 0.2s",
            }}>
            {lang.flag} {lang.label}
          </button>
        ))}
      </div>

      <div className="welcome-anim-1" style={{ position: "absolute", top: 24, left: 24, display: "flex", gap: 4 }}>
        {[
          { id: "light", icon: "☀️", label: "Light" },
          { id: "dark", icon: "🌙", label: "Dark" },
          { id: "auto", icon: "⚙️", label: "Auto" },
        ].map(toggle => (
          <button key={toggle.id} onClick={() => setTheme(toggle.id)}
            title={toggle.label}
            style={{
              padding: "6px 10px", borderRadius: 8,
              border: `1px solid ${theme === toggle.id ? th.primary : th.border}`,
              background: theme === toggle.id ? th.primaryLight : "transparent",
              color: theme === toggle.id ? th.primary : th.textSecondary,
              fontSize: 14, cursor: "pointer", transition: "all 0.2s",
            }}>
            {toggle.icon}
          </button>
        ))}
      </div>

      <div style={{ textAlign: "center", maxWidth: 600, padding: "0 24px", zIndex: 1 }}>
        <div className="welcome-logo welcome-float" style={{
          width: 100, height: 100, borderRadius: 24,
          background: th.gradient,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 48, fontWeight: 700, color: "#fff",
          margin: "0 auto 32px",
        }}>
          S
        </div>

        <h1 className="welcome-anim-2" style={{
          margin: 0, fontSize: 42, fontWeight: 800,
          color: th.text, lineHeight: 1.2,
          letterSpacing: "-0.02em",
        }}>
          {t.welcomePageTitle}
        </h1>

        <p className="welcome-anim-3" style={{
          margin: "16px 0 0", fontSize: 18,
          color: th.textSecondary, fontWeight: 400,
        }}>
          {t.welcomePageSubtitle}
        </p>

        <div className="welcome-anim-3" style={{
          display: "flex", gap: 24, justifyContent: "center",
          marginTop: 40, flexWrap: "wrap",
        }}>
          {[
            { icon: "🤖", text: "AI Chat" },
            { icon: "🎨", text: "Image Gen" },
            { icon: "🌐", text: "7 Languages" },
            { icon: "⚡", text: "Fast" },
          ].map(f => (
            <div key={f.text} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              padding: "16px 20px", borderRadius: 12,
              background: th.bgSecondary, border: `1px solid ${th.border}`,
              minWidth: 100,
            }}>
              <span style={{ fontSize: 28 }}>{f.icon}</span>
              <span style={{ fontSize: 12, color: th.textSecondary, fontWeight: 500 }}>{f.text}</span>
            </div>
          ))}
        </div>

        <div className="welcome-anim-4" style={{ marginTop: 48 }}>
          <button onClick={onStart}
            style={{
              padding: "16px 48px", borderRadius: 14,
              border: "none", background: th.gradient,
              color: "#fff", fontSize: 18, fontWeight: 700,
              cursor: "pointer", letterSpacing: "0.5px",
              boxShadow: `0 4px 20px ${th.primary}44`,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = `0 8px 30px ${th.primary}66`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = `0 4px 20px ${th.primary}44`;
            }}
          >
            {t.start} →
          </button>
        </div>

        <p className="welcome-anim-4" style={{
          marginTop: 40, fontSize: 12, color: th.textMuted,
        }}>
          Powered by Groq AI · ShardeumAI 2026
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ═══ OPTION 1: ChatGPT-Style Single File (Complete Redesign) ═══
// ═══════════════════════════════════════════════════════════════

function App() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const th = THEMES[resolvedTheme];
  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem("shardeumai-welcome-shown");
  });
  const [uiLang, setUiLang] = useState("en");
  const [modelLang, setModelLang] = useState("auto");
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");
  const [selectedModel, setSelectedModel] = useState("llama-3.1-8b-instant");
  const [aiMode, setAiMode] = useState("general");
  const [webSearch, setWebSearch] = useState(false);
  const [searchProvider, setSearchProvider] = useState("tavily");
  const [conversations, setConversations] = useState([]);
  const [activeConvoId, setActiveConvoId] = useState(null);
  const [showSignup, setShowSignup] = useState(false);
  const [profile, setProfile] = useState({ display_name: "", bio: "", avatar_color: "#10a37f" });
  const [shareUrl, setShareUrl] = useState("");
  const [shareLoading, setShareLoading] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminSettings, setAdminSettings] = useState({});
  const [adminLoading, setAdminLoading] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  const t = translations[uiLang] || translations.en;
  const isRTL = uiLang === "fa" || uiLang === "ar";
  const currentModel = MODELS.find(m => m.id === selectedModel);

  // ── Effects ──
  useEffect(() => {
    const detectLang = navigator.language?.slice(0, 2);
    const found = UI_LANGUAGES.find((l) => l.code === detectLang);
    if (found) setUiLang(found.code);
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) { setSession(data.session); loadHistory(data.session.user.id); loadProfile(data.session.user.id); }
    });
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, chatLoading]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [activeConvoId]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    if ("Notification" in window) setPushEnabled(Notification.permission === "granted");
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // ── Data Loading ──
  async function loadHistory(userId) {
    const { data: convos } = await supabase.from("conversations").select("id, title, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(30);
    if (convos) setConversations(convos);
    if (convos && convos.length > 0) {
      setActiveConvoId(convos[0].id);
      loadConversationMessages(convos[0].id);
    }
  }

  async function loadConversationMessages(convoId) {
    const { data } = await supabase.from("chat_history").select("role, content").eq("conversation_id", convoId).order("created_at", { ascending: true });
    setMessages(data || []);
    setActiveConvoId(convoId);
    setShareUrl("");
  }

  async function loadProfile(userId) {
    const { data } = await supabase.from("user_profiles").select("display_name, bio, avatar_color").eq("id", userId).single();
    if (data) setProfile({ display_name: data.display_name || "", bio: data.bio || "", avatar_color: data.avatar_color || "#10a37f" });
  }

  async function loadAdminData() {
    if (session?.user?.email !== ADMIN_EMAIL) return;
    setAdminLoading(true);
    const { data: users } = await supabase.from("admin_user_stats").select("*").order("created_at", { ascending: false });
    if (users) setAdminUsers(users);
    const { data: settings } = await supabase.from("system_settings").select("*");
    if (settings) { const obj = {}; settings.forEach(s => { obj[s.key] = s.value; }); setAdminSettings(obj); }
    setAdminLoading(false);
  }

  // ── Actions ──
  async function startNewChat() {
    setMessages([]);
    setActiveConvoId(null);
    setShareUrl("");
    setInput("");
    inputRef.current?.focus();
  }

  async function deleteConversation(convoId) {
    await supabase.from("conversations").delete().eq("id", convoId);
    setConversations(prev => prev.filter(c => c.id !== convoId));
    if (activeConvoId === convoId) startNewChat();
  }

  async function saveMessage(userId, role, msgContent, convoId) {
    await supabase.from("chat_history").insert({ user_id: userId, role, content: msgContent, conversation_id: convoId });
  }

  async function shareChat() {
    if (!session || messages.length === 0) return;
    setShareLoading(true); setShareUrl("");
    try {
      const { data, error } = await supabase.from("shared_chats").insert({ user_id: session.user.id, messages }).select("id").single();
      if (!error && data) {
        const url = `${window.location.origin}${window.location.pathname}?share=${data.id}`;
        setShareUrl(url);
        navigator.clipboard?.writeText(url).catch(() => {});
      }
    } catch {}
    setShareLoading(false);
  }

  async function handleLogin(e) {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email: e.target.email.value, password: e.target.password.value });
    if (!error) { setSession(data.session); loadHistory(data.session.user.id); loadProfile(data.session.user.id); }
    else alert("Login failed: " + error.message);
  }

  async function handleSignup(e) {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email: e.target.email.value, password: e.target.password.value });
    if (!error) { alert("Account created. Please login."); setShowSignup(false); }
    else alert("Signup failed: " + error.message);
  }

  async function handleOAuthLogin(provider) {
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin + window.location.pathname } });
    if (error) alert("Login failed: " + error.message);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
    setMessages([]);
    setConversations([]);
    setActiveConvoId(null);
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;
    if (!session) { alert("Please login first."); return; }
    const userMsg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setChatLoading(true);
    try {
      const currentMode = AI_MODES.find(m => m.id === aiMode);
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
        body: JSON.stringify({
          messages: newMessages, language: modelLang, system_prompt: currentMode?.prompt,
          web_search: webSearch, search_provider: searchProvider, model: selectedModel,
        }),
      });
      const data = await response.json();
      const reply = data.reply || "No response";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);

      let convoId = activeConvoId;
      if (!convoId) {
        const title = userMsg.content.slice(0, 50) || "New Chat";
        const { data: newConvo } = await supabase.from("conversations").insert({ user_id: session.user.id, title }).select().single();
        if (newConvo) { convoId = newConvo.id; setActiveConvoId(convoId); setConversations(prev => [newConvo, ...prev]); }
      }
      await saveMessage(session.user.id, "user", userMsg.content, convoId);
      await saveMessage(session.user.id, "assistant", reply, convoId);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Error connecting to AI." }]);
    }
    setChatLoading(false);
  }

  // ── Welcome Page ──
  if (showWelcome) {
    return (
      <WelcomePage
        t={t}
        th={th}
        theme={theme}
        setTheme={setTheme}
        uiLang={uiLang}
        setUiLang={setUiLang}
        onStart={() => {
          localStorage.setItem("shardeumai-welcome-shown", "true");
          setShowWelcome(false);
        }}
      />
    );
  }

  // ── Auth Screen ──
  if (!session) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#000", direction: isRTL ? "rtl" : "ltr" }}>
        <div style={{ width: "100%", maxWidth: 400, padding: 40 }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ width: 56, height: 56, borderRadius: 12, background: "#10a37f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#fff", margin: "0 auto 20px" }}>S</div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#fff" }}>{showSignup ? t.signup : t.loginTitle}</h1>
            <p style={{ margin: "8px 0 0", fontSize: 14, color: "#8e8ea0" }}>{t.subtitle}</p>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
            {UI_LANGUAGES.map(lang => (
              <button key={lang.code} onClick={() => setUiLang(lang.code)}
                style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${uiLang === lang.code ? "#10a37f" : "#2d2d2d"}`, background: uiLang === lang.code ? "#10a37f22" : "transparent", color: uiLang === lang.code ? "#10a37f" : "#8e8ea0", fontSize: 12, cursor: "pointer" }}>
                {lang.flag} {lang.label}
              </button>
            ))}
          </div>

          <form onSubmit={showSignup ? handleSignup : handleLogin} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input name="email" type="email" required placeholder={t.email} style={inputStyle} />
            <input name="password" type="password" required placeholder={t.password} style={inputStyle} />
            <button type="submit" style={{ ...inputStyle, background: "#10a37f", color: "#fff", fontWeight: 600, border: "none", cursor: "pointer", marginTop: 4 }}>
              {showSignup ? t.signup : t.login}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#2d2d2d" }} />
            <span style={{ fontSize: 12, color: "#5c5c5c" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "#2d2d2d" }} />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => handleOAuthLogin("google")} style={{ ...oauthBtnStyle, flex: 1 }}>
              <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
            <button onClick={() => handleOAuthLogin("github")} style={{ ...oauthBtnStyle, flex: 1 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
              GitHub
            </button>
          </div>

          <p style={{ textAlign: "center", fontSize: 13, color: "#8e8ea0", marginTop: 20 }}>
            {showSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <span onClick={() => setShowSignup(!showSignup)} style={{ color: "#10a37f", cursor: "pointer" }}>
              {showSignup ? t.login : t.signup}
            </span>
          </p>
        </div>
      </div>
    );
  }

  // ── Main ChatGPT-Style Layout ──
  return (
    <div style={{ display: "flex", height: "100vh", background: "#000", color: "#ececec", direction: isRTL ? "rtl" : "ltr", overflow: "hidden" }}>

      {/* SIDEBAR */}
      <div className={`chat-sidebar ${sidebarOpen ? "open" : ""}`} style={{
        width: sidebarOpen ? 260 : 0,
        minWidth: sidebarOpen ? 260 : 0,
        background: "#171717",
        borderRight: "1px solid #2d2d2d",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease",
        overflow: "hidden",
      }}>
        <div style={{ padding: "12px 14px", borderBottom: "1px solid #2d2d2d" }}>
          <button onClick={startNewChat}
            style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "1px dashed #3d3d3d", background: "transparent", color: "#ececec", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>+</span> {t.newChat}
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px" }}>
          <div style={{ fontSize: 11, color: "#5c5c5c", padding: "4px 6px 8px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{t.recentChats}</div>
          {conversations.length === 0 && (
            <div style={{ color: "#5c5c5c", fontSize: 12, textAlign: "center", padding: 20 }}>{t.noChats}</div>
          )}
          {conversations.map(convo => (
            <div key={convo.id}
              onClick={() => loadConversationMessages(convo.id)}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8,
                marginBottom: 2, cursor: "pointer",
                background: activeConvoId === convo.id ? "#2d2d2d" : "transparent",
                border: `1px solid ${activeConvoId === convo.id ? "#3d3d3d" : "transparent"}`,
              }}
              onMouseEnter={e => { if (activeConvoId !== convo.id) e.currentTarget.style.background = "#262626"; }}
              onMouseLeave={e => { if (activeConvoId !== convo.id) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ fontSize: 14, color: "#8e8ea0" }}>💬</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: "#ececec", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{convo.title}</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); deleteConversation(convo.id); }}
                style={{ background: "none", border: "none", color: "#8e8ea0", cursor: "pointer", fontSize: 14, padding: "4px 6px", borderRadius: 4, opacity: 0.6, transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.background = "#ef444422"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = 0.6; e.currentTarget.style.color = "#8e8ea0"; e.currentTarget.style.background = "transparent"; }}
              >🗑</button>
            </div>
          ))}
        </div>

        <div style={{ padding: "10px 14px", borderTop: "1px solid #2d2d2d", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: profile.avatar_color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, color: "#fff", flexShrink: 0 }}>
            {(profile.display_name || session.user.email || "S")[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: "#ececec", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile.display_name || session.user.email}</div>
            <div style={{ fontSize: 10, color: "#5c5c5c" }}>{t.logout}</div>
          </div>
          <button onClick={handleLogout} style={{ background: "none", border: "none", color: "#8e8ea0", cursor: "pointer", fontSize: 16 }}>↪</button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div className={`chat-sidebar-overlay ${sidebarOpen ? "show" : ""}`} onClick={() => setSidebarOpen(false)} />

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}>

        {/* Header */}
        <div style={{
          height: 48, display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 16px", borderBottom: "1px solid #2d2d2d", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: "none", border: "none", color: "#8e8ea0", cursor: "pointer", fontSize: 18, padding: 4 }}>
              ☰
            </button>
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowModelDropdown(!showModelDropdown)}
                style={{ background: "none", border: "none", color: "#ececec", fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                {currentModel?.label}
                <span style={{ fontSize: 10, color: "#5c5c5c" }}>▼</span>
              </button>
              {showModelDropdown && (
                <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, background: "#2d2d2d", border: "1px solid #3d3d3d", borderRadius: 12, padding: 6, minWidth: 220, zIndex: 100, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
                  {MODELS.map(m => (
                    <button key={m.id} onClick={() => { setSelectedModel(m.id); setShowModelDropdown(false); }}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "none", background: selectedModel === m.id ? "#404040" : "transparent", color: "#ececec", fontSize: 13, cursor: "pointer", textAlign: "left", display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontWeight: 500 }}>{m.label}</span>
                      <span style={{ fontSize: 11, color: "#8e8ea0" }}>{m.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <select value={aiMode} onChange={e => setAiMode(e.target.value)}
              style={{ background: "#2d2d2d", border: "1px solid #3d3d3d", borderRadius: 8, color: "#ececec", fontSize: 12, padding: "4px 8px", outline: "none", cursor: "pointer" }}>
              {AI_MODES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
            <select value={modelLang} onChange={e => setModelLang(e.target.value)}
              style={{ background: "#2d2d2d", border: "1px solid #3d3d3d", borderRadius: 8, color: "#ececec", fontSize: 12, padding: "4px 8px", outline: "none", cursor: "pointer" }}>
              {MODEL_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
            </select>
            {/* Theme Toggle */}
            <div style={{ display: "flex", gap: 4 }}>
              {[
                { id: "light", icon: "☀️" },
                { id: "dark", icon: "🌙" },
                { id: "auto", icon: "⚙️" },
              ].map(toggle => (
                <button key={toggle.id} onClick={() => setTheme(toggle.id)}
                  title={toggle.id}
                  style={{
                    padding: "4px 8px", borderRadius: 6,
                    border: `1px solid ${theme === toggle.id ? "#10a37f" : "#3d3d3d"}`,
                    background: theme === toggle.id ? "#10a37f22" : "transparent",
                    color: theme === toggle.id ? "#10a37f" : "#8e8ea0",
                    fontSize: 12, cursor: "pointer", transition: "all 0.2s",
                  }}>
                  {toggle.icon}
                </button>
              ))}
            </div>
            <button onClick={() => setWebSearch(!webSearch)}
              style={{ padding: "4px 10px", borderRadius: 8, border: `1px solid ${webSearch ? "#10a37f" : "#3d3d3d"}`, background: webSearch ? "#10a37f22" : "transparent", color: webSearch ? "#10a37f" : "#8e8ea0", fontSize: 12, cursor: "pointer" }}>
              🔍
            </button>
            {webSearch && (
              <select value={searchProvider} onChange={e => setSearchProvider(e.target.value)}
                style={{ background: "#2d2d2d", border: "1px solid #3d3d3d", borderRadius: 8, color: "#ececec", fontSize: 11, padding: "4px 8px", outline: "none", cursor: "pointer" }}>
                <option value="tavily">Tavily</option>
                <option value="exa">Exa</option>
                <option value="firecrawl">Firecrawl</option>
              </select>
            )}
            {["chat", "image", "profile", "api"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ padding: "4px 10px", borderRadius: 8, border: "none", background: activeTab === tab ? "#404040" : "transparent", color: activeTab === tab ? (tab === "api" ? "#a855f7" : "#ececec") : "#8e8ea0", fontSize: 12, cursor: "pointer" }}>
                {tab === "chat" ? "💬" : tab === "image" ? "🎨" : tab === "profile" ? "👤" : "🔌"}
              </button>
            ))}
            {session?.user?.email === ADMIN_EMAIL && (
              <button onClick={() => { setActiveTab("admin"); loadAdminData(); }}
                style={{ padding: "4px 10px", borderRadius: 8, border: "none", background: activeTab === "admin" ? "#404040" : "transparent", color: activeTab === "admin" ? "#f59e0b" : "#8e8ea0", fontSize: 12, cursor: "pointer" }}>
                ⚙️
              </button>
            )}
          </div>
        </div>

        {/* Chat / Image / Admin */}
        {activeTab === "chat" ? (
          <>
            <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "20px 0" }}>
              {messages.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: 40 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 12, background: "#10a37f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 24 }}>S</div>
                  <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{t.welcomeTitle}</h1>
                  <p style={{ margin: 0, fontSize: 16, color: "#8e8ea0" }}>{t.welcomeSubtitle}</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} style={{
                    background: msg.role === "user" ? "transparent" : "#171717",
                    borderBottom: msg.role === "assistant" ? "1px solid #2d2d2d" : "none",
                  }}>
                    <div style={{ maxWidth: 768, margin: "0 auto", padding: "20px 24px", display: "flex", gap: 16, direction: isRTL ? "rtl" : "ltr" }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: "#fff",
                        background: msg.role === "user" ? profile.avatar_color : "#10a37f",
                      }}>
                        {msg.role === "user" ? (profile.display_name || "U")[0].toUpperCase() : "S"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0, color: "#ececec", fontSize: 15, lineHeight: 1.7, direction: "auto" }}>
                        {msg.role === "user" ? (
                          <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{msg.content}</div>
                        ) : (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({children}) => <p style={{ margin: "0 0 10px", lineHeight: 1.8 }}>{children}</p>,
                              ul: ({children}) => <ul style={{ margin: "8px 0", paddingInlineStart: 20, lineHeight: 1.8 }}>{children}</ul>,
                              ol: ({children}) => <ol style={{ margin: "8px 0", paddingInlineStart: 20, lineHeight: 1.8 }}>{children}</ol>,
                              li: ({children}) => <li style={{ marginBottom: 4 }}>{children}</li>,
                              code: ({inline, className, children}) => {
                                const codeStr = String(children).trimEnd();
                                const match = /language-(\w+)/.exec(className || '');
                                const lang = match ? match[1] : '';
                                if (inline) return <code style={{ background: "#2d2d2d", padding: "2px 6px", borderRadius: 4, fontSize: 12, fontFamily: "JetBrains Mono, monospace", color: "#10a37f", direction: "ltr", display: "inline-block" }}>{children}</code>;
                                return <CodeBlock code={codeStr} lang={lang} />;
                              },
                              a: ({href, children}) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "#10a37f", textDecoration: "underline" }}>{children}</a>,
                              blockquote: ({children}) => <blockquote style={{ borderInlineStart: "3px solid #10a37f", margin: "8px 0", paddingInlineStart: 12, color: "#8e8ea0", fontStyle: "italic" }}>{children}</blockquote>,
                              table: ({children}) => <div style={{ overflowX: "auto", margin: "10px 0" }}><table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>{children}</table></div>,
                              th: ({children}) => <th style={{ border: "1px solid #3d3d3d", padding: "8px 12px", background: "#2d2d2d", textAlign: "left", color: "#ececec" }}>{children}</th>,
                              td: ({children}) => <td style={{ border: "1px solid #2d2d2d", padding: "8px 12px", color: "#ececec" }}>{children}</td>,
                              h1: ({children}) => <h1 style={{ fontSize: 20, fontWeight: 700, margin: "12px 0 8px", color: "#ececec" }}>{children}</h1>,
                              h2: ({children}) => <h2 style={{ fontSize: 17, fontWeight: 700, margin: "10px 0 6px", color: "#ececec" }}>{children}</h2>,
                              h3: ({children}) => <h3 style={{ fontSize: 15, fontWeight: 600, margin: "8px 0 4px", color: "#ececec" }}>{children}</h3>,
                              strong: ({children}) => <strong style={{ fontWeight: 700, color: "#fff" }}>{children}</strong>,
                              hr: () => <hr style={{ border: "none", borderTop: "1px solid #2d2d2d", margin: "12px 0" }} />,
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {chatLoading && (
                <div style={{ maxWidth: 768, margin: "0 auto", padding: "20px 24px", display: "flex", gap: 16 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#10a37f", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: "#fff" }}>S</div>
                  <div style={{ display: "flex", gap: 4, alignItems: "center", paddingTop: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#8e8ea0", animation: "pulse 1.4s infinite ease-in-out" }} />
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#8e8ea0", animation: "pulse 1.4s infinite ease-in-out 0.2s" }} />
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#8e8ea0", animation: "pulse 1.4s infinite ease-in-out 0.4s" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div style={{ padding: "12px 16px 24px", borderTop: "1px solid #2d2d2d", flexShrink: 0 }}>
              <div style={{ maxWidth: 768, margin: "0 auto", position: "relative" }}>
                <form onSubmit={handleSend} style={{ position: "relative" }}>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px"; }}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (input.trim() && !chatLoading) handleSend(e); } }}
                    placeholder={t.placeholder}
                    rows={1}
                    style={{
                      width: "100%", padding: "14px 48px 14px 16px", borderRadius: 16,
                      border: "1px solid #3d3d3d", background: "#2d2d2d", color: "#ececec",
                      fontSize: 15, outline: "none", resize: "none", overflow: "hidden",
                      minHeight: 52, maxHeight: 200, lineHeight: 1.5, direction: isRTL ? "rtl" : "ltr",
                    }}
                    disabled={chatLoading}
                  />
                  <button type="submit" disabled={!input.trim() || chatLoading}
                    style={{
                      position: "absolute", bottom: 10, right: 10,
                      width: 32, height: 32, borderRadius: "50%",
                      border: "none", background: input.trim() ? "#10a37f" : "#5c5c5c",
                      color: "#fff", fontSize: 14, cursor: input.trim() ? "pointer" : "default",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                    ➤
                  </button>
                </form>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    {messages.length > 0 && (
                      <>
                        <button onClick={shareChat} disabled={shareLoading}
                          style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #3d3d3d", background: "transparent", color: "#8e8ea0", fontSize: 11, cursor: "pointer" }}>
                          {shareLoading ? "..." : "🔗 " + t.share}
                        </button>
                        <div style={{ position: "relative" }}>
                          <button onClick={() => setShowExportMenu(!showExportMenu)}
                            style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #3d3d3d", background: "transparent", color: "#8e8ea0", fontSize: 11, cursor: "pointer" }}>
                            ⬇ {t.export}
                          </button>
                          {showExportMenu && (
                            <div style={{ position: "absolute", bottom: "calc(100% + 4px)", left: 0, background: "#2d2d2d", border: "1px solid #3d3d3d", borderRadius: 8, padding: 4, display: "flex", flexDirection: "column", gap: 2, zIndex: 100, minWidth: 120 }}>
                              {[["pdf","PDF"],["md","Markdown"],["html","HTML"],["txt","TXT"]].map(([fmt, label]) => (
                                <button key={fmt} onClick={() => { exportChat(messages, fmt); setShowExportMenu(false); }}
                                  style={{ padding: "6px 10px", background: "none", border: "none", color: "#ececec", cursor: "pointer", fontSize: 12, textAlign: "left", borderRadius: 4 }}
                                  onMouseEnter={e => e.target.style.background = "#404040"}
                                  onMouseLeave={e => e.target.style.background = "none"}>
                                  {label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  {shareUrl && (
                    <div style={{ fontSize: 11, color: "#10a37f" }}>
                      ✓ {t.copied}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : activeTab === "image" ? (
          <div style={{ flex: 1, overflow: "auto", padding: "0 16px" }}>
            <ImageGenerator t={t} isRTL={isRTL} />
          </div>
        ) : activeTab === "profile" ? (
          <div style={{ flex: 1, overflow: "auto", padding: "16px", maxWidth: 480, margin: "0 auto", width: "100%" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 700, color: "#ececec" }}>👤 Profile</h2>
            <div style={{ background: "#171717", border: "1px solid #2d2d2d", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: profile.avatar_color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                  {(profile.display_name || session?.user?.email || "?")[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{profile.display_name || session?.user?.email?.split("@")[0]}</div>
                  <div style={{ fontSize: 12, color: "#8e8ea0" }}>{session?.user?.email}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 12, color: "#8e8ea0" }}>Avatar Color</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {["#3b82f6","#8b5cf6","#ec4899","#ef4444","#f97316","#eab308","#22c55e","#14b8a6","#06b6d4","#6366f1","#ffffff","#64748b"].map(color => (
                    <div key={color} onClick={() => setProfile(p => ({ ...p, avatar_color: color }))}
                      style={{ width: 32, height: 32, borderRadius: "50%", background: color, cursor: "pointer", border: profile.avatar_color === color ? "3px solid #fff" : "3px solid transparent", boxShadow: profile.avatar_color === color ? `0 0 12px ${color}` : "none", transition: "all 0.15s ease" }} />
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, color: "#8e8ea0" }}>Display Name</label>
                <input value={profile.display_name} onChange={(e) => setProfile(p => ({ ...p, display_name: e.target.value }))}
                  placeholder="Your name..."
                  style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #2d2d2d", background: "#0d0d0d", color: "#ececec", fontSize: 13, outline: "none" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, color: "#8e8ea0" }}>Bio</label>
                <textarea value={profile.bio} onChange={(e) => setProfile(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell us about yourself..." rows={3}
                  style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #2d2d2d", background: "#0d0d0d", color: "#ececec", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit" }} />
              </div>
              <button onClick={async () => { if (!session) return; await supabase.from("user_profiles").upsert({ id: session.user.id, display_name: profile.display_name, bio: profile.bio, avatar_color: profile.avatar_color, updated_at: new Date().toISOString() }); }}
                style={{ padding: "11px 0", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${profile.avatar_color}, #22c55e)`, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Save Profile
              </button>
            </div>
            <div style={{ background: "#171717", border: "1px solid #2d2d2d", borderRadius: 16, padding: 16, marginTop: 16 }}>
              <div style={{ fontSize: 12, color: "#8e8ea0", marginBottom: 10 }}>Account Info</div>
              <div style={{ fontSize: 13, color: "#ececec" }}>{session?.user?.email}</div>
              <div style={{ fontSize: 12, color: "#8e8ea0", marginTop: 6 }}>Member since {new Date(session?.user?.created_at).toLocaleDateString()}</div>
            </div>
          </div>
        ) : activeTab === "api" ? (
          <div style={{ flex: 1, overflow: "auto", padding: "16px", maxWidth: 640, margin: "0 auto", width: "100%" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 700, color: "#a855f7" }}>🔌 API Documentation</h2>
            <div style={{ background: "#171717", border: "1px solid #2d2d2d", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#a855f7", marginBottom: 12 }}>🔔 Push Notifications</div>
              <div style={{ fontSize: 12, color: "#8e8ea0", marginBottom: 12 }}>Status: {pushEnabled ? <span style={{ color: "#10a37f" }}>Enabled</span> : <span style={{ color: "#ef4444" }}>Disabled</span>}</div>
              <div style={{ display: "flex", gap: 8 }}>
                {!pushEnabled ? (
                  <button onClick={async () => { if (!("Notification" in window)) return alert("Not supported"); const p = await Notification.requestPermission(); setPushEnabled(p === "granted"); if (p === "granted") new Notification("ShardeumAI", { body: "Enabled!", icon: "/icons/icon-192.png" }); }}
                    style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#7c3aed", color: "#fff", fontSize: 12, cursor: "pointer" }}>
                    Enable Notifications
                  </button>
                ) : (
                  <button onClick={() => new Notification("ShardeumAI Test", { body: "Test notification!", icon: "/icons/icon-192.png" })}
                    style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #10a37f", background: "#10a37f22", color: "#10a37f", fontSize: 12, cursor: "pointer" }}>
                    Send Test
                  </button>
                )}
              </div>
            </div>
            <div style={{ background: "#171717", border: "1px solid #2d2d2d", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#a855f7", marginBottom: 12 }}>📵 Offline Mode</div>
              <div style={{ fontSize: 12, color: "#8e8ea0" }}>Status: {isOffline ? <span style={{ color: "#ef4444" }}>Offline</span> : <span style={{ color: "#10a37f" }}>Online</span>}</div>
            </div>
            <div style={{ background: "#171717", border: "1px solid #2d2d2d", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#a855f7", marginBottom: 12 }}>📡 Chat API</div>
              <code style={{ display: "block", background: "#0d0d0d", padding: "10px 12px", borderRadius: 8, fontSize: 11, color: "#22c55e", wordBreak: "break-all", marginBottom: 12 }}>
                POST https://zzolokpbjkrvkyaubcoq.supabase.co/functions/v1/chat
              </code>
              <pre style={{ background: "#0d0d0d", padding: "10px 12px", borderRadius: 8, fontSize: 11, color: "#60a5fa", overflow: "auto", marginBottom: 12 }}>{`Content-Type: application/json
Authorization: Bearer YOUR_SUPABASE_KEY`}</pre>
              <pre style={{ background: "#0d0d0d", padding: "10px 12px", borderRadius: 8, fontSize: 11, color: "#60a5fa", overflow: "auto", marginBottom: 12 }}>{`{
  "messages": [{"role": "user", "content": "Hello"}],
  "language": "auto",
  "web_search": false,
  "search_provider": "tavily"
}`}</pre>
              <pre style={{ background: "#0d0d0d", padding: "10px 12px", borderRadius: 8, fontSize: 11, color: "#22c55e", overflow: "auto" }}>{`{
  "reply": "Hello! How can I help you?",
  "web_searched": false
}`}</pre>
            </div>
          </div>
        ) : activeTab === "admin" && session?.user?.email === ADMIN_EMAIL ? (
          <div style={{ flex: 1, overflow: "auto", padding: "16px", maxWidth: 900, margin: "0 auto", width: "100%" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 700, color: "#f59e0b" }}>⚙️ Admin Dashboard</h2>
            {adminLoading ? (
              <div style={{ color: "#8e8ea0", textAlign: "center", padding: 40 }}>Loading...</div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
                  {[
                    { label: "Users", value: adminUsers.length, icon: "👥" },
                    { label: "Messages", value: adminUsers.reduce((a, u) => a + (parseInt(u.total_messages) || 0), 0), icon: "💬" },
                    { label: "Shared", value: adminUsers.reduce((a, u) => a + (parseInt(u.total_shared_chats) || 0), 0), icon: "🔗" },
                  ].map(stat => (
                    <div key={stat.label} style={{ background: "#171717", border: "1px solid #2d2d2d", borderRadius: 12, padding: 16, textAlign: "center" }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>{stat.icon}</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: "#f59e0b" }}>{stat.value}</div>
                      <div style={{ fontSize: 11, color: "#8e8ea0", marginTop: 4 }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: "#171717", border: "1px solid #2d2d2d", borderRadius: 12, padding: 16, marginBottom: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#f59e0b", marginBottom: 12 }}>🔧 System Settings</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {Object.entries(adminSettings).map(([key, value]) => (
                      <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                        <span style={{ fontSize: 12, color: "#8e8ea0" }}>{key}</span>
                        {value === "true" || value === "false" ? (
                          <button onClick={() => { const nv = value === "true" ? "false" : "true"; supabase.from("system_settings").upsert({ key, value: nv, updated_at: new Date().toISOString() }); setAdminSettings(prev => ({ ...prev, [key]: nv })); }}
                            style={{ padding: "4px 12px", borderRadius: 999, border: "none", background: value === "true" ? "#10a37f22" : "#2d2d2d", color: value === "true" ? "#10a37f" : "#8e8ea0", fontSize: 11, cursor: "pointer" }}>
                            {value === "true" ? "ON" : "OFF"}
                          </button>
                        ) : (
                          <input defaultValue={value} onBlur={e => { supabase.from("system_settings").upsert({ key, value: e.target.value, updated_at: new Date().toISOString() }); setAdminSettings(prev => ({ ...prev, [key]: e.target.value })); }}
                            style={{ background: "#2d2d2d", border: "1px solid #3d3d3d", borderRadius: 6, padding: "4px 8px", color: "#ececec", fontSize: 12, width: 120, outline: "none" }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ background: "#171717", border: "1px solid #2d2d2d", borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#f59e0b", marginBottom: 12 }}>👥 Users ({adminUsers.length})</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 400, overflowY: "auto" }}>
                    {adminUsers.map(user => (
                      <div key={user.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "#0d0d0d", borderRadius: 8, border: "1px solid #2d2d2d" }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#10a37f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                          {user.email?.[0]?.toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, color: "#ececec", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.display_name || user.email}</div>
                          <div style={{ fontSize: 11, color: "#5c5c5c" }}>{user.email}</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#10a37f" }}>{user.total_messages}</div>
                          <div style={{ fontSize: 9, color: "#5c5c5c" }}>msgs</div>
                        </div>
                        <div style={{ fontSize: 11, color: "#5c5c5c" }}>
                          {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : "Never"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

const inputStyle = { padding: "11px 14px", borderRadius: 10, border: "1px solid #3d3d3d", background: "#2d2d2d", color: "#ececec", fontSize: 14, outline: "none" };
const oauthBtnStyle = { padding: "10px 0", borderRadius: 10, border: "1px solid #3d3d3d", background: "#2d2d2d", color: "#ececec", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 };

export default App;
