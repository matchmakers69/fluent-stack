"use client";

import { useState, useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { processPdfFile } from "@/app/[locale]/(admin)/uploads/actions";

type UploadStatus =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

export function usePdfUpload() {
  const [status, setStatus] = useState<UploadStatus>({ type: "idle" });

  const processFile = useCallback(async (file: File) => {
    setStatus({ type: "loading" });
    const result = await processPdfFile(file);
    if (result.success) {
      setStatus({ type: "success", message: result.message });
    } else {
      setStatus({ type: "error", message: result.error });
    }
  }, []);

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      if (rejected.length > 0) {
        setStatus({ type: "error", message: "Only PDF files are accepted" });
        return;
      }
      if (accepted[0]) {
        processFile(accepted[0]);
      }
    },
    [processFile]
  );

  const dropzone = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: status.type === "loading",
  });

  const reset = useCallback(() => setStatus({ type: "idle" }), []);

  return { status, dropzone, reset };
}
