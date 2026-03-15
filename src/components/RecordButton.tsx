import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square } from "lucide-react";

interface RecordButtonProps {
  onRecordingChange?: (isRecording: boolean) => void;
  onRecordingComplete?: (duration: number) => void;
}

const RecordButton = ({ onRecordingChange, onRecordingComplete }: RecordButtonProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const toggle = () => {
    if (isRecording) {
      setIsRecording(false);
      onRecordingChange?.(false);
      onRecordingComplete?.(seconds);
      setSeconds(0);
    } else {
      setIsRecording(true);
      onRecordingChange?.(true);
      setSeconds(0);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Pulse rings */}
      <div className="relative">
        <AnimatePresence>
          {isRecording && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/20"
                initial={{ scale: 1, opacity: 0.4 }}
                animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                style={{ width: 96, height: 96, top: -8, left: -8 }}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/10"
                initial={{ scale: 1, opacity: 0.3 }}
                animate={{ scale: [1, 2.2], opacity: [0.3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
                style={{ width: 96, height: 96, top: -8, left: -8 }}
              />
            </>
          )}
        </AnimatePresence>

        <motion.button
          onClick={toggle}
          className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-deep transition-colors ${
            isRecording ? "bg-destructive" : "bg-primary"
          }`}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          {isRecording ? (
            <Square size={28} className="text-primary-foreground" fill="currentColor" />
          ) : (
            <Mic size={28} className="text-primary-foreground" />
          )}
        </motion.button>
      </div>

      {/* Waveform & Timer */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="flex items-end gap-1 h-8">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full bg-primary"
                  animate={{
                    height: [8, Math.random() * 24 + 8, 8],
                  }}
                  transition={{
                    duration: 0.5 + Math.random() * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.05,
                  }}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground font-mono">
              {formatTime(seconds)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-sm text-muted-foreground">
        {isRecording ? "Recording..." : "Tap to record"}
      </p>
    </div>
  );
};

export default RecordButton;
