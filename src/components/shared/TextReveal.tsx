"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";

interface Line {
  text: string;
  maskColor: string;
  direction: "left" | "right";
  className?: string;
}

interface TextRevealProps {
  lines: Line[];
  className?: string;
  delay?: number;
}

export function TextReveal({ lines, className, delay = 0.2 }: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className={className}>
      {lines.map((line, index) => {
        const lineDelay = delay + index * 0.25;
        const duration = 1.0;
        const splitPoint = 0.45;

        // All four inset() values use consistent "0%" so motion can interpolate
        // smoothly — mixing bare "0" with "0%" breaks the tween.
        // "right": grows from left edge, exits off the right
        // "left":  grows from right edge, exits off the left
        const clipHidden =
          line.direction === "right" ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 0% 100%)";
        const clipFull = "inset(0% 0% 0% 0%)";
        const clipExited =
          line.direction === "right" ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)";

        return (
          <span
            key={index}
            style={{ display: "block", fontSize: "inherit" }}
            className={line.className}
          >
            <span
              style={{
                display: "inline-block",
                position: "relative",
                overflow: "hidden",
                fontSize: "inherit",
              }}
            >
              {/* Text: hidden until the mask finishes growing and begins its exit */}
              <motion.span
                style={{ display: "block", fontSize: "inherit" }}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{
                  duration: 0.01,
                  delay: lineDelay + duration * splitPoint,
                }}
              >
                {line.text}
              </motion.span>

              {/* Colored mask */}
              <motion.span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  backgroundColor: line.maskColor,
                }}
                initial={{ clipPath: clipHidden }}
                animate={
                  isInView
                    ? { clipPath: [clipHidden, clipFull, clipExited] }
                    : { clipPath: clipHidden }
                }
                transition={{
                  duration,
                  delay: lineDelay,
                  times: [0, splitPoint, 1],
                  ease: ["easeIn", [0.77, 0, 0.175, 1]],
                }}
              />
            </span>
          </span>
        );
      })}
    </div>
  );
}
