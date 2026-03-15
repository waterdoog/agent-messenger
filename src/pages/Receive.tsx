import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, FileText, MessageSquare, Send, ArrowLeft } from "lucide-react";
import AgentCharacter from "@/components/AgentCharacter";

const Receive = () => {
  const [phase, setPhase] = useState<"arriving" | "expanding" | "chat">("arriving");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ from: "agent" | "user"; text: string }[]>([]);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("expanding"), 2200);
    const t2 = setTimeout(() => setPhase("chat"), 2800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages((prev) => [
      ...prev,
      { from: "user", text: message },
      { from: "agent", text: "Got it! I'll relay this to the sender." },
    ]);
    setMessage("");
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        {/* Phase 1: Agent walking in */}
        {phase === "arriving" && (
          <motion.div
            key="arriving"
            className="flex-1 flex items-center justify-center"
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1.8, ease: [0.4, 0, 0.2, 1] }}
            >
              <AgentCharacter size={56} animate />
            </motion.div>
          </motion.div>
        )}

        {/* Phase 2: Expanding */}
        {phase === "expanding" && (
          <motion.div
            key="expanding"
            className="flex-1 flex items-center justify-center"
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.2, 0.8, 0] }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
              <AgentCharacter size={56} />
            </motion.div>
          </motion.div>
        )}

        {/* Phase 3: Chat interface */}
        {phase === "chat" && (
          <motion.div
            key="chat"
            className="flex-1 flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Header */}
            <div className="h-12 flex-shrink-0" />
            <div className="px-6 pb-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <MessageSquare size={14} className="text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-foreground">Agent Delivery</h1>
                <p className="text-xs text-muted-foreground">From Sarah · 2 items</p>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto px-4 pb-4 space-y-3">
              {/* Meeting Notes Card */}
              <motion.div
                className="bg-card rounded-2xl ring-subtle shadow-deep p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={16} className="text-primary" />
                  <span className="text-sm font-medium text-foreground">Meeting Notes</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Q1 planning meeting — discussed roadmap priorities, resource allocation for the new
                  product launch, and timeline for the beta release. Action items assigned to
                  engineering and design teams.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="px-2 py-0.5 rounded-lg bg-secondary">15 min</span>
                  <span>Today, 2:30 PM</span>
                </div>
              </motion.div>

              {/* Calendar Card */}
              <motion.div
                className="bg-card rounded-2xl ring-subtle shadow-deep p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={16} className="text-primary" />
                  <span className="text-sm font-medium text-foreground">Available Slots</span>
                </div>
                <div className="space-y-2">
                  {["Tue 10:00 AM", "Wed 2:00 PM", "Thu 11:00 AM"].map((slot) => (
                    <button
                      key={slot}
                      className="w-full text-left px-3 py-2 rounded-xl bg-secondary ring-subtle text-xs text-foreground hover:bg-primary/10 hover:ring-primary/30 transition-all"
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Permission notice */}
              <motion.div
                className="text-center py-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-[10px] text-muted-foreground/60">
                  🔒 Only permitted context is shared. No other data is accessible.
                </p>
              </motion.div>

              {/* Messages */}
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs ${
                      msg.from === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-secondary text-foreground rounded-bl-md"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input */}
            <div className="px-4 pb-8 pt-4">
              <div className="flex items-center gap-2 bg-secondary rounded-2xl ring-subtle px-4 py-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Reply to agent..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none py-2"
                />
                <motion.button
                  onClick={sendMessage}
                  className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-deep flex-shrink-0"
                  whileTap={{ scale: 0.9 }}
                >
                  <Send size={18} className="text-primary-foreground" />
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
