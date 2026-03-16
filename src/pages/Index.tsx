import { useState, useRef, useEffect } from "react";
import { Send, FolderOpen, Plug, ArrowUpRight, FileText, Trash2, ChevronLeft, Mic } from "lucide-react";
import { sampleMeetingNotes, MeetingNote } from "@/data/sampleNotes";
import { motion, AnimatePresence } from "framer-motion";
import RecordButton from "@/components/RecordButton";
import ContextDrawer from "@/components/ContextDrawer";
import AgentDispatchAnimation from "@/components/AgentDispatchAnimation";

interface Note {
  id: string;
  duration: number;
  timestamp: Date;
}

interface ChatMessage {
  id: string;
  from: "user" | "agent";
  text: string;
}

const Index = () => {
  const [inputText, setInputText] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [notes, setNotes] = useState<MeetingNote[]>(sampleMeetingNotes);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "0", from: "agent", text: "Hey! I'm your courier agent. What do you need?" },
  ]);
  const [panel, setPanel] = useState<"chat" | "files" | "integrations" | "notes">("chat");
  const [isRecording, setIsRecording] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleRecordingComplete = (duration: number) => {
    setHasRecording(true);
    setNotes((prev) => [
      { id: Date.now().toString(), duration, timestamp: new Date() },
      ...prev,
    ]);
  };

  const handleSend = (_contexts: string[]) => {
    setDrawerOpen(false);
    setTimeout(() => setDispatching(true), 300);
  };

  const handleDispatchComplete = () => {
    setDispatching(false);
    setHasRecording(false);
    setInputText("");
  };

  const handleChatSend = () => {
    if (!inputText.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), from: "user", text: inputText };
    setChatMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          from: "agent",
          text: "Got it, I'll take care of that for you.",
        },
      ]);
    }, 800);
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const formatDate = (d: Date) => {
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return "Today";
    if (diff < 172800000) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const showingPanel = panel !== "chat";

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Safe area */}
      <div className="h-10 flex-shrink-0" />

      {/* Top Nav Bar */}
      <motion.nav
        className="flex items-center justify-between px-5 py-2.5 flex-shrink-0"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Left: Files & Integrations */}
        <div className="flex items-center gap-1">
          {showingPanel ? (
            <button
              onClick={() => setPanel("chat")}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft size={14} />
              Back
            </button>
          ) : (
            <>
              <button
                onClick={() => setPanel("files")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <FolderOpen size={13} />
                Files
              </button>
              <button
                onClick={() => setPanel("integrations")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plug size={13} />
                Integrations
              </button>
            </>
          )}
        </div>

        {/* Center: Panel title when in subpage */}
        {showingPanel && (
          <span className="text-xs font-medium text-foreground capitalize">{panel}</span>
        )}

        {/* Right: Send Agent */}
        <motion.button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium"
          whileTap={{ scale: 0.94 }}
        >
          <ArrowUpRight size={13} />
          Send
        </motion.button>
      </motion.nav>

      <div className="h-px bg-foreground/[0.06]" />

      {/* Content */}
      <div className="flex-1 flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          {/* === DEFAULT: Chat View === */}
          {panel === "chat" && (
            <motion.div
              key="chat"
              className="flex-1 flex flex-col min-h-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* Chat header */}
              <div className="px-5 pt-4 pb-2 flex items-center justify-between flex-shrink-0">
                <div>
                  <h1 className="text-sm font-semibold text-foreground tracking-tight">Courier</h1>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {notes.length} note{notes.length !== 1 ? "s" : ""} saved
                  </p>
                </div>
                <button
                  onClick={() => setPanel("notes")}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04] transition-colors"
                >
                  <FileText size={12} />
                  Notes
                </button>
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-auto px-5 py-2 space-y-2">
                {chatMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      className={`max-w-[80%] px-3.5 py-2.5 text-xs leading-relaxed ${
                        msg.from === "user"
                          ? "bg-foreground text-background rounded-2xl rounded-br-md"
                          : "bg-secondary/60 text-foreground rounded-2xl rounded-bl-md"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Recording inline */}
              <AnimatePresence>
                {isRecording && (
                  <motion.div
                    className="px-5 flex-shrink-0"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <RecordButton
                      onRecordingChange={setIsRecording}
                      onRecordingComplete={handleRecordingComplete}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input bar */}
              <div className="px-5 pb-8 pt-3 flex-shrink-0">
                <div className="flex items-center gap-2 bg-secondary/50 rounded-2xl ring-subtle px-3 py-1.5">
                  <motion.button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      isRecording ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                    }`}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Mic size={15} />
                  </motion.button>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
                    placeholder="Talk to your agent..."
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none py-2"
                  />
                  <motion.button
                    onClick={handleChatSend}
                    className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center flex-shrink-0"
                    whileTap={{ scale: 0.9 }}
                  >
                    <Send size={14} className="text-background" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* === Notes Panel === */}
          {panel === "notes" && (
            <motion.div
              key="notes"
              className="flex-1 flex flex-col min-h-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex-1 overflow-auto px-5 pt-4 pb-2">
                {notes.length > 0 ? (
                  <div className="space-y-2">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-secondary/40 ring-subtle"
                      >
                        <div className="w-8 h-8 rounded-xl bg-foreground/[0.06] flex items-center justify-center flex-shrink-0">
                          <FileText size={14} className="text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">Meeting Note</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {formatDate(note.timestamp)} · {formatDuration(note.duration)}
                          </p>
                        </div>
                        <button className="text-muted-foreground/40 hover:text-muted-foreground transition-colors p-1">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center h-full">
                    <p className="text-xs text-muted-foreground/40">No notes yet</p>
                  </div>
                )}
              </div>

              <div className="flex-shrink-0 flex justify-center py-6">
                <RecordButton
                  onRecordingChange={() => {}}
                  onRecordingComplete={handleRecordingComplete}
                />
              </div>
            </motion.div>
          )}

          {/* === Files Panel === */}
          {panel === "files" && (
            <motion.div
              key="files"
              className="flex-1 flex items-center justify-center px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-foreground/[0.04] flex items-center justify-center mx-auto mb-3">
                  <FolderOpen size={20} className="text-muted-foreground/40" />
                </div>
                <p className="text-xs text-muted-foreground/60">No files yet</p>
                <p className="text-[10px] text-muted-foreground/30 mt-1">Attach files for your agent to carry</p>
              </div>
            </motion.div>
          )}

          {/* === Integrations Panel === */}
          {panel === "integrations" && (
            <motion.div
              key="integrations"
              className="flex-1 overflow-auto px-5 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="space-y-2">
                {[
                  { name: "Notion", connected: false },
                  { name: "Google Docs", connected: false },
                  { name: "Google Calendar", connected: false },
                  { name: "Slack", connected: false },
                ].map((item) => (
                  <button
                    key={item.name}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-secondary/40 ring-subtle text-left"
                  >
                    <div className="w-8 h-8 rounded-xl bg-foreground/[0.06] flex items-center justify-center flex-shrink-0">
                      <Plug size={14} className="text-muted-foreground" />
                    </div>
                    <span className="flex-1 text-xs font-medium text-foreground">{item.name}</span>
                    <span className="text-[10px] text-muted-foreground/40">Connect</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ContextDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSend={handleSend}
        hasRecording={hasRecording}
      />

      <AgentDispatchAnimation
        isActive={dispatching}
        onComplete={handleDispatchComplete}
      />
    </div>
  );
};

export default Index;
