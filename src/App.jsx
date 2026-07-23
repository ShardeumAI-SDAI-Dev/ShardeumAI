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
      .pricing-cards { grid-template-columns: 1fr !important; }
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
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes progressFill {
      from { width: 0%; }
      to { width: var(--progress-width); }
    }
    .welcome-anim-1 { animation: welcomeFadeIn 0.8s ease-out 0.2s both; }
    .welcome-anim-2 { animation: welcomeFadeIn 0.8s ease-out 0.5s both; }
    .welcome-anim-3 { animation: welcomeFadeIn 0.8s ease-out 0.8s both; }
    .welcome-anim-4 { animation: welcomeSlideUp 0.8s ease-out 1.1s both; }
    .welcome-logo { animation: welcomeScale 0.6s ease-out 0.1s both, welcomeGlow 3s ease-in-out 1s infinite; }
    .welcome-float { animation: float 3s ease-in-out infinite; }
    .shimmer-bg {
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
      background-size: 200% 100%;
      animation: shimmer 2s infinite;
    }
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

// ═══════════════════════════════════════════════════════════════
// ═══ SUBSCRIPTION PLANS ═══
// ═══════════════════════════════════════════════════════════════

const SUBSCRIPTION_PLANS = {
  free: {
    id: "free",
    name: { fa: "رایگان", en: "Free", es: "Gratis", fr: "Gratuit", de: "Kostenlos", ru: "Бесплатно", ar: "مجاني" },
    price: { monthly: 0, yearly: 0 },
    features: {
      messagesPerDay: 20,
      imagesPerDay: 3,
      models: ["llama-3.1-8b-instant"],
      webSearch: false,
      fileUpload: true,
      maxFileSize: 2 * 1024 * 1024,
      voiceInput: true,
      chatHistory: true,
      export: ["txt", "md"],
      analytics: false,
      priority: false,
      apiAccess: false,
    },
    color: "#8e8ea0",
  },
  pro: {
    id: "pro",
    name: { fa: "حرفه‌ای", en: "Pro", es: "Pro", fr: "Pro", de: "Pro", ru: "Про", ar: "احترافي" },
    price: { monthly: 9.99, yearly: 99.99 },
    features: {
      messagesPerDay: 200,
      imagesPerDay: 50,
      models: ["llama-3.1-8b-instant", "llama-3.3-70b", "qwen-32b"],
      webSearch: true,
      fileUpload: true,
      maxFileSize: 10 * 1024 * 1024,
      voiceInput: true,
      chatHistory: true,
      export: ["txt", "md", "html", "pdf"],
      analytics: true,
      priority: true,
      apiAccess: true,
    },
    color: "#3b82f6",
    popular: true,
  },
  enterprise: {
    id: "enterprise",
    name: { fa: "سازمانی", en: "Enterprise", es: "Empresarial", fr: "Entreprise", de: "Unternehmen", ru: "Корпоративный", ar: "مؤسسي" },
    price: { monthly: 49.99, yearly: 499.99 },
    features: {
      messagesPerDay: Infinity,
      imagesPerDay: Infinity,
      models: ["llama-3.1-8b-instant", "llama-3.3-70b", "qwen-32b"],
      webSearch: true,
      fileUpload: true,
      maxFileSize: 50 * 1024 * 1024,
      voiceInput: true,
      chatHistory: true,
      export: ["txt", "md", "html", "pdf"],
      analytics: true,
      priority: true,
      apiAccess: true,
      customModel: true,
      dedicatedSupport: true,
    },
    color: "#a855f7",
  },
};


// ═══════════════════════════════════════════════════════════════
// ═══ USAGE TRACKING HOOK ═══
// ═══════════════════════════════════════════════════════════════

