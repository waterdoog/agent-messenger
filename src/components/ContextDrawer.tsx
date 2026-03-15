import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Calendar, BookOpen, Globe, File, Check } from "lucide-react";
import { useState } from "react";

interface ContextItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  enabled: boolean;
}

interface ContextDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (contexts: string[]) => void;
  hasRecording: boolean;
}

const ContextDrawer = ({ isOpen, onClose, onSend, hasRecording }: ContextDrawerProps) => {
  const [items, setItems] = useState<ContextItem[]>([
    { id: "meeting-notes", label: "Meeting Notes", icon: <FileText size={16} />, enabled: hasRecording },
    { id: "calendar", label: "Calendar", icon: <Calendar size={16} />, enabled: false },
    { id: "notion", label: "Notion", icon: <BookOpen size={16} />, enabled: false },
    { id: "google-docs", label: "Google Docs", icon: <Globe size={16} />, enabled: false },
    { id: "files", label: "Files", icon: <File size={16} />, enabled: false },
  ]);

  const toggle = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item))
    );
  };

  const selectedCount = items.filter((i) => i.enabled).length;

  const handleSend = () => {
    onSend(items.filter((i) => i.enabled).map((i) => i.id));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-[28px] ring-subtle max-h-[75vh] overflow-auto"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 300 }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-8 h-[3px] rounded-full bg-foreground/10" />
            </div>

            <div className="px-6 pb-10 pt-2">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-semibold text-foreground tracking-tight">
                  Pack Context
                </h2>
                <button onClick={onClose} className="text-muted-foreground p-1.5 -mr-1.5 rounded-lg hover:bg-secondary transition-colors">
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-muted-foreground mb-5">
                Select what your agent should carry
              </p>

              <div className="space-y-2">
                {items.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => toggle(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${
                      item.enabled
                        ? "bg-foreground/[0.08] ring-1 ring-foreground/20"
                        : "bg-secondary/60 ring-subtle"
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className={`${item.enabled ? "text-foreground" : "text-muted-foreground"} transition-colors`}>
                      {item.icon}
                    </span>
                    <span className={`flex-1 text-left text-sm ${
                      item.enabled ? "text-foreground font-medium" : "text-muted-foreground"
                    } transition-colors`}>
                      {item.label}
                    </span>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      item.enabled ? "bg-foreground" : "border border-foreground/15"
                    }`}>
                      {item.enabled && <Check size={11} className="text-background" strokeWidth={3} />}
                    </div>
                  </motion.button>
                ))}
              </div>

              <motion.button
                onClick={handleSend}
                disabled={selectedCount === 0}
                className="mt-6 w-full py-4 rounded-2xl bg-foreground text-background font-semibold text-sm tracking-tight disabled:opacity-20 disabled:cursor-not-allowed transition-opacity"
                whileTap={{ scale: 0.98 }}
              >
                Dispatch · {selectedCount} item{selectedCount !== 1 ? "s" : ""}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ContextDrawer;
