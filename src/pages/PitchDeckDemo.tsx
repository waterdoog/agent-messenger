import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Send, FolderOpen, X, UserPlus, Shield, ChevronRight, Check, XCircle, Eye, ArrowLeft, Lock, AlertTriangle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import AgentCharacter from "@/components/AgentCharacter";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

type Msg = { role: "user" | "assistant"; content: string };

const pitchDeckContext = `## Mounted Context — Pitch Deck

### Company Overview
- Company: Pulse — AI-native agent communication platform
- Stage: Pre-Seed → Seed
- Founded: 2024
- Team: 4 co-founders (2 technical, 1 design, 1 business)

### Product
- Agents deliver context between users with granular permission control
- Physical isolation model: only mounted data is accessible, preventing prompt injection
- Key differentiator: Context Cells allow selective sharing — unlike competitors who do all-or-nothing

### Traction
- 2,400 beta users in 3 months
- 38% week-over-week growth
- 72% Day-7 retention
- Used by 15 startups for investor relations, hiring, and client management

### Market
- TAM: $18B (AI communication tools)
- SAM: $4.2B (enterprise agent platforms)
- SOM: $380M (privacy-first agent communication)

### Ask
- Raising $2.5M Seed round
- Use of funds: 60% engineering, 25% growth, 15% ops
- Target: 18-month runway to Series A metrics

### Competitive Landscape
- OpenShell: single-player sandbox, no guest concept
- NemoClaw: same limitation
- OpenClaw: all-or-nothing sharing, vulnerable to prompt injection
- Pulse: granular context control with physical isolation

## Calendar Access
Available slots: Mon 10:00 AM, Wed 3:00 PM, Fri 2:00 PM

## NOT MOUNTED (Blocked):
The following data is NOT in your context. If asked about these, you MUST say: "That information isn't part of my mounted context. I'll flag this as an escalation for the founder."
- Financial projections, revenue numbers, burn rate, unit economics
- Cap table, equity distribution, investor names
- Detailed salary information, individual compensation
- Legal documents, term sheets`;

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
}) {
  const systemPrompt = `You are Courier, an AI agent dispatched by a startup founder to answer investor questions about the pitch deck.

CRITICAL RULES:
1. You can ONLY answer questions based on the mounted context below
2. If asked about financials, revenue, burn rate, cap table, unit economics, salaries, or any financial data — you MUST refuse and say the data is not mounted
3. When refusing, be polite but firm: "That information isn't in my mounted context. I've flagged this for the founder — they'll review and decide whether to share."
4. For questions about product, traction, team, market, competitive landscape — answer thoroughly and enthusiastically
5. Be professional, concise, and investor-friendly
6. Answer in the same language as the user

${pitchDeckContext}`;

  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      context: pitchDeckContext,
    }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    onError(data.error || `Error ${resp.status}`);
    return;
  }

  if (!resp.body) { onError("No response body"); return; }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, idx);
      textBuffer = textBuffer.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { streamDone = true; break; }
      try {
        const p = JSON.parse(json);
        const c = p.choices?.[0]?.delta?.content;
        if (c) onDelta(c);
      } catch { textBuffer = line + "\n" + textBuffer; break; }
    }
  }
  onDone();
}

