import { useTranslations } from "next-intl";
import { HeroHeading } from "./HeroHeading";
import { HeroSlider } from "./HeroSlider";
import { TypewritingSlogan } from "./TypewritingSlogan";

export function Hero() {
  const t = useTranslations("home");

  return (
    <section className="flex w-full flex-col lg:flex-row overflow-hidden">
      <div className="intro-slider relative flex w-full flex-col items-center justify-center scroll-touch lg:min-h-screen lg:w-[50%]">
        <HeroSlider />

        {/* Vertical label — right edge of slider column, desktop only */}
        <div className="absolute right-4 lg:right-5 inset-y-0 z-30 hidden lg:flex items-end pb-6 pointer-events-none">
          <p
            className="text-white/70 uppercase font-bold tracking-[0.22em] text-[0.8rem]"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            {t("sliderLabel")}
          </p>
        </div>
      </div>

      <div
        id="hero-text-intro"
        className="flex flex-col justify-center overflow-hidden relative w-full items-center scroll-touch lg:min-h-screen lg:w-[50%]"
      >
        <div className="flex w-full intro-content gap-2 lg:max-w-150 flex-col px-6 lg:px-20 py-8 lg:py-10">
          <HeroHeading />
          <TypewritingSlogan />
        </div>
      </div>
    </section>
  );
}
