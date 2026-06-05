"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { usePdfUpload } from "@/hooks/usePdfUpload";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, FileUp, CheckCircle2, XCircle } from "lucide-react";

export function PdfUpload() {
  const t = useTranslations("uploads");
  const { status, dropzone, reset } = usePdfUpload();
  const { getRootProps, getInputProps, isDragActive } = dropzone;

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 transition-colors cursor-pointer",
          isDragActive
            ? "border-primary bg-primary/10"
            : "border-border hover:border-primary/60 hover:bg-muted/40",
          status.type === "loading" && "pointer-events-none opacity-60"
        )}
      >
        <input {...getInputProps()} />

        {status.type === "loading" ? (
          <>
            <Loader2 className="size-10 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">{t("processing")}</p>
          </>
        ) : (
          <>
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
              <FileUp className="size-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-bold">
                {isDragActive ? t("dropNow") : t("dropzone")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{t("pdfOnly")}</p>
            </div>
            <Button variant="secondary" size="sm" type="button">
              {t("browse")}
            </Button>
          </>
        )}
      </div>

      {status.type === "success" && (
        <Alert className="border-primary/40 bg-primary/10">
          <CheckCircle2 className="size-4 text-primary" />
          <AlertTitle>{t("successTitle")}</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>{status.message}</span>
            <Button variant="lavender" size="xs" onClick={reset}>
              {t("uploadAnother")}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {status.type === "error" && (
        <Alert variant="destructive">
          <XCircle className="size-4" />
          <AlertTitle>{t("errorTitle")}</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>{status.message}</span>
            <Button variant="pink" size="xs" onClick={reset}>
              {t("tryAgain")}
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
