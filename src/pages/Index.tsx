import { useState, useRef, useEffect, useCallback } from "react";
import { Send, FolderOpen, Plug, ArrowUpRight, FileText, Trash2, ChevronLeft, Mic, Square, Clock, Users, Tag, CheckSquare, File, Image, Table, Presentation, Code, Link2, ChevronRight, Search, Plus, UserPlus, X, Check } from "lucide-react";
import { sampleMeetingNotes, sampleFolders, MeetingNote, FolderItem } from "@/data/sampleNotes";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import RecordButton from "@/components/RecordButton";
import ContextDrawer from "@/components/ContextDrawer";
import AgentDispatchAnimation from "@/components/AgentDispatchAnimation";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

interface ChatMessage {
  id: string;
  from: "user" | "agent";
  text: string;
}

interface Integration {
  name: string;
  icon: string;
  connected: boolean;
  category: string;
}

interface Contact {
  id: string;
  name: string;
  agentName?: string; // e.g. "Spark (Eason's Agent)"
  avatar: string;
  avatarBg?: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  isPinned: boolean;
  isAgent: boolean;
  isOnline?: boolean;
}

const sampleContacts: Contact[] = [
  {
    id: "courier",
    name: "Courier",
    avatar: "⚡",
    lastMessage: "Hey! I'm your courier agent. What do you need?",
    lastMessageTime: "Now",
    unread: 1,
    isPinned: true,
    isAgent: true,
    isOnline: true,
  },
  {
    id: "carol",
    name: "Carol MA",
    avatar: "🐴",
    avatarBg: "bg-amber-800",
    lastMessage: "Hey, can we sync on the roadmap later today?",
    lastMessageTime: "2:30 PM",
    unread: 2,
    isPinned: false,
    isAgent: false,
  },
  {
    id: "carol-agent",
    name: "Dash",
    agentName: "Carol's Agent",
    avatar: "⚡",
    lastMessage: "📋 Carol shared Q1 Roadmap notes with you. 3 action items pending your review.",
    lastMessageTime: "2:15 PM",
    unread: 1,
    isPinned: false,
    isAgent: true,
  },
  {
    id: "eason",
    name: "Eason W",
    avatar: "E",
    avatarBg: "bg-cyan-500",
    lastMessage: "Let me know when you're free to chat about the API",
    lastMessageTime: "Mar 14",
    unread: 0,
    isPinned: false,
    isAgent: false,
  },
  {
    id: "eason-agent",
    name: "Bolt",
    agentName: "Eason's Agent",
    avatar: "⚡",
    lastMessage: "📅 Eason has 3 available slots this week. Want me to book one?",
    lastMessageTime: "Mar 14",
    unread: 1,
    isPinned: false,
    isAgent: true,
  },
  {
    id: "lina",
    name: "Lina Chen",
    avatar: "L",
    avatarBg: "bg-violet-500",
    lastMessage: "Can you send me the design specs?",
    lastMessageTime: "Mon",
    unread: 0,
    isPinned: false,
    isAgent: false,
  },
  {
    id: "lina-agent",
    name: "Nova",
    agentName: "Lina's Agent",
    avatar: "⚡",
    lastMessage: "✅ Design specs delivered. Lina confirmed receipt and left a comment.",
    lastMessageTime: "Mon",
    unread: 0,
    isPinned: false,
    isAgent: true,
  },
  {
    id: "alex",
    name: "Alex Rivera",
    avatar: "A",
    avatarBg: "bg-emerald-600",
    lastMessage: "The API docs are updated, take a look.",
    lastMessageTime: "Mar 12",
    unread: 0,
    isPinned: false,
    isAgent: false,
  },
  {
    id: "alex-agent",
    name: "Relay",
    agentName: "Alex's Agent",
    avatar: "⚡",
    lastMessage: "📎 Alex shared 2 files: API v2 spec & migration guide. Read-only access granted.",
    lastMessageTime: "Mar 12",
    unread: 1,
    isPinned: false,
    isAgent: true,
  },
];

