import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, FileText, Send } from "lucide-react";
import AgentCharacter from "@/components/AgentCharacter";

const Receive = () => {
  const [phase, setPhase] = useState<"arriving" | "expanding" | "chat">("arriving");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ from: "agent" | "user"; text: string }[]>([]);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("expanding"), 2400);
    const t2 = setTimeout(() => setPhase("chat"), 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Simulated QnA based on meeting context
  const getAgentReply = (userMsg: string): string => {
    const q = userMsg.toLowerCase();

    if (q.includes("summary") || q.includes("总结") || q.includes("what") && q.includes("about") || q.includes("讲了什么")) {
      return "Here's a summary of the meeting:\n\n1. **Roadmap priorities** — The team aligned on 3 key features for Q1: user onboarding revamp, API v2, and analytics dashboard.\n\n2. **Resource allocation** — 2 additional engineers will join the product launch team starting next week.\n\n3. **Beta timeline** — Beta release is targeted for March 28. Design handoff due by March 18.\n\n4. **Action items** — Sarah owns the design spec, Mike handles API scoping, and you were assigned the analytics data model.";
    }

    if (q.includes("action") || q.includes("todo") || q.includes("要我") || q.includes("我需要做") || q.includes("assign")) {
      return "Here are the action items assigned to you:\n\n• **Analytics data model** — Define the schema for the new dashboard (due March 15)\n• **Review Mike's API v2 proposal** — Give feedback by end of this week\n• **Schedule a sync with Sarah** — Align on the onboarding flow before design handoff";
    }

    if (q.includes("deadline") || q.includes("when") || q.includes("时间") || q.includes("date") || q.includes("timeline")) {
      return "Key dates from the meeting:\n\n• **March 15** — Analytics data model due\n• **March 18** — Design handoff deadline\n• **March 28** — Beta release target\n• **End of this week** — API v2 proposal feedback";
    }

    if (q.includes("book") || q.includes("meet") || q.includes("slot") || q.includes("约") || q.includes("calendar")) {
      return "You can book a follow-up meeting using the calendar slots above. Sarah is available Tue 10 AM, Wed 2 PM, and Thu 11 AM. Just tap a slot to confirm.";
    }

    if (q.includes("who") || q.includes("参加") || q.includes("attendee") || q.includes("谁")) {
      return "Attendees: Sarah (Design Lead), Mike (Backend), Lisa (PM), and James (Eng Manager). You and Tom were absent — this delivery is specifically for you.";
    }

    if (q.includes("tell") || q.includes("relay") || q.includes("转达") || q.includes("pass") || q.includes("let them know") || q.includes("forward")) {
      return "Sure, I'll pass that along to Sarah. She'll get your message when I return. Anything else you'd like me to relay?";
    }

    // Default: answer contextually, not just relay
    return "Based on the meeting notes, the key takeaway relevant to you is the analytics data model assignment (due March 15). Would you like me to summarize the full discussion, list your action items, or help you book a follow-up?";
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    const userText = message;
    setMessages((prev) => [...prev, { from: "user", text: userText }]);
    setMessage("");

    // Simulate typing delay
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { from: "agent", text: getAgentReply(userText) },
      ]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        {phase === "arriving" && (
          <motion.div
            key="arriving"
            className="flex-1 flex items-center justify-center"
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ x: -120, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <AgentCharacter size={56} animate walking />
            </motion.div>
          </motion.div>
        )}

        {phase === "expanding" && (
          <motion.div
            key="expanding"
            className="flex-1 flex items-center justify-center"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: [1, 1.1, 0], opacity: [1, 1, 0] }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
              <AgentCharacter size={56} />
            </motion.div>
          </motion.div>
        )}

        {phase === "chat" && (
          <motion.div
            key="chat"
            className="flex-1 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="h-14 flex-shrink-0" />
            <div className="px-6 pb-5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center">
                <span className="text-sm">🤖</span>
              </div>
              <div>
                <h1 className="text-sm font-medium text-foreground tracking-tight">Agent Delivery</h1>
                <p className="text-[11px] text-muted-foreground">From Sarah · 2 items</p>
              </div>
            </div>

            <div className="flex-1 overflow-auto px-4 pb-4 space-y-3">
              {/* Meeting Notes */}
              <motion.div
                className="bg-card rounded-2xl ring-subtle p-4"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <FileText size={14} className="text-foreground/60" />
                  <span className="text-xs font-medium text-foreground">Meeting Notes</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-[1.7]">
                  Q1 planning meeting — discussed roadmap priorities, resource allocation for the new
                  product launch, and timeline for the beta release. Action items assigned to
                  engineering and design teams.
                </p>
                <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground/60">
                  <span className="px-2 py-0.5 rounded-md bg-secondary">15 min</span>
                  <span>Today, 2:30 PM</span>
                </div>
              </motion.div>

              {/* Calendar */}
              <motion.div
                className="bg-card rounded-2xl ring-subtle p-4"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <Calendar size={14} className="text-foreground/60" />
                  <span className="text-xs font-medium text-foreground">Book a Slot</span>
                </div>
                <div className="space-y-1.5">
                  {["Tue 10:00 AM", "Wed 2:00 PM", "Thu 11:00 AM"].map((slot) => (
                    <button
                      key={slot}
                      className="w-full text-left px-3 py-2.5 rounded-xl bg-secondary/60 ring-subtle text-xs text-foreground hover:bg-foreground/[0.08] transition-colors"
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </motion.div>

              <motion.p
                className="text-center text-[10px] text-muted-foreground/40 py-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                🔒 Only permitted context is shared
              </motion.p>

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2.5 text-xs leading-relaxed ${
                      msg.from === "user"
                        ? "bg-foreground text-background rounded-2xl rounded-br-md"
                        : "bg-secondary text-foreground rounded-2xl rounded-bl-md"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="px-5 pb-10 pt-4">
              <div className="flex items-center gap-3 bg-secondary/50 rounded-2xl ring-subtle px-4 py-1.5">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Reply to agent..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none py-2.5"
                />
                <motion.button
                  onClick={sendMessage}
                  className="w-9 h-9 rounded-xl bg-foreground flex items-center justify-center flex-shrink-0"
                  whileTap={{ scale: 0.9 }}
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
