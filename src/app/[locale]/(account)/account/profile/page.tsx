import { currentUser } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared";
import { ProfileCard } from "@/components/account";

export default async function ProfilePage() {
  const [user, t] = await Promise.all([
    currentUser(),
    getTranslations("account.profile"),
  ]);

  if (!user) return null;

  const firstName = user.firstName ?? "";
  const lastName = user.lastName ?? "";
  const email = user.emailAddresses[0]?.emailAddress ?? "";
  const phone = (user.unsafeMetadata?.phoneNumber as string) ?? "";

  return (
    <div className="container py-12">
      <SectionHeading
        label={t("label")}
        title={t("title")}
        description={t("description")}
      />
      <Card className="mt-10 rounded-2xl border-2 border-[oklch(0.18_0.12_280)] shadow-[4px_4px_0px_oklch(0.18_0.12_280)] ring-0">
        <CardContent className="p-6 sm:p-8 space-y-8">
          <ProfileCard
            firstName={firstName}
            lastName={lastName}
            email={email}
            phone={phone}
          />
        </CardContent>
      </Card>
    </div>
  );
}
