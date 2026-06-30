[6/30/2026 6:54 PM] Farhad: import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// کلیدهای اتصال به دیتابیس شما
const SUPABASE_URL = "https://zzolokpbjkrvkyaubcoq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_mxVEWWeumrPEedmA4yD0cg_ZMPgwWYU"; // کلید ثانویه (anon key) خود را اینجا بین دو کوتیشن بگذارید

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
    chatNotice: 'AI Chat feature will be activated here soon...',
    logout: 'Logout',
    errorReg: 'Registration error:',
    errorLog: 'Login error:',
    successReg: 'Registration successful! Check your email for verification.'
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
    chatNotice: 'La fonction de chat IA sera bientôt activée ici...',
    logout: 'Déconnexion',
    errorReg: "Erreur d'inscription :",
    errorLog: 'Erreur de connexion :',
    successReg: 'Inscription réussie ! Vérifiez votre e-mail pour validation.'
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
    chatNotice: 'Die KI-Chat-Funktion wird hier bald aktiviert...',
    logout: 'Abmelden',
    errorReg: 'Registrierungsfehler:',
    errorLog: 'Login-Fehler:',
    successReg: 'Registrierung erfolgreich! Überprüfen Sie Ihre E-Mail zur Bestätigung.'
  },
  ar: {
    title: 'ShardeumAI',
    subtitle: 'SDAI - مساعد الشبكة الذكي والمحادثة',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    noAccount: 'ليس لديك حساب؟ ',
    hasAccount: 'لدیک حساب بالفعل؟ ',
    switchRegister: 'سجل الآن',
    switchLogin: 'تسجيل الدخول',
    processing: 'جاري المعالجة...',
    welcome: 'مرحبًا بك في ShardeumAI!',
    userEmail: 'بريدك الإلكتروني:',
    chatNotice: 'سيتم تفعيل ميزة المحادثة الذكية هنا قريبًا...',
    logout: 'تسجيل الخروج',
    errorReg: 'خطأ في التسجيل:',
    errorLog: 'خطأ في تسجيل الدخول:',
    successReg: 'تم التسجيل بنجاح! تحقق من بريدك الإلكتروني للتأكيد.'
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
    chatNotice: 'بخش گفتگو با هوش مصنوعی به‌زودی در اینجا فعال می‌شود...',
    logout: 'خروج از حساب',
    errorReg: 'خطا در ثبت‌نام:',
    errorLog: 'خطا در ورود:',
    successReg: 'ثبت‌نام با موفقیت انجام شد! ایمیل تایید خود را بررسی کنید.'
  }
};
[6/30/2026 6:54 PM] Farhad: function App() {
  const [lang, setLang] = useState('en');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const isRTL = lang === 'fa' || lang === 'ar';
  const direction = isRTL ? 'rtl' : 'ltr';
  const textAlign = isRTL ? 'right' : 'left';
  const t = translations[lang];

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(${t.errorReg} ${error.message});
      else setMessage(t.successReg);
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(${t.errorLog} ${error.message});
      else setUser(data.user);
    }
    setLoading(false);
  };

  if (user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0e1118', color: '#fff', flexDirection: 'column', direction }}>
        <h2>{t.welcome}</h2>
        <p>{t.userEmail} {user.email}</p>
        <p>{t.chatNotice}</p>
        <button onClick={() => { supabase.auth.signOut(); setUser(null); }} style={{ marginTop: '20px', padding: '10px 20px', background: '#e02424', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>{t.logout}</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0e1118', fontFamily: 'Arial, sans-serif', flexDirection: 'column' }}>
      
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
[6/30/2026 6:54 PM] Farhad: <form onSubmit={handleAuth}>
          <div style={{ textAlign, marginBottom: '15px' }}>
            <label style={{ fontSize: '14px', color: '#8a99ad', display: 'block', marginBottom: '5px' }}>{t.email}</label>
            <input type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #2d3748', background: '#0e1118', color: '#fff', boxSizing: 'border-box', textAlign: 'left' }} />
          </div>

          <div style={{ textAlign, marginBottom: '20px' }}>
            <label style={{ fontSize: '14px', color: '#8a99ad', display: 'block', marginBottom: '5px' }}>{t.password}</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #2d3748', background: '#0e1118', color: '#fff', boxSizing: 'border-box', textAlign: 'left' }} />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: '#00d2ff', color: '#0e1118', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? t.processing : (isSignUp ? t.register : t.login)}
          </button>
        </form>

        {message && <p style={{ fontSize: '13px', marginTop: '15px', color: message.includes('error') || message.includes('خطا') ? '#ef4444' : '#10b981' }}>{message}</p>}

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