const PitchDeckDemo = () => {
  const [phase, setPhase] = useState<"arriving" | "expanding" | "chat">("arriving");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPanel, setShowPanel] = useState<"deck" | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [profileView, setProfileView] = useState<"main" | "access">("main");
  const [accessTab, setAccessTab] = useState<"mounted" | "blocked">("mounted");
  const [showOwner, setShowOwner] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("expanding"), 2400);
    const t2 = setTimeout(() => setPhase("chat"), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: message };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setMessage("");
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: allMessages,
        onDelta: (chunk) => upsertAssistant(chunk),
        onDone: () => setIsLoading(false),
        onError: (err) => {
          upsertAssistant(`⚠️ ${err}`);
          setIsLoading(false);
        },
      });
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  const mountedItems = [
    { name: "Pitch Deck — Company Overview", icon: FileText },
    { name: "Pitch Deck — Product & Traction", icon: FileText },
    { name: "Pitch Deck — Market & Competition", icon: FileText },
    { name: "Pitch Deck — The Ask", icon: FileText },
  ];

  const blockedItems = [
    { name: "Financial Projections", reason: "Not mounted" },
    { name: "Cap Table & Equity", reason: "Not mounted" },
    { name: "Revenue & Unit Economics", reason: "Not mounted" },
    { name: "Salary Details", reason: "Not mounted" },
    { name: "Legal Documents", reason: "Not mounted" },
  ];

  return (
    <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        {phase === "arriving" && (
          <motion.div key="arriving" className="flex-1 flex flex-col items-center justify-center gap-4" exit={{ opacity: 0 }}>
            <motion.div initial={{ x: -120, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 2, ease: [0.25, 0.1, 0.25, 1] }}>
              <AgentCharacter size={56} animate walking />
            </motion.div>
            <motion.p
              className="text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Delivering pitch deck context...
            </motion.p>
          </motion.div>
        )}

        {phase === "expanding" && (
          <motion.div key="expanding" className="flex-1 flex items-center justify-center" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <motion.div initial={{ scale: 1, opacity: 1 }} animate={{ scale: [1, 1.1, 0], opacity: [1, 1, 0] }} transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}>
              <AgentCharacter size={56} />
            </motion.div>
          </motion.div>
        )}

        {phase === "chat" && (
          <motion.div
            key="chat"
            className="flex-1 flex flex-col min-h-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header */}
            <div className="flex-shrink-0">
              <div className="h-6" />
              <div className="px-6 pb-4 flex items-center gap-3">
                <button onClick={() => { setShowProfile(true); setProfileView("main"); }} className="w-8 h-8 rounded-full border border-foreground/20 flex items-center justify-center hover:bg-foreground/5 transition-colors">
                  <span className="text-xs font-semibold text-foreground">C</span>
                </button>
                <div className="flex-1 min-w-0">
                  <h1 onClick={() => setShowOwner(!showOwner)} className="text-sm font-medium text-foreground tracking-tight whitespace-nowrap cursor-pointer select-none">
                    {showOwner ? "Founder's Agent" : "Courier"}
                  </h1>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Pitch Deck · Read-only</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setShowPanel(showPanel === "deck" ? null : "deck")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-colors ${
                    showPanel === "deck" ? "bg-foreground text-background" : "bg-secondary text-foreground ring-subtle"
                  }`}
                >
                  <FolderOpen size={12} />
                  Pitch Deck
                </motion.button>
              </div>
            </div>

            {/* Profile Overlay */}
            <AnimatePresence>
              {showProfile && (
                <>
                  <motion.div
                    className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setShowProfile(false)}
                  />
                  <motion.div
                    className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-[28px] ring-subtle max-h-[70vh] overflow-auto scrollbar-none"
                    initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 32, stiffness: 300 }}
                  >
                    <div className="flex justify-center pt-3 pb-1">
                      <div className="w-8 h-[3px] rounded-full bg-foreground/10" />
                    </div>
                    <div className="px-6 pb-10 pt-2">
                      <AnimatePresence mode="wait">
                        {profileView === "main" ? (
                          <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                            <div className="flex items-center justify-between mb-1">
                              <h2 className="text-base font-semibold text-foreground tracking-tight">Agent Profile</h2>
                              <button onClick={() => setShowProfile(false)} className="text-muted-foreground p-1.5 rounded-lg hover:bg-secondary transition-colors">
                                <X size={18} />
                              </button>
                            </div>
                            <div className="flex items-center gap-3 mt-4 mb-6">
                              <div className="w-14 h-14 rounded-full border-2 border-foreground/10 flex items-center justify-center">
                                <span className="text-lg font-semibold text-foreground">C</span>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-foreground">Courier</p>
                                <p className="text-xs text-muted-foreground">Founder's Agent · Pitch Deck Mode</p>
                              </div>
                            </div>
                            <motion.button
                              onClick={() => setProfileView("access")}
                              className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-secondary/60 ring-subtle hover:bg-secondary transition-colors"
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-center gap-3">
                                <Shield size={16} className="text-foreground/60" />
                                <span className="text-sm font-medium text-foreground">Access & Isolation</span>
                              </div>
                              <ChevronRight size={16} className="text-muted-foreground" />
                            </motion.button>
                          </motion.div>
                        ) : (
                          <motion.div key="access" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                            <div className="flex items-center gap-2 mb-5">
                              <button onClick={() => setProfileView("main")} className="p-1 rounded-lg hover:bg-secondary transition-colors">
                                <ArrowLeft size={18} className="text-foreground" />
                              </button>
                              <h2 className="text-base font-semibold text-foreground tracking-tight">Access & Isolation</h2>
                            </div>

                            <div className="flex gap-1.5 mb-4">
                              {(["mounted", "blocked"] as const).map((tab) => (
                                <button
                                  key={tab}
                                  onClick={() => setAccessTab(tab)}
                                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                                    accessTab === tab ? "bg-foreground text-background" : "bg-secondary text-foreground"
                                  }`}
                                >
                                  {tab === "mounted" ? "✅ Mounted" : "🔒 Blocked"}
                                </button>
                              ))}
                            </div>

                            {accessTab === "mounted" ? (
                              <div className="space-y-2">
                                {mountedItems.map((item, i) => (
                                  <motion.div
                                    key={item.name}
                                    className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-secondary/40 ring-subtle"
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                  >
                                    <item.icon size={14} className="text-foreground/50" />
                                    <span className="text-xs font-medium text-foreground flex-1">{item.name}</span>
                                    <Eye size={12} className="text-emerald-500/60" />
                                  </motion.div>
                                ))}
                                <p className="text-center text-[10px] text-muted-foreground/40 pt-2">Agent can only access mounted context</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {blockedItems.map((item, i) => (
                                  <motion.div
                                    key={item.name}
                                    className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-destructive/[0.06] ring-1 ring-destructive/10"
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                  >
                                    <Lock size={14} className="text-destructive/60" />
                                    <span className="text-xs font-medium text-foreground flex-1">{item.name}</span>
                                    <span className="text-[10px] text-destructive/60 font-medium">{item.reason}</span>
                                  </motion.div>
                                ))}
                                <div className="mt-3 px-3 py-3 rounded-xl bg-amber-500/[0.06] ring-1 ring-amber-500/10">
                                  <div className="flex items-start gap-2">
                                    <AlertTriangle size={12} className="text-amber-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                                      These items are <strong className="text-foreground">physically not mounted</strong> in the agent's context. Even prompt injection cannot access them — the data simply isn't there.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Deck Panel */}
            <AnimatePresence>
              {showPanel && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0 overflow-hidden border-b border-foreground/[0.04]"
                >
                  <div className="px-4 pb-4 space-y-2.5 max-h-[50vh] overflow-auto scrollbar-none">
                    <div className="flex items-center justify-between px-1 pt-1">
                      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Pitch Deck Context</span>
                      <button onClick={() => setShowPanel(null)} className="p-1 rounded-lg hover:bg-secondary transition-colors">
                        <X size={14} className="text-muted-foreground" />
                      </button>
                    </div>

                    {[
                      { title: "Company Overview", desc: "Pulse — AI-native agent communication. Pre-Seed → Seed. 4 co-founders." },
                      { title: "Product & Differentiation", desc: "Context Cells with physical isolation. Granular permission control. No prompt injection risk." },
                      { title: "Traction", desc: "2,400 beta users. 38% WoW growth. 72% D7 retention. 15 startup customers." },
                      { title: "Market & Competition", desc: "TAM $18B. Key advantage: physical isolation vs competitors' all-or-nothing model." },
                      { title: "The Ask", desc: "Raising $2.5M Seed. 60% eng, 25% growth, 15% ops. 18-month runway." },
                    ].map((section, i) => (
                      <motion.div
                        key={section.title}
                        className="bg-card rounded-2xl ring-subtle p-4"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <FileText size={13} className="text-foreground/60" />
                          <span className="text-xs font-medium text-foreground">{section.title}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{section.desc}</p>
                      </motion.div>
                    ))}

                    <div className="bg-destructive/[0.06] rounded-2xl ring-1 ring-destructive/10 p-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Lock size={13} className="text-destructive/60" />
                        <span className="text-xs font-medium text-foreground">Financial Data</span>
                        <span className="text-[9px] text-destructive/60 font-semibold ml-auto">NOT MOUNTED</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Projections, cap table, revenue, unit economics — physically excluded from agent context</p>
                    </div>

                    <p className="text-center text-[10px] text-muted-foreground/40 py-1">🔒 Only mounted context is accessible</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat */}
            <div ref={scrollRef} className="flex-1 overflow-auto scrollbar-none min-h-0 px-4 pb-4 space-y-3">
              {messages.length === 0 && (
                <motion.div
                  className="flex flex-col items-center justify-center py-12 gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-xs text-muted-foreground/60 text-center max-w-[240px]">
                    Ask me anything about the pitch deck — product, traction, team, market, or competition.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center max-w-[320px]">
                    {[
                      "What does Pulse do?",
                      "What's the traction?",
                      "How big is the market?",
                      "What's the burn rate?",
                    ].map((q) => (
                      <motion.button
                        key={q}
                        onClick={() => { setMessage(q); }}
                        className="px-3 py-1.5 rounded-xl bg-secondary/50 ring-subtle text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                        whileTap={{ scale: 0.95 }}
                      >
                        {q}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-foreground text-background rounded-2xl rounded-br-md"
                        : "bg-secondary text-foreground rounded-2xl rounded-bl-md"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </motion.div>
              ))}

              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
                    <motion.span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                    <motion.span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }} />
                    <motion.span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }} />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="flex-shrink-0 px-5 pb-8 pt-3 border-t border-foreground/[0.04]">
              <div className="flex items-center gap-3 bg-secondary/50 rounded-2xl ring-subtle px-4 py-1.5">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Ask about the pitch deck..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none py-2.5"
                  disabled={isLoading}
                />
                <motion.button
                  onClick={sendMessage}
                  className="w-9 h-9 rounded-xl bg-foreground flex items-center justify-center flex-shrink-0 disabled:opacity-30"
                  whileTap={{ scale: 0.9 }}
                  disabled={isLoading || !message.trim()}
                >
                  <Send size={15} className="text-background" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PitchDeckDemo;
