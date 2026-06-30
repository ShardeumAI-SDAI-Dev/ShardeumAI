import React, { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { Send, LogOut, Plus, Menu, X, Loader2, Sparkles, MessageSquare, Trash2 } from "lucide-react";

const SUPABASE_URL = "https://zzolokpbjkrvkyaubcoq.supabase.co";
const SUPABASE_KEY = "sb_publishable_mxVEWWeumrPEedmA4yD0cg_ZMPgwWYU";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// کلید OpenRouter به‌صورت امن در Edge Function سمت سرور نگهداری می‌شود
const EDGE_FUNCTION_URL = "https://zzolokpbjkrvkyaubcoq.supabase.co/functions/v1/chat";

const SYSTEM_PROMPT = `تو ShardeumAI (SDAI) هستی، یک دستیار هوش مصنوعی دوزبانه (فارسی/انگلیسی) که هم می‌تونی به سوالات عمومی پاسخ بدی و هم تخصص ویژه‌ای در زمینه Shardeum و دنیای کریپتو/بلاکچین داری. وقتی کاربر به فارسی می‌نویسه، به فارسی روان و طبیعی جواب بده. وقتی به انگلیسی می‌نویسه، به انگلیسی جواب بده. لحنت دوستانه، دقیق و مفیده. در موضوعات کریپتو و Shardeum، اطلاعات دقیق و به‌روز (تا حد دانشت) بده و وقتی نامطمئنی صادقانه بگو.`;

function classNames(...c) { return c.filter(Boolean).join(" "); }

// ---------- Auth Screen ----------
function AuthScreen({ onAuthed }) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          onAuthed(data.session);
        } else {
          setInfo("ثبت‌نام انجام شد. اگر تایید ایمیل فعال باشد، ایمیلت را چک کن.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuthed(data.session);
      }
    } catch (err) {
      const msg = err.message || "خطایی رخ داد";
      if (msg.includes("Invalid login credentials")) setError("ایمیل یا رمز عبور اشتباه است.");
      else if (msg.includes("already registered") || msg.includes("already exists")) setError("این ایمیل قبلاً ثبت شده. وارد شوید.");
      else if (msg.includes("Password should be")) setError("رمز عبور باید حداقل ۶ کاراکتر باشد.");
      else setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-bg" aria-hidden="true">
        <div className="auth-glow" />
        <svg className="auth-lattice" viewBox="0 0 400 400" fill="none">
          {Array.from({ length: 7 }).map((_, i) => (
            <circle key={i} cx={60 + i * 50} cy={200 + Math.sin(i) * 60} r="2.5" fill="currentColor" opacity="0.5" />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={i} x1={60 + i * 50} y1={200 + Math.sin(i) * 60} x2={110 + i * 50} y2={200 + Math.sin(i + 1) * 60} stroke="currentColor" strokeWidth="1" opacity="0.25" />
          ))}
        </svg>
      </div>

      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-mark">SD</div>
          <div>
            <div className="auth-title">ShardeumAI</div>
            <div className="auth-subtitle">SDAI · دستیار هوشمند شبکه و گفتگو</div>
          </div>
        </div>

        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signin"}
            className={classNames("auth-tab", mode === "signin" && "auth-tab--active")}
            onClick={() => { setMode("signin"); setError(""); setInfo(""); }}
          >
            ورود
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signup"}
            className={classNames("auth-tab", mode === "signup" && "auth-tab--active")}
            onClick={() => { setMode("signup"); setError(""); setInfo(""); }}
          >
            ساخت اکانت
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label">
            ایمیل
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>
          <label className="auth-label">
            رمز عبور
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              placeholder="••••••••"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
          </label>

          {error && <div className="auth-error">{error}</div>}
          {info && <div className="auth-info">{info}</div>}

          <button type="submit" disabled={loading} className="auth-submit">
            {loading ? <Loader2 className="spin" size={18} /> : mode === "signin" ? "ورود" : "ساخت اکانت"}
          </button>
        </form>

        <p className="auth-footnote">
          {mode === "signin" ? "اکانت نداری؟ " : "قبلاً اکانت ساختی؟ "}
          <button
            type="button"
            className="auth-link"
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setInfo(""); }}
          >
            {mode === "signin" ? "بساز" : "وارد شو"}
          </button>
        </p>
      </div>
    </div>
  );
}

