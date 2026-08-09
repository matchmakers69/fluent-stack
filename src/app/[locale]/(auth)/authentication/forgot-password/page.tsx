import { CredentialColumn } from "@/features/auth/components/CredentialColumn";
import { HeroAuthColumn } from "@/features/auth/components/HeroAuthColumn";
import { HeroContent } from "@/features/auth/components/HeroContent";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import { SectionHeading } from "@/shared/components/layout/SectionHeading";
import { useTranslations } from "next-intl";

export default function ForgotPasswordPage() {
  const t = useTranslations("authentication");
  return (
    <section className="flex w-full flex-col lg:flex-row">
      <HeroAuthColumn image="/images/auth/forgot-password-hero.jpg">
        <HeroContent headline={t("forgotPassword.hero.headline")} subtext={t("forgotPassword.hero.subtext")} />
      </HeroAuthColumn>
      <CredentialColumn>
        <div className="flex flex-col gap-8 w-full">
          <SectionHeading
            label={t("forgotPassword.label")}
            title={t("forgotPassword.title")}
            description={t("forgotPassword.description")}
          />
          <ForgotPasswordForm />
        </div>
      </CredentialColumn>
    </section>
  );
}