// Pre-populated chat messages for non-Courier contacts
const contactMessages: Record<string, ChatMessage[]> = {
  "carol": [
    { id: "c1", from: "agent", text: "Hey, can we sync on the roadmap later today?" },
    { id: "c2", from: "user", text: "Sure! How about 3pm?" },
    { id: "c3", from: "agent", text: "Works for me. I'll send a calendar invite 👍" },
  ],
  "carol-agent": [
    { id: "ca1", from: "agent", text: "Hi! I'm Dash, Carol's agent. She asked me to share some context with you." },
    { id: "ca2", from: "agent", text: "📋 Carol shared **Q1 Roadmap Planning** notes with you. Here's a quick summary:\n\n- Onboarding revamp (#1), API v2 (#2), Analytics dashboard (#3)\n- Sarah leads design, Mike owns backend\n- Beta target: March 28" },
    { id: "ca3", from: "agent", text: "There are **3 action items** pending your review. Want me to list them?" },
  ],
  "eason": [
    { id: "e1", from: "agent", text: "Let me know when you're free to chat about the API" },
    { id: "e2", from: "user", text: "How about tomorrow afternoon?" },
    { id: "e3", from: "agent", text: "Let me check... I'll have Bolt coordinate with your calendar." },
  ],
  "eason-agent": [
    { id: "ea1", from: "agent", text: "Hey! I'm Bolt, Eason's agent. 👋" },
    { id: "ea2", from: "agent", text: "📅 Eason has 3 available slots this week:\n\n- **Tue 10:00 AM** - 30 min\n- **Wed 2:00 PM** - 45 min\n- **Thu 11:00 AM** - 30 min\n\nWant me to book one for you?" },
    { id: "ea3", from: "user", text: "Wed 2pm works!" },
    { id: "ea4", from: "agent", text: "✅ Done! Booked **Wed 2:00 PM** for 45 min. I've sent calendar invites to both of you. Eason will get a notification." },
  ],
  "lina": [
    { id: "l1", from: "agent", text: "Can you send me the design specs?" },
    { id: "l2", from: "user", text: "Sure, I'll have my agent deliver them to you" },
    { id: "l3", from: "agent", text: "Perfect, thanks! 🙏" },
  ],
  "lina-agent": [
    { id: "la1", from: "agent", text: "Hi, I'm Nova, Lina's agent." },
    { id: "la2", from: "agent", text: "✅ Design specs delivered successfully. Lina confirmed receipt." },
    { id: "la3", from: "agent", text: "She left a comment: \"Looks great! I especially like the onboarding flow. One question — is the color palette finalized?\"" },
    { id: "la4", from: "agent", text: "Want me to relay a response back to Lina?" },
  ],
  "alex": [
    { id: "a1", from: "agent", text: "The API docs are updated, take a look." },
    { id: "a2", from: "user", text: "Thanks! I'll review them today" },
    { id: "a3", from: "agent", text: "Cool. Also the migration guide is in the shared folder if you need it." },
  ],
  "alex-agent": [
    { id: "aa1", from: "agent", text: "Hey there! I'm Relay, Alex's agent. 📎" },
    { id: "aa2", from: "agent", text: "Alex shared 2 files with you:\n\n1. **API v2 Specification** (12 pages)\n2. **Migration Guide** (8 pages)\n\nBoth are read-only access." },
    { id: "aa3", from: "agent", text: "Alex also mentioned: breaking changes in v2 need a migration guide review before March 20. Want me to set a reminder?" },
  ],
};

const integrations: Integration[] = [
  { name: "Google Calendar", icon: "📅", connected: false, category: "Calendar" },
  { name: "Notion", icon: "📝", connected: false, category: "Docs" },
  { name: "Google Docs", icon: "📄", connected: false, category: "Docs" },
  { name: "Slack", icon: "💬", connected: false, category: "Communication" },
  { name: "Microsoft Teams", icon: "🟦", connected: false, category: "Communication" },
  { name: "Zoom", icon: "📹", connected: false, category: "Communication" },
  { name: "Google Drive", icon: "☁️", connected: false, category: "Storage" },
  { name: "Dropbox", icon: "📦", connected: false, category: "Storage" },
  { name: "OneDrive", icon: "🔵", connected: false, category: "Storage" },
  { name: "Linear", icon: "🔷", connected: false, category: "Project Mgmt" },
  { name: "Jira", icon: "🔶", connected: false, category: "Project Mgmt" },
  { name: "GitHub", icon: "🐙", connected: false, category: "Dev" },
  { name: "Figma", icon: "🎨", connected: false, category: "Design" },
  { name: "Confluence", icon: "📘", connected: false, category: "Docs" },
  { name: "Outlook Calendar", icon: "📆", connected: false, category: "Calendar" },
  { name: "Asana", icon: "🟠", connected: false, category: "Project Mgmt" },
];

