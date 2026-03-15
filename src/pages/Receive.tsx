import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, FileText, Send } from "lucide-react";
import AgentCharacter from "@/components/AgentCharacter";

const Receive = () => {
  const [phase, setPhase] = useState<"arriving" | "expanding" | "chat">("arriving");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ from: "agent" | "user"; text: string }[]>([]);
  const [replyIndex, setReplyIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("expanding"), 2400);
    const t2 = setTimeout(() => setPhase("chat"), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const contextualReplies = [
    "The meeting covered three main topics: Q1 roadmap priorities, resource allocation for the product launch, and beta release timeline. Want me to break any of these down?",
    "Your key action items:\n\n• Define the analytics data model schema (due March 15)\n• Review Mike's API v2 proposal (due this Friday)\n• Schedule a sync with Sarah on the onboarding flow",
    "Key dates:\n\n• March 15 — Analytics schema due\n• March 18 — Design handoff\n• March 28 — Beta release\n• This Friday — API v2 feedback",
    "The team decided to prioritize user onboarding revamp as the #1 feature. API v2 is second, and analytics dashboard third. Sarah is leading design, Mike owns backend.",
    "Two additional engineers (from the platform team) will join the product launch squad starting next Monday. James confirmed headcount approval.",
    "The beta release scope includes: new onboarding flow, API v2 endpoints, and a basic analytics dashboard. Full analytics is post-launch.",
  ];

  const getAgentReply = (userMsg: string): string => {
    const q = userMsg.toLowerCase();

    if (q.includes("summary") || q.includes("总结") || (q.includes("what") && q.includes("about")) || q.includes("讲了什么") || q.includes("overview")) {
      return "Here's a summary:\n\n1. Roadmap — 3 key Q1 features: onboarding revamp, API v2, analytics dashboard\n2. Resources — 2 engineers joining product launch next week\n3. Beta — Targeted March 28, design handoff due March 18\n4. Your tasks — Analytics data model (March 15), review API proposal (this week)";
    }

    if (q.includes("action") || q.includes("todo") || q.includes("要我") || q.includes("我需要做") || q.includes("assign") || q.includes("task")) {
      return "Your action items:\n\n• Analytics data model — define schema (due March 15)\n• Review Mike's API v2 proposal — feedback by Friday\n• Schedule sync with Sarah — align on onboarding before March 18";
    }

    if (q.includes("deadline") || q.includes("when") || q.includes("时间") || q.includes("date") || q.includes("timeline") || q.includes("due")) {
      return "Key dates:\n\n• March 15 — Analytics data model due\n• March 18 — Design handoff deadline\n• March 28 — Beta release target\n• This Friday — API v2 feedback due";
    }

    if (q.includes("book") || q.includes("meet") || q.includes("slot") || q.includes("约") || q.includes("calendar") || q.includes("schedule")) {
      return "You can book a follow-up using the calendar slots above. Sarah is available Tue 10 AM, Wed 2 PM, and Thu 11 AM. Tap any slot to confirm.";
    }

    if (q.includes("who") || q.includes("参加") || q.includes("attendee") || q.includes("谁") || q.includes("people")) {
      return "Attendees: Sarah (Design Lead), Mike (Backend), Lisa (PM), and James (Eng Manager). You and Tom were absent — this delivery is for both of you.";
    }

    if (q.includes("tell") || q.includes("relay") || q.includes("转达") || q.includes("pass") || q.includes("let them know") || q.includes("forward") || q.includes("回复")) {
      return "Sure, I'll pass that along to Sarah when I return. Anything else you'd like me to relay?";
    }

    if (q.includes("priority") || q.includes("重点") || q.includes("important") || q.includes("focus")) {
      return "Top priority is the user onboarding revamp — Sarah's leading design. API v2 is second (Mike owns it). Analytics dashboard is third and that's your domain.";
    }

    if (q.includes("resource") || q.includes("team") || q.includes("engineer") || q.includes("人")) {
      return "Two engineers from the platform team are joining the product launch squad next Monday. James got headcount approval. Total team will be 8 people.";
    }

    if (q.includes("beta") || q.includes("launch") || q.includes("scope") || q.includes("release")) {
      return "Beta scope: new onboarding flow + API v2 endpoints + basic analytics dashboard. Full analytics features are planned for post-launch.";
    }

    if (q.includes("thank") || q.includes("谢") || q.includes("ok") || q.includes("got it") || q.includes("好")) {
      return "You're welcome! Let me know if you need anything else — I can summarize, list action items, or help you book a follow-up.";
    }

    // Cycle through contextual replies for generic messages
    const reply = contextualReplies[replyIndex % contextualReplies.length];
    setReplyIndex((prev) => prev + 1);
    return reply;
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    const userText = message;
    setMessages((prev) => [...prev, { from: "user", text: userText }]);
    setMessage("");

    setTimeout(() => {
      setMessages((prev) => [...prev, { from: "agent", text: getAgentReply(userText) }]);
    }, 600);
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
            {/* Header - fixed */}
            <div className="flex-shrink-0">
              <div className="h-14" />
              <div className="px-6 pb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center">
                  <span className="text-sm">🤖</span>
                </div>
                <div>
                  <h1 className="text-sm font-medium text-foreground tracking-tight">Agent Delivery</h1>
                  <p className="text-[11px] text-muted-foreground">From Sarah · 2 items</p>
                </div>
              </div>
            </div>

            {/* Scrollable content */}
            <div ref={scrollRef} className="flex-1 overflow-auto min-h-0 px-4 pb-4 space-y-3">
              {/* Meeting Notes */}
              <motion.div className="bg-card rounded-2xl ring-subtle p-4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}>
                <div className="flex items-center gap-2 mb-2.5">
                  <FileText size={14} className="text-foreground/60" />
                  <span className="text-xs font-medium text-foreground">Meeting Notes</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-[1.7]">
                  Q1 planning meeting — discussed roadmap priorities, resource allocation for the new product launch, and timeline for the beta release. Action items assigned to engineering and design teams.
                </p>
                <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground/60">
                  <span className="px-2 py-0.5 rounded-md bg-secondary">15 min</span>
                  <span>Today, 2:30 PM</span>
                </div>
              </motion.div>

              {/* Calendar */}
              <motion.div className="bg-card rounded-2xl ring-subtle p-4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
                <div className="flex items-center gap-2 mb-2.5">
                  <Calendar size={14} className="text-foreground/60" />
                  <span className="text-xs font-medium text-foreground">Book a Slot</span>
                </div>
                <div className="space-y-1.5">
                  {["Tue 10:00 AM", "Wed 2:00 PM", "Thu 11:00 AM"].map((slot) => (
                    <button key={slot} className="w-full text-left px-3 py-2.5 rounded-xl bg-secondary/60 ring-subtle text-xs text-foreground hover:bg-foreground/[0.08] transition-colors">
                      {slot}
                    </button>
                  ))}
                </div>
              </motion.div>

              <motion.p className="text-center text-[10px] text-muted-foreground/40 py-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                🔒 Only permitted context is shared
              </motion.p>

              {/* Chat messages */}
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
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

            {/* Input - pinned to bottom */}
            <div className="flex-shrink-0 px-5 pb-8 pt-3 border-t border-foreground/[0.04]">
              <div className="flex items-center gap-3 bg-secondary/50 rounded-2xl ring-subtle px-4 py-1.5">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Ask about the meeting..."
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
