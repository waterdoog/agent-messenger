import { motion } from "framer-motion";
import { Bot, Briefcase } from "lucide-react";

interface AgentCharacterProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

const AgentCharacter = ({ size = 48, className = "", animate = false }: AgentCharacterProps) => {
  return (
    <motion.div
      className={`relative inline-flex flex-col items-center ${className}`}
      animate={animate ? { y: [0, -4, 0] } : undefined}
      transition={animate ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      <div
        className="rounded-full bg-primary flex items-center justify-center shadow-deep"
        style={{ width: size, height: size }}
      >
        <Bot size={size * 0.55} className="text-primary-foreground" />
      </div>
      <Briefcase
        size={size * 0.35}
        className="text-primary -mt-1"
      />
    </motion.div>
  );
};

export default AgentCharacter;
