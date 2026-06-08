import { CredentialColumn, HeroAuthColumn, SignInForm } from "@/components/auth";
import { SectionHeading } from "@/components/shared";
import { useTranslations } from "next-intl";

export default function SignInPage() {
  const t = useTranslations("authentication");
  return (
    <section className="flex w-full pt-22.5">
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
      <HeroAuthColumn image="/images/auth/login-hero.jpg" />
    </section>
  );
}