function useUsageTracking(userId, planId) {
  const [usage, setUsage] = useState(() => {
    const saved = localStorage.getItem(`shardeumai-usage-${userId}`);
    if (saved) return JSON.parse(saved);
    return {
      messagesToday: 0,
      imagesToday: 0,
      lastResetDate: new Date().toDateString(),
      totalMessages: 0,
      totalImages: 0,
      streakDays: 0,
      lastActiveDate: null,
    };
  });

  const plan = SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS.free;

  useEffect(() => {
    if (!userId) return;

    const today = new Date().toDateString();
    if (usage.lastResetDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const newStreak = usage.lastActiveDate === yesterday.toDateString() 
        ? usage.streakDays + 1 
        : 1;

      const resetUsage = {
        messagesToday: 0,
        imagesToday: 0,
        lastResetDate: today,
        totalMessages: usage.totalMessages,
        totalImages: usage.totalImages,
        streakDays: newStreak,
        lastActiveDate: today,
      };
      setUsage(resetUsage);
      localStorage.setItem(`shardeumai-usage-${userId}`, JSON.stringify(resetUsage));
    }
  }, [userId]);

  const incrementUsage = (type) => {
    const newUsage = {
      ...usage,
      [type === "message" ? "messagesToday" : "imagesToday"]: usage[type === "message" ? "messagesToday" : "imagesToday"] + 1,
      totalMessages: type === "message" ? usage.totalMessages + 1 : usage.totalMessages,
      totalImages: type === "image" ? usage.totalImages + 1 : usage.totalImages,
      lastActiveDate: new Date().toDateString(),
    };
    setUsage(newUsage);
    localStorage.setItem(`shardeumai-usage-${userId}`, JSON.stringify(newUsage));
    return newUsage;
  };

  const canSendMessage = () => {
    return usage.messagesToday < plan.features.messagesPerDay;
  };

  const canGenerateImage = () => {
    return usage.imagesToday < plan.features.imagesPerDay;
  };

  const getRemaining = () => ({
    messages: Math.max(0, plan.features.messagesPerDay - usage.messagesToday),
    images: Math.max(0, plan.features.imagesPerDay - usage.imagesToday),
    messagesPercent: Math.min(100, (usage.messagesToday / plan.features.messagesPerDay) * 100),
    imagesPercent: Math.min(100, (usage.imagesToday / plan.features.imagesPerDay) * 100),
  });

  return { usage, incrementUsage, canSendMessage, canGenerateImage, getRemaining, plan };
}

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
    landingTitle: "ShardeumAI — آینده هوش مصنوعی چندزبانه",
    landingSubtitle: "دستیار هوشمند شما برای گفتگو، تولید تصویر و جستجوی وب به ۷ زبان زنده دنیا",
    landingCTA: "شروع کنید",
    landingFeatures: "ویژگی‌ها",
    landingFeature1Title: "🤖 گفتگوی هوشمند",
    landingFeature1Desc: "با پیشرفته‌ترین مدل‌های زبانی مثل Llama 3.3 و Qwen 32B گفتگو کنید",
    landingFeature2Title: "🎨 تولید تصویر",
    landingFeature2Desc: "تصاویر منحصربه‌فرد با هوش مصنوعی تولید کنید",
    landingFeature3Title: "🌐 ۷ زبان زنده",
    landingFeature3Desc: "فارسی، انگلیسی، عربی، روسی، فرانسوی، آلمانی و اسپانیایی",
    landingFeature4Title: "⚡ سریع و امن",
    landingFeature4Desc: "پاسخ‌های لحظه‌ای با رمزنگاری end-to-end",
    landingStats: "آمار",
    landingStatsUsers: "کاربر فعال",
    landingStatsMessages: "پیام روزانه",
    landingStatsModels: "مدل هوشمند",
    landingStatsLanguages: "زبان پشتیبانی",
    landingHowItWorks: "چطور کار می‌کند؟",
    landingStep1: "۱. ثبت نام",
    landingStep1Desc: "در چند ثانیه حساب بسازید",
    landingStep2: "۲. انتخاب مدل",
    landingStep2Desc: "مدل مناسب خودتان را انتخاب کنید",
    landingStep3: "۳. شروع گفتگو",
    landingStep3Desc: "سوال بپرسید و پاسخ هوشمند بگیرید",
    landingFooter: "ShardeumAI 2026 — تمامی حقوق محفوظ است",
    landingSkip: "رد کردن →",
    pricingTitle: "پلن‌های اشتراک",
    pricingSubtitle: "پلن مناسب خود را انتخاب کنید",
    pricingMonthly: "ماهانه",
    pricingYearly: "سالانه",
    pricingSave: "صرفه‌جویی",
    pricingPopular: "محبوب",
    pricingCurrent: "فعلی",
    pricingUpgrade: "ارتقا",
    pricingFeatureMessages: "پیام در روز",
    pricingFeatureImages: "تصویر در روز",
    pricingFeatureModels: "مدل‌های AI",
    pricingFeatureWebSearch: "جستجوی وب",
    pricingFeatureFileUpload: "آپلود فایل",
    pricingFeatureExport: "خروجی",
    pricingFeatureAnalytics: "آنالیتیکس",
    pricingFeaturePriority: "اولویت پاسخ",
    pricingFeatureAPI: "دسترسی API",
    pricingFree: "رایگان",
    pricingPro: "حرفه‌ای",
    pricingEnterprise: "سازمانی",
    usageTitle: "مصرف امروز",
    usageMessages: "پیام",
    usageImages: "تصویر",
    usageRemaining: "باقیمانده",
    usageLimitReached: "محدودیت روزانه به پایان رسیده",
    usageUpgradePrompt: "برای استفاده بیشتر پلن خود را ارتقا دهید",
    messageEdit: "ویرایش",
    messageDelete: "حذف",
    messageCopy: "کپی",
    messageRegenerate: "تولید مجدد",
    messageReply: "پاسخ",
    chatSearch: "جستجو در چت‌ها...",
    chatFolder: "پوشه",
    chatFolderNew: "پوشه جدید",
    chatFolderRename: "تغییر نام",
    chatFolderDelete: "حذف پوشه",
    customInstructions: "دستورات سفارشی",
    customInstructionsPlaceholder: "دستورات سفارشی خود را وارد کنید...",
    customInstructionsSave: "ذخیره دستورات",
    referralTitle: "دعوت دوستان",
    referralSubtitle: "با دعوت دوستان، هر دو ۵ پیام رایگان دریافت کنید",
    referralLink: "لینک دعوت",
    referralCopy: "کپی لینک",
    referralCount: "تعداد دعوت",
    referralReward: "پاداش",
    imageError: "خطا در تولید تصویر",
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
    landingTitle: "ShardeumAI — The Future of Multilingual AI",
    landingSubtitle: "Your intelligent assistant for chat, image generation, and web search in 7 languages",
    landingCTA: "Get Started",
    landingFeatures: "Features",
    landingFeature1Title: "🤖 AI Chat",
    landingFeature1Desc: "Chat with advanced language models like Llama 3.3 and Qwen 32B",
    landingFeature2Title: "🎨 Image Generation",
    landingFeature2Desc: "Create unique images with AI-powered generation",
    landingFeature3Title: "🌐 7 Languages",
    landingFeature3Desc: "Persian, English, Arabic, Russian, French, German, and Spanish",
    landingFeature4Title: "⚡ Fast & Secure",
    landingFeature4Desc: "Instant responses with end-to-end encryption",
    landingStats: "Stats",
    landingStatsUsers: "Active Users",
    landingStatsMessages: "Daily Messages",
    landingStatsModels: "AI Models",
    landingStatsLanguages: "Languages",
    landingHowItWorks: "How It Works",
    landingStep1: "1. Sign Up",
    landingStep1Desc: "Create your account in seconds",
    landingStep2: "2. Choose Model",
    landingStep2Desc: "Pick the AI model that fits your needs",
    landingStep3: "3. Start Chatting",
    landingStep3Desc: "Ask questions and get intelligent answers",
    landingFooter: "ShardeumAI 2026 — All rights reserved",
    landingSkip: "Skip →",
    pricingTitle: "Subscription Plans",
    pricingSubtitle: "Choose the plan that fits your needs",
    pricingMonthly: "Monthly",
    pricingYearly: "Yearly",
    pricingSave: "Save",
    pricingPopular: "Popular",
    pricingCurrent: "Current",
    pricingUpgrade: "Upgrade",
    pricingFeatureMessages: "Messages per day",
    pricingFeatureImages: "Images per day",
    pricingFeatureModels: "AI Models",
    pricingFeatureWebSearch: "Web Search",
    pricingFeatureFileUpload: "File Upload",
    pricingFeatureExport: "Export",
    pricingFeatureAnalytics: "Analytics",
    pricingFeaturePriority: "Priority Response",
    pricingFeatureAPI: "API Access",
    pricingFree: "Free",
    pricingPro: "Pro",
    pricingEnterprise: "Enterprise",
    usageTitle: "Today's Usage",
    usageMessages: "Messages",
    usageImages: "Images",
    usageRemaining: "Remaining",
    usageLimitReached: "Daily limit reached",
    usageUpgradePrompt: "Upgrade your plan for more usage",
    messageEdit: "Edit",
    messageDelete: "Delete",
    messageCopy: "Copy",
    messageRegenerate: "Regenerate",
    messageReply: "Reply",
    chatSearch: "Search chats...",
    chatFolder: "Folder",
    chatFolderNew: "New Folder",
    chatFolderRename: "Rename",
    chatFolderDelete: "Delete Folder",
    customInstructions: "Custom Instructions",
    customInstructionsPlaceholder: "Enter your custom instructions...",
    customInstructionsSave: "Save Instructions",
    referralTitle: "Refer Friends",
    referralSubtitle: "Invite friends and both get 5 free messages",
    referralLink: "Referral Link",
    referralCopy: "Copy Link",
    referralCount: "Invites",
    referralReward: "Reward",
    imageError: "Error generating image",
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
    landingTitle: "ShardeumAI — El Futuro de la IA Multilingüe",
    landingSubtitle: "Tu asistente inteligente para chat, generación de imágenes y búsqueda web en 7 idiomas",
    landingCTA: "Comenzar",
    landingFeatures: "Características",
    landingFeature1Title: "🤖 Chat IA",
    landingFeature1Desc: "Chatea con modelos avanzados como Llama 3.3 y Qwen 32B",
    landingFeature2Title: "🎨 Generación de Imágenes",
    landingFeature2Desc: "Crea imágenes únicas con generación impulsada por IA",
    landingFeature3Title: "🌐 7 Idiomas",
    landingFeature3Desc: "Persa, Inglés, Árabe, Ruso, Francés, Alemán y Español",
    landingFeature4Title: "⚡ Rápido y Seguro",
    landingFeature4Desc: "Respuestas instantáneas con cifrado de extremo a extremo",
    landingStats: "Estadísticas",
    landingStatsUsers: "Usuarios Activos",
    landingStatsMessages: "Mensajes Diarios",
    landingStatsModels: "Modelos IA",
    landingStatsLanguages: "Idiomas",
    landingHowItWorks: "Cómo Funciona",
    landingStep1: "1. Registrarse",
    landingStep1Desc: "Crea tu cuenta en segundos",
    landingStep2: "2. Elegir Modelo",
    landingStep2Desc: "Elige el modelo de IA que necesitas",
    landingStep3: "3. Empezar Chat",
    landingStep3Desc: "Haz preguntas y recibe respuestas inteligentes",
    landingFooter: "ShardeumAI 2026 — Todos los derechos reservados",
    landingSkip: "Saltar →",
    pricingTitle: "Planes de Suscripción",
    pricingSubtitle: "Elige el plan que se adapte a tus necesidades",
    pricingMonthly: "Mensual",
    pricingYearly: "Anual",
    pricingSave: "Ahorra",
    pricingPopular: "Popular",
    pricingCurrent: "Actual",
    pricingUpgrade: "Actualizar",
    pricingFeatureMessages: "Mensajes por día",
    pricingFeatureImages: "Imágenes por día",
    pricingFeatureModels: "Modelos IA",
    pricingFeatureWebSearch: "Búsqueda Web",
    pricingFeatureFileUpload: "Subir Archivos",
    pricingFeatureExport: "Exportar",
    pricingFeatureAnalytics: "Analíticas",
    pricingFeaturePriority: "Respuesta Prioritaria",
    pricingFeatureAPI: "Acceso API",
    pricingFree: "Gratis",
    pricingPro: "Pro",
    pricingEnterprise: "Empresarial",
    usageTitle: "Uso de Hoy",
    usageMessages: "Mensajes",
    usageImages: "Imágenes",
    usageRemaining: "Restante",
    usageLimitReached: "Límite diario alcanzado",
    usageUpgradePrompt: "Actualiza tu plan para más uso",
    messageEdit: "Editar",
    messageDelete: "Eliminar",
    messageCopy: "Copiar",
    messageRegenerate: "Regenerar",
    messageReply: "Responder",
    chatSearch: "Buscar chats...",
    chatFolder: "Carpeta",
    chatFolderNew: "Nueva Carpeta",
    chatFolderRename: "Renombrar",
    chatFolderDelete: "Eliminar Carpeta",
    customInstructions: "Instrucciones Personalizadas",
    customInstructionsPlaceholder: "Ingresa tus instrucciones personalizadas...",
    customInstructionsSave: "Guardar Instrucciones",
    referralTitle: "Invitar Amigos",
    referralSubtitle: "Invita amigos y ambos obtienen 5 mensajes gratis",
    referralLink: "Enlace de Invitación",
    referralCopy: "Copiar Enlace",
    referralCount: "Invitaciones",
    referralReward: "Recompensa",
    imageError: "Error al generar imagen",
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
    landingTitle: "ShardeumAI — L'Avenir de l'IA Multilingue",
    landingSubtitle: "Votre assistant intelligent pour le chat, la génération d'images et la recherche web en 7 langues",
    landingCTA: "Commencer",
    landingFeatures: "Fonctionnalités",
    landingFeature1Title: "🤖 Chat IA",
    landingFeature1Desc: "Discutez avec des modèles avancés comme Llama 3.3 et Qwen 32B",
    landingFeature2Title: "🎨 Génération d'Images",
    landingFeature2Desc: "Créez des images uniques avec la génération IA",
    landingFeature3Title: "🌐 7 Langues",
    landingFeature3Desc: "Persan, Anglais, Arabe, Russe, Français, Allemand et Espagnol",
    landingFeature4Title: "⚡ Rapide et Sécurisé",
    landingFeature4Desc: "Réponses instantanées avec chiffrement de bout en bout",
    landingStats: "Statistiques",
    landingStatsUsers: "Utilisateurs Actifs",
    landingStatsMessages: "Messages Quotidiens",
    landingStatsModels: "Modèles IA",
    landingStatsLanguages: "Langues",
    landingHowItWorks: "Comment Ça Marche",
    landingStep1: "1. S'inscrire",
    landingStep1Desc: "Créez votre compte en quelques secondes",
    landingStep2: "2. Choisir le Modèle",
    landingStep2Desc: "Choisissez le modèle d'IA qui vous convient",
    landingStep3: "3. Commencer le Chat",
    landingStep3Desc: "Posez des questions et obtenez des réponses intelligentes",
    landingFooter: "ShardeumAI 2026 — Tous droits réservés",
    landingSkip: "Passer →",
    pricingTitle: "Plans d'Abonnement",
    pricingSubtitle: "Choisissez le plan qui vous convient",
    pricingMonthly: "Mensuel",
    pricingYearly: "Annuel",
    pricingSave: "Économisez",
    pricingPopular: "Populaire",
    pricingCurrent: "Actuel",
    pricingUpgrade: "Mettre à Niveau",
    pricingFeatureMessages: "Messages par jour",
    pricingFeatureImages: "Images par jour",
    pricingFeatureModels: "Modèles IA",
    pricingFeatureWebSearch: "Recherche Web",
    pricingFeatureFileUpload: "Télécharger Fichiers",
    pricingFeatureExport: "Exporter",
    pricingFeatureAnalytics: "Analyses",
    pricingFeaturePriority: "Réponse Prioritaire",
    pricingFeatureAPI: "Accès API",
    pricingFree: "Gratuit",
    pricingPro: "Pro",
    pricingEnterprise: "Entreprise",
    usageTitle: "Utilisation Aujourd'hui",
    usageMessages: "Messages",
    usageImages: "Images",
    usageRemaining: "Restant",
    usageLimitReached: "Limite quotidienne atteinte",
    usageUpgradePrompt: "Mettez à niveau votre plan pour plus d'utilisation",
    messageEdit: "Modifier",
    messageDelete: "Supprimer",
    messageCopy: "Copier",
    messageRegenerate: "Régénérer",
    messageReply: "Répondre",
    chatSearch: "Rechercher chats...",
    chatFolder: "Dossier",
    chatFolderNew: "Nouveau Dossier",
    chatFolderRename: "Renommer",
    chatFolderDelete: "Supprimer Dossier",
    customInstructions: "Instructions Personnalisées",
    customInstructionsPlaceholder: "Entrez vos instructions personnalisées...",
    customInstructionsSave: "Sauvegarder Instructions",
    referralTitle: "Parrainer des Amis",
    referralSubtitle: "Parrainez des amis et recevez 5 messages gratuits chacun",
    referralLink: "Lien de Parrainage",
    referralCopy: "Copier le Lien",
    referralCount: "Parrainages",
    referralReward: "Récompense",
    imageError: "Erreur de génération d'image",
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
    landingTitle: "ShardeumAI — Die Zukunft der Mehrsprachigen KI",
    landingSubtitle: "Ihr intelligenter Assistent für Chat, Bildgenerierung und Websuche in 7 Sprachen",
    landingCTA: "Starten",
    landingFeatures: "Funktionen",
    landingFeature1Title: "🤖 KI-Chat",
    landingFeature1Desc: "Chatten Sie mit fortschrittlichen Modellen wie Llama 3.3 und Qwen 32B",
    landingFeature2Title: "🎨 Bildgenerierung",
    landingFeature2Desc: "Erstellen Sie einzigartige Bilder mit KI-gestützter Generierung",
    landingFeature3Title: "🌐 7 Sprachen",
    landingFeature3Desc: "Persisch, Englisch, Arabisch, Russisch, Französisch, Deutsch und Spanisch",
    landingFeature4Title: "⚡ Schnell und Sicher",
    landingFeature4Desc: "Sofortige Antworten mit Ende-zu-Ende-Verschlüsselung",
    landingStats: "Statistiken",
    landingStatsUsers: "Aktive Nutzer",
    landingStatsMessages: "Tägliche Nachrichten",
    landingStatsModels: "KI-Modelle",
    landingStatsLanguages: "Sprachen",
    landingHowItWorks: "Wie Es Funktioniert",
    landingStep1: "1. Anmelden",
    landingStep1Desc: "Erstellen Sie Ihr Konto in Sekunden",
    landingStep2: "2. Modell Wählen",
    landingStep2Desc: "Wählen Sie das passende KI-Modell",
    landingStep3: "3. Chat Starten",
    landingStep3Desc: "Stellen Sie Fragen und erhalten Sie intelligente Antworten",
    landingFooter: "ShardeumAI 2026 — Alle Rechte vorbehalten",
    landingSkip: "Überspringen →",
    pricingTitle: "Abonnementpläne",
    pricingSubtitle: "Wählen Sie den passenden Plan",
    pricingMonthly: "Monatlich",
    pricingYearly: "Jährlich",
    pricingSave: "Sparen",
    pricingPopular: "Beliebt",
    pricingCurrent: "Aktuell",
    pricingUpgrade: "Upgrade",
    pricingFeatureMessages: "Nachrichten pro Tag",
    pricingFeatureImages: "Bilder pro Tag",
    pricingFeatureModels: "KI-Modelle",
    pricingFeatureWebSearch: "Websuche",
    pricingFeatureFileUpload: "Datei-Upload",
    pricingFeatureExport: "Export",
    pricingFeatureAnalytics: "Analysen",
    pricingFeaturePriority: "Prioritätsantwort",
    pricingFeatureAPI: "API-Zugriff",
    pricingFree: "Kostenlos",
    pricingPro: "Pro",
    pricingEnterprise: "Unternehmen",
    usageTitle: "Heutige Nutzung",
    usageMessages: "Nachrichten",
    usageImages: "Bilder",
    usageRemaining: "Verbleibend",
    usageLimitReached: "Tageslimit erreicht",
    usageUpgradePrompt: "Upgraden Sie für mehr Nutzung",
    messageEdit: "Bearbeiten",
    messageDelete: "Löschen",
    messageCopy: "Kopieren",
    messageRegenerate: "Neu generieren",
    messageReply: "Antworten",
    chatSearch: "Chats durchsuchen...",
    chatFolder: "Ordner",
    chatFolderNew: "Neuer Ordner",
    chatFolderRename: "Umbenennen",
    chatFolderDelete: "Ordner Löschen",
    customInstructions: "Benutzerdefinierte Anweisungen",
    customInstructionsPlaceholder: "Geben Sie Ihre Anweisungen ein...",
    customInstructionsSave: "Anweisungen Speichern",
    referralTitle: "Freunde Einladen",
    referralSubtitle: "Laden Sie Freunde ein und erhalten Sie beide 5 kostenlose Nachrichten",
    referralLink: "Empfehlungslink",
    referralCopy: "Link Kopieren",
    referralCount: "Einladungen",
    referralReward: "Belohnung",
    imageError: "Fehler bei der Bildgenerierung",
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
    landingTitle: "ShardeumAI — Будущее Многоязычного ИИ",
    landingSubtitle: "Ваш интеллектуальный помощник для чата, генерации изображений и веб-поиска на 7 языках",
    landingCTA: "Начать",
    landingFeatures: "Возможности",
    landingFeature1Title: "🤖 ИИ-Чат",
    landingFeature1Desc: "Общайтесь с продвинутыми моделями вроде Llama 3.3 и Qwen 32B",
    landingFeature2Title: "🎨 Генерация Изображений",
    landingFeature2Desc: "Создавайте уникальные изображения с помощью ИИ",
    landingFeature3Title: "🌐 7 Языков",
    landingFeature3Desc: "Персидский, Английский, Арабский, Русский, Французский, Немецкий и Испанский",
    landingFeature4Title: "⚡ Быстро и Безопасно",
    landingFeature4Desc: "Мгновенные ответы с сквозным шифрованием",
    landingStats: "Статистика",
    landingStatsUsers: "Активных Пользователей",
    landingStatsMessages: "Сообщений в День",
    landingStatsModels: "ИИ-Моделей",
    landingStatsLanguages: "Языков",
    landingHowItWorks: "Как Это Работает",
    landingStep1: "1. Регистрация",
    landingStep1Desc: "Создайте аккаунт за секунды",
    landingStep2: "2. Выбор Модели",
    landingStep2Desc: "Выберите подходящую ИИ-модель",
    landingStep3: "3. Начать Чат",
    landingStep3Desc: "Задавайте вопросы и получайте умные ответы",
    landingFooter: "ShardeumAI 2026 — Все права защищены",
    landingSkip: "Пропустить →",
    pricingTitle: "Планы Подписки",
    pricingSubtitle: "Выберите подходящий план",
    pricingMonthly: "Ежемесячно",
    pricingYearly: "Ежегодно",
    pricingSave: "Экономия",
    pricingPopular: "Популярный",
    pricingCurrent: "Текущий",
    pricingUpgrade: "Обновить",
    pricingFeatureMessages: "Сообщений в день",
    pricingFeatureImages: "Изображений в день",
    pricingFeatureModels: "ИИ-Модели",
    pricingFeatureWebSearch: "Веб-Поиск",
    pricingFeatureFileUpload: "Загрузка Файлов",
    pricingFeatureExport: "Экспорт",
    pricingFeatureAnalytics: "Аналитика",
    pricingFeaturePriority: "Приоритетный Ответ",
    pricingFeatureAPI: "API Доступ",
    pricingFree: "Бесплатно",
    pricingPro: "Про",
    pricingEnterprise: "Корпоративный",
    usageTitle: "Использование Сегодня",
    usageMessages: "Сообщения",
    usageImages: "Изображения",
    usageRemaining: "Осталось",
    usageLimitReached: "Дневной лимит достигнут",
    usageUpgradePrompt: "Обновите план для большего использования",
    messageEdit: "Редактировать",
    messageDelete: "Удалить",
    messageCopy: "Копировать",
    messageRegenerate: "Перегенерировать",
    messageReply: "Ответить",
    chatSearch: "Поиск чатов...",
    chatFolder: "Папка",
    chatFolderNew: "Новая Папка",
    chatFolderRename: "Переименовать",
    chatFolderDelete: "Удалить Папку",
    customInstructions: "Пользовательские Инструкции",
    customInstructionsPlaceholder: "Введите ваши инструкции...",
    customInstructionsSave: "Сохранить Инструкции",
    referralTitle: "Пригласить Друзей",
    referralSubtitle: "Пригласите друзей и получите по 5 бесплатных сообщений",
    referralLink: "Реферальная Ссылка",
    referralCopy: "Копировать Ссылку",
    referralCount: "Приглашения",
    referralReward: "Награда",
    imageError: "Ошибка генерации изображения",
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
    landingTitle: "ShardeumAI — مستقبل الذكاء الاصطناعي متعدد اللغات",
    landingSubtitle: "مساعدك الذكي للدردشة وتوليد الصور والبحث الويب بـ 7 لغات",
    landingCTA: "ابدأ الآن",
    landingFeatures: "المميزات",
    landingFeature1Title: "🤖 دردشة ذكية",
    landingFeature1Desc: "تحدث مع نماذج لغوية متقدمة مثل Llama 3.3 و Qwen 32B",
    landingFeature2Title: "🎨 توليد الصور",
    landingFeature2Desc: "أنشئ صور فريدة بالذكاء الاصطناعي",
    landingFeature3Title: "🌐 7 لغات",
    landingFeature3Desc: "الفارسية والإنجليزية والعربية والروسية والفرنسية والألمانية والإسبانية",
    landingFeature4Title: "⚡ سريع وآمن",
    landingFeature4Desc: "ردود فورية مع تشفير من طرف إلى طرف",
    landingStats: "الإحصائيات",
    landingStatsUsers: "مستخدم نشط",
    landingStatsMessages: "رسالة يومية",
    landingStatsModels: "نموذج ذكي",
    landingStatsLanguages: "لغة مدعومة",
    landingHowItWorks: "كيف يعمل؟",
    landingStep1: "١. التسجيل",
    landingStep1Desc: "أنشئ حسابك في ثوانٍ",
    landingStep2: "٢. اختيار النموذج",
    landingStep2Desc: "اختر نموذج الذكاء الاصطناعي المناسب",
    landingStep3: "٣. بدء الدردشة",
    landingStep3Desc: "اطرح أسئلتك واحصل على إجابات ذكية",
    landingFooter: "ShardeumAI 2026 — جميع الحقوق محفوظة",
    landingSkip: "تخطي →",
    pricingTitle: "خطط الاشتراك",
    pricingSubtitle: "اختر الخطة المناسبة لك",
    pricingMonthly: "شهري",
    pricingYearly: "سنوي",
    pricingSave: "وفر",
    pricingPopular: "الأكثر شعبية",
    pricingCurrent: "الحالي",
    pricingUpgrade: "ترقية",
    pricingFeatureMessages: "رسالة في اليوم",
    pricingFeatureImages: "صورة في اليوم",
    pricingFeatureModels: "نماذج الذكاء الاصطناعي",
    pricingFeatureWebSearch: "البحث في الويب",
    pricingFeatureFileUpload: "رفع الملفات",
    pricingFeatureExport: "تصدير",
    pricingFeatureAnalytics: "التحليلات",
    pricingFeaturePriority: "أولوية الرد",
    pricingFeatureAPI: "وصول API",
    pricingFree: "مجاني",
    pricingPro: "احترافي",
    pricingEnterprise: "مؤسسي",
    usageTitle: "استخدام اليوم",
    usageMessages: "رسائل",
    usageImages: "صور",
    usageRemaining: "متبقي",
    usageLimitReached: "تم الوصول للحد اليومي",
    usageUpgradePrompt: "قم بترقية خطتك للمزيد من الاستخدام",
    messageEdit: "تعديل",
    messageDelete: "حذف",
    messageCopy: "نسخ",
    messageRegenerate: "إعادة التوليد",
    messageReply: "رد",
    chatSearch: "البحث في المحادثات...",
    chatFolder: "مجلد",
    chatFolderNew: "مجلد جديد",
    chatFolderRename: "إعادة تسمية",
    chatFolderDelete: "حذف المجلد",
    customInstructions: "تعليمات مخصصة",
    customInstructionsPlaceholder: "أدخل تعليماتك المخصصة...",
    customInstructionsSave: "حفظ التعليمات",
    referralTitle: "دعوة الأصدقاء",
    referralSubtitle: "ادعُ أصدقاء واحصل على 5 رسائل مجانية لكل منكما",
    referralLink: "رابط الدعوة",
    referralCopy: "نسخ الرابط",
    referralCount: "الدعوات",
    referralReward: "المكافأة",
    imageError: "خطأ في توليد الصورة",
  },
};


