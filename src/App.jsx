import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY; 
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const translations = {
  en: {
    title: 'ShardeumAI',
    subtitle: 'SDAI - Intelligent Network Assistant & Chat',
    email: 'Email',
    password: 'Password',
    login: 'Login',
    register: 'Create Account',
    noAccount: "Don't have an account? ",
    hasAccount: 'Already have an account? ',
    switchRegister: 'Sign up',
    switchLogin: 'Sign in',
    processing: 'Processing...',
    welcome: 'Welcome to ShardeumAI!',
    userEmail: 'Your Email:',
    logout: 'Logout',
    errorReg: 'Registration error:',
    errorLog: 'Login error:',
    successReg: 'Registration successful!',
    chatPlaceholder: 'Ask ShardeumAI anything...',
    send: 'Send',
    thinking: 'Thinking...'
  },
  fr: {
    title: 'ShardeumAI',
    subtitle: 'SDAI - Assistant Réseau Intelligent & Chat',
    email: 'E-mail',
    password: 'Mot de passe',
    login: 'Connexion',
    register: 'Créer un compte',
    noAccount: "Vous n'avez pas de compte ? ",
    hasAccount: 'Vous avez déjà un compte ? ',
    switchRegister: "S'inscrire",
    switchLogin: 'Se connecter',
    processing: 'Traitement...',
    welcome: 'Bienvenue sur ShardeumAI !',
    userEmail: 'Votre E-mail :',
    logout: 'Déconnexion',
    errorReg: "Erreur d'inscription :",
    errorLog: 'Erreur de connexion :',
    successReg: 'Inscription réussie !',
    chatPlaceholder: 'Demandez n’importe quoi à ShardeumAI...',
    send: 'Envoyer',
    thinking: 'Réflexion...'
  },
  de: {
    title: 'ShardeumAI',
    subtitle: 'SDAI - Intelligenter Netzwerk-Assistent & Chat',
    email: 'E-Mail',
    password: 'Passwort',
    login: 'Einloggen',
    register: 'Konto erstellen',
    noAccount: 'Noch kein Konto? ',
    hasAccount: 'Bereits ein Konto? ',
    switchRegister: 'Registrieren',
    switchLogin: 'Anmelden',
    processing: 'In Bearbeitung...',
    welcome: 'Willkommen bei ShardeumAI!',
    userEmail: 'Ihre E-Mail:',
    logout: 'Abmelden',
    errorReg: 'Registrierungsfehler:',
    errorLog: 'Login-Fehler:',
    successReg: 'Registrierung erfolgreich!',
    chatPlaceholder: 'Fragen Sie ShardeumAI etwas...',
    send: 'Senden',
    thinking: 'Überlegen...'
  },
  ar: {
    title: 'ShardeumAI',
    subtitle: 'SDAI - مساعد الشبكة الذكي والمحادثة',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    noAccount: 'ليس لديك حساب؟ ',
    hasAccount: 'لديك حساب بالفعل؟ ',
    switchRegister: 'سجل الآن',
    switchLogin: 'تسجيل الدخول',
    processing: 'جاري المعالجة...',
    welcome: 'مرحبًا بك في ShardeumAI!',
    userEmail: 'بريدك الإلكتروني:',
    logout: 'تسجيل الخروج',
    errorReg: 'خطأ في التسجيل:',
    errorLog: 'خطأ في تسجيل الدخول:',
    successReg: 'تم التسجيل بنجاح!',
    chatPlaceholder: 'اسأل ShardeumAI أي شيء...',
    send: 'إرسال',
    thinking: 'جاري التفكير...'
  },
  fa: {
    title: 'ShardeumAI',
    subtitle: 'SDAI - دستیار هوشمند شبکه و گفتگو',
    email: 'ایمیل',
    password: 'رمز عبور',
    login: 'ورود',
    register: 'ساخت اکانت',
    noAccount: 'اکانت ندارید؟ ',
    hasAccount: 'قبلاً ثبت‌نام کرده‌اید؟ ',
    switchRegister: 'بسازید',
    switchLogin: 'ورود',
    processing: 'در حال پردازش...',
    welcome: 'به ShardeumAI خوش آمدید!',
    userEmail: 'ایمیل شما:',
    logout: 'خروج از حساب',
    errorReg: 'خطا در ثبت‌نام:',
    errorLog: 'خطا در ورود:',
    successReg: 'ثبت‌نام با موفقیت انجام شد!',
    chatPlaceholder: 'هر چیزی از ShardeumAI بپرسید...',
    send: 'ارسال',
    thinking: 'در حال فکر کردن...'
  }
};
function App() {
  const [lang, setLang] = useState('en');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  const isRTL = lang === 'fa' || lang === 'ar';
  const direction = isRTL ? 'rtl' : 'ltr';
  const textAlign = isRTL ? 'right' : 'left';
  const t = translations[lang];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUser(session.user);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setUser(session.user);
      else setUser(null);
    });
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(t.errorReg + ' ' + error.message);
      else setMessage(t.successReg);
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(t.errorLog + ' ' + error.message);
      else setUser(data.user);
    }
    setLoading(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = { role: 'user', content: chatInput };
    setChatHistory((prev) => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch('https://openrouter.ai', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + OPENROUTER_API_KEY,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin, 
          'X-Title': 'ShardeumAI'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3-8b-instruct:free',
          messages: [...chatHistory, userMessage].map(msg => ({ role: msg.role, content: msg.content })),
        }),
      });

      const data = await response.json();
      
      if (data && data.choices && data.choices && data.choices.message) {
        const aiReply = data.choices.message.content;
        setChatHistory((prev) => [...prev, { role: 'assistant', content: aiReply }]);
      } else {
        setChatHistory((prev) => [...prev, { role: 'assistant', content: 'خطا در دریافت پاسخ.' }]);
      }
    } catch (err) {
      setChatHistory((prev) => [...prev, { role: 'assistant', content: 'Error connecting to AI. Please check API key.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0e1118', color: '#fff', fontFamily: 'Arial, sans-serif', direction }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', background: '#161b26', borderBottom: '1px solid #2d3748' }}>
          <div>
            <h3 style={{ margin: '0', color: '#00d2ff' }}>{t.title}</h3>
            <span style={{ fontSize: '12px', color: '#8a99ad' }}>{user.email}</span>
          </div>
          <button onClick={() => supabase.auth.signOut()} style={{ padding: '8px 16px', background: '#e02424', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{t.logout}</button>
        </div>

        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {chatHistory.length === 0 && (
            <div style={{ color: '#8a99ad', margin: 'auto', textAlign: 'center' }}>
              <h2>{t.welcome}</h2>
              <p>SDAI Llama-3 Free Model Version</p>
            </div>
          )}
          {chatHistory.map((msg, index) => (
            <div 
              key={index} 
              style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', 
                background: msg.role === 'user' ? '#00d2ff' : '#161b26', 
                color: msg.role === 'user' ? '#0e1118' : '#fff', 
                padding: '12px 16px', 
                borderRadius: '12px', 
                maxWidth: '70%', 
                boxSizing: 'border-box', 
                whiteSpace: 'pre-wrap', 
                textAlign: isRTL ? 'right' : 'left' 
              }}
            >
              {msg.content}
            </div>
          ))}
          {chatLoading && (
            <div style={{ alignSelf: 'flex-start', background: '#161b26', padding: '12px 16px', borderRadius: '12px', color: '#8a99ad', fontStyle: 'italic' }}>
              {t.thinking}
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} style={{ display: 'flex', padding: '20px', background: '#161b26', gap: '10px', borderTop: '1px solid #2d3748' }}>
          <input type="text" placeholder={t.chatPlaceholder} value={chatInput} onChange={(e) => setChatInput(e.target.value)} disabled={chatLoading} style={{ flex: 1, padding: '14px', borderRadius: '8px', border: '1px solid #2d3748', background: '#0e1118', color: '#fff', boxSizing: 'border-box' }} />
          <button type="submit" disabled={chatLoading} style={{ padding: '0 25px', borderRadius: '8px', border: 'none', background: '#00d2ff', color: '#0e1118', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
            {t.send}
          </button>
        </form>
      </div>
    );
  }

  // شکستن خط طولانی خطاکار به خطوط بسیار کوتاه جهت جلوگیری از باگ کپی پیست
  const mainBoxStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#0e1118',
    fontFamily: 'Arial, sans-serif',
    flexDirection: 'column'
  };

  return (
    <div style={mainBoxStyle}>
<div style={{ marginBottom: '15px', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={() => setLang('en')} style={{ padding: '6px 12px', borderRadius: '5px', border: 'none', background: lang === 'en' ? '#00d2ff' : '#161b26', color: lang === 'en' ? '#0e1118' : '#fff', cursor: 'pointer', fontWeight: 'bold' }}>EN</button>
        <button onClick={() => setLang('fr')} style={{ padding: '6px 12px', borderRadius: '5px', border: 'none', background: lang === 'fr' ? '#00d2ff' : '#161b26', color: lang === 'fr' ? '#0e1118' : '#fff', cursor: 'pointer', fontWeight: 'bold' }}>FR</button>
        <button onClick={() => setLang('de')} style={{ padding: '6px 12px', borderRadius: '5px', border: 'none', background: lang === 'de' ? '#00d2ff' : '#161b26', color: lang === 'de' ? '#0e1118' : '#fff', cursor: 'pointer', fontWeight: 'bold' }}>DE</button>
        <button onClick={() => setLang('ar')} style={{ padding: '6px 12px', borderRadius: '5px', border: 'none', background: lang === 'ar' ? '#00d2ff' : '#161b26', color: lang === 'ar' ? '#0e1118' : '#fff', cursor: 'pointer', fontWeight: 'bold' }}>العربية</button>
        <button onClick={() => setLang('fa')} style={{ padding: '6px 12px', borderRadius: '5px', border: 'none', background: lang === 'fa' ? '#00d2ff' : '#161b26', color: lang === 'fa' ? '#0e1118' : '#fff', cursor: 'pointer', fontWeight: 'bold' }}>فارسی</button>
      </div>

      <div style={{ background: '#161b26', padding: '40px', borderRadius: '15px', width: '350px', textAlign: 'center', color: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', direction }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ background: '#00d2ff', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: '20px', fontWeight: 'bold', color: '#0e1118' }}>SD</div>
          <h2 style={{ margin: '0', fontSize: '24px' }}>{t.title}</h2>
          <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#8a99ad' }}>{t.subtitle}</p>
        </div>

        <form onSubmit={handleAuth}>
          <div style={{ textAlign, marginBottom: '15px' }}>
            <label style={{ fontSize: '14px', color: '#8a99ad', display: 'block', marginBottom: '5px' }}>{t.email}</label>
            <input type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #2d3748', background: '#0e1118', color: '#fff', boxSizing: 'border-box', textAlign: 'left', direction: 'ltr' }} />
          </div>

          <div style={{ textAlign, marginBottom: '20px' }}>
            <label style={{ fontSize: '14px', color: '#8a99ad', display: 'block', marginBottom: '5px' }}>{t.password}</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #2d3748', background: '#0e1118', color: '#fff', boxSizing: 'border-box', textAlign: 'left', direction: 'ltr' }} />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: '#00d2ff', color: '#0e1118', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? t.processing : (isSignUp ? t.register : t.login)}
          </button>
        </form>

        {message && (
          <p style={{ fontSize: '13px', marginTop: '15px', color: message.includes('error') || message.includes('خطا') ? '#ef4444' : '#10b981' }}>
            {message}
          </p>
        )}

        <p style={{ marginTop: '20px', fontSize: '14px', color: '#8a99ad' }}>
         {isSignUp ? t.hasAccount : t.noAccount}
          <span onClick={() => { setIsSignUp(!isSignUp); setMessage(''); }} style={{ color: '#00d2ff', cursor: 'pointer', textDecoration: 'underline' }}>
            {isSignUp ? t.switchLogin : t.switchRegister}
          </span>
        </p>
      </div>
    </div>
  );
}

export default App; 
