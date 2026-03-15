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
      const timer = setTimeout(() => setPhase("done"), 2800);
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
            <div className="w-full overflow-hidden flex items-center h-32">
              <motion.div
                initial={{ x: -100 }}
                animate={{ x: "calc(100vw + 100px)" }}
                transition={{ duration: 2.5, ease: [0.4, 0, 0.2, 1] }}
              >
                <AgentCharacter size={48} animate />
              </motion.div>
            </div>
          )}

          {phase === "done" && (
            <motion.div
              className="flex flex-col items-center gap-6 px-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <motion.div
                className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Link size={28} className="text-primary" />
              </motion.div>

              <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground mb-2">Agent Dispatched</h2>
                <p className="text-sm text-muted-foreground">
                  Your agent is ready. Share the link with recipients.
                </p>
              </div>

              <motion.button
                onClick={handleCopy}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm shadow-deep"
                whileTap={{ scale: 0.95 }}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? "Link Copied!" : "Copy Link"}
              </motion.button>

              <button
                onClick={onComplete}
                className="text-sm text-muted-foreground mt-2"
              >
                Back to Hub
              </button>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AgentDispatchAnimation;
