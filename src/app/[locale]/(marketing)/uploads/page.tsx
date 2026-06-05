import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { PdfUpload } from "@/components/marketing/PdfUpload";
import { SectionHeading } from "@/components/shared";

export default function UploadsPage() {
  const t = useTranslations("uploads");

  return (
    <main className="wrapper py-16 md:py-24">
      <SectionHeading
        label={t("label")}
        title={t("title")}
        description={t("description")}
        align="center"
      />
      <div className="container-narrow mt-10">
        <Card className="rounded-2xl p-6 md:p-10">
          <CardContent className="p-0">
            <PdfUpload />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
