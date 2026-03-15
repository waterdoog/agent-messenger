import { motion } from "framer-motion";

interface AgentCharacterProps {
  size?: number;
  className?: string;
  animate?: boolean;
  walking?: boolean;
}

const AgentCharacter = ({ size = 48, className = "", animate = false, walking = false }: AgentCharacterProps) => {
  const scale = size / 64;

  return (
    <motion.div
      className={`relative inline-flex items-end ${className}`}
      style={{ width: size * 1.2, height: size * 1.6 }}
    >
      <svg
        viewBox="0 0 80 110"
        fill="none"
        style={{ width: "100%", height: "100%" }}
      >
        {/* Head */}
        <motion.circle
          cx="40"
          cy="18"
          r="13"
          fill="hsl(var(--foreground))"
          animate={animate ? { cy: [18, 16, 18] } : undefined}
          transition={animate ? { duration: 0.5, repeat: Infinity, ease: "easeInOut" } : undefined}
        />
        {/* Eyes */}
        <circle cx="35" cy="16" r="2" fill="hsl(var(--background))" />
        <circle cx="45" cy="16" r="2" fill="hsl(var(--background))" />
        {/* Smile */}
        <path
          d="M36 22 Q40 26 44 22"
          stroke="hsl(var(--background))"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Body */}
        <motion.line
          x1="40" y1="31" x2="40" y2="58"
          stroke="hsl(var(--foreground))"
          strokeWidth="3.5"
          strokeLinecap="round"
          animate={animate ? { y1: [31, 29, 31] } : undefined}
          transition={animate ? { duration: 0.5, repeat: Infinity, ease: "easeInOut" } : undefined}
        />

        {/* Left arm holding briefcase */}
        <motion.path
          d="M40 38 L26 50 L26 56"
          stroke="hsl(var(--foreground))"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          animate={animate ? { d: ["M40 38 L26 50 L26 56", "M40 36 L26 48 L26 54", "M40 38 L26 50 L26 56"] } : undefined}
          transition={animate ? { duration: 0.5, repeat: Infinity, ease: "easeInOut" } : undefined}
        />

        {/* Right arm */}
        <motion.path
          d="M40 38 L56 48"
          stroke="hsl(var(--foreground))"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          animate={walking ? {
            d: ["M40 38 L56 48", "M40 38 L54 44", "M40 38 L56 48"]
          } : undefined}
          transition={walking ? { duration: 0.4, repeat: Infinity, ease: "easeInOut" } : undefined}
        />

        {/* Left leg */}
        <motion.line
          x1="40" y1="58" x2="30" y2="82"
          stroke="hsl(var(--foreground))"
          strokeWidth="3"
          strokeLinecap="round"
          animate={walking ? {
            x2: [30, 34, 30],
            y2: [82, 80, 82],
          } : undefined}
          transition={walking ? { duration: 0.4, repeat: Infinity, ease: "easeInOut" } : undefined}
        />
        {/* Left foot */}
        <motion.line
          x1="30" y1="82" x2="24" y2="84"
          stroke="hsl(var(--foreground))"
          strokeWidth="2.5"
          strokeLinecap="round"
          animate={walking ? {
            x1: [30, 34, 30],
            y1: [82, 80, 82],
            x2: [24, 28, 24],
            y2: [84, 82, 84],
          } : undefined}
          transition={walking ? { duration: 0.4, repeat: Infinity, ease: "easeInOut" } : undefined}
        />

        {/* Right leg */}
        <motion.line
          x1="40" y1="58" x2="50" y2="82"
          stroke="hsl(var(--foreground))"
          strokeWidth="3"
          strokeLinecap="round"
          animate={walking ? {
            x2: [50, 46, 50],
            y2: [82, 80, 82],
          } : undefined}
          transition={walking ? { duration: 0.4, repeat: Infinity, ease: "easeInOut", delay: 0.2 } : undefined}
        />
        {/* Right foot */}
        <motion.line
          x1="50" y1="82" x2="56" y2="84"
          stroke="hsl(var(--foreground))"
          strokeWidth="2.5"
          strokeLinecap="round"
          animate={walking ? {
            x1: [50, 46, 50],
            y1: [82, 80, 82],
            x2: [56, 52, 56],
            y2: [84, 82, 84],
          } : undefined}
          transition={walking ? { duration: 0.4, repeat: Infinity, ease: "easeInOut", delay: 0.2 } : undefined}
        />

        {/* Briefcase */}
        <motion.g
          animate={animate ? { y: [0, -2, 0] } : undefined}
          transition={animate ? { duration: 0.5, repeat: Infinity, ease: "easeInOut" } : undefined}
        >
          {/* Briefcase handle */}
          <rect x="19" y="53" width="14" height="2" rx="1" fill="hsl(var(--foreground))" />
          {/* Briefcase body */}
          <rect x="14" y="55" width="24" height="16" rx="3" fill="hsl(var(--foreground))" />
          {/* Briefcase clasp */}
          <rect x="23" y="61" width="6" height="4" rx="1" fill="hsl(var(--background))" />
        </motion.g>
      </svg>
    </motion.div>
  );
};

export default AgentCharacter;
