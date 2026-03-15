import { useState } from "react";
import { Send } from "lucide-react";
import { motion } from "framer-motion";
import RecordButton from "@/components/RecordButton";
import ContextDrawer from "@/components/ContextDrawer";
import AgentDispatchAnimation from "@/components/AgentDispatchAnimation";

const Index = () => {
  const [inputText, setInputText] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [recordings, setRecordings] = useState<number[]>([]);

  const handleRecordingComplete = (duration: number) => {
    setHasRecording(true);
    setRecordings((prev) => [...prev, duration]);
  };

  const handleSend = (_contexts: string[]) => {
    setDrawerOpen(false);
    setTimeout(() => setDispatching(true), 300);
  };

  const handleDispatchComplete = () => {
    setDispatching(false);
    setHasRecording(false);
    setRecordings([]);
    setInputText("");
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Safe area */}
      <div className="h-14 flex-shrink-0" />

      {/* Header - minimal */}
      <motion.div
        className="px-6 pb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.6 }}
      >
        <h1 className="text-sm font-medium text-foreground tracking-tight">Courier</h1>
      </motion.div>

      {/* Center */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
        {recordings.length > 0 && (
          <motion.div
            className="flex flex-wrap gap-2 justify-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {recordings.map((dur, i) => (
              <div
                key={i}
                className="px-3 py-1.5 rounded-xl border border-foreground/10 text-[11px] text-muted-foreground font-mono tracking-wide"
              >
                Note {i + 1} · {Math.floor(dur / 60)}:{(dur % 60).toString().padStart(2, "0")}
              </div>
            ))}
          </motion.div>
        )}

        <RecordButton
          onRecordingChange={() => {}}
          onRecordingComplete={handleRecordingComplete}
        />
      </div>

      {/* Bottom input */}
      <motion.div
        className="px-5 pb-10 pt-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex items-center gap-3 bg-secondary/50 rounded-2xl ring-subtle px-4 py-1.5">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="What should the agent do?"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none py-2.5"
          />
          <motion.button
            onClick={() => setDrawerOpen(true)}
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
