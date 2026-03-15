import { useState } from "react";
import { Bot, Send } from "lucide-react";
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

  const handleSend = (contexts: string[]) => {
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
      {/* Status bar spacer */}
      <div className="h-12 flex-shrink-0" />

      {/* Header */}
      <motion.div
        className="px-6 pb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="text-lg font-semibold text-foreground">Courier</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Dispatch your agent</p>
      </motion.div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        {/* Recording chips */}
        {recordings.length > 0 && (
          <motion.div
            className="flex flex-wrap gap-2 justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {recordings.map((dur, i) => (
              <div
                key={i}
                className="px-3 py-1.5 rounded-xl bg-primary/15 ring-1 ring-primary/30 text-xs text-primary font-medium"
              >
                Note {i + 1} · {Math.floor(dur / 60)}:{(dur % 60).toString().padStart(2, "0")}
              </div>
            ))}
          </motion.div>
        )}

        {/* Record Button */}
        <RecordButton
          onRecordingChange={() => {}}
          onRecordingComplete={handleRecordingComplete}
        />
      </div>

      {/* Bottom input bar */}
      <motion.div
        className="px-4 pb-8 pt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2 bg-secondary rounded-2xl ring-subtle px-4 py-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="What should the agent do?"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none py-2"
          />
          <motion.button
            onClick={() => setDrawerOpen(true)}
            className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-deep flex-shrink-0"
            whileTap={{ scale: 0.9 }}
          >
            <Send size={18} className="text-primary-foreground" />
          </motion.button>
        </div>
      </motion.div>

      {/* Context Drawer */}
      <ContextDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSend={handleSend}
        hasRecording={hasRecording}
      />

      {/* Dispatch Animation */}
      <AgentDispatchAnimation
        isActive={dispatching}
        onComplete={handleDispatchComplete}
      />
    </div>
  );
};

export default Index;
