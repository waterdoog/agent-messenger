import { useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { Shield, X, Check, AlertTriangle } from "lucide-react";

export interface EscalationRequest {
  id: string;
  guestName: string;
  guestAvatar: string;
  guestAvatarBg: string;
  agentName: string;
  request: string;
  detail: string;
  timestamp: string;
  severity: "low" | "medium" | "high";
}

interface EscalationCardProps {
  escalation: EscalationRequest;
  onApprove: (id: string) => void;
  onDeny: (id: string) => void;
}

const severityConfig = {
  low: { label: "Low", dotClass: "bg-emerald-500" },
  medium: { label: "Medium", dotClass: "bg-amber-500" },
  high: { label: "High", dotClass: "bg-destructive" },
};

const EscalationCard = ({ escalation, onApprove, onDeny }: EscalationCardProps) => {
  const [resolved, setResolved] = useState<"approved" | "denied" | null>(null);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-8, 0, 8]);
  const approveOpacity = useTransform(x, [0, 80], [0, 1]);
  const denyOpacity = useTransform(x, [-80, 0], [1, 0]);
  const bgColor = useTransform(
    x,
    [-120, -40, 0, 40, 120],
    [
      "rgba(239,68,68,0.15)",
      "rgba(239,68,68,0.05)",
      "rgba(0,0,0,0)",
      "rgba(34,197,94,0.05)",
      "rgba(34,197,94,0.15)",
    ]
  );

  const sev = severityConfig[escalation.severity];

  const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    const swipeThreshold = 100;
    const velocityThreshold = 300;
    if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      setResolved("approved");
      onApprove(escalation.id);
    } else if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      setResolved("denied");
      onDeny(escalation.id);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {resolved ? (
        <motion.div
          key="resolved"
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-medium ${
            resolved === "approved"
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-destructive/10 text-destructive"
          }`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {resolved === "approved" ? <Check size={14} /> : <X size={14} />}
          <span>
            {resolved === "approved" ? "Approved" : "Denied"} — {escalation.guestName}'s request
          </span>
        </motion.div>
      ) : (
        <motion.div
          key="card"
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
          transition={{ duration: 0.4, type: "spring", damping: 20 }}
        >
          {/* Swipe hints - always visible */}
          <div className="flex items-center justify-between px-2 mb-1.5">
            <span className="text-[10px] text-destructive/70 font-medium flex items-center gap-1">
              <X size={10} /> 左滑拒绝
            </span>
            <motion.span
              className="text-[10px] text-destructive font-semibold flex items-center gap-1"
              style={{ opacity: denyOpacity }}
            >
              Deny ✕
            </motion.span>
            <motion.span
              className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1"
              style={{ opacity: approveOpacity }}
            >
              ✓ Approve
            </motion.span>
            <span className="text-[10px] text-emerald-400/70 font-medium flex items-center gap-1">
              右滑通过 <Check size={10} />
            </span>
          </div>

          <motion.div
            className="rounded-2xl ring-1 ring-foreground/[0.08] overflow-hidden cursor-grab active:cursor-grabbing"
            style={{ x, rotate, backgroundColor: bgColor }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
            whileTap={{ scale: 0.98 }}
          >
            {/* Header */}
            <div className="px-4 pt-3.5 pb-2 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={13} className="text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-foreground">Escalation Request</p>
                <p className="text-[9px] text-muted-foreground/60">{escalation.timestamp}</p>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary/50">
                <div className={`w-1.5 h-1.5 rounded-full ${sev.dotClass}`} />
                <span className="text-[9px] text-muted-foreground font-medium">{sev.label}</span>
              </div>
            </div>

            {/* Guest info */}
            <div className="px-4 pb-2.5">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-6 h-6 rounded-full ${escalation.guestAvatarBg} flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0`}
                >
                  {escalation.guestAvatar}
                </div>
                <span className="text-[11px] text-foreground font-medium">{escalation.guestName}</span>
                <span className="text-[9px] text-muted-foreground/50">→ via {escalation.agentName}</span>
              </div>
              <p className="text-xs text-foreground/90 font-medium leading-snug">{escalation.request}</p>
              <p className="text-[10px] text-muted-foreground/70 mt-1 leading-relaxed">{escalation.detail}</p>
            </div>

            {/* Swipe indicator bar */}
            <div className="px-4 pb-3 pt-1">
              <div className="flex items-center justify-center gap-2 py-1.5 rounded-xl bg-foreground/[0.04]">
                <span className="text-[9px] text-muted-foreground/40 tracking-wide">← swipe to decide →</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EscalationCard;
