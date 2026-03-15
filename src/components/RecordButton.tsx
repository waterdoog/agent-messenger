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
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    <div className="flex flex-col items-center gap-6">
      <div className="relative flex items-center justify-center">
        <AnimatePresence>
          {isRecording && (
            <>
              <motion.div
                className="absolute rounded-full border border-foreground/10"
                initial={{ width: 80, height: 80, opacity: 0.5 }}
                animate={{ width: 140, height: 140, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.div
                className="absolute rounded-full border border-foreground/5"
                initial={{ width: 80, height: 80, opacity: 0.3 }}
                animate={{ width: 180, height: 180, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
              />
            </>
          )}
        </AnimatePresence>

        <motion.button
          onClick={toggle}
          className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-colors ${
            isRecording
              ? "bg-foreground"
              : "border-2 border-foreground/20 bg-transparent"
          }`}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          {isRecording ? (
            <Square size={22} className="text-background" fill="currentColor" />
          ) : (
            <Mic size={24} className="text-foreground" />
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="flex items-end gap-[3px] h-6">
              {Array.from({ length: 16 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-[2px] rounded-full bg-foreground/60"
                  animate={{
                    height: [4, Math.random() * 20 + 4, 4],
                  }}
                  transition={{
                    duration: 0.4 + Math.random() * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.04,
                  }}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground font-mono tracking-widest">
              {formatTime(seconds)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-xs text-muted-foreground tracking-wide">
        {isRecording ? "Recording" : "Tap to record"}
      </p>
    </div>
  );
};

export default RecordButton;
