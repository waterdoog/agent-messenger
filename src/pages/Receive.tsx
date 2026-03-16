import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, FileText, Send, FolderOpen, X, UserPlus } from "lucide-react";
import ReactMarkdown from "react-markdown";
import AgentCharacter from "@/components/AgentCharacter";
import { sampleMeetingNotes } from "@/data/sampleNotes";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

type Msg = { role: "user" | "assistant"; content: string };

// Build context string from carried items
const buildContext = () => {
  const notes = sampleMeetingNotes.slice(0, 3); // Simulate carrying first 3 notes
  let ctx = "## Meeting Notes Carried:\n\n";
  notes.forEach((note) => {
    ctx += `### ${note.title}\n`;
    ctx += `- Date: ${note.timestamp.toLocaleDateString()}\n`;
    ctx += `- Duration: ${Math.floor(note.duration / 60)} min\n`;
    ctx += `- Attendees: ${note.attendees.join(", ")}\n`;
    ctx += `- Summary: ${note.summary}\n`;
    ctx += `- Action Items:\n`;
    note.actionItems.forEach((item) => (ctx += `  - ${item}\n`));
    ctx += `- Tags: ${note.tags.join(", ")}\n\n`;
  });
  ctx += "\n## Calendar Access: View availability (recipient can see free/busy slots)\n";
  ctx += "Available slots: Tue 10:00 AM, Wed 2:00 PM, Thu 11:00 AM\n";
  ctx += "\n## Folders Shared: Product Specs (8 files)\n";
  return ctx;
};

const contextString = buildContext();

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
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, context: contextString }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    onError(data.error || `Error ${resp.status}`);
    return;
  }

  if (!resp.body) {
    onError("No response body");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") { streamDone = true; break; }
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  // Final flush
  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }
  onDone();
}

