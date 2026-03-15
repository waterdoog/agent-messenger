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
    { id: "meeting-notes", label: "Meeting Notes", icon: <FileText size={18} />, enabled: hasRecording },
    { id: "calendar", label: "Calendar", icon: <Calendar size={18} />, enabled: false },
    { id: "notion", label: "Notion", icon: <BookOpen size={18} />, enabled: false },
    { id: "google-docs", label: "Google Docs", icon: <Globe size={18} />, enabled: false },
    { id: "files", label: "Files", icon: <File size={18} />, enabled: false },
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
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl ring-subtle shadow-deep max-h-[70vh] overflow-auto"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            <div className="px-6 pb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">
                  Pack Context
                </h2>
                <button onClick={onClose} className="text-muted-foreground p-1">
                  <X size={20} />
                </button>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Select what your agent should carry
              </p>

              {/* Context Chips */}
              <div className="space-y-3">
                {items.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => toggle(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      item.enabled
                        ? "bg-primary/15 ring-1 ring-primary/40"
                        : "bg-secondary ring-subtle"
                    }`}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span className={item.enabled ? "text-primary" : "text-muted-foreground"}>
                      {item.icon}
                    </span>
                    <span className={`flex-1 text-left text-sm font-medium ${
                      item.enabled ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {item.label}
                    </span>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      item.enabled ? "bg-primary" : "bg-muted"
                    }`}>
                      {item.enabled && <Check size={12} className="text-primary-foreground" />}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Send */}
              <motion.button
                onClick={handleSend}
                disabled={selectedCount === 0}
                className="mt-6 w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-deep disabled:opacity-40 disabled:cursor-not-allowed"
                whileTap={{ scale: 0.97 }}
              >
                Dispatch Agent · {selectedCount} item{selectedCount !== 1 ? "s" : ""}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ContextDrawer;
