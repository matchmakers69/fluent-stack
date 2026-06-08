interface HeroContentProps {
  headline: string;
  subtext: string;
}

export function HeroContent({ headline, subtext }: HeroContentProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-[family-name:var(--font-display)] text-4xl leading-tight text-white xl:text-5xl">
        {headline}
      </h2>
      <p className="text-lg font-semibold leading-relaxed text-white/80 xl:text-xl">
        {subtext}
      </p>
    </div>
  );
}
