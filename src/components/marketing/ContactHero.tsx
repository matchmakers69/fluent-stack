import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/shared";
import { ContactForm } from "./ContactForm";
import { SocialLinks } from "./ContactSocialLinks";

export function ContactHero() {
  const t = useTranslations("contact");

  return (
    <section id="contact-page">
      <div className="px-8 md:px-16 lg:px-20 pt-6 md:pt-8">
        <h1>{t("title")}</h1>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[50%_50%]">
        <div className="lg:max-w-2xl w-full mx-auto flex flex-col px-8 md:px-16 lg:px-20 py-10">
          <ContactForm />
        </div>
        <div className="lg:max-w-2xl w-full mx-auto flex flex-col px-8 md:px-16 lg:px-20 py-10 gap-8">
          <SectionHeading label={t("social.sectionLabel")} title={t("social.sectionTitle")} />
          <SocialLinks />
        </div>
      </div>
    </section>
  );
}
