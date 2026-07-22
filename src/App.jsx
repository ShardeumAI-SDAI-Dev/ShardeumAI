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

// ── Mobile Detection ──
function useMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isMobile;
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
  { id: "general", label: "General", prompt: "You are ShardeumAI (SDAI), a helpful AI assistant. CRITICAL RULE: Detect the user's language from their message and reply ONLY in that exact same language. If user writes in Persian (Farsi), reply 100% in Persian using proper Persian script (نه فینگلیش). If user writes in English, reply 100% in English. Never mix languages. Never use Hindi, Arabic, Chinese, or any other script. Only use the exact same language and script as the user's message. Be friendly, accurate, and helpful." },
  { id: "crypto", label: "Crypto", prompt: "You are ShardeumAI (SDAI), a crypto and blockchain expert assistant. CRITICAL RULE: Detect the user's language from their message and reply ONLY in that exact same language. If user writes in Persian, reply 100% in Persian with proper Persian script. If English, reply 100% in English. Never mix languages or scripts. Never use Hindi, Arabic, Chinese, or other scripts. Give accurate, detailed crypto information." },
  { id: "shardeum", label: "Shardeum", prompt: "You are ShardeumAI (SDAI), a specialized Shardeum blockchain assistant. CRITICAL RULE: Detect the user's language and reply ONLY in that exact same language with proper script. Never mix languages or use other scripts. You have deep knowledge of Shardeum's architecture, SHM token, EVM compatibility, dynamic state sharding, validators, and ecosystem." },
  { id: "defi", label: "DeFi", prompt: "You are ShardeumAI (SDAI), a DeFi (Decentralized Finance) expert. CRITICAL RULE: Detect the user's language and reply ONLY in that exact same language with proper script. Never mix languages. You specialize in liquidity pools, yield farming, DEXs, lending protocols, staking, and DeFi strategies." },
  { id: "web3", label: "Web3", prompt: "You are ShardeumAI (SDAI), a Web3 and smart contract expert. CRITICAL RULE: Detect the user's language and reply ONLY in that exact same language with proper script. Never mix languages. You specialize in Solidity, dApps, MetaMask, wallets, NFTs, DAOs, and decentralized technologies." },
];

const MODELS = [
  { id: "llama-3.1-8b-instant", label: "Llama 3.1", desc: "Fast" },
  { id: "llama-3.3-70b", label: "Llama 3.3", desc: "Smart" },
  { id: "qwen-32b", label: "Qwen 32B", desc: "Multilingual" },
];

