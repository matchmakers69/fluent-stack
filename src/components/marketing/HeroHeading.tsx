import { TextReveal } from "@/components/shared";

export function HeroHeading() {
  return (
    <h1 className="text-[clamp(1.5rem,6vw,5rem)] leading-none uppercase">
      <TextReveal
        lines={[
          {
            text: "Speak English.",
            maskColor: "var(--uk-blue)",
            direction: "right",
          },
          {
            text: "Sound British.",
            maskColor: "var(--uk-red)",
            direction: "left",
            className: "md:ms-auto",
          },
        ]}
      />
    </h1>
  );
}
