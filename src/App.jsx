import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zzolokpbjkrvkyaubcoq.supabase.co";
const SUPABASE_KEY = "sb_publishable_mxVEWWeumrPEedmA4yD0cg_ZMPgwWYU";
const EDGE_FUNCTION_URL =
  "https://zzolokpbjkrvkyaubcoq.supabase.co/functions/v1/chat";

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

const translations = {
  fa: {
    title: "ShardeumAI",
    subtitle: "دستیار چندزبانه مبتنی بر Groq و Supabase",
    uiLangLabel: "زبان رابط کاربری",
    modelLangLabel: "زبان مدل",
    chatPlaceholder: "پیام خود را بنویسید...",
    send: "ارسال",
    loginTitle: "ورود به ShardeumAI",
    emailPlaceholder: "ایمیل",
    passwordPlaceholder: "رمز عبور",
    loginButton: "ورود",
    logoutButton: "خروج",
    loading: "در حال دریافت پاسخ...",
  },
  en: {
    title: "ShardeumAI",
    subtitle: "Multilingual assistant powered by Groq & Supabase",
    uiLangLabel: "UI Language",
    modelLangLabel: "Model Language",
    chatPlaceholder: "Type your message...",
    send: "Send",
    loginTitle: "Login to ShardeumAI",
    emailPlaceholder: "Email",
    passwordPlaceholder: "Password",
    loginButton: "Login",
    logoutButton: "Logout",
    loading: "Getting response...",
  },
  es: {
    title: "ShardeumAI",
    subtitle: "Asistente multilingüe con Groq y Supabase",
    uiLangLabel: "Idioma de la interfaz",
    modelLangLabel: "Idioma del modelo",
    chatPlaceholder: "Escribe tu mensaje...",
    send: "Enviar",
    loginTitle: "Iniciar sesión en ShardeumAI",
    emailPlaceholder: "Correo electrónico",
    passwordPlaceholder: "Contraseña",
    loginButton: "Iniciar sesión",
    logoutButton: "Cerrar sesión",
    loading: "Obteniendo respuesta...",
  },
  fr: {
    title: "ShardeumAI",
    subtitle: "Assistant multilingue avec Groq et Supabase",
    uiLangLabel: "Langue de l'interface",
    modelLangLabel: "Langue du modèle",
    chatPlaceholder: "Tapez votre message...",
    send: "Envoyer",
    loginTitle: "Connexion à ShardeumAI",
    emailPlaceholder: "E-mail",
    passwordPlaceholder: "Mot de passe",
    loginButton: "Connexion",
    logoutButton: "Déconnexion",
    loading: "Réponse en cours...",
  },
  de: {
    title: "ShardeumAI",
    subtitle: "Mehrsprachiger Assistent mit Groq und Supabase",
    uiLangLabel: "UI-Sprache",
    modelLangLabel: "Modellsprache",
    chatPlaceholder: "Nachricht eingeben...",
    send: "Senden",
    loginTitle: "Bei ShardeumAI anmelden",
    emailPlaceholder: "E-Mail",
    passwordPlaceholder: "Passwort",
    loginButton: "Anmelden",
    logoutButton: "Abmelden",
    loading: "Antwort wird abgerufen...",
  },
  ru: {
    title: "ShardeumAI",
    subtitle: "Многоязычный ассистент на Groq и Supabase",
    uiLangLabel: "Язык интерфейса",
    modelLangLabel: "Язык модели",
    chatPlaceholder: "Введите сообщение...",
    send: "Отправить",
    loginTitle: "Вход в ShardeumAI",
    emailPlaceholder: "Эл. почта",
    passwordPlaceholder: "Пароль",
    loginButton: "Войти",
    logoutButton: "Выйти",
    loading: "Получение ответа...",
  },
  ar: {
    title: "ShardeumAI",
    subtitle: "مساعد متعدد اللغات يعمل بـ Groq و Supabase",
    uiLangLabel: "لغة الواجهة",
    modelLangLabel: "لغة النموذج",
    chatPlaceholder: "اكتب رسالتك...",
    send: "إرسال",
    loginTitle: "تسجيل الدخول إلى ShardeumAI",
    emailPlaceholder: "البريد الإلكتروني",
    passwordPlaceholder: "كلمة المرور",
    loginButton: "تسجيل الدخول",
    logoutButton: "تسجيل الخروج",
    loading: "جاري جلب الرد...",
  },
};