// ---------- Sidebar ----------
function Sidebar({ conversations, activeId, onSelect, onNew, onDelete, onSignOut, email, open, onClose }) {
  return (
    <>
      {open && <div className="sidebar-scrim" onClick={onClose} />}
      <aside className={classNames("sidebar", open && "sidebar--open")}>
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <div className="sidebar-mark">SD</div>
            <span>ShardeumAI</span>
          </div>
          <button className="icon-btn icon-btn--ghost sidebar-close" onClick={onClose} aria-label="بستن منو">
            <X size={18} />
          </button>
        </div>

        <button className="new-chat-btn" onClick={onNew}>
          <Plus size={16} />
          گفتگوی جدید
        </button>

        <nav className="convo-list">
          {conversations.length === 0 && (
            <div className="convo-empty">هنوز گفتگویی نداری</div>
          )}
          {conversations.map((c) => (
            <div
              key={c.id}
              className={classNames("convo-item", c.id === activeId && "convo-item--active")}
              onClick={() => onSelect(c.id)}
            >
              <MessageSquare size={15} className="convo-icon" />
              <span className="convo-title">{c.title}</span>
              <button
                className="convo-delete"
                onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
                aria-label="حذف گفتگو"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-email" title={email}>{email}</div>
          <button className="signout-btn" onClick={onSignOut}>
            <LogOut size={15} />
            خروج
          </button>
        </div>
      </aside>
    </>
  );
}

// ---------- Message Bubble ----------
function MessageBubble({ role, content }) {
  const isUser = role === "user";
  return (
    <div className={classNames("msg-row", isUser && "msg-row--user")}>
      {!isUser && (
        <div className="msg-avatar">
          <Sparkles size={14} />
        </div>
      )}
      <div className={classNames("msg-bubble", isUser ? "msg-bubble--user" : "msg-bubble--ai")}>
        {content.split("\n").map((line, i) => (
          <p key={i} className="msg-line">{line || "\u00A0"}</p>
        ))}
      </div>
    </div>
  );
}

// ---------- Main Chat ----------
function ChatApp({ session, onSignOut }) {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [errorBanner, setErrorBanner] = useState("");
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  const userId = session.user.id;
  const userEmail = session.user.email;

  const loadConversations = useCallback(async () => {
    setLoadingConvos(true);
    const { data, error } = await supabase
      .from("conversations")
      .select("id, title, created_at")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setConversations(data);
      if (data.length > 0 && !activeId) {
        setActiveId(data[0].id);
      }
    }
    setLoadingConvos(false);
  }, [activeId]);

  useEffect(() => { loadConversations(); }, []);

  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    (async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("id, role, content, created_at")
        .eq("conversation_id", activeId)
        .order("created_at", { ascending: true });
      if (!error && data) setMessages(data);
    })();
  }, [activeId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  async function createConversation(firstUserMessage) {
    const title = firstUserMessage.slice(0, 40) || "گفتگوی جدید";
    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: userId, title })
      .select()
      .single();
    if (error) throw error;
    setConversations((prev) => [data, ...prev]);
    setActiveId(data.id);
    return data.id;
  }

  function handleNewChat() {
    setActiveId(null);
    setMessages([]);
    setSidebarOpen(false);
  }

  async function handleDeleteConversation(id) {
    await supabase.from("conversations").delete().eq("id", id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) {
      setActiveId(null);
      setMessages([]);
    }
  }

  async function callAI(history) {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        messages: history.map((m) => ({ role: m.role, content: m.content })),
      }),
    });
    if (!response.ok) throw new Error("خطا در ارتباط با هوش مصنوعی. دوباره تلاش کن.");
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.reply || "متاسفم، نتوانستم پاسخ بدهم.";
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;
    setErrorBanner("");
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    let convoId = activeId;
    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    try {
      if (!convoId) {
        convoId = await createConversation(text);
      }
      await supabase.from("messages").insert({ conversation_id: convoId, role: "user", content: text });

      const history = [...messages, userMsg];
      const replyText = await callAI(history);

      setMessages((prev) => [...prev, { role: "assistant", content: replyText }]);
      await supabase.from("messages").insert({ conversation_id: convoId, role: "assistant", content: replyText });
    } catch (err) {
      setErrorBanner(err.message || "مشکلی پیش آمد. دوباره تلاش کن.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function autoGrow(e) {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  }

  return (
    <div className="app-shell">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={(id) => { setActiveId(id); setSidebarOpen(false); }}
        onNew={handleNewChat}
        onDelete={handleDeleteConversation}
        onSignOut={onSignOut}
        email={userEmail}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="chat-main">
        <header className="chat-header">
          <button className="icon-btn header-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="باز کردن منو">
            <Menu size={20} />
          </button>
          <div className="chat-header-title">
            <span className="chat-header-name">ShardeumAI</span>
            <span className="chat-header-tag">SDAI</span>
          </div>
          <div style={{ width: 36 }} />
        </header>

        <div className="chat-scroll" ref={scrollRef}>
          {messages.length === 0 && !loadingConvos && (
            <div className="empty-state">
              <div className="empty-mark">SD</div>
              <h2>سلام! من ShardeumAI هستم</h2>
              <p>هم می‌توانم در سوالات عمومی کمکت کنم، هم تخصص ویژه‌ای در Shardeum و دنیای کریپتو دارم. چی می‌خوای بپرسی؟</p>
              <div className="suggestion-grid">
                {[
                  "Shardeum چه تفاوتی با اتریوم دارد؟",
                  "وضعیت فعلی بازار کریپتو را خلاصه کن",
                  "یک متن انگیزشی به فارسی برایم بنویس",
                  "EVM چیست و چرا اهمیت دارد؟",
                ].map((s) => (
                  <button key={s} className="suggestion-chip" onClick={() => setInput(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <MessageBubble key={m.id || i} role={m.role} content={m.content} />
          ))}

          {sending && (
            <div className="msg-row">
              <div className="msg-avatar"><Sparkles size={14} /></div>
              <div className="msg-bubble msg-bubble--ai msg-bubble--typing">
                <span className="dot" /><span className="dot" /><span className="dot" />
              </div>
            </div>
          )}
        </div>

        {errorBanner && <div className="error-banner">{errorBanner}</div>}

        <div className="composer">
          <textarea
            ref={textareaRef}
            className="composer-input"
            placeholder="پیامت را بنویس..."
            value={input}
            onChange={autoGrow}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            className="composer-send"
            onClick={handleSend}
            disabled={!input.trim() || sending}
            aria-label="ارسال"
          >
            <Send size={18} />
          </button>
        </div>
      </main>
    </div>
  );
}

// ---------- Root ----------
export default function App() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setSession(null);
  }

  return (
    <>
      <style>{STYLES}</style>
      {session === undefined ? (
        <div className="boot-screen">
          <Loader2 className="spin" size={28} />
        </div>
      ) : session ? (
        <ChatApp session={session} onSignOut={handleSignOut} />
      ) : (
        <AuthScreen onAuthed={setSession} />
      )}
    </>
  );
}

const STYLES = `
:root {
  --bg: #0b0f14;
  --bg-elevated: #11161d;
  --bg-soft: #161c25;
  --border: #232b36;
  --ink: #e8edf2;
  --ink-dim: #8b96a3;
  --accent: #4fd1c5;
  --accent-soft: rgba(79, 209, 197, 0.12);
  --accent-strong: #2fb8ab;
  --user-bubble: #1d4f49;
  --danger: #e0746a;
  --radius: 14px;
  font-family: 'Vazirmatn', 'Inter', system-ui, -apple-system, sans-serif;
}

* { box-sizing: border-box; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
}

body, html, #root { margin: 0; padding: 0; height: 100%; }

.boot-screen {
  height: 100vh; display: flex; align-items: center; justify-content: center;
  background: var(--bg); color: var(--accent);
}
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ---------- Auth screen ---------- */
.auth-wrap {
  min-height: 100vh;
  background: var(--bg);
  color: var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 24px;
  direction: rtl;
}
.auth-bg { position: absolute; inset: 0; z-index: 0; }
.auth-glow {
  position: absolute;
  top: -20%; left: 50%; transform: translateX(-50%);
  width: 700px; height: 700px;
  background: radial-gradient(circle, rgba(79,209,197,0.16), transparent 65%);
}
.auth-lattice {
  position: absolute; bottom: -10%; right: -10%;
  width: 500px; height: 500px;
  color: var(--accent);
}
.auth-card {
  position: relative; z-index: 1;
  width: 100%; max-width: 400px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 32px 28px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
}
.auth-brand { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
.auth-mark {
  width: 44px; height: 44px; border-radius: 12px;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  color: #06201c;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 15px; letter-spacing: 0.02em;
  flex-shrink: 0;
}
.auth-title { font-size: 18px; font-weight: 700; line-height: 1.3; }
.auth-subtitle { font-size: 12.5px; color: var(--ink-dim); margin-top: 2px; }

.auth-tabs { display: flex; gap: 4px; background: var(--bg-soft); border-radius: 10px; padding: 4px; margin-bottom: 22px; }
.auth-tab {
  flex: 1; padding: 9px 0; border: none; background: transparent; color: var(--ink-dim);
  font-size: 13.5px; font-weight: 600; border-radius: 7px; cursor: pointer;
  font-family: inherit; transition: all 0.15s ease;
}
.auth-tab--active { background: var(--accent-soft); color: var(--accent); }

.auth-form { display: flex; flex-direction: column; gap: 16px; }
.auth-label { display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: var(--ink-dim); font-weight: 500; }
.auth-input {
  background: var(--bg-soft); border: 1px solid var(--border); border-radius: 10px;
  padding: 11px 14px; color: var(--ink); font-size: 14.5px; font-family: inherit;
  outline: none; transition: border-color 0.15s ease;
}
.auth-input:focus { border-color: var(--accent); }
.auth-error { background: rgba(224,116,106,0.12); color: var(--danger); font-size: 13px; padding: 10px 12px; border-radius: 9px; }
.auth-info { background: var(--accent-soft); color: var(--accent); font-size: 13px; padding: 10px 12px; border-radius: 9px; }
.auth-submit {
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  color: #06201c; border: none; border-radius: 10px; padding: 12px 0;
  font-size: 14.5px; font-weight: 700; cursor: pointer; font-family: inherit;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: opacity 0.15s ease;
}
.auth-submit:disabled { opacity: 0.6; cursor: default; }
.auth-submit:hover:not(:disabled) { opacity: 0.92; }
.auth-footnote { text-align: center; font-size: 13px; color: var(--ink-dim); margin: 20px 0 0; }
.auth-link { background: none; border: none; color: var(--accent); font-weight: 600; cursor: pointer; font-family: inherit; font-size: 13px; padding: 0; }

/* ---------- App shell ---------- */
.app-shell {
  height: 100vh;
  display: flex;
  background: var(--bg);
  color: var(--ink);
  direction: rtl;
  overflow: hidden;
}

.sidebar {
  width: 268px; flex-shrink: 0;
  background: var(--bg-elevated);
  border-left: 1px solid var(--border);
  display: flex; flex-direction: column;
  padding: 16px 14px;
  transition: transform 0.25s ease;
  z-index: 20;
}
.sidebar-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
.sidebar-brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 15px; }
.sidebar-mark {
  width: 30px; height: 30px; border-radius: 8px;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  color: #06201c; display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 11px;
}
.sidebar-close { display: none; }

.new-chat-btn {
  display: flex; align-items: center; gap: 8px; justify-content: center;
  background: var(--accent-soft); color: var(--accent); border: 1px solid rgba(79,209,197,0.25);
  border-radius: 10px; padding: 10px 0; font-size: 13.5px; font-weight: 600;
  cursor: pointer; font-family: inherit; margin-bottom: 14px; transition: background 0.15s ease;
}
.new-chat-btn:hover { background: rgba(79,209,197,0.2); }

.convo-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 3px; }
.convo-empty { color: var(--ink-dim); font-size: 12.5px; text-align: center; padding: 24px 0; }
.convo-item {
  display: flex; align-items: center; gap: 8px; padding: 9px 10px; border-radius: 9px;
  cursor: pointer; font-size: 13px; color: var(--ink-dim); transition: background 0.12s ease;
}
.convo-item:hover { background: var(--bg-soft); }
.convo-item--active { background: var(--bg-soft); color: var(--ink); }
.convo-icon { flex-shrink: 0; opacity: 0.7; }
.convo-title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.convo-delete {
  opacity: 0; background: none; border: none; color: var(--ink-dim); cursor: pointer;
  padding: 4px; border-radius: 6px; flex-shrink: 0; transition: opacity 0.12s ease;
}
.convo-item:hover .convo-delete { opacity: 1; }
.convo-delete:hover { color: var(--danger); }

.sidebar-bottom { border-top: 1px solid var(--border); padding-top: 12px; margin-top: 8px; }
.sidebar-email { font-size: 12px; color: var(--ink-dim); margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.signout-btn {
  display: flex; align-items: center; gap: 8px; width: 100%;
  background: none; border: 1px solid var(--border); color: var(--ink-dim);
  border-radius: 9px; padding: 8px 10px; font-size: 13px; cursor: pointer;
  font-family: inherit; transition: all 0.15s ease;
}
.signout-btn:hover { border-color: var(--danger); color: var(--danger); }

.sidebar-scrim { display: none; }

.chat-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }

.chat-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px; border-bottom: 1px solid var(--border); flex-shrink: 0;
}
.header-menu-btn { display: none; }
.chat-header-title { display: flex; align-items: baseline; gap: 8px; }
.chat-header-name { font-weight: 700; font-size: 15px; }
.chat-header-tag { font-size: 11px; color: var(--accent); background: var(--accent-soft); padding: 2px 7px; border-radius: 6px; font-weight: 600; }

.icon-btn {
  background: none; border: none; color: var(--ink-dim); cursor: pointer;
  padding: 6px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
  transition: background 0.12s ease;
}
.icon-btn:hover { background: var(--bg-soft); color: var(--ink); }

.chat-scroll { flex: 1; overflow-y: auto; padding: 24px 20px; display: flex; flex-direction: column; gap: 18px; }

.empty-state { max-width: 560px; margin: 8vh auto; text-align: center; }
.empty-mark {
  width: 52px; height: 52px; border-radius: 14px; margin: 0 auto 18px;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  color: #06201c; display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 16px;
}
.empty-state h2 { font-size: 19px; margin: 0 0 8px; }
.empty-state p { color: var(--ink-dim); font-size: 14px; line-height: 1.7; margin: 0 0 22px; }
.suggestion-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.suggestion-chip {
  background: var(--bg-elevated); border: 1px solid var(--border); color: var(--ink);
  border-radius: 11px; padding: 12px 14px; font-size: 13px; text-align: right;
  cursor: pointer; font-family: inherit; line-height: 1.5; transition: border-color 0.15s ease;
}
.suggestion-chip:hover { border-color: var(--accent); }

.msg-row { display: flex; gap: 10px; max-width: 720px; width: 100%; margin: 0 auto; }
.msg-row--user { flex-direction: row-reverse; }
.msg-avatar {
  width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0;
  background: var(--accent-soft); color: var(--accent);
  display: flex; align-items: center; justify-content: center;
}
.msg-bubble { padding: 11px 15px; border-radius: var(--radius); max-width: 80%; font-size: 14.5px; line-height: 1.75; }
.msg-bubble--ai { background: var(--bg-elevated); border: 1px solid var(--border); }
.msg-bubble--user { background: var(--user-bubble); color: #eafaf6; }
.msg-line { margin: 0; }
.msg-line + .msg-line { margin-top: 4px; }

.msg-bubble--typing { display: flex; align-items: center; gap: 5px; padding: 14px 16px; }
.dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ink-dim); animation: bounce 1.2s infinite; }
.dot:nth-child(2) { animation-delay: 0.15s; }
.dot:nth-child(3) { animation-delay: 0.3s; }
@keyframes bounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.5; } 30% { transform: translateY(-4px); opacity: 1; } }

.error-banner {
  background: rgba(224,116,106,0.1); color: var(--danger); font-size: 13px;
  padding: 10px 20px; text-align: center; flex-shrink: 0;
}

.composer {
  display: flex; align-items: flex-end; gap: 10px;
  padding: 14px 20px 18px; border-top: 1px solid var(--border); flex-shrink: 0;
  max-width: 760px; margin: 0 auto; width: 100%;
}
.composer-input {
  flex: 1; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 14px;
  padding: 12px 16px; color: var(--ink); font-size: 14.5px; font-family: inherit;
  resize: none; outline: none; max-height: 160px; line-height: 1.6;
  transition: border-color 0.15s ease;
}
.composer-input:focus { border-color: var(--accent); }
.composer-send {
  width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong)); color: #06201c;
  border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: opacity 0.15s ease;
}
.composer-send:disabled { opacity: 0.4; cursor: default; }

@media (max-width: 760px) {
  .sidebar {
    position: fixed; top: 0; bottom: 0; right: 0;
    transform: translateX(100%);
    box-shadow: -10px 0 30px rgba(0,0,0,0.3);
  }
  .sidebar--open { transform: translateX(0); }
  .sidebar-close { display: flex; }
  .sidebar-scrim {
    display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 15;
  }
  .header-menu-btn { display: flex; }
  .suggestion-grid { grid-template-columns: 1fr; }
  .msg-bubble { max-width: 88%; }
}
`;
