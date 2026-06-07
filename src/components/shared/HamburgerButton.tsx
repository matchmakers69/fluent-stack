"use client";

import { MotionConfig, motion } from "motion/react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  top: {
    open: {
      rotate: ["0deg", "0deg", "45deg"],
      top: ["28%", "50%", "50%"],
      x: "-50%",
      y: "-50%",
    },
    closed: {
      rotate: ["45deg", "0deg", "0deg"],
      top: ["50%", "50%", "28%"],
      x: "-50%",
      y: "-50%",
    },
  },
  middle: {
    open: {
      rotate: ["0deg", "0deg", "-45deg"],
      x: "-50%",
      y: "-50%",
    },
    closed: {
      rotate: ["-45deg", "0deg", "0deg"],
      x: "-50%",
      y: "-50%",
    },
  },
  bottom: {
    open: {
      rotate: ["0deg", "0deg", "45deg"],
      bottom: ["28%", "50%", "50%"],
      left: "50%",
      x: "-50%",
      y: "50%",
    },
    closed: {
      rotate: ["45deg", "0deg", "0deg"],
      bottom: ["50%", "50%", "28%"],
      left: "calc(50% + 8px)",
      x: "-50%",
      y: "50%",
    },
  },
};

interface HamburgerButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export function HamburgerButton({
  isOpen,
  onToggle,
  className,
}: HamburgerButtonProps) {
  return (
    <MotionConfig transition={{ duration: 0.5, ease: "easeInOut" }}>
      <motion.button
        initial={false}
        animate={isOpen ? "open" : "closed"}
        onClick={onToggle}
        className={cn("relative h-10 w-10 cursor-pointer", className)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <motion.span
          variants={VARIANTS.top}
          className="absolute h-1 w-8 bg-current left-1/2 top-[28%]"
        />
        <motion.span
          variants={VARIANTS.middle}
          className="absolute h-1 w-8 bg-current left-1/2 top-1/2"
        />
        <motion.span
          variants={VARIANTS.bottom}
          className="absolute h-1 w-4 bg-current bottom-[28%]"
        />
      </motion.button>
    </MotionConfig>
  );
}