const Receive = () => {
  const [phase, setPhase] = useState<"arriving" | "expanding" | "chat">("arriving");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPanel, setShowPanel] = useState<"files" | "calendar" | null>(null);
  const [showAddPulse, setShowAddPulse] = useState(false);
  const [pulseStep, setPulseStep] = useState<"signup" | "sent">("signup");
  const [pulseEmail, setPulseEmail] = useState("");
  const [pulseName, setPulseName] = useState("");
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

  const carriedNotes = sampleMeetingNotes.slice(0, 3);

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

  return (
    <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        {phase === "arriving" && (
          <motion.div key="arriving" className="flex-1 flex items-center justify-center" exit={{ opacity: 0 }}>
            <motion.div initial={{ x: -120, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 2, ease: [0.25, 0.1, 0.25, 1] }}>
              <AgentCharacter size={56} animate walking />
            </motion.div>
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
                <div className="w-8 h-8 rounded-full border border-foreground/20 flex items-center justify-center">
                  <span className="text-xs font-semibold text-foreground">D</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-sm font-medium text-foreground tracking-tight whitespace-nowrap">Dash <span className="text-muted-foreground font-normal">(Sarah's Agent)</span></h1>
                    <motion.button
                      onClick={() => { setShowAddPulse(true); setPulseStep("signup"); }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-foreground/10 text-[10px] text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                      whileTap={{ scale: 0.95 }}
                    >
                      <UserPlus size={10} />
                      Add
                    </motion.button>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setShowPanel(showPanel === "files" ? null : "files")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-colors ${
                      showPanel === "files" ? "bg-foreground text-background" : "bg-secondary text-foreground ring-subtle"
                    }`}
                  >
                    <FolderOpen size={12} />
                    Files
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setShowPanel(showPanel === "calendar" ? null : "calendar")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-colors ${
                      showPanel === "calendar" ? "bg-foreground text-background" : "bg-secondary text-foreground ring-subtle"
                    }`}
                  >
                    <Calendar size={12} />
                    Calendar
                  </motion.button>
                </div>
              </div>
            </div>

            {/* === Add on Pulse Overlay === */}
            <AnimatePresence>
              {showAddPulse && (
                <>
                  <motion.div
                    className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowAddPulse(false)}
                  />
                  <motion.div
                    className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-[28px] ring-subtle"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 32, stiffness: 300 }}
                  >
                    <div className="flex justify-center pt-3 pb-1">
                      <div className="w-8 h-[3px] rounded-full bg-foreground/10" />
                    </div>
                    <div className="px-6 pb-10 pt-2">
                      {pulseStep === "signup" ? (
                        <>
                          <div className="flex items-center justify-between mb-1">
                            <h2 className="text-base font-semibold text-foreground tracking-tight">Join Pulse</h2>
                            <button onClick={() => setShowAddPulse(false)} className="text-muted-foreground p-1.5 rounded-lg hover:bg-secondary transition-colors">
                              <X size={18} />
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground mb-5">Create an account to add Sarah as a friend and start using agents</p>

                          <div className="space-y-3 mb-5">
                            <div>
                              <label className="text-[11px] text-muted-foreground/70 font-medium mb-1.5 block">Name</label>
                              <input
                                type="text"
                                value={pulseName}
                                onChange={(e) => setPulseName(e.target.value)}
                                placeholder="Your name"
                                className="w-full px-4 py-3 rounded-xl bg-secondary/50 ring-subtle text-sm text-foreground placeholder:text-muted-foreground/40 outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-muted-foreground/70 font-medium mb-1.5 block">Email</label>
                              <input
                                type="email"
                                value={pulseEmail}
                                onChange={(e) => setPulseEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="w-full px-4 py-3 rounded-xl bg-secondary/50 ring-subtle text-sm text-foreground placeholder:text-muted-foreground/40 outline-none"
                              />
                            </div>
                          </div>

                          <motion.button
                            onClick={() => setPulseStep("sent")}
                            disabled={!pulseName.trim() || !pulseEmail.trim()}
                            className="w-full py-4 rounded-2xl bg-foreground text-background font-semibold text-sm tracking-tight disabled:opacity-20 transition-opacity"
                            whileTap={{ scale: 0.98 }}
                          >
                            Sign Up & Add Sarah
                          </motion.button>
                        </>
                      ) : (
                        <motion.div
                          className="text-center py-6"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <div className="w-14 h-14 rounded-full bg-foreground/10 mx-auto mb-4 flex items-center justify-center text-2xl">
                            ✅
                          </div>
                          <h2 className="text-base font-semibold text-foreground mb-1">Friend Request Sent!</h2>
                          <p className="text-xs text-muted-foreground mb-6">Sarah will be notified. You can start chatting once she accepts.</p>
                          <motion.button
                            onClick={() => setShowAddPulse(false)}
                            className="w-full py-4 rounded-2xl bg-foreground text-background font-semibold text-sm tracking-tight"
                            whileTap={{ scale: 0.98 }}
                          >
                            Done
                          </motion.button>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Expandable Content Panel */}
            <AnimatePresence>
              {showPanel && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  className="flex-shrink-0 overflow-hidden border-b border-foreground/[0.04]"
                >
                  <div className="px-4 pb-4 space-y-2.5 max-h-[50vh] overflow-auto scrollbar-none">
                    <div className="flex items-center justify-between px-1 pt-1">
                      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        {showPanel === "files" ? "Notes & Files" : "Book a Slot"}
                      </span>
                      <button onClick={() => setShowPanel(null)} className="p-1 rounded-lg hover:bg-secondary transition-colors">
                        <X size={14} className="text-muted-foreground" />
                      </button>
                    </div>

                    {showPanel === "files" && (
                      <>
                        {carriedNotes.map((note, i) => (
                          <motion.div
                            key={note.id}
                            className="bg-card rounded-2xl ring-subtle p-4"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06, duration: 0.3 }}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <FileText size={13} className="text-foreground/60" />
                              <span className="text-xs font-medium text-foreground">{note.title}</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-[1.7]">{note.summary}</p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {note.tags.map((tag) => (
                                <span key={tag} className="px-2 py-0.5 rounded-md bg-secondary text-[10px] text-muted-foreground">{tag}</span>
                              ))}
                              <span className="px-2 py-0.5 rounded-md bg-secondary text-[10px] text-muted-foreground">
                                {Math.floor(note.duration / 60)} min
                              </span>
                            </div>
                          </motion.div>
                        ))}
                        <motion.div
                          className="bg-card rounded-2xl ring-subtle p-4"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: carriedNotes.length * 0.06, duration: 0.3 }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <FolderOpen size={13} className="text-foreground/60" />
                            <span className="text-xs font-medium text-foreground">Product Specs</span>
                            <span className="text-[10px] text-muted-foreground">· 8 files</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">Shared read-only access</p>
                        </motion.div>
                      </>
                    )}

                    {showPanel === "calendar" && (
                      <motion.div
                        className="bg-card rounded-2xl ring-subtle p-4"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center gap-2 mb-2.5">
                          <Calendar size={14} className="text-foreground/60" />
                          <span className="text-xs font-medium text-foreground">Available Slots</span>
                        </div>
                        <div className="space-y-1.5">
                          {["Tue 10:00 AM", "Wed 2:00 PM", "Thu 11:00 AM"].map((slot) => (
                            <button key={slot} className="w-full text-left px-3 py-2.5 rounded-xl bg-secondary/60 ring-subtle text-xs text-foreground hover:bg-foreground/[0.08] transition-colors">
                              {slot}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    <p className="text-center text-[10px] text-muted-foreground/40 py-1">🔒 Only permitted context is shared</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scrollable chat area */}
            <div ref={scrollRef} className="flex-1 overflow-auto scrollbar-none min-h-0 px-4 pb-4 space-y-3">
              {/* Chat messages */}
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
                      <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5 [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:my-1">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
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
                  placeholder="Ask about the meeting..."
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

export default Receive;