const translations = {
  fa: {
    title: "ShardeumAI", subtitle: "دستیار هوشمند چندزبانه",
    placeholder: "پیام خود را بنویسید...", send: "ارسال",
    loginTitle: "ورود", email: "ایمیل", password: "رمز عبور", login: "ورود", logout: "خروج", signup: "ثبت نام",
    newChat: "گفتگوی جدید", recentChats: "گفتگوهای اخیر", noChats: "گفتگویی وجود ندارد",
    imageTab: "تولید عکس", chatTab: "گفتگو", profileTab: "پروفایل", adminTab: "مدیریت",
    imagePlaceholder: "توضیح عکس را بنویسید...", generate: "ساخت عکس", generating: "در حال ساخت...",
    welcomeTitle: "ShardeumAI", welcomeSubtitle: "چه کاری می‌توانم برای شما انجام دهم؟",
    share: "اشتراک‌گذاری", export: "خروجی", copy: "کپی", copied: "کپی شد!",
    model: "مدل", language: "زبان", webSearch: "جستجوی وب",
    welcomePageTitle: "به ShardeumAI خوش آمدید", welcomePageSubtitle: "یک پلتفرم هوش مصنوعی چندزبانه", start: "شروع",
      smartNotificationTitle: "سلام! 👋",
    smartNotificationMessage: "یک سوال جدید بپرس — من اینجام که کمکت کنم!",
    smartNotificationDismiss: "بستن",
    smartNotificationDays: "روز",
    smartNotificationAgo: "از آخرین بازدید",
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
    streaming: "Streaming", analytics: "Analytics", notifications: "Notifications", customTheme: "Custom Theme", shortcuts: "Shortcuts", feedback: "Feedback", sendFeedback: "Send Feedback", feedbackPlaceholder: "Your feedback...", feedbackSent: "Feedback sent! Thank you!",
    totalMessages: "Total Messages", totalChats: "Total Chats", avgResponseTime: "Avg Response", charactersTyped: "Characters Typed", today: "Today", thisWeek: "This Week", thisMonth: "This Month",
    shortcutSend: "Send Message", shortcutNewChat: "New Chat", shortcutSearch: "Toggle Search", shortcutFocus: "Focus Input", shortcutTheme: "Toggle Theme",
      smartNotificationTitle: "Hey there! 👋",
    smartNotificationMessage: "Ask a new question — I'm here to help!",
    smartNotificationDismiss: "Dismiss",
    smartNotificationDays: "days",
    smartNotificationAgo: "since last visit",
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
    streaming: "Transmision", analytics: "Analiticas", notifications: "Notificaciones", customTheme: "Tema Personalizado", shortcuts: "Atajos", feedback: "Comentarios", sendFeedback: "Enviar Comentarios", feedbackPlaceholder: "Tus comentarios...", feedbackSent: "Comentarios enviados! Gracias!",
    totalMessages: "Mensajes Totales", totalChats: "Chats Totales", avgResponseTime: "Tiempo Promedio", charactersTyped: "Caracteres", today: "Hoy", thisWeek: "Esta Semana", thisMonth: "Este Mes",
    shortcutSend: "Enviar Mensaje", shortcutNewChat: "Nuevo Chat", shortcutSearch: "Busqueda", shortcutFocus: "Enfocar Input", shortcutTheme: "Cambiar Tema",
      smartNotificationTitle: "¡Hola! 👋",
    smartNotificationMessage: "Haz una nueva pregunta — ¡estoy aquí para ayudarte!",
    smartNotificationDismiss: "Cerrar",
    smartNotificationDays: "días",
    smartNotificationAgo: "desde la última visita",
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
    streaming: "Diffusion", analytics: "Analyses", notifications: "Notifications", customTheme: "Theme Personnalise", shortcuts: "Raccourcis", feedback: "Retour", sendFeedback: "Envoyer Retour", feedbackPlaceholder: "Vos commentaires...", feedbackSent: "Retour envoye! Merci!",
    totalMessages: "Messages Totaux", totalChats: "Chats Totaux", avgResponseTime: "Temps Moyen", charactersTyped: "Caracteres", today: "Aujourd'hui", thisWeek: "Cette Semaine", thisMonth: "Ce Mois",
    shortcutSend: "Envoyer Message", shortcutNewChat: "Nouveau Chat", shortcutSearch: "Recherche", shortcutFocus: "Focus Input", shortcutTheme: "Changer Theme",
      smartNotificationTitle: "Salut! 👋",
    smartNotificationMessage: "Pose une nouvelle question — je suis là pour t'aider!",
    smartNotificationDismiss: "Fermer",
    smartNotificationDays: "jours",
    smartNotificationAgo: "depuis la dernière visite",
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
    streaming: "Streaming", analytics: "Analysen", notifications: "Benachrichtigungen", customTheme: "Benutzerdefiniertes Theme", shortcuts: "Tastenkombinationen", feedback: "Feedback", sendFeedback: "Feedback Senden", feedbackPlaceholder: "Ihr Feedback...", feedbackSent: "Feedback gesendet! Danke!",
    totalMessages: "Nachrichten Gesamt", totalChats: "Chats Gesamt", avgResponseTime: "Durchschnittszeit", charactersTyped: "Zeichen", today: "Heute", thisWeek: "Diese Woche", thisMonth: "Dieser Monat",
    shortcutSend: "Nachricht Senden", shortcutNewChat: "Neuer Chat", shortcutSearch: "Suche", shortcutFocus: "Input Fokus", shortcutTheme: "Theme Wechseln",
      smartNotificationTitle: "Hallo! 👋",
    smartNotificationMessage: "Stell eine neue Frage — ich bin hier, um zu helfen!",
    smartNotificationDismiss: "Schließen",
    smartNotificationDays: "Tage",
    smartNotificationAgo: "seit dem letzten Besuch",
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
    streaming: "Translyatsiya", analytics: "Analitika", notifications: "Uvedomleniya", customTheme: "Pol'zovatel'skaya Tema", shortcuts: "Goryachie Klavishi", feedback: "Otziv", sendFeedback: "Otpravit' Otziv", feedbackPlaceholder: "Vash otziv...", feedbackSent: "Otziv otpravlen! Spasibo!",
    totalMessages: "Vsego Soobshcheniy", totalChats: "Vsego Chatov", avgResponseTime: "Srednee Vremya", charactersTyped: "Simvolov", today: "Segodnya", thisWeek: "Etu Nedelyu", thisMonth: "Etot Mesyats",
    shortcutSend: "Otpravit' Soobshchenie", shortcutNewChat: "Novyy Chat", shortcutSearch: "Poisk", shortcutFocus: "Fokus Inputa", shortcutTheme: "Smene Temy",
      smartNotificationTitle: "Привет! 👋",
    smartNotificationMessage: "Задай новый вопрос — я здесь, чтобы помочь!",
    smartNotificationDismiss: "Закрыть",
    smartNotificationDays: "дней",
    smartNotificationAgo: "с последнего визита",
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
    streaming: "Bath Mubashar", analytics: "Tahlilat", notifications: "Tanzimat", customTheme: "Mawzu' Mukassas", shortcuts: "Iqtirahat", feedback: "Raja'", sendFeedback: "Irsal Raja'", feedbackPlaceholder: "Tafqidak...", feedbackSent: "Raja' Irsal! Shukran!",
    totalMessages: "Ijmal al-Rasail", totalChats: "Ijmal al-Muhadathat", avgResponseTime: "Zaman al-Ijaba", charactersTyped: "Huruf", today: "Al-Yawm", thisWeek: "Hadha al-Usbua'", thisMonth: "Hadha al-Shahr",
    shortcutSend: "Irsal Risala", shortcutNewChat: "Muhadatha Jadida", shortcutSearch: "Bahth", shortcutFocus: "Turkiz Input", shortcutTheme: "Taghyir al-Mawzu'",
      smartNotificationTitle: "مرحباً! 👋",
    smartNotificationMessage: "اسأل سؤالاً جديداً — أنا هنا للمساعدة!",
    smartNotificationDismiss: "إغلاق",
    smartNotificationDays: "أيام",
    smartNotificationAgo: "منذ آخر زيارة",
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

// ── Save Chat ──
function saveChatToLocal(messages, title) {
  const chats = JSON.parse(localStorage.getItem("shardeumai-saved-chats") || "[]");
  const newChat = {
    id: Date.now().toString(),
    title: title || "Saved Chat",
    messages: messages,
    savedAt: new Date().toISOString(),
  };
  chats.unshift(newChat);
  localStorage.setItem("shardeumai-saved-chats", JSON.stringify(chats.slice(0, 50)));
  return newChat.id;
}

function loadSavedChats() {
  return JSON.parse(localStorage.getItem("shardeumai-saved-chats") || "[]");
}

function deleteSavedChat(chatId) {
  const chats = loadSavedChats().filter(c => c.id !== chatId);
  localStorage.setItem("shardeumai-saved-chats", JSON.stringify(chats));
}

function downloadChatJSON(messages, title) {
  const data = {
    title: title || "ShardeumAI Chat",
    exportedAt: new Date().toISOString(),
    messages: messages,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `chat-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
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

function WelcomePage({ t, th, theme, setTheme, uiLang, setUiLang, onStart, isMobile }) {
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
          width: isMobile ? 70 : 100, height: isMobile ? 70 : 100, borderRadius: 24,
          background: th.gradient,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 48, fontWeight: 700, color: "#fff",
          margin: "0 auto 32px",
        }}>
          S
        </div>

        <h1 className="welcome-anim-2" style={{
          margin: 0, fontSize: isMobile ? 28 : 42, fontWeight: 800,
          color: th.text, lineHeight: 1.2,
          letterSpacing: "-0.02em",
        }}>
          {t.welcomePageTitle}
        </h1>

        <p className="welcome-anim-3" style={{
          margin: "16px 0 0", fontSize: isMobile ? 14 : 18,
          color: th.textSecondary, fontWeight: 400,
        }}>
          {t.welcomePageSubtitle}
        </p>

        <div className="welcome-anim-3" style={{
          display: "flex", gap: isMobile ? 12 : 24, justifyContent: "center",
          marginTop: isMobile ? 24 : 40, flexWrap: "wrap",
        }}>
          {[
            { icon: "🤖", text: "AI Chat" },
            { icon: "🎨", text: "Image Gen" },
            { icon: "🌐", text: "7 Languages" },
            { icon: "⚡", text: "Fast" },
          ].map(f => (
            <div key={f.text} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              padding: isMobile ? "12px 14px" : "16px 20px", borderRadius: 12,
              background: th.bgSecondary, border: `1px solid ${th.border}`,
              minWidth: isMobile ? 80 : 100,
            }}>
              <span style={{ fontSize: 28 }}>{f.icon}</span>
              <span style={{ fontSize: 12, color: th.textSecondary, fontWeight: 500 }}>{f.text}</span>
            </div>
          ))}
        </div>

        <div className="welcome-anim-4" style={{ marginTop: 48 }}>
          <button onClick={onStart}
            style={{
              padding: isMobile ? "12px 32px" : "16px 48px", borderRadius: 14,
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
  const isMobile = useMobile();
  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem("shardeumai-welcome-v2");
  });
  const [uiLang, setUiLang] = useState("en");
  const [modelLang, setModelLang] = useState("auto");
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");
  const [ratings, setRatings] = useState({});
  const [selectedModel, setSelectedModel] = useState("llama-3.1-8b-instant");
  const [aiMode, setAiMode] = useState("general");
  const [webSearch, setWebSearch] = useState(false);
  const [searchProvider, setSearchProvider] = useState("tavily");
  const [showSearchProvider, setShowSearchProvider] = useState(false);
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
  const [isListening, setIsListening] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showSavedChats, setShowSavedChats] = useState(false);
  const [savedChats, setSavedChats] = useState([]);
  const [streamingEnabled, setStreamingEnabled] = useState(() => localStorage.getItem("shardeumai-streaming") !== "false");
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({ totalMessages: 0, totalChats: 0, avgResponseTime: 0, charactersTyped: 0, messagesToday: 0, messagesThisWeek: 0, messagesThisMonth: 0 });
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [customAccentColor, setCustomAccentColor] = useState(() => localStorage.getItem("shardeumai-accent") || "#10a37f");
  const fileInputRef = useRef(null);
  const chatRef = useRef(null);
  const inputRef = useRef(null);
  const responseTimeRef = useRef(null);

  // ── Smart Notification States ──
  const [showSmartNotification, setShowSmartNotification] = useState(false);
  const [daysSinceLastVisit, setDaysSinceLastVisit] = useState(0);
  const [smartNotifDismissed, setSmartNotifDismissed] = useState(() => {
    return localStorage.getItem("shardeumai-smart-notif-dismissed") === "true";
  });
  const responseTimeRef = useRef(null);

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

  // ── Load Saved Chats ──
  useEffect(() => {
    setSavedChats(loadSavedChats());
  }, [showSavedChats]);

  // ── Voice Recognition ──
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) return;
    // Cleanup previous instance
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }
  }, [uiLang]);

  // ── Smart Notification ──
  useEffect(() => {
    const lastVisit = localStorage.getItem("shardeumai-last-visit");
    const now = new Date().toISOString();

    if (lastVisit && !smartNotifDismissed && session) {
      const lastVisitDate = new Date(lastVisit);
      const currentDate = new Date();
      const diffTime = Math.abs(currentDate - lastVisitDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 2) {
        setDaysSinceLastVisit(diffDays);
        setShowSmartNotification(true);
      }
    }

    localStorage.setItem("shardeumai-last-visit", now);
  }, [session, smartNotifDismissed]);

  function dismissSmartNotification() {
    setShowSmartNotification(false);
    setSmartNotifDismissed(true);
    localStorage.setItem("shardeumai-smart-notif-dismissed", "true");
  }

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

  async function rateMessage(idx, rating) {
    if (!session) return;
    const msg = messages[idx];
    if (!msg || msg.role !== "assistant") return;
    const key = String(idx);
    const prev = ratings[key];
    if (prev === rating) {
      setRatings(r => { const n = {...r}; delete n[key]; return n; });
      return;
    }
    setRatings(r => ({ ...r, [key]: rating }));
    await supabase.from("message_ratings").insert({
      user_id: session.user.id,
      conversation_id: activeConvoId,
      message_content: msg.content.slice(0, 500),
      rating,
    });
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

  // ── Analytics ──
  function calculateAnalytics() {
    const allChats = [...conversations];
    const now = new Date();
    const today = now.toDateString();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    let totalMsgs = messages.length;
    let charsTyped = messages.filter(m => m.role === "user").reduce((a, m) => a + m.content.length, 0);
    let msgToday = messages.filter(m => new Date(m.created_at || Date.now()).toDateString() === today).length;
    let msgWeek = messages.filter(m => new Date(m.created_at || Date.now()) > weekAgo).length;
    let msgMonth = messages.filter(m => new Date(m.created_at || Date.now()) > monthAgo).length;

    setAnalyticsData({
      totalMessages: totalMsgs,
      totalChats: allChats.length + (activeConvoId ? 1 : 0),
      avgResponseTime: 0,
      charactersTyped: charsTyped,
      messagesToday: msgToday,
      messagesThisWeek: msgWeek,
      messagesThisMonth: msgMonth,
    });
  }

  // ── Feedback ──
  async function sendFeedback() {
    if (!feedbackText.trim()) return;
    try {
      await supabase.from("feedback").insert({
        user_id: session?.user?.id || null,
        email: session?.user?.email || "anonymous",
        message: feedbackText.trim(),
        rating: 5,
        created_at: new Date().toISOString(),
      });
    } catch (e) {
      console.log("Feedback save error:", e);
    }
    setFeedbackSent(true);
    setFeedbackText("");
    setTimeout(() => setFeedbackSent(false), 3000);
  }

  // ── Keyboard Shortcuts ──
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "n" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        startNewChat();
      }
      if (e.key === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setWebSearch(prev => !prev);
      }
      if (e.key === "t" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setTheme(theme === "dark" ? "light" : theme === "light" ? "auto" : "dark");
      }
      if (e.key === "?" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setShowShortcuts(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [theme]);

  // ── Voice Input ──
  function toggleVoiceInput() {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice input not supported in your browser. Please use Chrome or Safari.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
      }
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = uiLang === "fa" ? "fa-IR" : uiLang === "ar" ? "ar-SA" : uiLang === "ru" ? "ru-RU" : uiLang === "de" ? "de-DE" : uiLang === "fr" ? "fr-FR" : uiLang === "es" ? "es-ES" : "en-US";

    recognition.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join("");
      setInput(prev => prev ? prev + " " + transcript : transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onerror = (e) => {
      console.log("Voice error:", e.error);
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setInput("");
    recognition.start();
    setIsListening(true);
  }

  // ── File Upload ──
  function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedFiles(prev => [...prev, {
          name: file.name,
          type: file.type,
          size: file.size,
          content: event.target.result,
          id: Date.now().toString() + Math.random().toString(36).slice(2),
        }]);
      };
      if (file.type.startsWith("image/")) {
        reader.readAsDataURL(file);
      } else if (file.type === "application/pdf" || file.type.includes("text") || file.name.endsWith(".txt") || file.name.endsWith(".md") || file.name.endsWith(".js") || file.name.endsWith(".py") || file.name.endsWith(".json")) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    });
    e.target.value = "";
  }

  function removeUploadedFile(fileId) {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() && uploadedFiles.length === 0) return;
    if (!session) { alert("Please login first."); return; }
    let messageContent = input.trim();

    // Add uploaded files context
    if (uploadedFiles.length > 0) {
      const fileContext = uploadedFiles.map(f => {
        if (f.type.startsWith("image/")) {
          return `[Uploaded Image: ${f.name}]`;
        } else if (f.content && f.content.length < 5000) {
          return `[File: ${f.name}]\n${f.content}`;
        } else {
          return `[File: ${f.name} (${formatFileSize(f.size)})]`;
        }
      }).join("\n\n");
      messageContent = messageContent ? messageContent + "\n\n" + fileContext : fileContext;
    }

    const userMsg = { role: "user", content: messageContent };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setChatLoading(true);

    let reply = "";

    try {
      const currentMode = AI_MODES.find(m => m.id === aiMode);

      console.log("Sending request to edge function...", {
        url: EDGE_FUNCTION_URL,
        model: selectedModel,
        streaming: streamingEnabled,
        messageCount: newMessages.length
      });

      const response = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${session.access_token}` 
        },
        body: JSON.stringify({
          messages: newMessages, 
          language: modelLang, 
          system_prompt: currentMode?.prompt,
          web_search: webSearch, 
          search_provider: searchProvider, 
          model: selectedModel,
          stream: streamingEnabled,
        }),
      });

      console.log("Response received:", response.status, response.statusText);

      // CRITICAL FIX: Check if response is OK before parsing
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Edge function error:", response.status, errorText);
        throw new Error(`Server error ${response.status}: ${errorText.slice(0, 200)}`);
      }

      if (streamingEnabled) {
        // Streaming mode
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullReply = "";

        if (!reader) {
          throw new Error("Response body is not readable");
        }

        // Add empty assistant message for streaming
        setMessages(prev => [...prev, { role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            // Handle SSE format: "data: {...}"
            if (trimmedLine.startsWith("data: ")) {
              const data = trimmedLine.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content || "";
                if (delta) {
                  fullReply += delta;
                  setMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1] = { role: "assistant", content: fullReply };
                    return newMsgs;
                  });
                }
              } catch (e) {
                console.log("Failed to parse SSE data:", data);
              }
            } 
            // Handle plain text chunks (non-SSE format)
            else {
              fullReply += trimmedLine + "\n";
              setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1] = { role: "assistant", content: fullReply };
                return newMsgs;
              });
            }
          }
        }

        reply = fullReply || "No response";

      } else {
        // Non-streaming mode
        const contentType = response.headers.get("content-type");
        console.log("Response content-type:", contentType);

        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          console.log("Response data:", data);
          reply = data.reply || data.response || data.message || data.content || JSON.stringify(data);
        } else {
          // Handle plain text response
          reply = await response.text();
          console.log("Response text:", reply.slice(0, 200));
        }

        setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      }

      let convoId = activeConvoId;
      if (!convoId) {
        const title = userMsg.content.slice(0, 50) || "New Chat";
        const { data: newConvo } = await supabase.from("conversations").insert({ user_id: session.user.id, title }).select().single();
        if (newConvo) { convoId = newConvo.id; setActiveConvoId(convoId); setConversations(prev => [newConvo, ...prev]); }
      }

      if (convoId) {
        await saveMessage(session.user.id, "user", userMsg.content, convoId);
        await saveMessage(session.user.id, "assistant", reply, convoId);
      }

    } catch (err) {
      console.error("Chat error details:", err);
      const errorMsg = err.message || "Unknown error occurred";
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Error: " + errorMsg }]);
    } finally {
      setUploadedFiles([]);
      setChatLoading(false);
    }
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
        isMobile={isMobile}
        onStart={() => {
          localStorage.setItem("shardeumai-welcome-v2", "true");
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
      <div style={{
        width: isMobile ? (sidebarOpen ? 260 : 0) : (sidebarOpen ? 260 : 0),
        minWidth: isMobile ? (sidebarOpen ? 260 : 0) : (sidebarOpen ? 260 : 0),
        position: isMobile && sidebarOpen ? "fixed" : "relative",
        zIndex: isMobile && sidebarOpen ? 200 : "auto",
        height: isMobile ? "100vh" : "auto",
        top: isMobile ? 0 : "auto",
        left: isMobile ? 0 : "auto",
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
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 199 }} />
      )}

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}>

        {/* Header */}
        <div style={{
          height: isMobile ? "auto" : 48,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: isMobile ? "6px 8px" : "0 16px",
          borderBottom: "1px solid #2d2d2d", flexShrink: 0,
          flexWrap: isMobile ? "wrap" : "nowrap",
          gap: isMobile ? 4 : 0,
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
            {/* Desktop Feature Buttons */}
            {!isMobile && (
              <>
                <button onClick={() => { setStreamingEnabled(!streamingEnabled); localStorage.setItem("shardeumai-streaming", !streamingEnabled); }}
                  title={t.streaming}
                  style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${streamingEnabled ? "#10a37f" : "#3d3d3d"}`, background: streamingEnabled ? "#10a37f22" : "transparent", color: streamingEnabled ? "#10a37f" : "#8e8ea0", fontSize: 12, cursor: "pointer" }}>
                  🔄
                </button>
                <button onClick={() => { calculateAnalytics(); setShowAnalytics(!showAnalytics); }}
                  title={t.analytics}
                  style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #3d3d3d", background: showAnalytics ? "#404040" : "transparent", color: showAnalytics ? "#10a37f" : "#8e8ea0", fontSize: 12, cursor: "pointer" }}>
                  📊
                </button>
                <button onClick={() => setShowShortcuts(!showShortcuts)}
                  title={t.shortcuts}
                  style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #3d3d3d", background: showShortcuts ? "#404040" : "transparent", color: showShortcuts ? "#10a37f" : "#8e8ea0", fontSize: 12, cursor: "pointer" }}>
                  ⌨️
                </button>
                <button onClick={() => setShowFeedback(!showFeedback)}
                  title={t.feedback}
                  style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #3d3d3d", background: showFeedback ? "#404040" : "transparent", color: showFeedback ? "#10a37f" : "#8e8ea0", fontSize: 12, cursor: "pointer" }}>
                  💬
                </button>
                <div style={{ position: "relative" }}>
                  <button title={t.customTheme}
                    style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #3d3d3d", background: "transparent", color: "#8e8ea0", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 12, height: 12, borderRadius: "50%", background: customAccentColor, display: "inline-block" }}></span>
                    🎨
                  </button>
                  <input
                    type="color"
                    value={customAccentColor}
                    onChange={(e) => { setCustomAccentColor(e.target.value); localStorage.setItem("shardeumai-accent", e.target.value); }}
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
                  />
                </div>
              </>
            )}
            <div style={{ position: "relative" }}>
              <button onClick={() => setWebSearch(!webSearch)}
                style={{ padding: "4px 10px", borderRadius: 8, border: `1px solid ${webSearch ? "#10a37f" : "#3d3d3d"}`, background: webSearch ? "#10a37f22" : "transparent", color: webSearch ? "#10a37f" : "#8e8ea0", fontSize: 12, cursor: "pointer" }}>
                🔍
              </button>
              {webSearch && (
                <button onClick={() => setShowSearchProvider(!showSearchProvider)}
                  style={{ padding: "4px 6px", borderRadius: 8, border: "1px solid #3d3d3d", background: "#2d2d2d", color: "#8e8ea0", fontSize: 10, cursor: "pointer", marginLeft: 4 }}>
                  ▼
                </button>
              )}
              {webSearch && showSearchProvider && (
                <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, background: "#2d2d2d", border: "1px solid #3d3d3d", borderRadius: 8, padding: 4, zIndex: 100, minWidth: 100 }}>
                  {["tavily", "exa", "firecrawl"].map(p => (
                    <button key={p} onClick={() => { setSearchProvider(p); setShowSearchProvider(false); }}
                      style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "none", background: searchProvider === p ? "#404040" : "transparent", color: searchProvider === p ? "#10a37f" : "#ececec", fontSize: 12, cursor: "pointer", textAlign: "left" }}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Desktop tabs - inline */}
            {!isMobile && ["chat", "image", "profile", "api"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ padding: "4px 10px", borderRadius: 8, border: "none", background: activeTab === tab ? "#404040" : "transparent", color: activeTab === tab ? (tab === "api" ? "#a855f7" : "#ececec") : "#8e8ea0", fontSize: 12, cursor: "pointer" }}>
                {tab === "chat" ? "💬" : tab === "image" ? "🎨" : tab === "profile" ? "👤" : "🔌"}
              </button>
            ))}
            {!isMobile && session?.user?.email === ADMIN_EMAIL && (
              <button onClick={() => { setActiveTab("admin"); loadAdminData(); }}
                style={{ padding: "4px 10px", borderRadius: 8, border: "none", background: activeTab === "admin" ? "#404040" : "transparent", color: activeTab === "admin" ? "#f59e0b" : "#8e8ea0", fontSize: 12, cursor: "pointer" }}>
                ⚙️
              </button>
            )}
          </div>
        </div>

        {/* Smart Notification Banner */}
        {showSmartNotification && activeTab === "chat" && (
          <div style={{
            padding: "12px 16px",
            background: "#10a37f22",
            borderBottom: "1px solid #10a37f44",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexShrink: 0,
            animation: "welcomeFadeIn 0.5s ease-out",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
              <span style={{ fontSize: 24 }}>👋</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#10a37f" }}>
                  {t.smartNotificationTitle}
                </div>
                <div style={{ fontSize: 12, color: "#8e8ea0", marginTop: 2 }}>
                  {t.smartNotificationMessage}
                  <span style={{ color: "#10a37f", marginRight: 4, marginLeft: 4 }}>
                    ({daysSinceLastVisit} {t.smartNotificationDays} {t.smartNotificationAgo})
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={dismissSmartNotification}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                border: "1px solid #10a37f44",
                background: "transparent",
                color: "#10a37f",
                fontSize: 12,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "#10a37f22";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              {t.smartNotificationDismiss}
            </button>
          </div>
        )}

        {/* Mobile Tabs Row */}
        {isMobile && (
          <div style={{ flexShrink: 0, borderBottom: "1px solid #2d2d2d" }}>
            {/* Tab buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", overflowX: "auto" }}>
              {["chat", "image", "profile", "api"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: activeTab === tab ? "#404040" : "transparent", color: activeTab === tab ? (tab === "api" ? "#a855f7" : "#ececec") : "#8e8ea0", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>
                  {tab === "chat" ? "💬 Chat" : tab === "image" ? "🎨 Image" : tab === "profile" ? "👤 Profile" : "🔌 API"}
                </button>
              ))}
              {session?.user?.email === ADMIN_EMAIL && (
                <button onClick={() => { setActiveTab("admin"); loadAdminData(); }}
                  style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: activeTab === "admin" ? "#404040" : "transparent", color: activeTab === "admin" ? "#f59e0b" : "#8e8ea0", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>
                  ⚙️ Admin
                </button>
              )}
            </div>
            {/* Feature buttons - second row */}
            <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px 6px", overflowX: "auto" }}>
              <button onClick={() => { setStreamingEnabled(!streamingEnabled); }}
                title={t.streaming}
                style={{ padding: "5px 10px", borderRadius: 8, border: `1px solid ${streamingEnabled ? "#10a37f" : "#3d3d3d"}`, background: streamingEnabled ? "#10a37f22" : "transparent", color: streamingEnabled ? "#10a37f" : "#8e8ea0", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap" }}>
                🔄 {t.streaming}
              </button>
              <button onClick={() => { calculateAnalytics(); setShowAnalytics(!showAnalytics); }}
                title={t.analytics}
                style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid #3d3d3d", background: showAnalytics ? "#404040" : "transparent", color: showAnalytics ? "#10a37f" : "#8e8ea0", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap" }}>
                📊 {t.analytics}
              </button>
              <button onClick={() => setShowShortcuts(!showShortcuts)}
                title={t.shortcuts}
                style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid #3d3d3d", background: showShortcuts ? "#404040" : "transparent", color: showShortcuts ? "#10a37f" : "#8e8ea0", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap" }}>
                ⌨️ {t.shortcuts}
              </button>
              <button onClick={() => setShowFeedback(!showFeedback)}
                title={t.feedback}
                style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid #3d3d3d", background: showFeedback ? "#404040" : "transparent", color: showFeedback ? "#10a37f" : "#8e8ea0", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap" }}>
                💬 {t.feedback}
              </button>
              <div style={{ position: "relative", display: "inline-block" }}>
                <button title={t.customTheme}
                  style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid #3d3d3d", background: "transparent", color: "#8e8ea0", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: customAccentColor, display: "inline-block" }}></span>
                  🎨 {t.customTheme}
                </button>
                <input
                  type="color"
                  value={customAccentColor}
                  onChange={(e) => { setCustomAccentColor(e.target.value); }}
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Analytics Panel */}
        {showAnalytics && (
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #2d2d2d", background: "#171717" }}>
            <div style={{ maxWidth: 768, margin: "0 auto", display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              {[
                { label: t.totalMessages, value: analyticsData.totalMessages, icon: "💬" },
                { label: t.totalChats, value: analyticsData.totalChats, icon: "📁" },
                { label: t.charactersTyped, value: analyticsData.charactersTyped, icon: "📝" },
                { label: t.today, value: analyticsData.messagesToday, icon: "📅" },
                { label: t.thisWeek, value: analyticsData.messagesThisWeek, icon: "📆" },
                { label: t.thisMonth, value: analyticsData.messagesThisMonth, icon: "🗓️" },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: "center", padding: "8px 16px", borderRadius: 10, background: "#2d2d2d", border: "1px solid #3d3d3d", minWidth: 100 }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{stat.icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#10a37f" }}>{stat.value}</div>
                  <div style={{ fontSize: 10, color: "#8e8ea0" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shortcuts Panel */}
        {showShortcuts && (
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #2d2d2d", background: "#171717" }}>
            <div style={{ maxWidth: 768, margin: "0 auto" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#ececec", marginBottom: 10 }}>⌨️ {t.shortcuts}</div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: 8 }}>
                {[
                  { key: "Ctrl + Enter / ⌘ + Enter", action: t.shortcutSend },
                  { key: "Ctrl + N / ⌘ + N", action: t.shortcutNewChat },
                  { key: "Ctrl + K / ⌘ + K", action: t.shortcutSearch },
                  { key: "/", action: t.shortcutFocus },
                  { key: "Ctrl + T / ⌘ + T", action: t.shortcutTheme },
                  { key: "Ctrl + ? / ⌘ + ?", action: t.shortcuts },
                ].map(s => (
                  <div key={s.action} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "#2d2d2d", borderRadius: 6, fontSize: 12 }}>
                    <span style={{ color: "#8e8ea0" }}>{s.action}</span>
                    <kbd style={{ background: "#404040", padding: "2px 6px", borderRadius: 4, fontSize: 11, color: "#ececec", fontFamily: "monospace" }}>{s.key}</kbd>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowShortcuts(false)} style={{ marginTop: 8, padding: "4px 12px", borderRadius: 6, border: "1px solid #3d3d3d", background: "transparent", color: "#8e8ea0", fontSize: 11, cursor: "pointer" }}>Close</button>
            </div>
          </div>
        )}

        {/* Feedback Panel */}
        {showFeedback && (
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #2d2d2d", background: "#171717" }}>
            <div style={{ maxWidth: 768, margin: "0 auto" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#ececec", marginBottom: 10 }}>💬 {t.feedback}</div>
              {feedbackSent ? (
                <div style={{ color: "#10a37f", fontSize: 14, padding: "10px 0" }}>✅ {t.feedbackSent}</div>
              ) : (
                <>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder={t.feedbackPlaceholder}
                    rows={3}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #3d3d3d", background: "#2d2d2d", color: "#ececec", fontSize: 13, outline: "none", resize: "vertical", marginBottom: 8 }}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={sendFeedback} disabled={!feedbackText.trim()}
                      style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#10a37f", color: "#fff", fontSize: 13, cursor: feedbackText.trim() ? "pointer" : "default", opacity: feedbackText.trim() ? 1 : 0.5 }}>
                      {t.sendFeedback}
                    </button>
                    <button onClick={() => setShowFeedback(false)}
                      style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #3d3d3d", background: "transparent", color: "#8e8ea0", fontSize: 13, cursor: "pointer" }}>
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Chat / Image / Admin */}
        {activeTab === "chat" ? (
          <>
            <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "20px 0" }}>
              {messages.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: isMobile ? 20 : 40 }}>
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
                    <div style={{ maxWidth: 768, margin: "0 auto", padding: isMobile ? "12px 8px" : "20px 24px", display: "flex", gap: isMobile ? 10 : 16, direction: isRTL ? "rtl" : "ltr" }}>
                      <div style={{ width: isMobile ? 24 : 28, height: isMobile ? 24 : 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: isMobile ? 10 : 12, fontWeight: 600, color: "#fff",
                        background: msg.role === "user" ? profile.avatar_color : "#10a37f",
                      }}>
                        {msg.role === "user" ? (profile.display_name || "U")[0].toUpperCase() : "S"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0, color: "#ececec", fontSize: isMobile ? 14 : 15, lineHeight: 1.7, direction: "auto" }}>
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
                        {msg.role === "assistant" && msg.content && (
                          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                            <button
                              onClick={() => rateMessage(idx, "up")}
                              title="Good response"
                              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, opacity: ratings[String(idx)] === "up" ? 1 : 0.4, color: ratings[String(idx)] === "up" ? "#10a37f" : "#8e8ea0", padding: "2px 4px", borderRadius: 4, transition: "all 0.15s" }}>
                              👍
                            </button>
                            <button
                              onClick={() => rateMessage(idx, "down")}
                              title="Bad response"
                              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, opacity: ratings[String(idx)] === "down" ? 1 : 0.4, color: ratings[String(idx)] === "down" ? "#ef4444" : "#8e8ea0", padding: "2px 4px", borderRadius: 4, transition: "all 0.15s" }}>
                              👎
                            </button>
                          </div>
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
            <div style={{ padding: isMobile ? "8px 8px 16px" : "12px 16px 24px", borderTop: "1px solid #2d2d2d", flexShrink: 0 }}>
              <div style={{ maxWidth: 768, margin: "0 auto", width: "100%", position: "relative" }}>
                <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {/* Uploaded Files Preview */}
                  {uploadedFiles.length > 0 && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "0 4px" }}>
                      {uploadedFiles.map(file => (
                        <div key={file.id} style={{
                          display: "flex", alignItems: "center", gap: 6,
                          padding: "4px 10px", borderRadius: 8,
                          background: "#404040", border: "1px solid #3d3d3d",
                          fontSize: 12, color: "#ececec",
                        }}>
                          <span>{file.type.startsWith("image/") ? "🖼️" : "📄"}</span>
                          <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
                          <span style={{ color: "#8e8ea0", fontSize: 10 }}>({formatFileSize(file.size)})</span>
                          <button type="button" onClick={() => removeUploadedFile(file.id)}
                            style={{ background: "none", border: "none", color: "#e0746a", cursor: "pointer", fontSize: 14, padding: 0, marginLeft: 4 }}>
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-end", width: "100%" }}>
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px"; }}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if ((input.trim() || uploadedFiles.length > 0) && !chatLoading) handleSend(e); } }}
                      placeholder={isListening ? "Listening..." : t.placeholder}
                      rows={1}
                      style={{
                        flex: 1, padding: "14px 16px", borderRadius: 16,
                        border: "1px solid #3d3d3d", background: "#2d2d2d", color: "#ececec",
                        fontSize: 15, outline: "none", resize: "none", overflow: "hidden",
                        minHeight: 52, maxHeight: 200, lineHeight: 1.5, direction: isRTL ? "rtl" : "ltr",
                      }}
                      disabled={chatLoading || isListening}
                    />
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <button type="button" onClick={toggleVoiceInput}
                        style={{
                          width: isMobile ? 32 : 36, height: isMobile ? 32 : 36, borderRadius: "50%",
                          border: "none", background: isListening ? "#ef4444" : "#404040",
                          color: "#fff", fontSize: 14, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.3s",
                          animation: isListening ? "pulse 1.5s infinite" : "none",
                          flexShrink: 0,
                        }}>
                        {isListening ? "🔴" : "🎤"}
                      </button>
                      <button type="button" onClick={() => fileInputRef.current?.click()}
                        style={{
                          width: isMobile ? 32 : 36, height: isMobile ? 32 : 36, borderRadius: "50%",
                          border: "none", background: "#404040",
                          color: "#fff", fontSize: 14, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}>
                        📎
                      </button>
                      <button type="submit" disabled={(!input.trim() && uploadedFiles.length === 0) || chatLoading}
                        style={{
                          width: isMobile ? 32 : 36, height: isMobile ? 32 : 36, borderRadius: "50%",
                          border: "none", background: (input.trim() || uploadedFiles.length > 0) ? "#10a37f" : "#5c5c5c",
                          color: "#fff", fontSize: 14, cursor: (input.trim() || uploadedFiles.length > 0) ? "pointer" : "default",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}>
                        ➤
                      </button>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    accept="image/*,.txt,.md,.pdf,.js,.py,.json,.csv,.html,.css"
                    style={{ display: "none" }}
                  />
                </form>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, flexWrap: "wrap", gap: 4 }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
                  {/* Save Chat Button */}
                  {messages.length > 0 && (
                    <div style={{ position: "relative" }}>
                      <button onClick={() => {
                        const title = messages[0]?.content?.slice(0, 50) || "Saved Chat";
                        saveChatToLocal(messages, title);
                        alert("Chat saved!");
                        setSavedChats(loadSavedChats());
                      }}
                        style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #3d3d3d", background: "transparent", color: "#8e8ea0", fontSize: 11, cursor: "pointer" }}>
                        💾 Save
                      </button>
                    </div>
                  )}
                  {/* Saved Chats Dropdown */}
                  {savedChats.length > 0 && (
                    <div style={{ position: "relative" }}>
                      <button onClick={() => setShowSavedChats(!showSavedChats)}
                        style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #3d3d3d", background: "transparent", color: "#8e8ea0", fontSize: 11, cursor: "pointer" }}>
                        📂 Saved ({savedChats.length})
                      </button>
                      {showSavedChats && (
                        <div style={{ position: "absolute", bottom: "calc(100% + 4px)", left: 0, background: "#2d2d2d", border: "1px solid #3d3d3d", borderRadius: 8, padding: 4, minWidth: 220, zIndex: 100, maxHeight: 300, overflowY: "auto" }}>
                          {savedChats.map(chat => (
                            <div key={chat.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 4, cursor: "pointer" }}
                              onMouseEnter={e => e.currentTarget.style.background = "#404040"}
                              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                              <span onClick={() => { setMessages(chat.messages); setShowSavedChats(false); }}
                                style={{ flex: 1, fontSize: 12, color: "#ececec", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {chat.title}
                              </span>
                              <button onClick={(e) => { e.stopPropagation(); deleteSavedChat(chat.id); setSavedChats(loadSavedChats()); }}
                                style={{ background: "none", border: "none", color: "#e0746a", cursor: "pointer", fontSize: 12 }}>
                                🗑
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
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
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
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
