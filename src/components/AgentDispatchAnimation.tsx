import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Check, Copy, Link } from "lucide-react";
import AgentCharacter from "./AgentCharacter";

interface AgentDispatchAnimationProps {
  isActive: boolean;
  onComplete: () => void;
}

const AgentDispatchAnimation = ({ isActive, onComplete }: AgentDispatchAnimationProps) => {
  const [phase, setPhase] = useState<"walking" | "done">("walking");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isActive) {
      setPhase("walking");
      setCopied(false);
      const timer = setTimeout(() => setPhase("done"), 3000);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  const handleCopy = () => {
    const link = `${window.location.origin}/receive/demo-${Date.now()}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-50 bg-background flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {phase === "walking" && (
            <div className="w-full overflow-hidden flex items-center h-40">
              <motion.div
                initial={{ x: -80 }}
                animate={{ x: "calc(100vw + 80px)" }}
                transition={{ duration: 2.8, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <AgentCharacter size={52} animate walking />
              </motion.div>
            </div>
          )}

          {phase === "done" && (
            <motion.div
              className="flex flex-col items-center gap-8 px-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              <motion.div
                className="w-14 h-14 rounded-full border border-foreground/20 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Link size={22} className="text-foreground" />
              </motion.div>

              <div className="text-center">
                <h2 className="text-lg font-semibold text-foreground tracking-tight mb-1.5">
                  Agent Dispatched
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Share the link with your recipients
                </p>
              </div>

              <motion.button
                onClick={handleCopy}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-foreground text-background font-medium text-sm tracking-tight"
                whileTap={{ scale: 0.96 }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy Link"}
              </motion.button>

              <button
                onClick={onComplete}
                className="text-xs text-muted-foreground tracking-wide"
              >
                Done
              </button>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AgentDispatchAnimation;