function App() {
  const [uiLang, setUiLang] = useState("fa");
  const [modelLang, setModelLang] = useState("auto");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [mountAnim, setMountAnim] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const chatRef = useRef(null);

  const t = translations[uiLang] || translations.fa;

  useEffect(() => {
    setMountAnim(true);
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, chatLoading]);

  useEffect(() => {
    const detectLang = navigator.language?.slice(0, 2);
    const found = UI_LANGUAGES.find((l) => l.code === detectLang);
    if (found) setUiLang(found.code);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSession(data.session);
    });
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setAuthLoading(true);
    const email = e.target.email.value;
    const password = e.target.password.value;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      setSession(data.session);
    } else {
      alert("Login failed: " + error.message);
    }
    setAuthLoading(false);
  }

  async function handleSignup(e) {
    e.preventDefault();
    setAuthLoading(true);
    const email = e.target.email.value;
    const password = e.target.password.value;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (!error) {
      alert("Account created. Please login.");
      setShowSignup(false);
    } else {
      alert("Signup failed: " + error.message);
    }
    setAuthLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;
    if (!session) {
      alert("Please login first.");
      return;
    }

    const userMsg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];

    setMessages(newMessages);
    setInput("");
    setChatLoading(true);

    try {
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: newMessages,
          language: modelLang,
        }),
      });

      const data = await response.json();
      console.log("EDGE RESPONSE:", data);
      const replyText = data.reply || "No response";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: replyText },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "خطا در دریافت پاسخ از سرور." },
      ]);
    }

    setChatLoading(false);
  }

  if (!session && showSignup) {
    return (
      <div style={styles.center}>
        <div
          style={{
            ...styles.card,
            transform: mountAnim ? "translateY(0)" : "translateY(20px)",
            opacity: mountAnim ? 1 : 0,
            transition: "all 0.5s ease",
          }}
        >
          <div style={styles.brandRow}>
            <div style={styles.logoCircle}>S</div>
            <div>
              <h1 style={styles.title}>Create Account</h1>
              <p style={styles.subtitle}>{t.subtitle}</p>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <label style={styles.label}>{t.uiLangLabel}</label>
            <div style={styles.flagSelect}>
              {UI_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setUiLang(lang.code)}
                  style={{
                    ...styles.flagBtn,
                    borderColor:
                      uiLang === lang.code ? "#3b82f6" : "#2b3442",
                    background:
                      uiLang === lang.code ? "#111827" : "#020617",
                  }}
                >
                  <span style={styles.flagIcon}>{lang.flag}</span>
                  <span style={styles.flagLabel}>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSignup} style={styles.form}>
            <input
              name="email"
              placeholder={t.emailPlaceholder}
              style={styles.input}
            />
            <input
              name="password"
              type="password"
              placeholder={t.passwordPlaceholder}
              style={styles.input}
            />
            <button
              type="submit"
              style={styles.button}
              disabled={authLoading}
            >
              Sign Up
            </button>
          </form>

          <button
            onClick={() => setShowSignup(false)}
            style={{
              ...styles.button,
              background: "#374151",
              marginTop: 10,
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (!session && !showSignup) {
    return (
      <div style={styles.center}>
        <div
          style={{
            ...styles.card,
            transform: mountAnim ? "translateY(0)" : "translateY(20px)",
            opacity: mountAnim ? 1 : 0,
            transition: "all 0.5s ease",
          }}
        >
          <div style={styles.brandRow}>
            <div style={styles.logoCircle}>S</div>
            <div>
              <h1 style={styles.title}>{t.loginTitle}</h1>
              <p style={styles.subtitle}>{t.subtitle}</p>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <label style={styles.label}>{t.uiLangLabel}</label>
            <div style={styles.flagSelect}>
              {UI_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setUiLang(lang.code)}
                  style={{
                    ...styles.flagBtn,
                    borderColor:
                      uiLang === lang.code ? "#3b82f6" : "#2b3442",
                    background:
                      uiLang === lang.code ? "#111827" : "#020617",
                  }}
                >
                  <span style={styles.flagIcon}>{lang.flag}</span>
                  <span style={styles.flagLabel}>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <label style={styles.label}>{t.modelLangLabel}</label>
            <div style={styles.flagSelect}>
              {MODEL_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setModelLang(lang.code)}
                  style={{
                    ...styles.flagBtn,
                    borderColor:
                      modelLang === lang.code ? "#22c55e" : "#2b3442",
                    background:
                      modelLang === lang.code ? "#052e16" : "#020617",
                  }}
                >
                  <span style={styles.flagIcon}>{lang.flag}</span>
                  <span style={styles.flagLabel}>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleLogin} style={styles.form}>
            <input
              name="email"
              placeholder={t.emailPlaceholder}
              style={styles.input}
            />
            <input
              name="password"
              type="password"
              placeholder={t.passwordPlaceholder}
              style={styles.input}
            />
            <button
              type="submit"
              style={styles.button}
              disabled={authLoading}
            >
              {t.loginButton}
            </button>
          </form>

          <button
            onClick={() => setShowSignup(true)}
            style={{
              ...styles.button,
              background: "#374151",
              marginTop: 10,
            }}
          >
            Sign Up
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.brandRow}>
          <div style={styles.logoCircle}>S</div>
          <div>
            <h1 style={styles.title}>{t.title}</h1>
            <p style={styles.subtitle}>{t.subtitle}</p>
          </div>
        </div>
        <div style={styles.headerControls}>
          <div style={styles.selectGroup}>
            <label style={styles.label}>{t.uiLangLabel}</label>
            <div style={styles.flagSelect}>
              {UI_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setUiLang(lang.code)}
                  style={{
                    ...styles.flagBtn,
                    borderColor:
                      uiLang === lang.code ? "#3b82f6" : "#2b3442",
                    background:
                      uiLang === lang.code ? "#111827" : "#020617",
                  }}
                >
                  <span style={styles.flagIcon}>{lang.flag}</span>
                  <span style={styles.flagLabel}>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div style={styles.selectGroup}>
            <label style={styles.label}>{t.modelLangLabel}</label>
            <div style={styles.flagSelect}>
              {MODEL_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setModelLang(lang.code)}
                  style={{
                    ...styles.flagBtn,
                    borderColor:
                      modelLang === lang.code ? "#22c55e" : "#2b3442",
                    background:
                      modelLang === lang.code ? "#052e16" : "#020617",
                  }}
                >
                  <span style={styles.flagIcon}>{lang.flag}</span>
                  <span style={styles.flagLabel}>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            {t.logoutButton}
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.chatWrapper}>
          <div style={styles.chat} ref={chatRef}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={
                  msg.role === "user"
                    ? styles.userMessage
                    : styles.assistantMessage
                }
              >
                {msg.content}
              </div>
            ))}
            {chatLoading && (
              <div style={styles.loadingRow}>
                <div style={styles.dot} />
                <div style={styles.dot} />
                <div style={styles.dot} />
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSend} style={styles.composer}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.chatPlaceholder}
            style={styles.composerInput}
            disabled={chatLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || chatLoading}
            style={styles.sendBtn}
          >
            {t.send}
          </button>
        </form>
      </main>
    </div>
  );
}

