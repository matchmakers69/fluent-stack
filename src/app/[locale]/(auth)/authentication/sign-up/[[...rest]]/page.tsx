import { CredentialColumn, HeroAuthColumn, HeroContent, SignUpForm } from "@/components/auth";
import { SectionHeading } from "@/components/shared";
import { useTranslations } from "next-intl";

export default function SignUpPage() {
  const t = useTranslations("authentication");
  return (
    <section className="flex w-full flex-col lg:flex-row">
      <HeroAuthColumn image="/images/auth/register-hero.jpg">
        <HeroContent headline={t("signUp.hero.headline")} subtext={t("signUp.hero.subtext")} />
      </HeroAuthColumn>
      <CredentialColumn>
        <div className="flex flex-col gap-8 w-full">
          <SectionHeading
            label={t("signUp.label")}
            title={t("signUp.title")}
            description={t("signUp.description")}
          />
          <SignUpForm />
        </div>
      </CredentialColumn>
    </section>
  );
}
