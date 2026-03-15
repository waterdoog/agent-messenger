import { useState } from "react";
import { Send, FolderOpen, Plug, ArrowUpRight, Mic, FileText, Trash2 } from "lucide-react";
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
  const [notes, setNotes] = useState<Note[]>([
    { id: "1", duration: 912, timestamp: new Date(Date.now() - 86400000 * 2) },
    { id: "2", duration: 340, timestamp: new Date(Date.now() - 86400000) },
  ]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "0", from: "agent", text: "Hey! I'm your courier agent. Tell me what you need." },
  ]);
  const [activeTab, setActiveTab] = useState<"notes" | "files" | "integrations">("notes");

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
    // Simulate agent reply
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

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Safe area */}
      <div className="h-10 flex-shrink-0" />

      {/* Top Nav Bar */}
      <motion.nav
        className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Left: Files & Integrations */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("files")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "files"
                ? "bg-foreground/10 text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FolderOpen size={13} />
            Files
          </button>
          <button
            onClick={() => setActiveTab("integrations")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "integrations"
                ? "bg-foreground/10 text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Plug size={13} />
            Integrations
          </button>
        </div>

        {/* Center: Courier */}
        <button
          onClick={() => setActiveTab("notes")}
          className="text-sm font-semibold text-foreground tracking-tight"
        >
          Courier
        </button>

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

      {/* Divider */}
      <div className="h-px bg-foreground/[0.06] mx-5" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          {activeTab === "notes" && (
            <motion.div
              key="notes"
              className="flex-1 flex flex-col min-h-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Notes list - scrollable */}
              <div className="flex-1 overflow-auto px-5 pt-4 pb-2">
                {notes.length > 0 ? (
                  <div className="space-y-2">
                    {notes.map((note, i) => (
                      <motion.div
                        key={note.id}
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-secondary/40 ring-subtle"
                        initial={i === 0 ? { opacity: 0, y: -8 } : undefined}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="w-8 h-8 rounded-xl bg-foreground/[0.06] flex items-center justify-center flex-shrink-0">
                          <FileText size={14} className="text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">
                            Meeting Note
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {formatDate(note.timestamp)} · {formatDuration(note.duration)}
                          </p>
                        </div>
                        <button className="text-muted-foreground/40 hover:text-muted-foreground transition-colors p-1">
                          <Trash2 size={13} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center h-full">
                    <p className="text-xs text-muted-foreground/40">No notes yet</p>
                  </div>
                )}
              </div>

              {/* Record Button - compact */}
              <div className="flex-shrink-0 flex justify-center py-4">
                <RecordButton
                  onRecordingChange={() => {}}
                  onRecordingComplete={handleRecordingComplete}
                />
              </div>
            </motion.div>
          )}

          {activeTab === "files" && (
            <motion.div
              key="files"
              className="flex-1 flex items-center justify-center px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-foreground/[0.04] flex items-center justify-center mx-auto mb-3">
                  <FolderOpen size={20} className="text-muted-foreground/40" />
                </div>
                <p className="text-xs text-muted-foreground/60">No files yet</p>
                <p className="text-[10px] text-muted-foreground/30 mt-1">
                  Attach files for your agent to carry
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === "integrations" && (
            <motion.div
              key="integrations"
              className="flex-1 overflow-auto px-5 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
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
                    <span className="flex-1 text-xs font-medium text-foreground">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground/40">
                      Connect
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div className="h-px bg-foreground/[0.06] mx-5" />

      {/* Agent Chat Messages - small scrollable area */}
      <div className="max-h-32 overflow-auto px-5 pt-2 pb-1 flex-shrink-0">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex mb-1.5 ${msg.from === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-3 py-2 text-[11px] leading-relaxed ${
                msg.from === "user"
                  ? "bg-foreground text-background rounded-2xl rounded-br-md"
                  : "bg-secondary/60 text-foreground rounded-2xl rounded-bl-md"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Chat Input - talk to your agent */}
      <motion.div
        className="px-5 pb-8 pt-2 flex-shrink-0"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <div className="flex items-center gap-3 bg-secondary/50 rounded-2xl ring-subtle px-4 py-1.5">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
            placeholder="Talk to your agent..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none py-2.5"
          />
          <motion.button
            onClick={handleChatSend}
            className="w-9 h-9 rounded-xl bg-foreground flex items-center justify-center flex-shrink-0"
            whileTap={{ scale: 0.9 }}
          >
            <Send size={15} className="text-background" />
          </motion.button>
        </div>
      </motion.div>

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