const styles = {
  app: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background:
      "radial-gradient(circle at top, #1f2937 0, #020617 45%, #000 100%)",
    color: "#e8edf2",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  center: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    background: "#020617",
  },
  card: {
    background:
      "linear-gradient(145deg, rgba(15,23,42,0.95), rgba(17,24,39,0.98))",
    border: "1px solid #1f2937",
    borderRadius: 24,
    padding: "32px 28px",
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 24px 80px rgba(0,0,0,0.65)",
    color: "#e8edf2",
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 999,
    background:
      "radial-gradient(circle at 30% 0%, #3b82f6, #0ea5e9 40%, #22c55e 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 16,
    marginRight: 10,
    boxShadow: "0 0 20px rgba(59,130,246,0.6)",
  },
  title: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "#9aa4b2",
  },
  form: {
    marginTop: 24,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  input: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #1f2937",
    background: "#020617",
    color: "#e8edf2",
    fontSize: 13,
    outline: "none",
  },
  button: {
    marginTop: 8,
    padding: "10px 12px",
    borderRadius: 12,
    border: "none",
    background:
      "linear-gradient(135deg, #3b82f6, #0ea5e9, #22c55e)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  header: {
    padding: "16px 20px",
    borderBottom: "1px solid #1f2937",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backdropFilter: "blur(12px)",
    background: "rgba(2,6,23,0.85)",
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  headerControls: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  selectGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 11,
    color: "#9aa4b2",
  },
  flagSelect: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    maxWidth: 260,
  },
  flagBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid #2b3442",
    background: "#020617",
    color: "#e8edf2",
    fontSize: 11,
    cursor: "pointer",
  },
  flagIcon: {
    fontSize: 14,
  },
  flagLabel: {
    fontSize: 11,
  },
  logoutBtn: {
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid #374151",
    background: "#020617",
    color: "#e8edf2",
    fontSize: 12,
    cursor: "pointer",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "14px 20px 18px",
    gap: 12,
  },
  chatWrapper: {
    flex: 1,
    borderRadius: 20,
    border: "1px solid #1f2937",
    background:
      "radial-gradient(circle at top left, #0f172a 0, #020617 55%, #000 100%)",
    padding: 12,
    boxShadow: "0 18px 60px rgba(0,0,0,0.7)",
  },
  chat: {
    height: "100%",
    borderRadius: 16,
    background:
      "linear-gradient(145deg, rgba(15,23,42,0.96), rgba(17,24,39,0.98))",
    padding: 12,
    overflowY: "auto",
    fontSize: 13,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  userMessage: {
    alignSelf: "flex-end",
    background:
      "linear-gradient(135deg, #3b82f6, #0ea5e9)",
    color: "#fff",
    padding: "8px 10px",
    borderRadius: 14,
    maxWidth: "80%",
    boxShadow: "0 10px 30px rgba(59,130,246,0.5)",
  },
  assistantMessage: {
    alignSelf: "flex-start",
    background: "#0b1120",
    color: "#e5e7eb",
    padding: "8px 10px",
    borderRadius: 14,
    maxWidth: "80%",
    border: "1px solid #1f2937",
  },
  loadingRow: {
    display: "flex",
    gap: 4,
    marginTop: 6,
    marginLeft: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    background: "#9aa4b2",
    animation: "pulse 1s infinite ease-in-out",
  },
  composer: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    marginTop: 10,
  },
  composerInput: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: 999,
    border: "1px solid #1f2937",
    background: "#020617",
    color: "#e8edf2",
    fontSize: 13,
    outline: "none",
  },
  sendBtn: {
    padding: "10px 18px",
    borderRadius: 999,
    border: "none",
    background:
      "linear-gradient(135deg, #3b82f6, #0ea5e9)",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
};

export default App;
