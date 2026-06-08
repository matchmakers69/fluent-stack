import { CredentialColumn, HeroAuthColumn, SignUpForm } from "@/components/auth";
import { SectionHeading } from "@/components/shared";
import { useTranslations } from "next-intl";

export default function SignUpPage() {
  const t = useTranslations("authentication");
  return (
    <section className="flex w-full pt-22.5">
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
      <HeroAuthColumn image="/images/auth/register-hero.jpg" />
    </section>
  );
}
