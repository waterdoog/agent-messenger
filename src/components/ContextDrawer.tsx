import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Calendar, FolderOpen, Check, ChevronDown, ChevronUp, Shield, Eye, CalendarPlus, Settings } from "lucide-react";
import { useState } from "react";
import { MeetingNote, FolderItem, CalendarPermission, sampleMeetingNotes, sampleFolders, calendarPermissions } from "@/data/sampleNotes";

interface ContextDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (contexts: string[]) => void;
  hasRecording: boolean;
  notes: MeetingNote[];
}

const ContextDrawer = ({ isOpen, onClose, onSend, notes }: ContextDrawerProps) => {
  const [expandedSection, setExpandedSection] = useState<string | null>("files");
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set());
  const [selectedCalPerm, setSelectedCalPerm] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const toggleNote = (id: string) => {
    setSelectedNotes((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleFolder = (id: string) => {
    setSelectedFolders((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const totalSelected = selectedNotes.size + selectedFolders.size + (selectedCalPerm ? 1 : 0);

  const handleSend = () => {
    const contexts = [
      ...Array.from(selectedNotes),
      ...Array.from(selectedFolders),
      ...(selectedCalPerm ? [selectedCalPerm] : []),
    ];
    onSend(contexts);
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    return `${m} min`;
  };

  const formatDate = (d: Date) => {
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return "Today";
    if (diff < 172800000) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const calPermIcons: Record<string, React.ReactNode> = {
    "cal-view": <Eye size={13} />,
    "cal-book": <CalendarPlus size={13} />,
    "cal-manage": <Settings size={13} />,
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
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-[28px] ring-subtle max-h-[85vh] overflow-auto scrollbar-none"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 300 }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-8 h-[3px] rounded-full bg-foreground/10" />
            </div>

            <div className="px-5 pb-10 pt-2">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-semibold text-foreground tracking-tight">
                  Pack Context
                </h2>
                <button onClick={onClose} className="text-muted-foreground p-1.5 -mr-1.5 rounded-lg hover:bg-secondary transition-colors">
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Select exactly what your agent carries
              </p>

              {/* === NOTES SECTION === */}
              <div className="mb-3">
                <button
                  onClick={() => toggleSection("notes")}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-secondary/40 ring-subtle"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText size={15} className="text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">Meeting Notes</span>
                    {selectedNotes.size > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-foreground text-background font-medium">
                        {selectedNotes.size}
                      </span>
                    )}
                  </div>
                  {expandedSection === "notes" ? (
                    <ChevronUp size={14} className="text-muted-foreground" />
                  ) : (
                    <ChevronDown size={14} className="text-muted-foreground" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedSection === "notes" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2 space-y-1.5 max-h-[200px] overflow-auto scrollbar-none">
                        {notes.map((note) => {
                          const selected = selectedNotes.has(note.id);
                          return (
                            <motion.button
                              key={note.id}
                              onClick={() => toggleNote(note.id)}
                              className={`w-full flex items-start gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all ${
                                selected
                                  ? "bg-foreground/[0.08] ring-1 ring-foreground/20"
                                  : "bg-secondary/30 hover:bg-secondary/50"
                              }`}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className={`w-4 h-4 mt-0.5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                                selected ? "bg-foreground" : "border border-foreground/15"
                              }`}>
                                {selected && <Check size={9} className="text-background" strokeWidth={3} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-medium truncate ${selected ? "text-foreground" : "text-muted-foreground"}`}>
                                  {note.title}
                                </p>
                                <p className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">
                                  {formatDate(note.timestamp)} · {formatDuration(note.duration)} · {note.attendees.length} people
                                </p>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* === FOLDERS SECTION === */}
              <div className="mb-3">
                <button
                  onClick={() => toggleSection("folders")}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-secondary/40 ring-subtle"
                >
                  <div className="flex items-center gap-2.5">
                    <FolderOpen size={15} className="text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">Folders</span>
                    {selectedFolders.size > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-foreground text-background font-medium">
                        {selectedFolders.size}
                      </span>
                    )}
                  </div>
                  {expandedSection === "folders" ? (
                    <ChevronUp size={14} className="text-muted-foreground" />
                  ) : (
                    <ChevronDown size={14} className="text-muted-foreground" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedSection === "folders" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2 space-y-1.5">
                        {sampleFolders.map((folder) => {
                          const selected = selectedFolders.has(folder.id);
                          return (
                            <motion.button
                              key={folder.id}
                              onClick={() => toggleFolder(folder.id)}
                              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all ${
                                selected
                                  ? "bg-foreground/[0.08] ring-1 ring-foreground/20"
                                  : "bg-secondary/30 hover:bg-secondary/50"
                              }`}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                                selected ? "bg-foreground" : "border border-foreground/15"
                              }`}>
                                {selected && <Check size={9} className="text-background" strokeWidth={3} />}
                              </div>
                              <span className="text-sm">{folder.icon}</span>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-medium ${selected ? "text-foreground" : "text-muted-foreground"}`}>
                                  {folder.name}
                                </p>
                                <p className="text-[10px] text-muted-foreground/60">{folder.files.length} files</p>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* === CALENDAR PERMISSIONS === */}
              <div className="mb-3">
                <button
                  onClick={() => toggleSection("calendar")}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-secondary/40 ring-subtle"
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar size={15} className="text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">Calendar Access</span>
                    {selectedCalPerm && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-foreground text-background font-medium">
                        1
                      </span>
                    )}
                  </div>
                  {expandedSection === "calendar" ? (
                    <ChevronUp size={14} className="text-muted-foreground" />
                  ) : (
                    <ChevronDown size={14} className="text-muted-foreground" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedSection === "calendar" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2 space-y-1.5">
                        {calendarPermissions.map((perm) => {
                          const selected = selectedCalPerm === perm.id;
                          return (
                            <motion.button
                              key={perm.id}
                              onClick={() => setSelectedCalPerm(selected ? null : perm.id)}
                              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all ${
                                selected
                                  ? "bg-foreground/[0.08] ring-1 ring-foreground/20"
                                  : "bg-secondary/30 hover:bg-secondary/50"
                              }`}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                                selected ? "bg-foreground" : "border border-foreground/15"
                              }`}>
                                {selected && <Check size={9} className="text-background" strokeWidth={3} />}
                              </div>
                              <span className={`${selected ? "text-foreground" : "text-muted-foreground/60"}`}>
                                {calPermIcons[perm.id]}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-medium ${selected ? "text-foreground" : "text-muted-foreground"}`}>
                                  {perm.label}
                                </p>
                                <p className="text-[10px] text-muted-foreground/60">{perm.description}</p>
                              </div>
                              <Shield size={11} className="text-muted-foreground/30 flex-shrink-0" />
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Selected summary */}
              {totalSelected > 0 && (
                <motion.div
                  className="mb-4 px-3.5 py-2.5 rounded-xl bg-secondary/30 text-[10px] text-muted-foreground"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                >
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from(selectedNotes).map((id) => {
                      const note = notes.find((n) => n.id === id);
                      return note ? (
                        <span key={id} className="px-2 py-0.5 rounded-md bg-foreground/10 text-foreground/70">
                          📝 {note.title}
                        </span>
                      ) : null;
                    })}
                    {Array.from(selectedFolders).map((id) => {
                      const folder = sampleFolders.find((f) => f.id === id);
                      return folder ? (
                        <span key={id} className="px-2 py-0.5 rounded-md bg-foreground/10 text-foreground/70">
                          {folder.icon} {folder.name}
                        </span>
                      ) : null;
                    })}
                    {selectedCalPerm && (
                      <span className="px-2 py-0.5 rounded-md bg-foreground/10 text-foreground/70">
                        📅 {calendarPermissions.find((p) => p.id === selectedCalPerm)?.label}
                      </span>
                    )}
                  </div>
                </motion.div>
              )}

              <motion.button
                onClick={handleSend}
                disabled={totalSelected === 0}
                className="w-full py-4 rounded-2xl bg-foreground text-background font-semibold text-sm tracking-tight disabled:opacity-20 disabled:cursor-not-allowed transition-opacity"
                whileTap={{ scale: 0.98 }}
              >
                Dispatch Agent · {totalSelected} item{totalSelected !== 1 ? "s" : ""}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ContextDrawer;
