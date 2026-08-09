"use client";
import { motion } from "motion/react";

export const SocialLinks = () => {
  return (
    <section className="flex flex-col gap-6">
      <FlipSocialLink href="#">Twitter</FlipSocialLink>
      <FlipSocialLink href="#">Linkedin</FlipSocialLink>
      <FlipSocialLink href="#">Facebook</FlipSocialLink>
      <FlipSocialLink href="#">Instagram</FlipSocialLink>
    </section>
  );
};

const DURATION = 0.25;
const STAGGER = 0.025;

const FlipSocialLink = ({ children, href }: { children: string; href: string }) => {
  return (
    <motion.a
      initial="initial"
      whileHover="hovered"
      href={href}
      className="flip-link relative block overflow-hidden whitespace-nowrap text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black uppercase leading-none text-muted-foreground"
      style={{ fontFamily: "var(--font-display)" }}
    >
      <div>
        {children.split("").map((l, i) => (
          <motion.span
            key={i}
            variants={{
              initial: { y: 0 },
              hovered: { y: "-100%" },
            }}
            transition={{ duration: DURATION, ease: "easeInOut", delay: STAGGER * i }}
            className="inline-block"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {l}
          </motion.span>
        ))}
      </div>
      <div className="absolute top-0 left-0 text-secondary" aria-hidden="true">
        {children.split("").map((l, i) => (
          <motion.span
            key={i}
            variants={{
              initial: { y: "100%" },
              hovered: { y: 0 },
            }}
            transition={{ duration: DURATION, ease: "easeInOut", delay: STAGGER * i }}
            className="inline-block"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {l}
          </motion.span>
        ))}
      </div>
    </motion.a>
  );
};
