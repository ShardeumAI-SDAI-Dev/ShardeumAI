import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

// Load highlight.js CSS
if (typeof document !== "undefined" && !document.getElementById("hljs-css")) {
  const link = document.createElement("link");
  link.id = "hljs-css";
  link.rel = "stylesheet";
  link.href = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/styles/github-dark.min.css";
  document.head.appendChild(link);
}

// Load Vazirmatn font
if (typeof document !== "undefined" && !document.getElementById("vazirmatn-font")) {
  const link = document.createElement("link");
  link.id = "vazirmatn-font";
  link.rel = "stylesheet";
  link.href = "https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css";
  document.head.appendChild(link);
}

const SUPABASE_URL = "https://zzolokpbjkrvkyaubcoq.supabase.co";
const ADMIN_EMAIL = "farhad1984crypto@gmail.com";
const SUPABASE_KEY = "sb_publishable_mxVEWWeumrPEedmA4yD0cg_ZMPgwWYU";
const EDGE_FUNCTION_URL = "https://zzolokpbjkrvkyaubcoq.supabase.co/functions/v1/chat";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const UI_LANGUAGES = [
  { code: "fa", label: "فارسی", flag: "🇮🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
];

const MODEL_LANGUAGES = [
  { code: "auto", label: "Auto", flag: "🌐" },
  { code: "fa", label: "فارسی", flag: "🇮🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
];

const AI_MODES = [
  { id: "general", label: "🌐 General", prompt: "You are ShardeumAI (SDAI), a helpful bilingual AI assistant (Persian/English). Reply in the same language the user writes in. Be friendly, accurate, and helpful." },
  { id: "crypto", label: "₿ Crypto", prompt: "You are ShardeumAI (SDAI), a crypto and blockchain expert assistant. You specialize in Shardeum, Ethereum, Bitcoin, DeFi, NFTs, Web3, tokenomics, and market analysis. Reply in the same language the user writes in. Give accurate, detailed crypto information." },
  { id: "shardeum", label: "⬡ Shardeum", prompt: "You are ShardeumAI (SDAI), a specialized Shardeum blockchain assistant. You have deep knowledge of Shardeum's architecture, SHM token, EVM compatibility, dynamic state sharding, validators, and ecosystem. Reply in the same language the user writes in." },
  { id: "defi", label: "💰 DeFi", prompt: "You are ShardeumAI (SDAI), a DeFi (Decentralized Finance) expert. You specialize in liquidity pools, yield farming, DEXs, lending protocols, staking, and DeFi strategies. Reply in the same language the user writes in." },
  { id: "web3", label: "🔗 Web3", prompt: "You are ShardeumAI (SDAI), a Web3 and smart contract expert. You specialize in Solidity, dApps, MetaMask, wallets, NFTs, DAOs, and decentralized technologies. Reply in the same language the user writes in." },
];

const translations = {
  fa: {
    title: "ShardeumAI", subtitle: "دستیار چندزبانه مبتنی بر Groq و Supabase",
    uiLangLabel: "زبان رابط کاربری", modelLangLabel: "زبان مدل",
    chatPlaceholder: "پیام خود را بنویسید...", send: "ارسال",
    loginTitle: "ورود به ShardeumAI", emailPlaceholder: "ایمیل",
    passwordPlaceholder: "رمز عبور", loginButton: "ورود", logoutButton: "خروج",
    loading: "در حال دریافت پاسخ...", welcomeTitle: "به ShardeumAI خوش آمدید",
    welcomeSubtitle: "دستیار هوشمند بلاکچین و Web3", startBtn: "شروع",
    imageTab: "تولید عکس", chatTab: "گفتگو",
    imagePlaceholder: "توضیح عکس را بنویسید...", generateBtn: "ساخت عکس",
    generatingImg: "در حال ساخت...", imageError: "خطا در ساخت عکس. دوباره تلاش کن.",
  },
  en: {
    title: "ShardeumAI", subtitle: "Multilingual assistant powered by Groq & Supabase",
    uiLangLabel: "UI Language", modelLangLabel: "Model Language",
    chatPlaceholder: "Type your message...", send: "Send",
    loginTitle: "Login to ShardeumAI", emailPlaceholder: "Email",
    passwordPlaceholder: "Password", loginButton: "Login", logoutButton: "Logout",
    loading: "Getting response...", welcomeTitle: "Welcome to ShardeumAI",
    welcomeSubtitle: "Your Intelligent Blockchain & Web3 Assistant", startBtn: "Start",
    imageTab: "Image Generation", chatTab: "Chat",
    imagePlaceholder: "Describe the image...", generateBtn: "Generate",
    generatingImg: "Generating...", imageError: "Error generating image. Try again.",
  },
  es: {
    title: "ShardeumAI", subtitle: "Asistente multilingüe con Groq y Supabase",
    uiLangLabel: "Idioma de la interfaz", modelLangLabel: "Idioma del modelo",
    chatPlaceholder: "Escribe tu mensaje...", send: "Enviar",
    loginTitle: "Iniciar sesión en ShardeumAI", emailPlaceholder: "Correo electrónico",
    passwordPlaceholder: "Contraseña", loginButton: "Iniciar sesión", logoutButton: "Cerrar sesión",
    loading: "Obteniendo respuesta...", welcomeTitle: "Bienvenido a ShardeumAI",
    welcomeSubtitle: "Tu asistente inteligente de Blockchain y Web3", startBtn: "Comenzar",
    imageTab: "Generar Imagen", chatTab: "Chat",
    imagePlaceholder: "Describe la imagen...", generateBtn: "Generar",
    generatingImg: "Generando...", imageError: "Error al generar imagen.",
  },
  fr: {
    title: "ShardeumAI", subtitle: "Assistant multilingue avec Groq et Supabase",
    uiLangLabel: "Langue de l'interface", modelLangLabel: "Langue du modèle",
    chatPlaceholder: "Tapez votre message...", send: "Envoyer",
    loginTitle: "Connexion à ShardeumAI", emailPlaceholder: "E-mail",
    passwordPlaceholder: "Mot de passe", loginButton: "Connexion", logoutButton: "Déconnexion",
    loading: "Réponse en cours...", welcomeTitle: "Bienvenue sur ShardeumAI",
    welcomeSubtitle: "Votre assistant intelligent Blockchain & Web3", startBtn: "Commencer",
    imageTab: "Générer Image", chatTab: "Chat",
    imagePlaceholder: "Décrivez l'image...", generateBtn: "Générer",
    generatingImg: "Génération...", imageError: "Erreur de génération.",
  },
  de: {
    title: "ShardeumAI", subtitle: "Mehrsprachiger Assistent mit Groq und Supabase",
    uiLangLabel: "UI-Sprache", modelLangLabel: "Modellsprache",
    chatPlaceholder: "Nachricht eingeben...", send: "Senden",
    loginTitle: "Bei ShardeumAI anmelden", emailPlaceholder: "E-Mail",
    passwordPlaceholder: "Passwort", loginButton: "Anmelden", logoutButton: "Abmelden",
    loading: "Antwort wird abgerufen...", welcomeTitle: "Willkommen bei ShardeumAI",
    welcomeSubtitle: "Ihr intelligenter Blockchain & Web3 Assistent", startBtn: "Starten",
    imageTab: "Bild erstellen", chatTab: "Chat",
    imagePlaceholder: "Bild beschreiben...", generateBtn: "Erstellen",
    generatingImg: "Wird erstellt...", imageError: "Fehler beim Erstellen.",
  },
  ru: {
    title: "ShardeumAI", subtitle: "Многоязычный ассистент на Groq и Supabase",
    uiLangLabel: "Язык интерфейса", modelLangLabel: "Язык модели",
    chatPlaceholder: "Введите сообщение...", send: "Отправить",
    loginTitle: "Вход в ShardeumAI", emailPlaceholder: "Эл. почта",
    passwordPlaceholder: "Пароль", loginButton: "Войти", logoutButton: "Выйти",
    loading: "Получение ответа...", welcomeTitle: "Добро пожаловать в ShardeumAI",
    welcomeSubtitle: "Ваш умный ассистент Blockchain & Web3", startBtn: "Начать",
    imageTab: "Генерация изображений", chatTab: "Чат",
    imagePlaceholder: "Опишите изображение...", generateBtn: "Создать",
    generatingImg: "Создание...", imageError: "Ошибка генерации.",
  },
  ar: {
    title: "ShardeumAI", subtitle: "مساعد متعدد اللغات يعمل بـ Groq و Supabase",
    uiLangLabel: "لغة الواجهة", modelLangLabel: "لغة النموذج",
    chatPlaceholder: "اكتب رسالتك...", send: "إرسال",
    loginTitle: "تسجيل الدخول إلى ShardeumAI", emailPlaceholder: "البريد الإلكتروني",
    passwordPlaceholder: "كلمة المرور", loginButton: "تسجيل الدخول", logoutButton: "تسجيل الخروج",
    loading: "جاري جلب الرد...", welcomeTitle: "مرحباً بك في ShardeumAI",
    welcomeSubtitle: "مساعدك الذكي للبلوكشين و Web3", startBtn: "ابدأ",
    imageTab: "توليد الصور", chatTab: "المحادثة",
    imagePlaceholder: "صف الصورة...", generateBtn: "توليد",
    generatingImg: "جاري التوليد...", imageError: "خطأ في التوليد.",
  },
};

// ── Welcome Screen ──
function WelcomeScreen({ onStart, uiLang, setUiLang }) {
  const [anim, setAnim] = useState(false);
  useEffect(() => { setTimeout(() => setAnim(true), 50); }, []);
  const t = translations[uiLang] || translations.en;
  const isRTL = uiLang === "fa" || uiLang === "ar";
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "radial-gradient(circle at top, #1f2937 0, #020617 45%, #000 100%)", color: "#e8edf2", fontFamily: "system-ui, sans-serif", direction: isRTL ? "rtl" : "ltr" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 48 }}>
        {UI_LANGUAGES.map((lang) => (
          <button key={lang.code} onClick={() => setUiLang(lang.code)}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 999, border: `1px solid ${uiLang === lang.code ? "#3b82f6" : "#2b3442"}`, background: uiLang === lang.code ? "#111827" : "#020617", color: "#e8edf2", fontSize: 12, cursor: "pointer" }}>
            <span>{lang.flag}</span><span>{lang.label}</span>
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", transform: anim ? "translateY(0)" : "translateY(30px)", opacity: anim ? 1 : 0, transition: "all 0.6s ease" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "radial-gradient(circle at 30% 0%, #3b82f6, #0ea5e9 40%, #22c55e 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 700, color: "#fff", boxShadow: "0 0 40px rgba(59,130,246,0.6)", marginBottom: 24 }}>S</div>
        <h1 style={{ fontSize: 36, fontWeight: 800, margin: "0 0 12px", letterSpacing: "-0.5px" }}>{t.welcomeTitle}</h1>
        <p style={{ fontSize: 16, color: "#9aa4b2", margin: "0 0 48px", maxWidth: 360, lineHeight: 1.6 }}>{t.welcomeSubtitle}</p>
        <button onClick={onStart}
          style={{ padding: "14px 56px", borderRadius: 999, border: "none", background: "linear-gradient(135deg, #3b82f6, #0ea5e9, #22c55e)", color: "#fff", fontSize: 18, fontWeight: 700, cursor: "pointer", boxShadow: "0 0 30px rgba(59,130,246,0.5)" }}>
          {t.startBtn}
        </button>
      </div>
    </div>
  );
}

// ── Image Generator ──
function ImageGenerator({ t, isRTL }) {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate(e) {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setImageUrl("");
    try {
      const encoded = encodeURIComponent(prompt.trim());
      const seed = Math.floor(Math.random() * 1000000);
      const url = `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&seed=${seed}&nologo=true`;
      // Pre-fetch to check availability
      const res = await fetch(url);
      if (!res.ok) throw new Error("error");
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      setImageUrl(objectUrl);
    } catch {
      setError(t.imageError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 16, direction: isRTL ? "rtl" : "ltr" }}>
      <form onSubmit={handleGenerate} style={{ display: "flex", gap: 10 }}>
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={t.imagePlaceholder}
          disabled={loading}
          style={{ flex: 1, padding: "10px 14px", borderRadius: 999, border: "1px solid #1f2937", background: "#020617", color: "#e8edf2", fontSize: 13, outline: "none" }}
        />
        <button type="submit" disabled={!prompt.trim() || loading}
          style={{ padding: "10px 18px", borderRadius: 999, border: "none", background: "linear-gradient(135deg, #3b82f6, #0ea5e9)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
          {loading ? t.generatingImg : t.generateBtn}
        </button>
      </form>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 16, border: "1px solid #1f2937", background: "#0b1120", overflow: "hidden", minHeight: 300 }}>
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, color: "#9aa4b2" }}>
            <div style={{ width: 40, height: 40, border: "3px solid #1f2937", borderTop: "3px solid #3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: 13 }}>{t.generatingImg}</span>
          </div>
        )}
        {error && <p style={{ color: "#e0746a", fontSize: 13 }}>{error}</p>}
        {imageUrl && !loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 16 }}>
            <img src={imageUrl} alt="generated" style={{ maxWidth: "100%", maxHeight: 400, borderRadius: 12, boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }} />
            <a href={imageUrl} download="shardeumai-image.png"
              style={{ padding: "8px 20px", borderRadius: 999, background: "#1f2937", color: "#e8edf2", fontSize: 12, textDecoration: "none", border: "1px solid #374151" }}>
              ⬇ Download
            </a>
          </div>
        )}
        {!imageUrl && !loading && !error && (
          <p style={{ color: "#374151", fontSize: 13 }}>🎨 {t.imagePlaceholder}</p>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Main App ──
function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [uiLang, setUiLang] = useState("en");
  const [modelLang, setModelLang] = useState("auto");
  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [mountAnim, setMountAnim] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [aiMode, setAiMode] = useState("general");
  const [webSearch, setWebSearch] = useState(false);
  const [searchProvider, setSearchProvider] = useState("tavily");
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminSettings, setAdminSettings] = useState({});
  const [adminLoading, setAdminLoading] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [conversations, setConversations] = useState([]);
  const [activeConvoId, setActiveConvoId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [sharedChat, setSharedChat] = useState(null);
  const [profile, setProfile] = useState({ display_name: "", bio: "", avatar_color: "#3b82f6" });
  const [profileLoading, setProfileLoading] = useState(false);
  const chatRef = useRef(null);

  const t = translations[uiLang] || translations.en;
  const isRTL = uiLang === "fa" || uiLang === "ar";

  useEffect(() => { setMountAnim(true); }, []);
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, chatLoading]);
  useEffect(() => {
    // Online/offline detection
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    // Check push permission
    if ("Notification" in window) {
      setPushEnabled(Notification.permission === "granted");
    }
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  async function requestPushPermission() {
    if (!("Notification" in window)) return alert("Push notifications not supported.");
    const permission = await Notification.requestPermission();
    setPushEnabled(permission === "granted");
    if (permission === "granted") {
      new Notification("ShardeumAI", {
        body: "Push notifications enabled! ✓",
        icon: "/icons/icon-192.png",
      });
    }
  }

  function sendTestNotification() {
    if (Notification.permission === "granted") {
      new Notification("ShardeumAI Test", {
        body: "This is a test notification from ShardeumAI! 🤖",
        icon: "/icons/icon-192.png",
      });
    }
  }

  useEffect(() => {
    const detectLang = navigator.language?.slice(0, 2);
    const found = UI_LANGUAGES.find((l) => l.code === detectLang);
    if (found) setUiLang(found.code);
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get("share");
    if (shareId) { loadSharedChat(shareId); setShowWelcome(false); }
  }, []);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSession(data.session);
        loadHistory(data.session.user.id);
        loadProfile(data.session.user.id);
      }
    });
  }, []);

  async function loadHistory(userId) {
    // Load conversations list
    const { data: convos } = await supabase
      .from("conversations")
      .select("id, title, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30);
    if (convos) setConversations(convos);
    // Load latest conversation messages
    if (convos && convos.length > 0) {
      setActiveConvoId(convos[0].id);
      loadConversationMessages(convos[0].id);
    }
  }

  async function loadConversationMessages(convoId) {
    const { data } = await supabase
      .from("chat_history")
      .select("role, content")
      .eq("conversation_id", convoId)
      .order("created_at", { ascending: true });
    setMessages(data || []);
    setActiveConvoId(convoId);
    setShowSidebar(false);
  }

  async function startNewConversation() {
    setMessages([]);
    setActiveConvoId(null);
    setShowSidebar(false);
    setShareUrl("");
  }

  async function deleteConversation(convoId) {
    await supabase.from("conversations").delete().eq("id", convoId);
    setConversations(prev => prev.filter(c => c.id !== convoId));
    if (activeConvoId === convoId) {
      setMessages([]);
      setActiveConvoId(null);
    }
  }

  async function saveMessage(userId, role, msgContent, convoId) {
    await supabase.from("chat_history").insert({ 
      user_id: userId, role, content: msgContent, conversation_id: convoId 
    });
  }

  async function clearHistory() {
    if (!session) return;
    await supabase.from("chat_history").delete().eq("user_id", session.user.id);
    setMessages([]);
  }

  async function loadAdminData() {
    if (session?.user?.email !== ADMIN_EMAIL) return;
    setAdminLoading(true);
    const { data: users } = await supabase.from("admin_user_stats").select("*").order("created_at", { ascending: false });
    if (users) setAdminUsers(users);
    const { data: settings } = await supabase.from("system_settings").select("*");
    if (settings) {
      const obj = {};
      settings.forEach(s => { obj[s.key] = s.value; });
      setAdminSettings(obj);
    }
    setAdminLoading(false);
  }

  async function updateSetting(key, value) {
    await supabase.from("system_settings").upsert({ key, value, updated_at: new Date().toISOString() });
    setAdminSettings(prev => ({ ...prev, [key]: value }));
  }

  async function shareChat() {
    if (!session || messages.length === 0) return;
    setShareLoading(true);
    setShareUrl("");
    try {
      const { data, error } = await supabase
        .from("shared_chats")
        .insert({ user_id: session.user.id, messages: messages })
        .select("id")
        .single();
      if (!error && data) {
        const url = `${window.location.origin}${window.location.pathname}?share=${data.id}`;
        setShareUrl(url);
        navigator.clipboard?.writeText(url).catch(() => {});
      }
    } catch {}
    setShareLoading(false);
  }

  async function loadSharedChat(shareId) {
    const { data } = await supabase.from("shared_chats").select("messages").eq("id", shareId).single();
    if (data) setSharedChat(data.messages);
  }

  async function loadProfile(userId) {
    const { data } = await supabase.from("user_profiles").select("display_name, bio, avatar_color").eq("id", userId).single();
    if (data) setProfile({ display_name: data.display_name || "", bio: data.bio || "", avatar_color: data.avatar_color || "#3b82f6" });
  }

  async function saveProfile() {
    if (!session) return;
    setProfileLoading(true);
    await supabase.from("user_profiles").upsert({ id: session.user.id, display_name: profile.display_name, bio: profile.bio, avatar_color: profile.avatar_color, updated_at: new Date().toISOString() });
    setProfileLoading(false);
    setShowProfile(false);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setAuthLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: e.target.email.value, password: e.target.password.value });
    if (!error) { setSession(data.session); loadHistory(data.session.user.id); loadProfile(data.session.user.id); }
    else alert("Login failed: " + error.message);
    setAuthLoading(false);
  }

  async function handleSignup(e) {
    e.preventDefault();
    setAuthLoading(true);
    const { error } = await supabase.auth.signUp({ email: e.target.email.value, password: e.target.password.value });
    if (!error) { alert("Account created. Please login."); setShowSignup(false); }
    else alert("Signup failed: " + error.message);
    setAuthLoading(false);
  }

  async function handleOAuthLogin(provider) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin + window.location.pathname,
      },
    });
    if (error) alert("Login failed: " + error.message);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
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
          messages: newMessages,
          language: modelLang,
          system_prompt: currentMode?.prompt,
          web_search: webSearch,
          search_provider: searchProvider,
        }),
      });
      const data = await response.json();
      const reply = data.reply || "No response";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      
      // Create new conversation if needed
      let convoId = activeConvoId;
      if (!convoId) {
        const title = userMsg.content.slice(0, 50) || "New Chat";
        const { data: newConvo } = await supabase
          .from("conversations")
          .insert({ user_id: session.user.id, title })
          .select()
          .single();
        if (newConvo) {
          convoId = newConvo.id;
          setActiveConvoId(convoId);
          setConversations(prev => [newConvo, ...prev]);
        }
      }
      
      await saveMessage(session.user.id, "user", userMsg.content, convoId);
      await saveMessage(session.user.id, "assistant", reply, convoId);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error connecting to AI." }]);
    }
    setChatLoading(false);
  }

  if (showWelcome) return <WelcomeScreen onStart={() => setShowWelcome(false)} uiLang={uiLang} setUiLang={setUiLang} />;

  // Shared chat view
  if (sharedChat) {
    return (
      <div style={{ minHeight: "100vh", background: "#020617", color: "#e8edf2", fontFamily: "system-ui, sans-serif", padding: 20 }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "radial-gradient(circle at 30% 0%, #3b82f6, #22c55e)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16 }}>S</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>ShardeumAI</div>
              <div style={{ fontSize: 12, color: "#9aa4b2" }}>Shared conversation</div>
            </div>
            <button onClick={() => { setSharedChat(null); window.history.replaceState({}, "", window.location.pathname); }}
              style={{ marginLeft: "auto", padding: "6px 14px", borderRadius: 999, border: "1px solid #1f2937", background: "#020617", color: "#9aa4b2", fontSize: 12, cursor: "pointer" }}>
              Start Chat →
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sharedChat.map((msg, i) => (
              <div key={i} style={{ alignSelf: msg.role === "user" ? "flex-end" : "flex-start", background: msg.role === "user" ? "linear-gradient(135deg, #3b82f6, #0ea5e9)" : "#0b1120", color: "#fff", padding: "10px 14px", borderRadius: 14, maxWidth: "80%", fontSize: 13, border: msg.role === "assistant" ? "1px solid #1f2937" : "none" }}>
                {msg.content}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session && showSignup) {
    return (
      <div style={styles.center} dir={isRTL ? "rtl" : "ltr"}>
        <div style={{ ...styles.card, opacity: mountAnim ? 1 : 0, transition: "all 0.5s ease" }}>
          <div style={styles.brandRow}><div style={styles.logoCircle}>S</div><div><h1 style={styles.title}>Create Account</h1><p style={styles.subtitle}>{t.subtitle}</p></div></div>
          <form onSubmit={handleSignup} style={styles.form}>
            <input name="email" type="email" required placeholder={t.emailPlaceholder} style={styles.input} />
            <input name="password" type="password" required placeholder={t.passwordPlaceholder} style={styles.input} />
            <button type="submit" disabled={authLoading} style={styles.button}>{authLoading ? "..." : "Create Account"}</button>
          </form>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1, height: 1, background: "#1f2937" }} />
              <span style={{ fontSize: 11, color: "#9aa4b2" }}>or continue with</span>
              <div style={{ flex: 1, height: 1, background: "#1f2937" }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => handleOAuthLogin("google")}
                style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid #1f2937", background: "#020617", color: "#e8edf2", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </button>
              <button onClick={() => handleOAuthLogin("github")}
                style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid #1f2937", background: "#020617", color: "#e8edf2", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#e8edf2"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                GitHub
              </button>
            </div>
          </div>
          <p style={{ textAlign: "center", fontSize: 13, color: "#9aa4b2", marginTop: 16 }}>
            Already have an account?{" "}<span onClick={() => setShowSignup(false)} style={{ color: "#3b82f6", cursor: "pointer" }}>Login</span>
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={styles.center} dir={isRTL ? "rtl" : "ltr"}>
        <div style={{ ...styles.card, opacity: mountAnim ? 1 : 0, transition: "all 0.5s ease" }}>
          <div style={styles.brandRow}><div style={styles.logoCircle}>S</div><div><h1 style={styles.title}>{t.loginTitle}</h1><p style={styles.subtitle}>{t.subtitle}</p></div></div>
          <div style={{ marginTop: 20 }}>
            <label style={styles.label}>{t.uiLangLabel}</label>
            <div style={styles.flagSelect}>
              {UI_LANGUAGES.map((lang) => (
                <button key={lang.code} type="button" onClick={() => setUiLang(lang.code)}
                  style={{ ...styles.flagBtn, borderColor: uiLang === lang.code ? "#3b82f6" : "#2b3442", background: uiLang === lang.code ? "#111827" : "#020617" }}>
                  <span style={styles.flagIcon}>{lang.flag}</span><span style={styles.flagLabel}>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>
          <form onSubmit={handleLogin} style={styles.form}>
            <input name="email" type="email" required placeholder={t.emailPlaceholder} style={styles.input} />
            <input name="password" type="password" required placeholder={t.passwordPlaceholder} style={styles.input} />
            <button type="submit" disabled={authLoading} style={styles.button}>{authLoading ? "..." : t.loginButton}</button>
          </form>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1, height: 1, background: "#1f2937" }} />
              <span style={{ fontSize: 11, color: "#9aa4b2" }}>or continue with</span>
              <div style={{ flex: 1, height: 1, background: "#1f2937" }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => handleOAuthLogin("google")}
                style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid #1f2937", background: "#020617", color: "#e8edf2", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </button>
              <button onClick={() => handleOAuthLogin("github")}
                style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid #1f2937", background: "#020617", color: "#e8edf2", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#e8edf2"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                GitHub
              </button>
            </div>
          </div>
          <p style={{ textAlign: "center", fontSize: 13, color: "#9aa4b2", marginTop: 16 }}>
            Don't have an account?{" "}<span onClick={() => setShowSignup(true)} style={{ color: "#3b82f6", cursor: "pointer" }}>Sign up</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...styles.app, direction: isRTL ? "rtl" : "ltr" }}>

      {/* Sidebar */}
      {showSidebar && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
          <div style={{ width: 280, background: "#0b1120", borderRight: "1px solid #1f2937", display: "flex", flexDirection: "column", height: "100%", zIndex: 51 }}>
            <div style={{ padding: "16px", borderBottom: "1px solid #1f2937", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: "#e8edf2" }}>💬 Recent Chats</span>
              <button onClick={() => setShowSidebar(false)} style={{ background: "none", border: "none", color: "#9aa4b2", cursor: "pointer", fontSize: 20, lineHeight: 1 }}>✕</button>
            </div>
            <button onClick={startNewConversation}
              style={{ margin: 12, padding: "10px 0", borderRadius: 10, border: "1px dashed #374151", background: "transparent", color: "#3b82f6", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
              ✏️ New Chat
            </button>
            <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 16px" }}>
              {conversations.length === 0 && (
                <div style={{ color: "#9aa4b2", fontSize: 12, textAlign: "center", padding: 20 }}>No conversations yet</div>
              )}
              {conversations.map(convo => (
                <div key={convo.id}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, marginBottom: 4, background: activeConvoId === convo.id ? "#1e3a5f" : "transparent", cursor: "pointer", border: `1px solid ${activeConvoId === convo.id ? "#3b82f6" : "transparent"}` }}
                  onClick={() => loadConversationMessages(convo.id)}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: "#e8edf2", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{convo.title}</div>
                    <div style={{ fontSize: 10, color: "#9aa4b2", marginTop: 2 }}>{new Date(convo.created_at).toLocaleDateString()}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteConversation(convo.id); }}
                    style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 14, padding: "2px 4px", flexShrink: 0 }}>🗑</button>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, background: "rgba(0,0,0,0.6)" }} onClick={() => setShowSidebar(false)} />
        </div>
      )}

      <header style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setShowSidebar(true)}
            style={{ background: "none", border: "1px solid #1f2937", borderRadius: 8, color: "#9aa4b2", cursor: "pointer", padding: "6px 10px", fontSize: 18, lineHeight: 1 }}>
            ☰
          </button>
          <div style={styles.brandRow}>
            <div style={{ ...styles.logoCircle, background: profile.avatar_color, boxShadow: `0 0 12px ${profile.avatar_color}88` }}>
              {session ? (profile.display_name || session.user.email || "S")[0].toUpperCase() : "S"}
            </div>
            <div><h1 style={{ ...styles.title, fontSize: 18 }}>{t.title}</h1><p style={{ ...styles.subtitle, margin: 0 }}>{t.subtitle}</p></div>
          </div>
        </div>
        <div style={styles.headerControls}>
          <div style={styles.selectGroup}>
            <label style={styles.label}>{t.uiLangLabel}</label>
            <div style={styles.flagSelect}>
              {UI_LANGUAGES.map((lang) => (
                <button key={lang.code} type="button" onClick={() => setUiLang(lang.code)}
                  style={{ ...styles.flagBtn, borderColor: uiLang === lang.code ? "#3b82f6" : "#2b3442", background: uiLang === lang.code ? "#111827" : "#020617" }}>
                  <span style={styles.flagIcon}>{lang.flag}</span><span style={styles.flagLabel}>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div style={styles.selectGroup}>
            <label style={styles.label}>{t.modelLangLabel}</label>
            <div style={styles.flagSelect}>
              {MODEL_LANGUAGES.map((lang) => (
                <button key={lang.code} type="button" onClick={() => setModelLang(lang.code)}
                  style={{ ...styles.flagBtn, borderColor: modelLang === lang.code ? "#22c55e" : "#2b3442", background: modelLang === lang.code ? "#052e16" : "#020617" }}>
                  <span style={styles.flagIcon}>{lang.flag}</span><span style={styles.flagLabel}>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>
          <button onClick={clearHistory} style={{ ...styles.logoutBtn, borderColor: "#ef4444", color: "#ef4444", marginRight: 4 }}>🗑</button>
          <button onClick={handleLogout} style={styles.logoutBtn}>{t.logoutButton}</button>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, padding: "6px 12px 0", background: "rgba(2,6,23,0.85)", borderBottom: "1px solid #1f2937", overflowX: "auto" }}>
        {["chat", "image", "profile", "api", ...(session?.user?.email === ADMIN_EMAIL ? ["admin"] : [])].map((tab) => (
          <button key={tab} onClick={() => { setActiveTab(tab); if (tab === "admin") loadAdminData(); }}
            style={{ padding: "8px 16px", borderRadius: "8px 8px 0 0", border: "none", background: activeTab === tab ? "#0f172a" : "transparent", color: activeTab === tab ? (tab === "admin" ? "#f59e0b" : tab === "api" ? "#a855f7" : "#3b82f6") : "#9aa4b2", fontSize: 12, fontWeight: activeTab === tab ? 600 : 400, cursor: "pointer", borderBottom: activeTab === tab ? `2px solid ${tab === "admin" ? "#f59e0b" : tab === "api" ? "#a855f7" : "#3b82f6"}` : "2px solid transparent" }}>
            {tab === "chat" ? `💬 ${t.chatTab}` : tab === "image" ? `🎨 ${t.imageTab}` : tab === "profile" ? `👤 Profile` : tab === "api" ? `🔌 API` : `⚙️ Admin`}
          </button>
        ))}
      </div>

      <main style={styles.main}>
        {activeTab === "chat" ? (
          <>
            {/* AI Mode selector */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {AI_MODES.map(mode => (
                <button key={mode.id} onClick={() => setAiMode(mode.id)}
                  style={{ padding: "5px 12px", borderRadius: 999, border: `1px solid ${aiMode === mode.id ? "#3b82f6" : "#1f2937"}`, background: aiMode === mode.id ? "#1e3a5f" : "#020617", color: aiMode === mode.id ? "#60a5fa" : "#9aa4b2", fontSize: 11, cursor: "pointer", fontWeight: aiMode === mode.id ? 600 : 400 }}>
                  {mode.label}
                </button>
              ))}
            </div>
            {/* Web Search Toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <button onClick={() => setWebSearch(!webSearch)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 999, border: `1px solid ${webSearch ? "#22c55e" : "#1f2937"}`, background: webSearch ? "#052e16" : "#020617", color: webSearch ? "#22c55e" : "#9aa4b2", fontSize: 11, cursor: "pointer", fontWeight: webSearch ? 600 : 400 }}>
                🔍 {webSearch ? "Web Search ON" : "Web Search OFF"}
              </button>
              {webSearch && (
                <div style={{ display: "flex", gap: 6 }}>
                  {["tavily", "exa", "firecrawl"].map(p => (
                    <button key={p} onClick={() => setSearchProvider(p)}
                      style={{ padding: "4px 10px", borderRadius: 999, border: `1px solid ${searchProvider === p ? "#22c55e" : "#1f2937"}`, background: searchProvider === p ? "#052e16" : "#020617", color: searchProvider === p ? "#22c55e" : "#9aa4b2", fontSize: 10, cursor: "pointer" }}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div style={styles.chatWrapper}>
              <div style={styles.chat} ref={chatRef}>
                {messages.map((msg, idx) => (
                  <div key={idx} style={{
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                    width: msg.role === "assistant" ? "100%" : "auto",
                  }}>
                    {msg.role === "user" ? (
                      <div style={styles.userMessage}>{msg.content}</div>
                    ) : (
                      <div style={styles.assistantMessage} dir="auto">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeHighlight]}
                          components={{
                            p: ({children}) => <p style={{ margin: "0 0 10px", lineHeight: 1.8 }}>{children}</p>,
                            ul: ({children}) => <ul style={{ margin: "8px 0", paddingInlineStart: 20, lineHeight: 1.8 }}>{children}</ul>,
                            ol: ({children}) => <ol style={{ margin: "8px 0", paddingInlineStart: 20, lineHeight: 1.8 }}>{children}</ol>,
                            li: ({children}) => <li style={{ marginBottom: 4 }}>{children}</li>,
                            code: ({inline, className, children}) => {
                              const codeStr = String(children).trimEnd();

                              if (inline) return (
                                <code style={{ background: "#1e293b", padding: "2px 6px", borderRadius: 4, fontSize: 12, fontFamily: "JetBrains Mono, Fira Code, monospace", color: "#7dd3fc", direction: "ltr", display: "inline-block" }}>
                                  {children}
                                </code>
                              );
                              return (
                                <div style={{ position: "relative", margin: "10px 0", direction: "ltr" }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0f172a", padding: "6px 12px", borderRadius: "8px 8px 0 0", borderBottom: "1px solid #1f2937" }}>
                                    <span style={{ fontSize: 11, color: "#9aa4b2" }}>{className?.replace("language-", "") || "code"}</span>
                                    <button onClick={() => navigator.clipboard?.writeText(codeStr)}
                                      style={{ background: "none", border: "1px solid #374151", borderRadius: 5, color: "#9aa4b2", cursor: "pointer", fontSize: 10, padding: "2px 8px" }}>
                                      Copy
                                    </button>
                                  </div>
                                  <pre style={{ margin: 0, padding: "12px", background: "#020617", borderRadius: "0 0 8px 8px", overflow: "auto", fontSize: 12, fontFamily: "JetBrains Mono, Fira Code, monospace", lineHeight: 1.6, color: "#e2e8f0" }}>
                                    <code>{codeStr}</code>
                                  </pre>
                                </div>
                              );
                            },
                            a: ({href, children}) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa", textDecoration: "underline" }}>{children}</a>,
                            blockquote: ({children}) => <blockquote style={{ borderInlineStart: "3px solid #3b82f6", margin: "8px 0", paddingInlineStart: 12, color: "#9aa4b2", fontStyle: "italic" }}>{children}</blockquote>,
                            table: ({children}) => <div style={{ overflowX: "auto", margin: "10px 0" }}><table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>{children}</table></div>,
                            th: ({children}) => <th style={{ border: "1px solid #374151", padding: "8px 12px", background: "#0f172a", textAlign: "right", color: "#e8edf2" }}>{children}</th>,
                            td: ({children}) => <td style={{ border: "1px solid #1f2937", padding: "8px 12px", color: "#e8edf2" }}>{children}</td>,
                            h1: ({children}) => <h1 style={{ fontSize: 20, fontWeight: 700, margin: "12px 0 8px", color: "#e8edf2" }}>{children}</h1>,
                            h2: ({children}) => <h2 style={{ fontSize: 17, fontWeight: 700, margin: "10px 0 6px", color: "#e8edf2" }}>{children}</h2>,
                            h3: ({children}) => <h3 style={{ fontSize: 15, fontWeight: 600, margin: "8px 0 4px", color: "#e8edf2" }}>{children}</h3>,
                            strong: ({children}) => <strong style={{ fontWeight: 700, color: "#f1f5f9" }}>{children}</strong>,
                            hr: () => <hr style={{ border: "none", borderTop: "1px solid #1f2937", margin: "12px 0" }} />,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                ))}
                {chatLoading && (
                  <div style={styles.loadingRow}>
                    <div style={styles.dot} /><div style={styles.dot} /><div style={styles.dot} />
                  </div>
                )}
              </div>
            </div>
            {/* Share */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {messages.length > 0 && (
                <button onClick={shareChat} disabled={shareLoading}
                  style={{ padding: "6px 14px", borderRadius: 999, border: "1px solid #1f2937", background: "#020617", color: "#9aa4b2", fontSize: 11, cursor: "pointer" }}>
                  {shareLoading ? "..." : "🔗 Share Chat"}
                </button>
              )}
              {shareUrl && (
                <div style={{ flex: 1, fontSize: 11, color: "#22c55e", background: "#052e16", padding: "6px 12px", borderRadius: 8, wordBreak: "break-all" }}>
                  ✓ Copied! {shareUrl}
                </div>
              )}
            </div>
            <form onSubmit={handleSend} style={styles.composer}>
              <textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (input.trim() && !chatLoading) handleSend(e);
                  }
                }}
                placeholder={t.chatPlaceholder}
                style={{ ...styles.composerInput, resize: "none", overflow: "hidden", minHeight: 42, maxHeight: 120 }}
                disabled={chatLoading}
                rows={1}
              />
              <button type="submit" disabled={!input.trim() || chatLoading} style={styles.sendBtn}>{t.send}</button>
            </form>
          </>
        ) : activeTab === "image" ? (
          <ImageGenerator t={t} isRTL={isRTL} />

        ) : activeTab === "profile" ? (
          <div style={{ maxWidth: 480, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: 16, padding: "16px 0", direction: isRTL ? "rtl" : "ltr", overflowY: "auto" }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#e8edf2" }}>👤 Profile</h2>
            <div style={{ background: "#0b1120", border: "1px solid #1f2937", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Avatar preview */}
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: profile.avatar_color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#fff", flexShrink: 0, boxShadow: `0 0 20px ${profile.avatar_color}66` }}>
                  {(profile.display_name || session?.user?.email || "?")[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{profile.display_name || session?.user?.email?.split("@")[0]}</div>
                  <div style={{ fontSize: 12, color: "#9aa4b2" }}>{session?.user?.email}</div>
                </div>
              </div>
              {/* Color picker */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 12, color: "#9aa4b2" }}>Avatar Color</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {["#3b82f6","#8b5cf6","#ec4899","#ef4444","#f97316","#eab308","#22c55e","#14b8a6","#06b6d4","#6366f1","#ffffff","#64748b"].map(color => (
                    <div key={color} onClick={() => setProfile(p => ({ ...p, avatar_color: color }))}
                      style={{ width: 32, height: 32, borderRadius: "50%", background: color, cursor: "pointer", border: profile.avatar_color === color ? "3px solid #fff" : "3px solid transparent", boxShadow: profile.avatar_color === color ? `0 0 12px ${color}` : "none", transition: "all 0.15s ease" }} />
                  ))}
                </div>
              </div>
              {/* Display Name */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, color: "#9aa4b2" }}>Display Name</label>
                <input value={profile.display_name} onChange={(e) => setProfile(p => ({ ...p, display_name: e.target.value }))}
                  placeholder="Your name..."
                  style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #1f2937", background: "#020617", color: "#e8edf2", fontSize: 13, outline: "none" }} />
              </div>
              {/* Bio */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, color: "#9aa4b2" }}>Bio</label>
                <textarea value={profile.bio} onChange={(e) => setProfile(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell us about yourself..." rows={3}
                  style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #1f2937", background: "#020617", color: "#e8edf2", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit" }} />
              </div>
              <button onClick={saveProfile} disabled={profileLoading}
                style={{ padding: "11px 0", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${profile.avatar_color}, #22c55e)`, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                {profileLoading ? "Saving..." : "💾 Save Profile"}
              </button>
            </div>
            <div style={{ background: "#0b1120", border: "1px solid #1f2937", borderRadius: 16, padding: 16 }}>
              <div style={{ fontSize: 12, color: "#9aa4b2", marginBottom: 10 }}>Account Info</div>
              <div style={{ fontSize: 13, color: "#e8edf2" }}>📧 {session?.user?.email}</div>
              <div style={{ fontSize: 12, color: "#9aa4b2", marginTop: 6 }}>🗓 Member since {new Date(session?.user?.created_at).toLocaleDateString()}</div>
            </div>
          </div>

        ) : activeTab === "api" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", padding: "4px 0", maxWidth: 640, margin: "0 auto", width: "100%" }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#a855f7" }}>🔌 API Documentation</h2>

            {/* Push Notifications */}
            <div style={{ background: "#0b1120", border: "1px solid #1f2937", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#a855f7", marginBottom: 12 }}>🔔 Push Notifications</div>
              <div style={{ fontSize: 12, color: "#9aa4b2", marginBottom: 12 }}>Status: {pushEnabled ? <span style={{ color: "#22c55e" }}>✓ Enabled</span> : <span style={{ color: "#ef4444" }}>✗ Disabled</span>}</div>
              <div style={{ display: "flex", gap: 8 }}>
                {!pushEnabled ? (
                  <button onClick={requestPushPermission}
                    style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#7c3aed", color: "#fff", fontSize: 12, cursor: "pointer" }}>
                    🔔 Enable Notifications
                  </button>
                ) : (
                  <button onClick={sendTestNotification}
                    style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #22c55e", background: "#052e16", color: "#22c55e", fontSize: 12, cursor: "pointer" }}>
                    🧪 Send Test Notification
                  </button>
                )}
              </div>
            </div>

            {/* Offline Status */}
            <div style={{ background: "#0b1120", border: "1px solid #1f2937", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#a855f7", marginBottom: 12 }}>📵 Offline Mode</div>
              <div style={{ fontSize: 12, color: "#9aa4b2", lineHeight: 1.7 }}>
                Status: {isOffline ? <span style={{ color: "#ef4444" }}>✗ Offline</span> : <span style={{ color: "#22c55e" }}>✓ Online</span>}<br/>
                Cached pages will load without internet. API calls require connection.
              </div>
            </div>

            {/* API Docs */}
            <div style={{ background: "#0b1120", border: "1px solid #1f2937", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#a855f7", marginBottom: 12 }}>📡 Chat API</div>
              <div style={{ fontSize: 12, color: "#9aa4b2", marginBottom: 8 }}>Endpoint:</div>
              <code style={{ display: "block", background: "#020617", padding: "10px 12px", borderRadius: 8, fontSize: 11, color: "#22c55e", wordBreak: "break-all", marginBottom: 12 }}>
                POST https://zzolokpbjkrvkyaubcoq.supabase.co/functions/v1/chat
              </code>
              <div style={{ fontSize: 12, color: "#9aa4b2", marginBottom: 8 }}>Headers:</div>
              <pre style={{ background: "#020617", padding: "10px 12px", borderRadius: 8, fontSize: 11, color: "#60a5fa", overflow: "auto", marginBottom: 12 }}>{`Content-Type: application/json
Authorization: Bearer YOUR_SUPABASE_KEY`}</pre>
              <div style={{ fontSize: 12, color: "#9aa4b2", marginBottom: 8 }}>Request Body:</div>
              <pre style={{ background: "#020617", padding: "10px 12px", borderRadius: 8, fontSize: 11, color: "#60a5fa", overflow: "auto", marginBottom: 12 }}>{`{
  "messages": [
    {"role": "user", "content": "Hello"}
  ],
  "language": "auto",
  "web_search": false,
  "search_provider": "tavily"
}`}</pre>
              <div style={{ fontSize: 12, color: "#9aa4b2", marginBottom: 8 }}>Response:</div>
              <pre style={{ background: "#020617", padding: "10px 12px", borderRadius: 8, fontSize: 11, color: "#22c55e", overflow: "auto" }}>{`{
  "reply": "Hello! How can I help you?",
  "web_searched": false
}`}</pre>
            </div>

            {/* AI Modes */}
            <div style={{ background: "#0b1120", border: "1px solid #1f2937", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#a855f7", marginBottom: 12 }}>🤖 Available AI Modes</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {AI_MODES.map(mode => (
                  <div key={mode.id} style={{ padding: "8px 12px", background: "#020617", borderRadius: 8, border: "1px solid #1f2937" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#e8edf2" }}>{mode.label}</div>
                    <code style={{ fontSize: 10, color: "#9aa4b2" }}>system_prompt: "{mode.prompt.slice(0, 60)}..."</code>
                  </div>
                ))}
              </div>
            </div>
          </div>

        ) : activeTab === "admin" && session?.user?.email === ADMIN_EMAIL ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", padding: "4px 0" }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#f59e0b" }}>⚙️ Admin Dashboard</h2>
            {adminLoading ? (
              <div style={{ color: "#9aa4b2", textAlign: "center", padding: 40 }}>Loading...</div>
            ) : (
              <>
                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  {[
                    { label: "Users", value: adminUsers.length, icon: "👥" },
                    { label: "Messages", value: adminUsers.reduce((a, u) => a + (parseInt(u.total_messages) || 0), 0), icon: "💬" },
                    { label: "Shared", value: adminUsers.reduce((a, u) => a + (parseInt(u.total_shared_chats) || 0), 0), icon: "🔗" },
                  ].map(stat => (
                    <div key={stat.label} style={{ background: "#0b1120", border: "1px solid #1f2937", borderRadius: 12, padding: 14, textAlign: "center" }}>
                      <div style={{ fontSize: 20, marginBottom: 6 }}>{stat.icon}</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: "#f59e0b" }}>{stat.value}</div>
                      <div style={{ fontSize: 10, color: "#9aa4b2", marginTop: 4 }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
                {/* System Settings */}
                <div style={{ background: "#0b1120", border: "1px solid #1f2937", borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#f59e0b", marginBottom: 12 }}>🔧 System Settings</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {Object.entries(adminSettings).map(([key, value]) => (
                      <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                        <span style={{ fontSize: 12, color: "#9aa4b2" }}>{key}</span>
                        {value === "true" || value === "false" ? (
                          <button onClick={() => updateSetting(key, value === "true" ? "false" : "true")}
                            style={{ padding: "4px 12px", borderRadius: 999, border: "none", background: value === "true" ? "#052e16" : "#1f2937", color: value === "true" ? "#22c55e" : "#9aa4b2", fontSize: 11, cursor: "pointer" }}>
                            {value === "true" ? "ON" : "OFF"}
                          </button>
                        ) : (
                          <input defaultValue={value} onBlur={e => updateSetting(key, e.target.value)}
                            style={{ background: "#020617", border: "1px solid #1f2937", borderRadius: 6, padding: "4px 8px", color: "#e8edf2", fontSize: 12, width: 100, outline: "none" }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Users */}
                <div style={{ background: "#0b1120", border: "1px solid #1f2937", borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#f59e0b", marginBottom: 12 }}>👥 Users ({adminUsers.length})</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto" }}>
                    {adminUsers.map(user => (
                      <div key={user.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "#020617", borderRadius: 8, border: "1px solid #1f2937" }}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #22c55e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                          {user.email?.[0]?.toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, color: "#e8edf2", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.display_name || user.email}</div>
                          <div style={{ fontSize: 10, color: "#9aa4b2", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
                        </div>
                        <div style={{ textAlign: "center", flexShrink: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#3b82f6" }}>{user.total_messages}</div>
                          <div style={{ fontSize: 9, color: "#9aa4b2" }}>msgs</div>
                        </div>
                        <div style={{ fontSize: 10, color: "#9aa4b2", flexShrink: 0 }}>
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

      </main>
    </div>
  );
}

const styles = {
  app: { height: "100vh", display: "flex", flexDirection: "column", background: "radial-gradient(circle at top, #1f2937 0, #020617 45%, #000 100%)", color: "#e8edf2", fontFamily: "system-ui, -apple-system, sans-serif" },
  center: { display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#020617" },
  card: { background: "linear-gradient(145deg, rgba(15,23,42,0.95), rgba(17,24,39,0.98))", border: "1px solid #1f2937", borderRadius: 24, padding: "32px 28px", width: "100%", maxWidth: 420, boxShadow: "0 24px 80px rgba(0,0,0,0.65)", color: "#e8edf2" },
  logoCircle: { width: 32, height: 32, borderRadius: 999, background: "radial-gradient(circle at 30% 0%, #3b82f6, #0ea5e9 40%, #22c55e 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, marginRight: 10, boxShadow: "0 0 20px rgba(59,130,246,0.6)" },
  title: { margin: 0, fontSize: 24, fontWeight: 700 },
  subtitle: { marginTop: 6, fontSize: 13, color: "#9aa4b2" },
  form: { marginTop: 24, display: "flex", flexDirection: "column", gap: 12 },
  input: { padding: "10px 12px", borderRadius: 12, border: "1px solid #1f2937", background: "#020617", color: "#e8edf2", fontSize: 13, outline: "none" },
  button: { marginTop: 8, padding: "10px 12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #3b82f6, #0ea5e9, #22c55e)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  header: { padding: "10px 12px", borderBottom: "1px solid #1f2937", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 8, backdropFilter: "blur(12px)", background: "rgba(2,6,23,0.85)", flexShrink: 0 },
  brandRow: { display: "flex", alignItems: "center", gap: 8 },
  headerControls: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  selectGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 11, color: "#9aa4b2" },
  flagSelect: { display: "flex", flexWrap: "wrap", gap: 4, maxWidth: 220 },
  flagBtn: { display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 999, border: "1px solid #2b3442", background: "#020617", color: "#e8edf2", fontSize: 10, cursor: "pointer" },
  flagIcon: { fontSize: 14 },
  flagLabel: { fontSize: 11 },
  logoutBtn: { padding: "8px 10px", borderRadius: 999, border: "1px solid #374151", background: "#020617", color: "#e8edf2", fontSize: 12, cursor: "pointer" },
  main: { flex: 1, display: "flex", flexDirection: "column", padding: "10px 12px 12px", gap: 10, overflow: "hidden" },
  chatWrapper: { flex: 1, borderRadius: 20, border: "1px solid #1f2937", background: "radial-gradient(circle at top left, #0f172a 0, #020617 55%, #000 100%)", padding: 12, boxShadow: "0 18px 60px rgba(0,0,0,0.7)", overflow: "hidden" },
  chat: { height: "100%", borderRadius: 16, background: "linear-gradient(145deg, rgba(15,23,42,0.96), rgba(17,24,39,0.98))", padding: "16px 12px", overflowY: "auto", fontSize: 14, display: "flex", flexDirection: "column", gap: 16, fontFamily: "Vazirmatn, Inter, system-ui, sans-serif", lineHeight: 1.8 },
  userMessage: { background: "linear-gradient(135deg, #3b82f6, #0ea5e9)", color: "#fff", padding: "10px 14px", borderRadius: 14, boxShadow: "0 4px 20px rgba(59,130,246,0.4)", lineHeight: 1.7, fontSize: 14 },
  assistantMessage: { background: "#0b1120", color: "#e2e8f0", padding: "12px 16px", borderRadius: 14, border: "1px solid #1f2937", lineHeight: 1.8, fontSize: 14, width: "100%" },
  loadingRow: { display: "flex", gap: 4, marginTop: 6, marginLeft: 4 },
  dot: { width: 6, height: 6, borderRadius: 999, background: "#9aa4b2", animation: "pulse 1s infinite ease-in-out" },
  composer: { display: "flex", gap: 10, alignItems: "center" },
  composerInput: { flex: 1, padding: "10px 14px", borderRadius: 16, border: "1px solid #1f2937", background: "#020617", color: "#e8edf2", fontSize: 13, outline: "none", fontFamily: "inherit", lineHeight: 1.5 },
  sendBtn: { padding: "10px 18px", borderRadius: 999, border: "none", background: "linear-gradient(135deg, #3b82f6, #0ea5e9)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" },
};

export default App;
