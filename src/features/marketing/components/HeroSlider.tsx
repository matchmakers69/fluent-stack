"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Image from "next/image";

const slides = [
  { id: 1, src: "/images/hero/slide-1.jpg" },
  { id: 2, src: "/images/hero/slide-2.jpg" },
  { id: 3, src: "/images/hero/slide-3.jpg" },
  { id: 4, src: "/images/hero/slide-4.jpg" },
  { id: 5, src: "/images/hero/slide-5.jpg" },
];

const INTERVAL_MS = 4500;

export function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    // Mobile: fixed aspect-ratio height so the slider has dimensions.
    // Desktop (lg): absolute inset-0 fills the full-height parent column.
    <div className="relative w-full h-[60vw] lg:h-auto lg:absolute lg:inset-0 overflow-hidden">
      {/* Cross-dissolve + Ken Burns scale — all rendered, opacity/scale toggled */}
      {slides.map((slide, i) => (
        <motion.div
          key={slide.id}
          className="absolute inset-0 z-10 pointer-events-none"
          initial={{ opacity: 0, scale: 1 }}
          animate={{
            opacity: i === current ? 1 : 0,
            scale: i === current ? 1.12 : 1,
          }}
          transition={{
            opacity: { duration: 2, ease: [0.4, 0, 0.2, 1] },
            scale: {
              duration: i === current ? 12 : 0.6,
              ease: "linear",
            },
          }}
        >
          <Image
            src={slide.src}
            alt=""
            fill
            priority={i === 0}
            sizes="(max-width: 1024px) 100vw, 50vw"
            style={{ objectFit: "cover" }}
          />
        </motion.div>
      ))}

      {/* British accent — curtain wipe from left: blue first, red second */}
      <motion.div
        className="absolute inset-y-0 right-0 w-1/2 z-10 pointer-events-none bg-uk-blue/50"
        initial={{ clipPath: "inset(0% 100% 0% 0%)" }}
        animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
        transition={{ duration: 0.9, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
      />
      <motion.div
        className="absolute inset-y-0 left-0 w-1/2 z-10 pointer-events-none bg-uk-red/25"
        initial={{ clipPath: "inset(0% 100% 0% 0%)" }}
        animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
        transition={{ duration: 0.5, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
      />
    </div>
  );
}
