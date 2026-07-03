import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zzolokpbjkrvkyaubcoq.supabase.co";
const SUPABASE_KEY = "sb_publishable_mxVEWWeumrPEedmA4yD0cg_ZMPgwWYU";
const EDGE_FUNCTION_URL = "https://zzolokpbjkrvkyaubcoq.supabase.co/functions/v1/chat";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// زبان‌ها + متن‌های UI
const LANGS = {
  en: {
    dir: "ltr",
    login: "Login",
    register: "Create Account",
    email: "Email",
    password: "Password",
    send: "Send",
    logout: "Logout",
    placeholder: "Ask anything...",
    noAccount: "No account? ",
    hasAccount: "Have an account? ",
    signUp: "Sign up",
    signIn: "Sign in",
    welcome: "Hi! I'm ShardeumAI. How can I help you?",
    thinking: "Thinking...",
    error: "Error getting response. Please try again."
  },
  fr: {
    dir: "ltr",
    login: "Connexion",
    register: "Créer un compte",
    email: "E-mail",
    password: "Mot de passe",
    send: "Envoyer",
    logout: "Déconnexion",
    placeholder: "Posez une question...",
    noAccount: "Pas de compte ? ",
    hasAccount: "Déjà un compte ? ",
    signUp: "S'inscrire",
    signIn: "Se connecter",
    welcome: "Bonjour ! Je suis ShardeumAI. Comment puis-je vous aider ?",
    thinking: "Réflexion...",
    error: "Erreur. Veuillez réessayer."
  },
  de: {
    dir: "ltr",
    login: "Einloggen",
    register: "Konto erstellen",
    email: "E-Mail",
    password: "Passwort",
    send: "Senden",
    logout: "Abmelden",
    placeholder: "Fragen Sie etwas...",
    noAccount: "Kein Konto? ",
    hasAccount: "Bereits ein Konto? ",
    signUp: "Registrieren",
    signIn: "Anmelden",
    welcome: "Hallo! Ich bin ShardeumAI. Wie kann ich Ihnen helfen?",
    thinking: "Überlegen...",
    error: "Fehler. Bitte erneut versuchen."
  },
  ru: {
    dir: "ltr",
    login: "Войти",
    register: "Создать аккаунт",
    email: "Эл. почта",
    password: "Пароль",
    send: "Отправить",
    logout: "Выйти",
    placeholder: "Задайте вопрос...",
    noAccount: "Нет аккаунта? ",
    hasAccount: "Уже есть аккаунт? ",
    signUp: "Зарегистрироваться",
    signIn: "Войти",
    welcome: "Привет! Я ShardeumAI. Чем могу помочь?",
    thinking: "Думаю...",
    error: "Ошибка. Попробуйте ещё раз."
  },
  ar: {
    dir: "rtl",
    login: "دخول",
    register: "إنشاء حساب",
    email: "البريد",
    password: "كلمة المرور",
    send: "إرسال",
    logout: "خروج",
    placeholder: "اسأل أي شيء...",
    noAccount: "ليس لديك حساب؟ ",
    hasAccount: "لديك حساب؟ ",
    signUp: "سجل",
    signIn: "دخول",
    welcome: "مرحباً! أنا ShardeumAI. كيف يمكنني مساعدتك؟",
    thinking: "جاري التفكير...",
    error: "خطأ في الاستجابة. حاول مرة أخرى."
  },
  es: {
    dir: "ltr",
    login: "Iniciar sesión",
    register: "Crear cuenta",
    email: "Correo",
    password: "Contraseña",
    send: "Enviar",
    logout: "Cerrar sesión",
    placeholder: "Pregunta lo que quieras...",
    noAccount: "¿No tienes cuenta? ",
    hasAccount: "¿Ya tienes cuenta? ",
    signUp: "Registrarse",
    signIn: "Entrar",
    welcome: "¡Hola! Soy ShardeumAI. ¿En qué puedo ayudarte?",
    thinking: "Pensando...",
    error: "Error al obtener respuesta. Inténtalo de nuevo."
  }
};

// زبان‌های انتخابی برای مدل (با پرچم)
const LANGUAGE_OPTIONS = [
  { code: "auto", label: "Auto Detect", flag: "🌐" },
  { code: "fa", label: "Persian", flag: "🇮🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "fr", label: "French", flag: "🇫🇷" },
  { code: "de", label: "German", flag: "🇩🇪" },
  { code: "ru", label: "Russian", flag: "🇷🇺" },
  { code: "ar", label: "Arabic", flag: "🇸🇦" }
];

async function sendMessage(userMessage, selectedLanguage) {
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: userMessage }],
        language: selectedLanguage
      })
    });

    const data = await response.json();
    return data.reply;
  } catch (err) {
    console.log("Connection error:", err);
    return null;
  }
}