// ── Syntax Highlighting ──
const KC = { kw:"#c678dd", str:"#98c379", cmt:"#5c6370", num:"#d19a66", tag:"#e06c75", attr:"#d19a66" };
function sp(color, text) { return '<span style="color:' + color + '">' + text + '</span>'; }
function esc(s) { return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

function applyKw(text, kws, color) {
  let r = text;
  kws.forEach(kw => {
    r = r.split(new RegExp("(\b" + kw + "\b)")).map((p,i) => i%2===1 ? sp(color,p) : p).join("");
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

function ImageGenerator({ t, isRTL, usageTracking }) {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate(e) {
    e.preventDefault();
    if (!prompt.trim()) return;

    if (!usageTracking.canGenerateImage()) {
      setError(t.usageLimitReached + " — " + t.usageUpgradePrompt);
      return;
    }

    setLoading(true); setError(""); setImageUrl("");
    try {
      const encoded = encodeURIComponent(prompt.trim());
      const seed = Math.floor(Math.random() * 1000000);
      const url = `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&seed=${seed}&nologo=true`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("error");
      const blob = await res.blob();
      setImageUrl(URL.createObjectURL(blob));
      usageTracking.incrementUsage("image");
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
// ═══ PRICING PAGE COMPONENT ═══
// ═══════════════════════════════════════════════════════════════

function PricingPage({ t, th, uiLang, currentPlan, onSelectPlan, onBack, isMobile }) {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const isRTL = uiLang === "fa" || uiLang === "ar";

  const plans = [SUBSCRIPTION_PLANS.free, SUBSCRIPTION_PLANS.pro, SUBSCRIPTION_PLANS.enterprise];

  const featureLabels = [
    { key: "messagesPerDay", label: t.pricingFeatureMessages },
    { key: "imagesPerDay", label: t.pricingFeatureImages },
    { key: "models", label: t.pricingFeatureModels },
    { key: "webSearch", label: t.pricingFeatureWebSearch },
    { key: "fileUpload", label: t.pricingFeatureFileUpload },
    { key: "export", label: t.pricingFeatureExport },
    { key: "analytics", label: t.pricingFeatureAnalytics },
    { key: "priority", label: t.pricingFeaturePriority },
    { key: "apiAccess", label: t.pricingFeatureAPI },
  ];

  function formatFeatureValue(plan, key) {
    const val = plan.features[key];
    if (key === "messagesPerDay" || key === "imagesPerDay") {
      return val === Infinity ? "∞" : val;
    }
    if (key === "models") return val.length + " models";
    if (key === "export") return val.length + " formats";
    if (key === "maxFileSize") return (val / (1024 * 1024)) + "MB";
    if (typeof val === "boolean") return val ? "✓" : "—";
    return val;
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: th.bg,
      color: th.text,
      direction: isRTL ? "rtl" : "ltr",
      overflowY: "auto",
      overflowX: "hidden",
      padding: isMobile ? "20px" : "40px",
    }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <button onClick={onBack}
          style={{
            padding: "8px 16px", borderRadius: 8, border: `1px solid ${th.border}`,
            background: "transparent", color: th.textSecondary, fontSize: 14,
            cursor: "pointer", marginBottom: 24,
          }}>
          ← Back
        </button>

        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ margin: 0, fontSize: isMobile ? 28 : 40, fontWeight: 800, color: th.text }}>
            {t.pricingTitle}
          </h1>
          <p style={{ margin: "12px 0 0", fontSize: 16, color: th.textSecondary }}>
            {t.pricingSubtitle}
          </p>
        </div>

        {/* Billing Toggle */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 4,
          background: th.bgSecondary, borderRadius: 12, padding: 4,
          maxWidth: 280, margin: "0 auto 40px",
        }}>
          <button onClick={() => setBillingCycle("monthly")}
            style={{
              flex: 1, padding: "10px 20px", borderRadius: 10,
              border: "none", background: billingCycle === "monthly" ? th.primary : "transparent",
              color: billingCycle === "monthly" ? "#fff" : th.textSecondary,
              fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
            }}>
            {t.pricingMonthly}
          </button>
          <button onClick={() => setBillingCycle("yearly")}
            style={{
              flex: 1, padding: "10px 20px", borderRadius: 10,
              border: "none", background: billingCycle === "yearly" ? th.primary : "transparent",
              color: billingCycle === "yearly" ? "#fff" : th.textSecondary,
              fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
              position: "relative",
            }}>
            {t.pricingYearly}
            <span style={{
              position: "absolute", top: -8, right: -8,
              background: "#22c55e", color: "#fff", fontSize: 10,
              padding: "2px 6px", borderRadius: 999, fontWeight: 700,
            }}>
              {t.pricingSave} 20%
            </span>
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="pricing-cards" style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
          gap: 24,
        }}>
          {plans.map(plan => {
            const isCurrent = currentPlan === plan.id;
            const price = billingCycle === "monthly" ? plan.price.monthly : plan.price.yearly;

            return (
              <div key={plan.id} style={{
                background: th.bgSecondary,
                border: `2px solid ${isCurrent ? plan.color : th.border}`,
                borderRadius: 20,
                padding: isMobile ? 24 : 32,
                position: "relative",
                transition: "all 0.3s ease",
                transform: isCurrent ? "scale(1.02)" : "scale(1)",
              }}>
                {plan.popular && (
                  <div style={{
                    position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                    background: plan.color, color: "#fff", fontSize: 12, fontWeight: 700,
                    padding: "4px 16px", borderRadius: 999,
                  }}>
                    {t.pricingPopular}
                  </div>
                )}
                {isCurrent && (
                  <div style={{
                    position: "absolute", top: 12, right: 12,
                    background: plan.color + "22", color: plan.color,
                    fontSize: 11, fontWeight: 600,
                    padding: "4px 10px", borderRadius: 6,
                  }}>
                    {t.pricingCurrent}
                  </div>
                )}

                <div style={{ textAlign: "center", marginBottom: 24 }}>
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: plan.color }}>
                    {plan.name[uiLang] || plan.name.en}
                  </h3>
                  <div style={{ marginTop: 12 }}>
                    <span style={{ fontSize: 36, fontWeight: 800, color: th.text }}>
                      ${price}
                    </span>
                    <span style={{ fontSize: 14, color: th.textMuted }}>
                      /{billingCycle === "monthly" ? "mo" : "yr"}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                  {featureLabels.map(feat => (
                    <div key={feat.key} style={{
                      display: "flex", justifyContent: "space-between",
                      alignItems: "center", padding: "6px 0",
                      borderBottom: `1px solid ${th.border}`,
                    }}>
                      <span style={{ fontSize: 13, color: th.textSecondary }}>{feat.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: th.text }}>
                        {formatFeatureValue(plan, feat.key)}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onSelectPlan(plan.id)}
                  disabled={isCurrent}
                  style={{
                    width: "100%", padding: "12px 0", borderRadius: 12,
                    border: "none",
                    background: isCurrent ? th.border : plan.color,
                    color: isCurrent ? th.textMuted : "#fff",
                    fontSize: 15, fontWeight: 700, cursor: isCurrent ? "default" : "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {isCurrent ? t.pricingCurrent : t.pricingUpgrade}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ═══ USAGE BAR COMPONENT ═══
// ═══════════════════════════════════════════════════════════════

function UsageBar({ t, th, usageTracking, isMobile }) {
  const remaining = usageTracking.getRemaining();
  const isRTL = t.title === "ShardeumAI" && (t.landingTitle && t.landingTitle.includes("آینده"));

  return (
    <div style={{
      padding: "8px 16px",
      background: th.bgSecondary,
      borderBottom: `1px solid ${th.border}`,
      display: "flex",
      gap: isMobile ? 8 : 16,
      alignItems: "center",
      flexWrap: "wrap",
      direction: isRTL ? "rtl" : "ltr",
    }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: th.textSecondary, whiteSpace: "nowrap" }}>
        {t.usageTitle}
      </span>

      {/* Messages Progress */}
      <div style={{ flex: 1, minWidth: 120, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 10, color: th.textMuted, whiteSpace: "nowrap" }}>
          {t.usageMessages}
        </span>
        <div style={{
          flex: 1, height: 6, borderRadius: 3,
          background: th.border, overflow: "hidden",
        }}>
          <div style={{
            width: `${remaining.messagesPercent}%`,
            height: "100%",
            background: remaining.messagesPercent > 80 ? "#ef4444" : remaining.messagesPercent > 50 ? "#f59e0b" : "#10a37f",
            borderRadius: 3,
            transition: "width 0.3s ease",
          }} />
        </div>
        <span style={{ fontSize: 10, color: th.textMuted, whiteSpace: "nowrap" }}>
          {remaining.messages} {t.usageRemaining}
        </span>
      </div>

      {/* Images Progress */}
      <div style={{ flex: 1, minWidth: 120, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 10, color: th.textMuted, whiteSpace: "nowrap" }}>
          {t.usageImages}
        </span>
        <div style={{
          flex: 1, height: 6, borderRadius: 3,
          background: th.border, overflow: "hidden",
        }}>
          <div style={{
            width: `${remaining.imagesPercent}%`,
            height: "100%",
            background: remaining.imagesPercent > 80 ? "#ef4444" : remaining.imagesPercent > 50 ? "#f59e0b" : "#10a37f",
            borderRadius: 3,
            transition: "width 0.3s ease",
          }} />
        </div>
        <span style={{ fontSize: 10, color: th.textMuted, whiteSpace: "nowrap" }}>
          {remaining.images} {t.usageRemaining}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ═══ CUSTOM INSTRUCTIONS COMPONENT ═══
// ═══════════════════════════════════════════════════════════════

function CustomInstructionsPanel({ t, th, customInstructions, setCustomInstructions, onSave, isMobile }) {
  const [localInstructions, setLocalInstructions] = useState(customInstructions);
  const isRTL = t.title === "ShardeumAI" && (t.landingTitle && t.landingTitle.includes("آینده"));

  return (
    <div style={{
      padding: "12px 16px",
      background: th.bgSecondary,
      borderBottom: `1px solid ${th.border}`,
      direction: isRTL ? "rtl" : "ltr",
    }}>
      <div style={{ maxWidth: 768, margin: "0 auto" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: th.text, marginBottom: 8 }}>
          📝 {t.customInstructions}
        </div>
        <textarea
          value={localInstructions}
          onChange={(e) => setLocalInstructions(e.target.value)}
          placeholder={t.customInstructionsPlaceholder}
          rows={2}
          style={{
            width: "100%", padding: "10px 12px", borderRadius: 10,
            border: `1px solid ${th.border}`, background: th.inputBg,
            color: th.text, fontSize: 13, outline: "none",
            resize: "vertical", marginBottom: 8,
            direction: isRTL ? "rtl" : "ltr",
          }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { onSave(localInstructions); }}
            style={{
              padding: "6px 14px", borderRadius: 8, border: "none",
              background: th.primary, color: "#fff",
              fontSize: 12, cursor: "pointer", fontWeight: 600,
            }}>
            {t.customInstructionsSave}
          </button>
          <button onClick={() => setLocalInstructions("")}
            style={{
              padding: "6px 14px", borderRadius: 8,
              border: `1px solid ${th.border}`, background: "transparent",
              color: th.textSecondary, fontSize: 12, cursor: "pointer",
            }}>
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ═══ REFERRAL COMPONENT ═══
// ═══════════════════════════════════════════════════════════════

function ReferralPanel({ t, th, session, isMobile }) {
  const [copied, setCopied] = useState(false);
  const referralLink = session 
    ? `${window.location.origin}${window.location.pathname}?ref=${session.user.id}`
    : "";
  const isRTL = t.title === "ShardeumAI" && (t.landingTitle && t.landingTitle.includes("آینده"));

  const [referralData, setReferralData] = useState(() => {
    const saved = localStorage.getItem(`shardeumai-referrals-${session?.user?.id}`);
    return saved ? JSON.parse(saved) : { count: 0, reward: 0 };
  });

  function copyReferralLink() {
    navigator.clipboard?.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{
      padding: "12px 16px",
      background: th.bgSecondary,
      borderBottom: `1px solid ${th.border}`,
      direction: isRTL ? "rtl" : "ltr",
    }}>
      <div style={{ maxWidth: 768, margin: "0 auto" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: th.text, marginBottom: 4 }}>
          🎁 {t.referralTitle}
        </div>
        <p style={{ fontSize: 12, color: th.textSecondary, margin: "0 0 10px" }}>
          {t.referralSubtitle}
        </p>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input
            value={referralLink}
            readOnly
            style={{
              flex: 1, padding: "8px 12px", borderRadius: 8,
              border: `1px solid ${th.border}`, background: th.inputBg,
              color: th.text, fontSize: 12, outline: "none",
              minWidth: 200,
            }}
          />
          <button onClick={copyReferralLink}
            style={{
              padding: "8px 16px", borderRadius: 8, border: "none",
              background: copied ? "#22c55e" : th.primary, color: "#fff",
              fontSize: 12, cursor: "pointer", fontWeight: 600,
              whiteSpace: "nowrap",
            }}>
            {copied ? "✓ " + t.copied : t.referralCopy}
          </button>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
          <div style={{ fontSize: 12, color: th.textSecondary }}>
            {t.referralCount}: <strong style={{ color: th.primary }}>{referralData.count}</strong>
          </div>
          <div style={{ fontSize: 12, color: th.textSecondary }}>
            {t.referralReward}: <strong style={{ color: th.primary }}>{referralData.reward}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// ═══ WELCOME PAGE & LANDING PAGE ═══
// ═══════════════════════════════════════════════════════════════

function LandingPage({ t, th, uiLang, setUiLang, onStart, isMobile }) {
  const isRTL = uiLang === "fa" || uiLang === "ar";
  const [animatedStats, setAnimatedStats] = useState({ users: 0, messages: 0, models: 0, languages: 0 });

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;

    const targets = { users: 12500, messages: 89000, models: 3, languages: 7 };

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedStats({
        users: Math.floor(targets.users * easeOut),
        messages: Math.floor(targets.messages * easeOut),
        models: Math.floor(targets.models * easeOut),
        languages: Math.floor(targets.languages * easeOut),
      });

      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const features = [
    { icon: "🤖", title: t.landingFeature1Title, desc: t.landingFeature1Desc },
    { icon: "🎨", title: t.landingFeature2Title, desc: t.landingFeature2Desc },
    { icon: "🌐", title: t.landingFeature3Title, desc: t.landingFeature3Desc },
    { icon: "⚡", title: t.landingFeature4Title, desc: t.landingFeature4Desc },
  ];

  const steps = [
    { num: "1", title: t.landingStep1, desc: t.landingStep1Desc },
    { num: "2", title: t.landingStep2, desc: t.landingStep2Desc },
    { num: "3", title: t.landingStep3, desc: t.landingStep3Desc },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: th.bg,
      color: th.text,
      direction: isRTL ? "rtl" : "ltr",
      overflowY: "auto",
      overflowX: "hidden",
    }}>
      {/* Hero Section */}
      <div style={{
        minHeight: isMobile ? "auto" : "90vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "60px 20px" : "80px 40px",
        position: "relative",
        textAlign: "center",
      }}>
        <div style={{
          position: "absolute", top: "20%", left: "10%", width: 300, height: 300,
          borderRadius: "50%", background: th.primary, opacity: 0.05, filter: "blur(100px)",
        }} />
        <div style={{
          position: "absolute", bottom: "10%", right: "10%", width: 400, height: 400,
          borderRadius: "50%", background: "#3b82f6", opacity: 0.03, filter: "blur(120px)",
        }} />

        <div style={{
          position: "absolute", top: 24, right: 24,
          display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end",
          zIndex: 10,
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

        <button onClick={onStart}
          style={{
            position: "absolute", top: 24, left: 24,
            padding: "6px 14px", borderRadius: 8,
            border: `1px solid ${th.border}`,
            background: "transparent", color: th.textMuted,
            fontSize: 13, cursor: "pointer", zIndex: 10,
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = th.text; e.currentTarget.style.borderColor = th.primary; }}
          onMouseLeave={e => { e.currentTarget.style.color = th.textMuted; e.currentTarget.style.borderColor = th.border; }}
        >
          {t.landingSkip}
        </button>

        <div className="welcome-logo welcome-float" style={{
          width: isMobile ? 80 : 120, height: isMobile ? 80 : 120, borderRadius: 28,
          background: th.gradient,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: isMobile ? 40 : 56, fontWeight: 800, color: "#fff",
          marginBottom: 32,
          boxShadow: `0 20px 60px ${th.primary}33`,
        }}>
          S
        </div>

        <h1 style={{
          margin: 0, fontSize: isMobile ? 28 : 48, fontWeight: 800,
          color: th.text, lineHeight: 1.2,
          letterSpacing: "-0.02em", maxWidth: 800,
        }}>
          {t.landingTitle}
        </h1>

        <p style={{
          margin: "20px 0 0", fontSize: isMobile ? 15 : 20,
          color: th.textSecondary, fontWeight: 400,
          maxWidth: 600, lineHeight: 1.6,
        }}>
          {t.landingSubtitle}
        </p>

        <button onClick={onStart}
          style={{
            marginTop: 40,
            padding: isMobile ? "14px 36px" : "18px 48px", borderRadius: 16,
            border: "none", background: th.gradient,
            color: "#fff", fontSize: isMobile ? 16 : 20, fontWeight: 700,
            cursor: "pointer", letterSpacing: "0.5px",
            boxShadow: `0 8px 32px ${th.primary}44`,
            transition: "all 0.3s ease",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
            e.currentTarget.style.boxShadow = `0 16px 48px ${th.primary}66`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "translateY(0) scale(1)";
            e.currentTarget.style.boxShadow = `0 8px 32px ${th.primary}44`;
          }}
        >
          {t.landingCTA} →
        </button>

        <div style={{
          position: "absolute", bottom: 30,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          animation: "welcomeFadeIn 1s ease-out 2s both",
        }}>
          <span style={{ fontSize: 11, color: th.textMuted }}>Scroll</span>
          <div style={{
            width: 20, height: 30, borderRadius: 10,
            border: `2px solid ${th.border}`,
            display: "flex", justifyContent: "center", paddingTop: 6,
          }}>
            <div style={{
              width: 4, height: 8, borderRadius: 2,
              background: th.primary,
              animation: "float 2s ease-in-out infinite",
            }} />
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{
        padding: isMobile ? "40px 20px" : "60px 40px",
        background: th.bgSecondary,
        borderTop: `1px solid ${th.border}`,
        borderBottom: `1px solid ${th.border}`,
      }}>
        <div style={{
          maxWidth: 900, margin: "0 auto",
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
          gap: isMobile ? 20 : 40,
        }}>
          {[
            { value: animatedStats.users.toLocaleString(), label: t.landingStatsUsers, icon: "👥" },
            { value: animatedStats.messages.toLocaleString(), label: t.landingStatsMessages, icon: "💬" },
            { value: animatedStats.models, label: t.landingStatsModels, icon: "🤖" },
            { value: animatedStats.languages, label: t.landingStatsLanguages, icon: "🌍" },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{stat.icon}</div>
              <div style={{ fontSize: isMobile ? 24 : 32, fontWeight: 800, color: th.primary }}>
                {stat.value}+
              </div>
              <div style={{ fontSize: 12, color: th.textSecondary, marginTop: 4 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div style={{ padding: isMobile ? "60px 20px" : "80px 40px", maxWidth: 1000, margin: "0 auto" }}>
        <h2 style={{
          textAlign: "center", fontSize: isMobile ? 24 : 32, fontWeight: 700,
          color: th.text, marginBottom: isMobile ? 40 : 60,
        }}>
          {t.landingFeatures}
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
          gap: isMobile ? 16 : 24,
        }}>
          {features.map((f, i) => (
            <div key={i} style={{
              padding: isMobile ? "24px" : "32px", borderRadius: 20,
              background: th.bgSecondary,
              border: `1px solid ${th.border}`,
              transition: "all 0.3s ease",
              cursor: "default",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = th.shadow;
              e.currentTarget.style.borderColor = th.primary + "44";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.borderColor = th.border;
            }}
            >
              <div style={{ fontSize: isMobile ? 32 : 40, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: th.text, margin: "0 0 8px" }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 14, color: th.textSecondary, lineHeight: 1.6, margin: 0 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div style={{
        padding: isMobile ? "60px 20px" : "80px 40px",
        background: th.bgSecondary,
        borderTop: `1px solid ${th.border}`,
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{
            textAlign: "center", fontSize: isMobile ? 24 : 32, fontWeight: 700,
            color: th.text, marginBottom: isMobile ? 40 : 60,
          }}>
            {t.landingHowItWorks}
          </h2>
          <div style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 24 : 32,
            alignItems: "stretch",
          }}>
            {steps.map((s, i) => (
              <div key={i} style={{
                flex: 1,
                padding: isMobile ? "24px" : "32px", borderRadius: 16,
                background: th.bg,
                border: `1px solid ${th.border}`,
                textAlign: "center",
                position: "relative",
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: th.gradient,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, fontWeight: 700, color: "#fff",
                  margin: "0 auto 16px",
                }}>
                  {s.num}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: th.text, margin: "0 0 8px" }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: 13, color: th.textSecondary, lineHeight: 1.6, margin: 0 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{
        padding: isMobile ? "60px 20px" : "100px 40px",
        textAlign: "center",
        position: "relative",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: th.gradient, opacity: 0.05,
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{
            fontSize: isMobile ? 24 : 36, fontWeight: 800,
            color: th.text, margin: "0 0 16px",
          }}>
            {t.welcomePageTitle}
          </h2>
          <p style={{
            fontSize: isMobile ? 14 : 18, color: th.textSecondary,
            margin: "0 0 32px", maxWidth: 500, marginLeft: "auto", marginRight: "auto",
          }}>
            {t.welcomePageSubtitle}
          </p>
          <button onClick={onStart}
            style={{
              padding: isMobile ? "14px 36px" : "18px 48px", borderRadius: 16,
              border: "none", background: th.gradient,
              color: "#fff", fontSize: isMobile ? 16 : 20, fontWeight: 700,
              cursor: "pointer",
              boxShadow: `0 8px 32px ${th.primary}44`,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
              e.currentTarget.style.boxShadow = `0 16px 48px ${th.primary}66`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = `0 8px 32px ${th.primary}44`;
            }}
          >
            {t.landingCTA} →
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: "24px 20px",
        borderTop: `1px solid ${th.border}`,
        textAlign: "center",
        background: th.bgSecondary,
      }}>
        <p style={{ fontSize: 12, color: th.textMuted, margin: 0 }}>
          {t.landingFooter}
        </p>
      </div>
    </div>
  );
}

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
// ═══ MAIN APP COMPONENT ═══
// ═══════════════════════════════════════════════════════════════

function App() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const th = THEMES[resolvedTheme];
  const isMobile = useMobile();

  const [showLanding, setShowLanding] = useState(() => {
    return !localStorage.getItem("shardeumai-landing-v1");
  });
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

  // ── NEW: Subscription & Usage States ──
  const [currentPlan, setCurrentPlan] = useState(() => {
    return localStorage.getItem("shardeumai-plan") || "free";
  });
  const [showPricing, setShowPricing] = useState(false);
  const [showCustomInstructions, setShowCustomInstructions] = useState(false);
  const [customInstructions, setCustomInstructions] = useState(() => {
    return localStorage.getItem("shardeumai-custom-instructions") || "";
  });
  const [showReferral, setShowReferral] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [showChatSearch, setShowChatSearch] = useState(false);
  const [editingMessageIdx, setEditingMessageIdx] = useState(null);
  const [editText, setEditText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);

  const fileInputRef = useRef(null);
  const chatRef = useRef(null);
  const inputRef = useRef(null);
  const responseTimeRef = useRef(null);
  const recognitionRef = useRef(null);

  // ── Usage Tracking ──
  const usageTracking = useUsageTracking(session?.user?.id, currentPlan);

  // ── Smart Notification States ──
  const [showSmartNotification, setShowSmartNotification] = useState(false);
  const [daysSinceLastVisit, setDaysSinceLastVisit] = useState(0);
  const [smartNotifDismissed, setSmartNotifDismissed] = useState(() => {
    return localStorage.getItem("shardeumai-smart-notif-dismissed") === "true";
  });

  const t = translations[uiLang] || translations.en;
  const isRTL = uiLang === "fa" || uiLang === "ar";
  const currentModel = MODELS.find(m => m.id === selectedModel);

  // ── Effects ──
  useEffect(() => {
    const detectLang = navigator.language?.slice(0, 2);
    const found = UI_LANGUAGES.find((l) => l.code === detectLang);
    if (found) setUiLang(found.code);
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) { 
        setSession(data.session); 
        loadHistory(data.session.user.id); 
        loadProfile(data.session.user.id); 
      }
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

  useEffect(() => {
    setSavedChats(loadSavedChats());
  }, [showSavedChats]);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) return;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }
  }, [uiLang]);

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

  // ── Plan Management ──
  function handleSelectPlan(planId) {
    setCurrentPlan(planId);
    localStorage.setItem("shardeumai-plan", planId);
    setShowPricing(false);
    // Reset usage when plan changes
    const newUsage = {
      messagesToday: 0,
      imagesToday: 0,
      lastResetDate: new Date().toDateString(),
      totalMessages: usageTracking.usage.totalMessages,
      totalImages: usageTracking.usage.totalImages,
      streakDays: usageTracking.usage.streakDays,
      lastActiveDate: usageTracking.usage.lastActiveDate,
    };
    localStorage.setItem(`shardeumai-usage-${session?.user?.id}`, JSON.stringify(newUsage));
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
    setReplyingTo(null);
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

  // ── Message Actions ──
  function handleEditMessage(idx) {
    if (messages[idx].role !== "user") return;
    setEditingMessageIdx(idx);
    setEditText(messages[idx].content);
  }

  function saveEditMessage() {
    if (!editText.trim()) return;
    const newMessages = [...messages];
    newMessages[editingMessageIdx] = { ...newMessages[editingMessageIdx], content: editText.trim() };
    // Remove all messages after the edited one
    setMessages(newMessages.slice(0, editingMessageIdx + 1));
    setEditingMessageIdx(null);
    setEditText("");
    // Regenerate response
    handleRegenerate(editingMessageIdx);
  }

  function handleDeleteMessage(idx) {
    const newMessages = messages.filter((_, i) => i !== idx);
    setMessages(newMessages);
  }

  function handleRegenerate(idx) {
    // Remove the assistant response and regenerate
    const userMsgIndex = idx % 2 === 0 ? idx : idx - 1;
    const messagesUpToUser = messages.slice(0, userMsgIndex + 1);
    setMessages(messagesUpToUser);
    // Trigger new response
    setTimeout(() => {
      handleSend({ preventDefault: () => {} }, true);
    }, 100);
  }

  function handleReplyToMessage(idx) {
    setReplyingTo({ idx, content: messages[idx].content.slice(0, 100) });
    inputRef.current?.focus();
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
    const plan = SUBSCRIPTION_PLANS[currentPlan];

    files.forEach(file => {
      if (file.size > plan.features.maxFileSize) {
        alert(`File too large. Max size: ${(plan.features.maxFileSize / (1024 * 1024)).toFixed(0)}MB`);
        return;
      }
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

  // ── Chat Search Filter ──
  const filteredConversations = conversations.filter(convo =>
    convo.title.toLowerCase().includes(chatSearchQuery.toLowerCase())
  );

  // ── Main Send Handler ──
  async function handleSend(e, isRegenerate = false) {
    if (e && e.preventDefault) e.preventDefault();
    if (!input.trim() && uploadedFiles.length === 0 && !isRegenerate) return;
    if (!session) { alert("Please login first."); return; }

    // Check usage limit
    if (!usageTracking.canSendMessage() && !isRegenerate) {
      alert(t.usageLimitReached + "\n" + t.usageUpgradePrompt);
      setShowPricing(true);
      return;
    }

    // Check model availability for plan
    const plan = SUBSCRIPTION_PLANS[currentPlan];
    if (!plan.features.models.includes(selectedModel)) {
      alert(`This model is not available on your plan. Please upgrade to access ${currentModel?.label}.`);
      setShowPricing(true);
      return;
    }

    let messageContent = input.trim();

    // Add reply context
    if (replyingTo) {
      messageContent = `[Replying to: "${replyingTo.content}..."]\n\n${messageContent}`;
    }

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

    // Add custom instructions
    if (customInstructions.trim()) {
      messageContent = `[Custom Instructions: ${customInstructions}]\n\n${messageContent}`;
    }

    const userMsg = { role: "user", content: messageContent };
    const newMessages = isRegenerate ? messages : [...messages, userMsg];
    if (!isRegenerate) {
      setMessages(newMessages);
      setInput("");
      setReplyingTo(null);
    }
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

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Edge function error:", response.status, errorText);
        throw new Error(`Server error ${response.status}: ${errorText.slice(0, 200)}`);
      }

      if (streamingEnabled) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullReply = "";

        if (!reader) {
          throw new Error("Response body is not readable");
        }

        setMessages(prev => [...prev, { role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

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
            } else {
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
        const contentType = response.headers.get("content-type");
        console.log("Response content-type:", contentType);

        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          console.log("Response data:", data);
          reply = data.reply || data.response || data.message || data.content || JSON.stringify(data);
        } else {
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

      // Increment usage
      if (!isRegenerate) {
        usageTracking.incrementUsage("message");
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


  // ── Render ──
  if (showLanding) {
    return (
      <LandingPage
        t={t}
        th={th}
        uiLang={uiLang}
        setUiLang={setUiLang}
        isMobile={isMobile}
        onStart={() => {
          localStorage.setItem("shardeumai-landing-v1", "true");
          setShowLanding(false);
        }}
      />
    );
  }

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

  if (showPricing) {
    return (
      <PricingPage
        t={t}
        th={th}
        uiLang={uiLang}
        currentPlan={currentPlan}
        onSelectPlan={handleSelectPlan}
        onBack={() => setShowPricing(false)}
        isMobile={isMobile}
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

        {/* Chat Search */}
        <div style={{ padding: "8px 10px 0" }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button onClick={() => setShowChatSearch(!showChatSearch)}
              style={{ background: "none", border: "none", color: "#8e8ea0", cursor: "pointer", fontSize: 14, padding: "4px" }}>
              🔍
            </button>
            {showChatSearch && (
              <input
                value={chatSearchQuery}
                onChange={(e) => setChatSearchQuery(e.target.value)}
                placeholder={t.chatSearch}
                style={{
                  flex: 1, padding: "6px 10px", borderRadius: 8,
                  border: "1px solid #3d3d3d", background: "#2d2d2d",
                  color: "#ececec", fontSize: 12, outline: "none",
                }}
              />
            )}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px" }}>
          <div style={{ fontSize: 11, color: "#5c5c5c", padding: "4px 6px 8px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{t.recentChats}</div>
          {(showChatSearch ? filteredConversations : conversations).length === 0 && (
            <div style={{ color: "#5c5c5c", fontSize: 12, textAlign: "center", padding: 20 }}>{t.noChats}</div>
          )}
          {(showChatSearch ? filteredConversations : conversations).map(convo => (
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

        {/* Plan Badge */}
        <div style={{ padding: "8px 14px", borderTop: "1px solid #2d2d2d" }}>
          <button onClick={() => setShowPricing(true)}
            style={{
              width: "100%", padding: "8px 0", borderRadius: 8,
              border: `1px solid ${SUBSCRIPTION_PLANS[currentPlan].color}`,
              background: SUBSCRIPTION_PLANS[currentPlan].color + "22",
              color: SUBSCRIPTION_PLANS[currentPlan].color,
              fontSize: 12, cursor: "pointer", fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
            <span>⭐</span>
            {SUBSCRIPTION_PLANS[currentPlan].name[uiLang] || SUBSCRIPTION_PLANS[currentPlan].name.en}
            {currentPlan !== "enterprise" && <span style={{ fontSize: 10, opacity: 0.7 }}>({t.pricingUpgrade})</span>}
          </button>
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
                  {MODELS.map(m => {
                    const plan = SUBSCRIPTION_PLANS[currentPlan];
                    const isAvailable = plan.features.models.includes(m.id);
                    return (
                      <button key={m.id} onClick={() => { if (isAvailable) { setSelectedModel(m.id); setShowModelDropdown(false); } }}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "none", background: selectedModel === m.id ? "#404040" : "transparent", color: isAvailable ? "#ececec" : "#5c5c5c", fontSize: 13, cursor: isAvailable ? "pointer" : "not-allowed", textAlign: "left", display: "flex", flexDirection: "column", gap: 2, opacity: isAvailable ? 1 : 0.5 }}>
                        <span style={{ fontWeight: 500 }}>{m.label} {!isAvailable && "🔒"}</span>
                        <span style={{ fontSize: 11, color: "#8e8ea0" }}>{m.desc}</span>
                      </button>
                    );
                  })}
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
                <button onClick={() => setShowCustomInstructions(!showCustomInstructions)}
                  title={t.customInstructions}
                  style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${showCustomInstructions ? "#10a37f" : "#3d3d3d"}`, background: showCustomInstructions ? "#10a37f22" : "transparent", color: showCustomInstructions ? "#10a37f" : "#8e8ea0", fontSize: 12, cursor: "pointer" }}>
                  📝
                </button>
                <button onClick={() => setShowReferral(!showReferral)}
                  title={t.referralTitle}
                  style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${showReferral ? "#10a37f" : "#3d3d3d"}`, background: showReferral ? "#10a37f22" : "transparent", color: showReferral ? "#10a37f" : "#8e8ea0", fontSize: 12, cursor: "pointer" }}>
                  🎁
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
              <button onClick={() => {
                const plan = SUBSCRIPTION_PLANS[currentPlan];
                if (!plan.features.webSearch) {
                  alert("Web search is not available on your plan. Please upgrade.");
                  setShowPricing(true);
                  return;
                }
                setWebSearch(!webSearch);
              }}
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


        {/* Mobile Tabs Row */}
        {isMobile && (
          <div style={{ flexShrink: 0, borderBottom: "1px solid #2d2d2d" }}>
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
              <button onClick={() => setShowCustomInstructions(!showCustomInstructions)}
                title={t.customInstructions}
                style={{ padding: "5px 10px", borderRadius: 8, border: `1px solid ${showCustomInstructions ? "#10a37f" : "#3d3d3d"}`, background: showCustomInstructions ? "#10a37f22" : "transparent", color: showCustomInstructions ? "#10a37f" : "#8e8ea0", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap" }}>
                📝 {t.customInstructions}
              </button>
              <button onClick={() => setShowReferral(!showReferral)}
                title={t.referralTitle}
                style={{ padding: "5px 10px", borderRadius: 8, border: `1px solid ${showReferral ? "#10a37f" : "#3d3d3d"}`, background: showReferral ? "#10a37f22" : "transparent", color: showReferral ? "#10a37f" : "#8e8ea0", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap" }}>
                🎁 {t.referralTitle}
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

        {/* Usage Bar */}
        {activeTab === "chat" && <UsageBar t={t} th={th} usageTracking={usageTracking} isMobile={isMobile} />}

        {/* Custom Instructions Panel */}
        {showCustomInstructions && activeTab === "chat" && (
          <CustomInstructionsPanel
            t={t}
            th={th}
            customInstructions={customInstructions}
            setCustomInstructions={setCustomInstructions}
            onSave={(instructions) => {
              setCustomInstructions(instructions);
              localStorage.setItem("shardeumai-custom-instructions", instructions);
              setShowCustomInstructions(false);
            }}
            isMobile={isMobile}
          />
        )}

        {/* Referral Panel */}
        {showReferral && activeTab === "chat" && (
          <ReferralPanel t={t} th={th} session={session} isMobile={isMobile} />
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
              {/* Smart Notification Banner */}
              {showSmartNotification && (
                <div style={{
                  padding: "12px 16px",
                  background: "#10a37f22",
                  borderBottom: "1px solid #10a37f44", borderRadius: 12, margin: "0 16px 16px", maxWidth: 768,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  flexShrink: 0, marginBottom: 8,
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
                          <div>
                            {editingMessageIdx === idx ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                <textarea
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  style={{
                                    width: "100%", padding: "10px 12px", borderRadius: 10,
                                    border: "1px solid #3d3d3d", background: "#2d2d2d",
                                    color: "#ececec", fontSize: 14, outline: "none",
                                    resize: "vertical", minHeight: 60,
                                  }}
                                  rows={3}
                                />
                                <div style={{ display: "flex", gap: 8 }}>
                                  <button onClick={saveEditMessage}
                                    style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "#10a37f", color: "#fff", fontSize: 12, cursor: "pointer" }}>
                                    Save
                                  </button>
                                  <button onClick={() => { setEditingMessageIdx(null); setEditText(""); }}
                                    style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #3d3d3d", background: "transparent", color: "#8e8ea0", fontSize: 12, cursor: "pointer" }}>
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{msg.content}</div>
                            )}
                          </div>
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
                          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                            <button onClick={() => rateMessage(idx, "up")} title="Good response"
                              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, opacity: ratings[String(idx)] === "up" ? 1 : 0.4, color: ratings[String(idx)] === "up" ? "#10a37f" : "#8e8ea0", padding: "2px 4px", borderRadius: 4, transition: "all 0.15s" }}>
                              👍
                            </button>
                            <button onClick={() => rateMessage(idx, "down")} title="Bad response"
                              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, opacity: ratings[String(idx)] === "down" ? 1 : 0.4, color: ratings[String(idx)] === "down" ? "#ef4444" : "#8e8ea0", padding: "2px 4px", borderRadius: 4, transition: "all 0.15s" }}>
                              👎
                            </button>
                            <button onClick={() => handleRegenerate(idx)} title={t.messageRegenerate}
                              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#8e8ea0", padding: "2px 6px", borderRadius: 4, opacity: 0.6 }}>
                              🔄 {t.messageRegenerate}
                            </button>
                            <button onClick={() => handleReplyToMessage(idx)} title={t.messageReply}
                              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#8e8ea0", padding: "2px 6px", borderRadius: 4, opacity: 0.6 }}>
                              ↩️ {t.messageReply}
                            </button>
                          </div>
                        )}
                        {msg.role === "user" && editingMessageIdx !== idx && (
                          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                            <button onClick={() => handleEditMessage(idx)} title={t.messageEdit}
                              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#8e8ea0", padding: "2px 6px", borderRadius: 4, opacity: 0.6 }}>
                              ✏️ {t.messageEdit}
                            </button>
                            <button onClick={() => handleDeleteMessage(idx)} title={t.messageDelete}
                              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#8e8ea0", padding: "2px 6px", borderRadius: 4, opacity: 0.6 }}>
                              🗑 {t.messageDelete}
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

            {/* Reply Indicator */}
            {replyingTo && (
              <div style={{
                padding: "8px 16px", background: "#171717",
                borderTop: "1px solid #2d2d2d", display: "flex",
                alignItems: "center", gap: 8,
              }}>
                <span style={{ fontSize: 12, color: "#8e8ea0" }}>
                  ↩️ Replying to: <em style={{ color: "#ececec" }}>"{replyingTo.content}..."</em>
                </span>
                <button onClick={() => setReplyingTo(null)}
                  style={{ background: "none", border: "none", color: "#e0746a", cursor: "pointer", fontSize: 14 }}>
                  ×
                </button>
              </div>
            )}

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
                              {[["pdf","PDF"],["md","Markdown"],["html","HTML"],["txt","TXT"]].map(([fmt, label]) => {
                                const plan = SUBSCRIPTION_PLANS[currentPlan];
                                const isAvailable = plan.features.export.includes(fmt);
                                return (
                                  <button key={fmt} onClick={() => { if (isAvailable) { exportChat(messages, fmt); setShowExportMenu(false); } else { alert(`Export to ${label} requires Pro plan or higher.`); setShowPricing(true); } }}
                                    style={{ padding: "6px 10px", background: "none", border: "none", color: isAvailable ? "#ececec" : "#5c5c5c", cursor: isAvailable ? "pointer" : "not-allowed", fontSize: 12, textAlign: "left", borderRadius: 4, opacity: isAvailable ? 1 : 0.5 }}
                                    onMouseEnter={e => { if (isAvailable) e.target.style.background = "#404040"; }}
                                    onMouseLeave={e => e.target.style.background = "none"}>
                                    {label} {!isAvailable && "🔒"}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
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
            <ImageGenerator t={t} isRTL={isRTL} usageTracking={usageTracking} />
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
            {/* Plan Info Card */}
            <div style={{ background: "#171717", border: "1px solid #2d2d2d", borderRadius: 16, padding: 16, marginTop: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#ececec", marginBottom: 12 }}>
                ⭐ Current Plan: {SUBSCRIPTION_PLANS[currentPlan].name[uiLang] || SUBSCRIPTION_PLANS[currentPlan].name.en}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "#8e8ea0" }}>{t.pricingFeatureMessages}</span>
                  <span style={{ color: "#ececec" }}>{SUBSCRIPTION_PLANS[currentPlan].features.messagesPerDay === Infinity ? "∞" : SUBSCRIPTION_PLANS[currentPlan].features.messagesPerDay}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "#8e8ea0" }}>{t.pricingFeatureImages}</span>
                  <span style={{ color: "#ececec" }}>{SUBSCRIPTION_PLANS[currentPlan].features.imagesPerDay === Infinity ? "∞" : SUBSCRIPTION_PLANS[currentPlan].features.imagesPerDay}</span>
                </div>
              </div>
              <button onClick={() => setShowPricing(true)}
                style={{
                  width: "100%", marginTop: 12, padding: "10px 0", borderRadius: 10,
                  border: "none", background: SUBSCRIPTION_PLANS[currentPlan].color,
                  color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}>
                {currentPlan === "enterprise" ? t.pricingCurrent : t.pricingUpgrade}
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
