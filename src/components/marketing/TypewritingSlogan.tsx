"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const examples = [
  "Stop translating. Start thinking in English.",
  "What if English just... clicked?",
];

const LETTER_DELAY = 0.025;
const BOX_FADE_DURATION = 0.25;
const FADE_DELAY = 5;
const MAIN_FADE_DURATION = 0.25;
const SWAP_DELAY_IN_MS = 5500;

export function TypewritingSlogan() {
  const [exampleIndex, setExampleIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setExampleIndex((pv) => (pv + 1) % examples.length);
    }, SWAP_DELAY_IN_MS);

    return () => clearInterval(intervalId);
  }, []);
  return (
    <div>
      <p className="text-sm text-left font-semibold uppercase leading-relaxed text-navy/80 xl:text-md">
        {examples[exampleIndex].split("").map((letter, index) => {
          return (
            <motion.span
              initial={{
                opacity: 1,
              }}
              animate={{
                opacity: 0,
              }}
              transition={{
                delay: FADE_DELAY,
                duration: MAIN_FADE_DURATION,
                ease: "easeInOut",
              }}
              className="parent-text relative"
              key={`${exampleIndex}-${index}`}
            >
              <motion.span
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  delay: index * LETTER_DELAY,
                  duration: 0,
                }}
              >
                {letter}
              </motion.span>
              <motion.span
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: [0, 1, 0],
                }}
                transition={{
                  delay: index * LETTER_DELAY,
                  times: [0, 0.1, 1],
                  duration: BOX_FADE_DURATION,
                  ease: "easeInOut",
                }}
                className="mask-text absolute bottom-0.75 left-px right-0 top-0.75 bg-navy"
              />
            </motion.span>
          );
        })}
      </p>
    </div>
  );
}
