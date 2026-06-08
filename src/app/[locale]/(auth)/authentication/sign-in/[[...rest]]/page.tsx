import { CredentialColumn, HeroAuthColumn, HeroContent, SignInForm } from "@/components/auth";
import { SectionHeading } from "@/components/shared";
import { useTranslations } from "next-intl";

export default function SignInPage() {
  const t = useTranslations("authentication");
  return (
    <section className="flex w-full flex-col lg:flex-row">
      <HeroAuthColumn image="/images/auth/login-hero.jpg">
        <HeroContent headline={t("signIn.hero.headline")} subtext={t("signIn.hero.subtext")} />
      </HeroAuthColumn>
      <CredentialColumn>
        <div className="flex flex-col gap-8 w-full">
          <SectionHeading
            label={t("signIn.label")}
            title={t("signIn.title")}
            description={t("signIn.description")}
          />
          <SignInForm />
        </div>
      </CredentialColumn>
    </section>
  );
}