const Index = () => {
  const [view, setView] = useState<"contacts" | "chat">("contacts");
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [notes, setNotes] = useState<MeetingNote[]>(sampleMeetingNotes);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "0", from: "agent", text: "Hey! I'm your courier agent. What do you need?" },
  ]);
  const [panel, setPanel] = useState<"chat" | "files" | "states">("chat");
  const [isRecording, setIsRecording] = useState(false);
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);
  const [connectedIntegrations, setConnectedIntegrations] = useState<Set<string>>(new Set());
  const [openFolderId, setOpenFolderId] = useState<string | null>(null);
  const [showFriends, setShowFriends] = useState(false);
  const [friendTab, setFriendTab] = useState<"add" | "requests">("requests");
  const [friendSearch, setFriendSearch] = useState("");
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [acceptedRequests, setAcceptedRequests] = useState<Set<string>>(new Set());
  const chatEndRef = useRef<HTMLDivElement>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingStartRef = useRef<number>(0);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const openContact = (contactId: string) => {
    setActiveContactId(contactId);
    setView("chat");
    setPanel("chat");
    setOpenNoteId(null);
    setOpenFolderId(null);
  };

  const goBackToContacts = () => {
    setView("contacts");
    setActiveContactId(null);
    setPanel("chat");
    setOpenNoteId(null);
    setOpenFolderId(null);
  };

  const startMicRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.start();
      recordingStartRef.current = Date.now();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  }, []);

  const stopMicRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    const duration = Math.round((Date.now() - recordingStartRef.current) / 1000);
    setIsRecording(false);
    setHasRecording(true);
    setNotes((prev) => [
      {
        id: Date.now().toString(),
        title: "New Recording",
        summary: "Recording captured — tap to add notes or let AI transcribe.",
        duration,
        timestamp: new Date(),
        attendees: [],
        actionItems: [],
        tags: ["recording"],
      },
      ...prev,
    ]);
  }, []);

  const toggleMicRecording = () => {
    if (isRecording) stopMicRecording();
    else startMicRecording();
  };

  const handleSend = (_contexts: string[]) => {
    setDrawerOpen(false);
    setTimeout(() => setDispatching(true), 300);
  };

  const handleDispatchComplete = () => {
    setDispatching(false);
    setHasRecording(false);
    setInputText("");
  };

  const handleChatSend = async () => {
    if (!inputText.trim() || isAiLoading) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), from: "user", text: inputText };
    setChatMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsAiLoading(true);

    const allMsgs = [...chatMessages, userMsg].map((m) => ({
      role: m.from === "user" ? ("user" as const) : ("assistant" as const),
      content: m.text,
    }));

    const senderContext = `You are Courier, a helpful AI agent on the sender side. You help the user prepare what to send — organize meeting notes, pick files, and set up calendar permissions. You have access to ${notes.length} meeting notes. Be concise and helpful. Answer in the same language as the user.`;

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setChatMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.from === "agent") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, text: assistantSoFar } : m));
        }
        return [...prev, { id: (Date.now() + 1).toString(), from: "agent", text: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMsgs, context: senderContext }),
      });

      if (!resp.ok || !resp.body) {
        const data = await resp.json().catch(() => ({}));
        upsert(`⚠️ ${data.error || "Something went wrong"}`);
        setIsAiLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;

      while (!done) {
        const { done: rd, value } = await reader.read();
        if (rd) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const p = JSON.parse(json);
            const c = p.choices?.[0]?.delta?.content;
            if (c) upsert(c);
          } catch { buf = line + "\n" + buf; break; }
        }
      }
    } catch (e) {
      console.error(e);
      upsert("⚠️ Connection error");
    }
    setIsAiLoading(false);
  };

  const toggleIntegration = (name: string) => {
    setConnectedIntegrations((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const formatDate = (d: Date) => {
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return "Today";
    if (diff < 172800000) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const showingPanel = panel !== "chat";

  const groupedIntegrations = integrations.reduce<Record<string, Integration[]>>((acc, item) => {
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {});

  const activeContact = sampleContacts.find((c) => c.id === activeContactId);
  const isCourierChat = activeContactId === "courier";

  const pinnedContacts = sampleContacts.filter((c) => c.isPinned);
  const allContacts = sampleContacts.filter((c) => !c.isPinned);
  const filteredPinned = pinnedContacts.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredAll = allContacts.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // ========== CONTACTS LIST VIEW ==========
  if (view === "contacts") {
    return (
      <div className="fixed inset-0 bg-background flex flex-col">
        <div className="h-3 flex-shrink-0" />

        <div className="px-5 pt-2 pb-3 flex-shrink-0 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground tracking-tight">Chats</h1>
          <motion.button
            onClick={() => { setShowFriends(true); setFriendTab("requests"); }}
            className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <Plus size={16} />
          </motion.button>
        </div>

        {/* Search */}
        <div className="px-5 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-secondary/50 ring-subtle">
            <Search size={14} className="text-muted-foreground/50 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto scrollbar-none px-5">
          {/* PINNED */}
          {filteredPinned.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] text-muted-foreground/50 font-semibold uppercase tracking-wider mb-2 px-1">
                Pinned
              </p>
              <div className="space-y-1">
                {filteredPinned.map((contact) => (
                  <motion.button
                    key={contact.id}
                    onClick={() => openContact(contact.id)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-primary/[0.06] ring-1 ring-primary/10 text-left hover:bg-primary/[0.1] transition-colors"
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-secondary/80 flex items-center justify-center text-base">
                        {contact.avatar}
                      </div>
                      {contact.isOnline && (
                        <div className="absolute -bottom-0.5 -left-0.5 w-3 h-3 rounded-full bg-green-500 ring-2 ring-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-primary truncate">{contact.name}</p>
                        <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">{contact.lastMessageTime}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{contact.lastMessage}</p>
                    </div>
                    {contact.unread > 0 && (
                      <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-background">{contact.unread}</span>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* ALL CHATS */}
          {filteredAll.length > 0 && (
            <div>
              <p className="text-[10px] text-muted-foreground/50 font-semibold uppercase tracking-wider mb-2 px-1">
                All Chats
              </p>
              <div className="space-y-0.5">
                {filteredAll.map((contact) => (
                  <motion.button
                    key={contact.id}
                    onClick={() => openContact(contact.id)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left hover:bg-secondary/40 transition-colors"
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="relative flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white ${
                        contact.isAgent ? "bg-secondary/80" : (contact.avatarBg || "bg-muted")
                      }`}>
                        {contact.isAgent ? "⚡" : contact.avatar}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground truncate">
                          {contact.name}
                          {contact.agentName && (
                            <span className="text-muted-foreground/50 font-normal"> ({contact.agentName})</span>
                          )}
                        </p>
                        {contact.lastMessageTime && (
                          <span className="text-[10px] text-muted-foreground/50 flex-shrink-0 ml-2">{contact.lastMessageTime}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground/60 truncate mt-0.5">{contact.lastMessage}</p>
                    </div>
                    {contact.unread > 0 && (
                      <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-background">{contact.unread}</span>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom input hint */}
        <div className="flex-shrink-0 px-5 pb-8 pt-3">
          <div className="flex items-center gap-3 py-3 px-4 rounded-2xl bg-secondary/30 ring-subtle">
            <Mic size={15} className="text-muted-foreground/40 flex-shrink-0" />
            <span className="text-xs text-muted-foreground/40">Record a meeting note...</span>
          </div>
        </div>

        {/* === Friends / Add People Overlay === */}
        <AnimatePresence>
          {showFriends && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFriends(false)}
              />
              <motion.div
                className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-[28px] ring-subtle max-h-[80vh] overflow-auto scrollbar-none"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 32, stiffness: 300 }}
              >
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-8 h-[3px] rounded-full bg-foreground/10" />
                </div>
                <div className="px-5 pb-10 pt-2">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-foreground tracking-tight">Friends</h2>
                    <button onClick={() => setShowFriends(false)} className="text-muted-foreground p-1.5 rounded-lg hover:bg-secondary transition-colors">
                      <X size={18} />
                    </button>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-1 mb-4 p-1 rounded-xl bg-secondary/40">
                    <button
                      onClick={() => setFriendTab("requests")}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                        friendTab === "requests" ? "bg-foreground text-background" : "text-muted-foreground"
                      }`}
                    >
                      Requests · 2
                    </button>
                    <button
                      onClick={() => setFriendTab("add")}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                        friendTab === "add" ? "bg-foreground text-background" : "text-muted-foreground"
                      }`}
                    >
                      Add People
                    </button>
                  </div>

                  {friendTab === "requests" && (
                    <div className="space-y-2">
                      {[
                        { id: "req-sarah", name: "Sarah K", avatar: "S", bg: "bg-rose-500", msg: "Wants to connect with you", time: "2h ago" },
                        { id: "req-mike", name: "Mike P", avatar: "M", bg: "bg-blue-500", msg: "Sent you a friend request", time: "1d ago" },
                      ].map((req) => (
                        <motion.div
                          key={req.id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className={`w-10 h-10 rounded-full ${req.bg} flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}>
                            {req.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{req.name}</p>
                            <p className="text-[10px] text-muted-foreground/60">{req.msg} · {req.time}</p>
                          </div>
                          {acceptedRequests.has(req.id) ? (
                            <span className="text-[10px] text-muted-foreground px-2 py-1 rounded-lg bg-secondary">Added ✓</span>
                          ) : (
                            <div className="flex gap-1.5">
                              <motion.button
                                onClick={() => setAcceptedRequests(prev => new Set(prev).add(req.id))}
                                className="px-3 py-1.5 rounded-lg bg-foreground text-background text-[11px] font-medium"
                                whileTap={{ scale: 0.95 }}
                              >
                                Accept
                              </motion.button>
                              <motion.button
                                className="px-2.5 py-1.5 rounded-lg bg-secondary text-muted-foreground text-[11px]"
                                whileTap={{ scale: 0.95 }}
                              >
                                ✕
                              </motion.button>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {friendTab === "add" && (
                    <div>
                      <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-secondary/50 ring-subtle mb-4">
                        <Search size={14} className="text-muted-foreground/50 flex-shrink-0" />
                        <input
                          type="text"
                          value={friendSearch}
                          onChange={(e) => setFriendSearch(e.target.value)}
                          placeholder="Search by name or email..."
                          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        {[
                          { id: "sug-david", name: "David L", avatar: "D", bg: "bg-orange-500", mutual: "3 mutual friends" },
                          { id: "sug-emma", name: "Emma W", avatar: "E", bg: "bg-pink-500", mutual: "Works at Acme Inc" },
                          { id: "sug-james", name: "James T", avatar: "J", bg: "bg-indigo-500", mutual: "5 mutual friends" },
                          { id: "sug-nina", name: "Nina R", avatar: "N", bg: "bg-teal-500", mutual: "From your contacts" },
                        ].filter(p => !friendSearch || p.name.toLowerCase().includes(friendSearch.toLowerCase()))
                        .map((person) => (
                          <motion.div
                            key={person.id}
                            className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <div className={`w-10 h-10 rounded-full ${person.bg} flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}>
                              {person.avatar}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">{person.name}</p>
                              <p className="text-[10px] text-muted-foreground/60">{person.mutual}</p>
                            </div>
                            {sentRequests.has(person.id) ? (
                              <span className="text-[10px] text-muted-foreground px-2 py-1 rounded-lg bg-secondary">Sent ✓</span>
                            ) : (
                              <motion.button
                                onClick={() => setSentRequests(prev => new Set(prev).add(person.id))}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-foreground text-background text-[11px] font-medium"
                                whileTap={{ scale: 0.95 }}
                              >
                                <UserPlus size={11} />
                                Add
                              </motion.button>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ========== CHAT / DETAIL VIEW (inside a contact) ==========
  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      <div className="h-3 flex-shrink-0" />

      {/* Top Nav Bar */}
      <motion.nav
        className="flex items-center justify-between px-5 py-2.5 flex-shrink-0"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-1">
          {showingPanel ? (
            <button
              onClick={() => { setPanel("chat"); setOpenNoteId(null); setOpenFolderId(null); }}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft size={14} />
              Back
            </button>
          ) : (
            <>
              <button
                onClick={goBackToContacts}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              {isCourierChat && (
                <>
                  <button
                    onClick={() => setPanel("files")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <FolderOpen size={13} />
                    Files
                  </button>
                  <button
                    onClick={() => setPanel("states")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Plug size={13} />
                    States
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {showingPanel && (
          <span className="text-xs font-medium text-foreground">
            {openNoteId ? "Note" : openFolderId === "meeting-notes" ? "Meeting Notes" : openFolderId ? sampleFolders.find(f => f.id === openFolderId)?.name || "Files" : panel === "states" ? "States" : "Files"}
          </span>
        )}

        {isCourierChat && (
          <motion.button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium"
            whileTap={{ scale: 0.94 }}
          >
            <ArrowUpRight size={13} />
            Send
          </motion.button>
        )}

        {!isCourierChat && !showingPanel && (
          <div className="w-16" /> 
        )}
      </motion.nav>

      <div className="h-px bg-foreground/[0.06]" />

      {/* Content */}
      <div className="flex-1 flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          {/* === Chat View === */}
          {panel === "chat" && (
            <motion.div
              key="chat"
              className="flex-1 flex flex-col min-h-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* Chat header */}
              <div className="px-5 pt-4 pb-2 flex items-center gap-3 flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                  activeContact?.isAgent ? "bg-secondary/80" : (activeContact?.avatarBg || "bg-muted")
                } ${!activeContact?.isAgent ? "text-white font-semibold" : ""}`}>
                  {activeContact?.avatar || "⚡"}
                </div>
                <div>
                  <h1 className="text-sm font-semibold text-foreground tracking-tight">{activeContact?.name || "Chat"}</h1>
                  {isCourierChat && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {notes.length} note{notes.length !== 1 ? "s" : ""} · {sampleFolders.length} folders
                    </p>
                  )}
                  {activeContact?.isAgent && !isCourierChat && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">Agent</p>
                  )}
                </div>
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-auto scrollbar-none px-5 py-2 space-y-2">
                {isCourierChat ? (
                  <>
                    {chatMessages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div
                          className={`max-w-[80%] px-3.5 py-2.5 text-xs leading-relaxed ${
                            msg.from === "user"
                              ? "bg-foreground text-background rounded-2xl rounded-br-md"
                              : "bg-secondary/60 text-foreground rounded-2xl rounded-bl-md"
                          }`}
                        >
                          {msg.from === "agent" ? (
                            <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5">
                              <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                          ) : (
                            msg.text
                          )}
                        </div>
                      </motion.div>
                    ))}
                    {isAiLoading && chatMessages[chatMessages.length - 1]?.from !== "agent" && (
                      <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="bg-secondary/60 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
                          <motion.span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                          <motion.span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }} />
                          <motion.span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }} />
                        </div>
                      </motion.div>
                    )}
                  </>
                ) : (
                  /* Non-courier contact: show messages */
                  <>
                    {(contactMessages[activeContactId || ""] || []).map((msg) => (
                      <motion.div
                        key={msg.id}
                        className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div
                          className={`max-w-[80%] px-3.5 py-2.5 text-xs leading-relaxed ${
                            msg.from === "user"
                              ? "bg-foreground text-background rounded-2xl rounded-br-md"
                              : "bg-secondary/60 text-foreground rounded-2xl rounded-bl-md"
                          }`}
                        >
                          {msg.from === "agent" ? (
                            <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5">
                              <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                          ) : (
                            msg.text
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Recording inline bar */}
              <AnimatePresence>
                {isRecording && isCourierChat && (
                  <motion.div
                    className="px-5 pb-2 flex-shrink-0"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-destructive/10 ring-1 ring-destructive/20">
                      <motion.div
                        className="w-2.5 h-2.5 rounded-full bg-destructive"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1.2 }}
                      />
                      <div className="flex items-end gap-[2px] h-4 flex-1">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-[2px] rounded-full bg-foreground/40"
                            animate={{ height: [2, Math.random() * 14 + 2, 2] }}
                            transition={{ duration: 0.3 + Math.random() * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.03 }}
                          />
                        ))}
                      </div>
                      <motion.button
                        onClick={stopMicRecording}
                        className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center flex-shrink-0"
                        whileTap={{ scale: 0.9 }}
                      >
                        <Square size={11} className="text-background" fill="currentColor" />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input bar */}
              <div className="px-5 pb-8 pt-3 flex-shrink-0">
                <div className="flex items-center gap-2 bg-secondary/50 rounded-2xl ring-subtle px-3 py-1.5">
                  {isCourierChat && (
                    <motion.button
                      onClick={toggleMicRecording}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                        isRecording ? "bg-destructive text-destructive-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                      whileTap={{ scale: 0.9 }}
                    >
                      {isRecording ? <Square size={12} fill="currentColor" /> : <Mic size={15} />}
                    </motion.button>
                  )}
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (isCourierChat ? handleChatSend() : null)}
                    placeholder={isCourierChat ? "Talk to your agent..." : `Message ${activeContact?.name || ""}...`}
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none py-2"
                  />
                  <motion.button
                    onClick={isCourierChat ? handleChatSend : undefined}
                    className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center flex-shrink-0"
                    whileTap={{ scale: 0.9 }}
                  >
                    <Send size={14} className="text-background" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* === Files Panel — Folder List === */}
          {panel === "files" && !openFolderId && !openNoteId && (
            <motion.div
              key="files"
              className="flex-1 overflow-auto scrollbar-none px-5 pt-4 pb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="space-y-2">
                <motion.button
                  onClick={() => setOpenFolderId("meeting-notes")}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-secondary/40 ring-subtle text-left hover:bg-secondary/60 transition-colors"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-8 h-8 rounded-xl bg-foreground/[0.06] flex items-center justify-center flex-shrink-0 text-sm">🎙️</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">Meeting Notes</p>
                    <p className="text-[10px] text-muted-foreground">{notes.length} notes</p>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground/30" />
                </motion.button>

                {sampleFolders.map((folder) => (
                  <motion.button
                    key={folder.id}
                    onClick={() => setOpenFolderId(folder.id)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-secondary/40 ring-subtle text-left hover:bg-secondary/60 transition-colors"
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-8 h-8 rounded-xl bg-foreground/[0.06] flex items-center justify-center flex-shrink-0 text-sm">{folder.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">{folder.name}</p>
                      <p className="text-[10px] text-muted-foreground">{folder.files.length} files</p>
                    </div>
                    <ChevronRight size={14} className="text-muted-foreground/30" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* === Files Panel — Meeting Notes List === */}
          {panel === "files" && openFolderId === "meeting-notes" && !openNoteId && (
            <motion.div
              key="meeting-notes"
              className="flex-1 flex flex-col min-h-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="px-5 pt-4 pb-2 flex-shrink-0 flex items-center gap-2">
                <span className="text-sm">🎙️</span>
                <h2 className="text-sm font-semibold text-foreground">Meeting Notes</h2>
                <span className="text-[10px] text-muted-foreground ml-1">{notes.length}</span>
              </div>
              <div className="flex-1 overflow-auto scrollbar-none px-5 pb-4">
                <div className="space-y-1.5">
                  {notes.map((note) => (
                    <motion.button
                      key={note.id}
                      onClick={() => setOpenNoteId(note.id)}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left hover:bg-secondary/40 transition-colors"
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-7 h-7 rounded-lg bg-foreground/[0.06] flex items-center justify-center flex-shrink-0">
                        <FileText size={13} className="text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-foreground truncate">{note.title}</p>
                        <p className="text-[9px] text-muted-foreground/50">
                          {formatDate(note.timestamp)} · {formatDuration(note.duration)} · {note.attendees.length} people
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setNotes((prev) => prev.filter((n) => n.id !== note.id)); }}
                        className="text-muted-foreground/20 hover:text-muted-foreground transition-colors p-1"
                      >
                        <Trash2 size={11} />
                      </button>
                    </motion.button>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0 px-5 pb-8 pt-3">
                <button
                  onClick={() => setOpenFolderId(null)}
                  className="w-full py-3 rounded-2xl bg-secondary/40 ring-subtle text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back to Files
                </button>
              </div>
            </motion.div>
          )}

          {/* === Files Panel — Note Detail === */}
          {panel === "files" && openNoteId && (() => {
            const note = notes.find((n) => n.id === openNoteId);
            if (!note) return null;
            return (
              <motion.div
                key={`note-${note.id}`}
                className="flex-1 flex flex-col min-h-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex-1 overflow-auto scrollbar-none px-5 pt-4 pb-8">
                  <h2 className="text-base font-semibold text-foreground tracking-tight">{note.title}</h2>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock size={10} />{formatDate(note.timestamp)} · {formatDuration(note.duration)}</span>
                    <span className="flex items-center gap-1"><Users size={10} />{note.attendees.length || "—"}</span>
                  </div>
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {note.tags.map((tag) => (
                        <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-[10px] text-muted-foreground"><Tag size={8} />{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-5">
                    <h3 className="text-xs font-semibold text-foreground mb-2">Summary</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{note.summary}</p>
                  </div>
                  {note.attendees.length > 0 && (
                    <div className="mt-5">
                      <h3 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5"><Users size={12} />Attendees</h3>
                      <div className="flex flex-wrap gap-2">
                        {note.attendees.map((a) => (<span key={a} className="px-2.5 py-1 rounded-xl bg-secondary/60 ring-subtle text-xs text-foreground">{a}</span>))}
                      </div>
                    </div>
                  )}
                  {note.actionItems.length > 0 && (
                    <div className="mt-5">
                      <h3 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5"><CheckSquare size={12} />Action Items</h3>
                      <div className="space-y-2">
                        {note.actionItems.map((item, i) => (
                          <div key={i} className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-secondary/30">
                            <div className="w-4 h-4 mt-0.5 rounded border border-foreground/15 flex-shrink-0" />
                            <p className="text-xs text-foreground/80 leading-relaxed">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 px-5 pb-8 pt-3">
                  <button onClick={() => setOpenNoteId(null)} className="w-full py-3 rounded-2xl bg-secondary/40 ring-subtle text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                    ← Back
                  </button>
                </div>
              </motion.div>
            );
          })()}

          {/* === Files Panel — Regular Folder Contents === */}
          {panel === "files" && openFolderId && openFolderId !== "meeting-notes" && !openNoteId && (() => {
            const folder = sampleFolders.find((f) => f.id === openFolderId);
            if (!folder) return null;

            const fileIcon = (type: string) => {
              switch (type) {
                case "pdf": return <FileText size={13} className="text-red-400" />;
                case "doc": return <FileText size={13} className="text-blue-400" />;
                case "sheet": return <Table size={13} className="text-green-400" />;
                case "image": return <Image size={13} className="text-purple-400" />;
                case "figma": return <Presentation size={13} className="text-pink-400" />;
                case "slide": return <Presentation size={13} className="text-orange-400" />;
                case "md": return <Code size={13} className="text-muted-foreground" />;
                case "link": return <Link2 size={13} className="text-cyan-400" />;
                default: return <File size={13} className="text-muted-foreground" />;
              }
            };

            return (
              <motion.div
                key={`folder-${folder.id}`}
                className="flex-1 flex flex-col min-h-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="px-5 pt-4 pb-2 flex-shrink-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{folder.icon}</span>
                    <h2 className="text-sm font-semibold text-foreground">{folder.name}</h2>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{folder.files.length} files</p>
                </div>
                <div className="flex-1 overflow-auto scrollbar-none px-5 pb-4">
                  <div className="space-y-1">
                    {folder.files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-secondary/40 transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-foreground/[0.06] flex items-center justify-center flex-shrink-0">
                          {fileIcon(file.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium text-foreground truncate">{file.name}</p>
                          <p className="text-[9px] text-muted-foreground/50">{file.size} · {formatDate(file.updatedAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-shrink-0 px-5 pb-8 pt-3">
                  <button
                    onClick={() => setOpenFolderId(null)}
                    className="w-full py-3 rounded-2xl bg-secondary/40 ring-subtle text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Back to Folders
                  </button>
                </div>
              </motion.div>
            );
          })()}

          {/* === States Panel === */}
          {panel === "states" && (
            <motion.div
              key="states"
              className="flex-1 overflow-auto scrollbar-none px-5 pt-4 pb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {Object.entries(groupedIntegrations).map(([category, items]) => (
                <div key={category} className="mb-5">
                  <p className="text-[10px] text-muted-foreground/50 font-medium uppercase tracking-wider mb-2 px-1">{category}</p>
                  <div className="space-y-1.5">
                    {items.map((item) => {
                      const isConnected = connectedIntegrations.has(item.name);
                      return (
                        <motion.button
                          key={item.name}
                          onClick={() => toggleIntegration(item.name)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all ${
                            isConnected ? "bg-foreground/[0.08] ring-1 ring-foreground/20" : "bg-secondary/40 ring-subtle"
                          }`}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="w-8 h-8 rounded-xl bg-foreground/[0.06] flex items-center justify-center flex-shrink-0 text-sm">{item.icon}</div>
                          <span className="flex-1 text-xs font-medium text-foreground">{item.name}</span>
                          <span className={`text-[10px] font-medium ${isConnected ? "text-green-400" : "text-muted-foreground/40"}`}>
                            {isConnected ? "Connected" : "Connect"}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ContextDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSend={handleSend}
        hasRecording={hasRecording}
        notes={notes}
      />

      <AgentDispatchAnimation
        isActive={dispatching}
        onComplete={handleDispatchComplete}
      />
    </div>
  );
};

export default Index;