export default function App() {
  const [uiLang, setUiLang] = useState("en");          // زبان UI
  const [modelLang, setModelLang] = useState("auto");  // زبان مدل (به Edge Function)
  const [session, setSession] = useState(undefined);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [authMsg, setAuthMsg] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const scrollRef = useRef(null);

  const t = LANGS[uiLang];

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, chatLoading]);

  async function handleAuth(e) {
    e.preventDefault();
    setAuthMsg("");
    setAuthLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) setAuthMsg(error.message);
        else setAuthMsg("Check your email to confirm.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setAuthMsg(error.message);
        else setAuthMsg("");
      }
    } catch (err) {
      setAuthMsg("Auth error.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setChatLoading(true);

    const reply = await sendMessage(userMsg.content, modelLang);

    if (!reply) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: t.error }
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply }
      ]);
    }

    setChatLoading(false);
  }

  if (!session) {
    return (
      <div style={styles.center}>
        <div style={styles.card}>
          <div style={styles.brandRow}>
            <div style={styles.mark}>SD</div>
            <div>
              <div style={styles.brandName}>ShardeumAI</div>
              <div style={styles.brandSub}>SDAI · Smart Assistant</div>
            </div>
          </div>

          {/* انتخاب زبان UI با پرچم‌ها */}
          <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
            {Object.keys(LANGS).map((code) => (
              <button
                key={code}
                onClick={() => setUiLang(code)}
                style={{
                  ...styles.langBtn,
                  background: uiLang === code ? "rgba(79,209,197,0.15)" : "#161c25",
                  color: uiLang === code ? "#4fd1c5" : "#8b96a3",
                  border: "1px solid #232b36"
                }}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>

          <div style={styles.tabs}>
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              style={{
                ...styles.tab,
                ...(isSignUp ? {} : styles.tabActive)
              }}
            >
              {t.login}
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              style={{
                ...styles.tab,
                ...(isSignUp ? styles.tabActive : {})
              }}
            >
              {t.register}
            </button>
          </div>

          <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={styles.field}>
              <label style={styles.label}>{t.email}</label>
              <input
                style={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>{t.password}</label>
              <input
                style={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {authMsg && (
              <div style={{ fontSize: 12.5, color: "#f56565" }}>
                {authMsg}
              </div>
            )}

            <button type="submit" style={styles.submitBtn} disabled={authLoading}>
              {authLoading ? "..." : isSignUp ? t.signUp : t.signIn}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0b0f14", color: "#e8edf2" }}>
      <header style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={styles.headerMark}>SD</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>ShardeumAI</div>
            <div style={{ fontSize: 11, color: "#8b96a3" }}>SDAI · Smart Assistant</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* انتخاب زبان مدل با پرچم‌ها */}
          <div style={{ display: "flex", gap: 6 }}>
            {LANGUAGE_OPTIONS.map((langOpt) => (
              <button
                key={langOpt.code}
                onClick={() => setModelLang(langOpt.code)}
                style={{
                  padding: "5px 10px",
                  borderRadius: 8,
                  border: "1px solid #232b36",
                  background: modelLang === langOpt.code ? "rgba(79,209,197,0.15)" : "#161c25",
                  color: modelLang === langOpt.code ? "#4fd1c5" : "#8b96a3",
                  cursor: "pointer",
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "inherit"
                }}
              >
                <span>{langOpt.flag}</span>
                <span>{langOpt.code.toUpperCase()}</span>
              </button>
            ))}
          </div>

          {/* زبان UI */}
          <select
            value={uiLang}
            onChange={(e) => setUiLang(e.target.value)}
            style={{
              background: "#161c25",
              border: "1px solid #232b36",
              borderRadius: 8,
              padding: "6px 10px",
              color: "#e8edf2",
              fontSize: 12,
              fontFamily: "inherit"
            }}
          >
            <option value="en">EN</option>
            <option value="de">DE</option>
            <option value="fr">FR</option>
            <option value="ru">RU</option>
            <option value="ar">AR</option>
            <option value="es">ES</option>
          </select>

          <button
            onClick={() => supabase.auth.signOut()}
            style={styles.logoutBtn}
          >
            {t.logout}
          </button>
        </div>
      </header>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div ref={scrollRef} style={styles.msgArea}>
          {messages.length === 0 && (
            <div style={styles.welcome}>
              <div style={styles.welcomeMark}>SD</div>
              <p style={{ maxWidth: 420, textAlign: "center", fontSize: 14.5, color: "#8b96a3", direction: t.dir }}>
                {t.welcome}
              </p>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent:
                  m.role === "user"
                    ? (t.dir === "rtl" ? "flex-start" : "flex-end")
                    : (t.dir === "rtl" ? "flex-end" : "flex-start")
              }}
            >
              <div style={{ ...styles.bubble, ...(m.role === "user" ? styles.userBubble : styles.aiBubble) }}>
                {(m.content || "").split("\n").map((line, j) => (
                  <p key={j} style={{ margin: 0 }}>
                    {line || "\u00A0"}
                  </p>
                ))}
              </div>
            </div>
          ))}

          {chatLoading && (
            <div style={{ display: "flex", justifyContent: t.dir === "rtl" ? "flex-end" : "flex-start" }}>
              <div style={{ ...styles.bubble, ...styles.aiBubble, color: "#8b96a3", fontStyle: "italic" }}>
                {t.thinking}
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} style={styles.composer}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.placeholder}
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
      </div>
    </div>
  );
}

const styles = {
  center: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    background: "#0b0f14"
  },
  card: {
    background: "#11161d",
    border: "1px solid #232b36",
    borderRadius: 20,
    padding: "32px 28px",
    width: "100%",
    maxWidth: 380,
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
    color: "#e8edf2"
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 24
  },
  mark: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: "linear-gradient(135deg,#4fd1c5,#2fb8ab)",
    color: "#06201c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 15
  },
  brandName: {
    fontSize: 18,
    fontWeight: 700
  },
  brandSub: {
    fontSize: 12,
    color: "#8b96a3",
    marginTop: 2
  },
  tabs: {
    display: "flex",
    gap: 4,
    background: "#161c25",
    borderRadius: 10,
    padding: 4,
    marginBottom: 20
  },
  tab: {
    flex: 1,
    padding: "9px 0",
    border: "none",
    background: "transparent",
    color: "#8b96a3",
    fontSize: 13.5,
    fontWeight: 600,
    borderRadius: 7,
    cursor: "pointer",
    fontFamily: "inherit"
  },
  tabActive: {
    background: "rgba(79,209,197,0.12)",
    color: "#4fd1c5"
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6
  },
  label: {
    fontSize: 13,
    color: "#8b96a3",
    fontWeight: 500
  },
  input: {
    background: "#161c25",
    border: "1px solid #232b36",
    borderRadius: 10,
    padding: "11px 14px",
    color: "#e8edf2",
    fontSize: 14.5,
    fontFamily: "inherit",
    outline: "none"
  },
  submitBtn: {
    background: "linear-gradient(135deg,#4fd1c5,#2fb8ab)",
    color: "#06201c",
    border: "none",
    borderRadius: 10,
    padding: "12px 0",
    fontSize: 14.5,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit"
  },
  langBtn: {
    padding: "5px 10px",
    borderRadius: 7,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 12,
    fontFamily: "inherit"
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 20px",
    borderBottom: "1px solid #232b36",
    background: "#11161d",
    flexShrink: 0
  },
  headerMark: {
    width: 32,
    height: 32,
    borderRadius: 9,
    background: "linear-gradient(135deg,#4fd1c5,#2fb8ab)",
    color: "#06201c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 12
  },
  logoutBtn: {
    padding: "7px 14px",
    borderRadius: 8,
    border: "1px solid #232b36",
    background: "none",
    color: "#8b96a3",
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "inherit"
  },
  msgArea: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: 14
  },
  welcome: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: 16,
    margin: "auto"
  },
  welcomeMark: {
    width: 56,
    height: 56,
    borderRadius: 16,
    background: "linear-gradient(135deg,#4fd1c5,#2fb8ab)",
    color: "#06201c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 18
  },
  bubble: {
    padding: "11px 15px",
    borderRadius: 14,
    maxWidth: "78%",
    fontSize: 14.5,
    lineHeight: 1.75
  },
  userBubble: {
    background: "#1d4f49",
    color: "#eafaf6"
  },
  aiBubble: {
    background: "#11161d",
    border: "1px solid #232b36",
    color: "#e8edf2"
  },
  composer: {
    display: "flex",
    gap: 10,
    padding: "14px 20px 18px",
    borderTop: "1px solid #232b36",
    background: "#11161d",
    flexShrink: 0
  },
  composerInput: {
    flex: 1,
    background: "#161c25",
    border: "1px solid #232b36",
    borderRadius: 12,
    padding: "12px 16px",
    color: "#e8edf2",
    fontSize: 14.5,
    fontFamily: "inherit",
    outline: "none"
  },
  sendBtn: {
    padding: "0 20px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg,#4fd1c5,#2fb8ab)",
    color: "#06201c",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14,
    fontFamily: "inherit"
  }
};

