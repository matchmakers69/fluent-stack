import { CredentialColumn, HeroAuthColumn } from "@/components/auth";
import { SectionHeading } from "@/components/shared";
import { useTranslations } from "next-intl";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  const t = useTranslations("authentication");
  return (
    <>
      <CredentialColumn>
        <div className="flex flex-col gap-8 w-full">
          <SectionHeading
            label={t("signUp.label")}
            title={t("signUp.title")}
            description={t("signUp.description")}
          />
          <SignUp fallbackRedirectUrl="/dashboard" signInUrl="/authentication/sign-in" />
        </div>
      </CredentialColumn>
      <HeroAuthColumn />
    </>
  );
}
