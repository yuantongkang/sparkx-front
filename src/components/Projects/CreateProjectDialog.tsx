"use client";

import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, UploadCloud, Zap } from "lucide-react";

import { useI18n } from "@/i18n/client";

const MAX_NAME_LENGTH = 50;
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type CreateProjectDialogProps = {
  isOpen: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (input: { name: string; coverImage?: string }) => Promise<void> | void;
};

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        resolve(result);
      } else {
        reject(new Error("Unable to read file"));
      }
    };
    reader.onerror = () => reject(new Error("Unable to read file"));
    reader.readAsDataURL(file);
  });

export default function CreateProjectDialog({
  isOpen,
  isSubmitting,
  onCancel,
  onSubmit,
}: CreateProjectDialogProps) {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState("");
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const resetForm = () => {
    setName("");
    setCoverImage(undefined);
    setError(null);
    setIsDragOver(false);
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const handleReadFile = async (file: File) => {
    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
      setError(t("projects.create_dialog.cover_invalid"));
      return;
    }

    try {
      const preview = await readFileAsDataUrl(file);
      setCoverImage(preview);
      setError(null);
    } catch {
      setError(t("projects.create_dialog.cover_invalid"));
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    await handleReadFile(file);
    event.currentTarget.value = "";
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError(t("projects.create_dialog.name_required"));
      return;
    }

    setError(null);
    await onSubmit({
      name: trimmedName,
      coverImage,
    });
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/30 px-4 py-8 backdrop-blur-[1px]">
      <div className="mx-auto h-full w-full max-w-4xl overflow-y-auto rounded-[32px] border border-slate-200/80 bg-slate-50 shadow-[0_32px_80px_-44px_rgba(15,23,42,0.55)]">
        <form
          className="space-y-8 px-5 py-8 sm:px-10 sm:py-10"
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
        >
          <div className="space-y-3 text-center">
            <h2 className="text-4xl font-black tracking-tight text-[#0f2b58] sm:text-5xl">
              {t("projects.create_dialog.title")}
            </h2>
            <p className="text-sm text-slate-500 sm:text-base">
              {t("projects.create_dialog.subtitle")}
            </p>
          </div>

          <section className="space-y-3">
            <p className="text-sm font-semibold text-[#0f2b58]">
              {t("projects.create_dialog.cover_label")}
              <span className="ml-1 font-normal text-slate-400">
                {t("projects.create_dialog.cover_recommend_size")}
              </span>
            </p>

            <button
              type="button"
              onClick={() => {
                fileInputRef.current?.click();
              }}
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDragOver(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setIsDragOver(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragOver(false);
                const file = event.dataTransfer.files?.[0];
                if (!file) return;
                void handleReadFile(file);
              }}
              className={[
                "group relative flex h-[250px] w-full items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed transition",
                isDragOver
                  ? "border-sky-300 bg-sky-50/80"
                  : "border-slate-200 bg-slate-100/60 hover:border-slate-300",
              ].join(" ")}
            >
              {coverImage ? (
                <>
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    role="img"
                    aria-label={t("projects.create_dialog.cover_preview")}
                    style={{ backgroundImage: `url(${coverImage})` }}
                  />
                  <div className="absolute inset-0 bg-slate-900/35" />
                  <div className="relative z-10 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                    {t("projects.create_dialog.cover_change")}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-200/80 text-slate-500">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-[#0f2b58]">
                      {t("projects.create_dialog.cover_upload_hint")}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {t("projects.create_dialog.cover_supported")}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">
                    <UploadCloud className="h-3.5 w-3.5" />
                    {t("projects.create_dialog.cover_click_upload")}
                  </div>
                </div>
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => {
                void handleFileChange(event);
              }}
            />
          </section>

          <section className="space-y-3">
            <p className="text-sm font-semibold text-[#0f2b58]">
              {t("projects.create_dialog.name_label")}
              <span className="ml-1 text-red-500">*</span>
            </p>

            <input
              value={name}
              onChange={(event) => {
                setName(event.currentTarget.value.slice(0, MAX_NAME_LENGTH));
                if (error) {
                  setError(null);
                }
              }}
              placeholder={t("projects.create_dialog.name_placeholder")}
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xl text-[#0f2b58] outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-300/40"
            />

            <div className="text-sm text-slate-400">
              {name.length}/{MAX_NAME_LENGTH}
            </div>
          </section>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex h-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-lg font-semibold text-[#0f2b58] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
            >
              {t("projects.create_dialog.cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#0c1941] text-lg font-semibold text-white shadow-sm transition hover:bg-[#091637] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>{isSubmitting ? t("projects.create_dialog.creating") : t("projects.create_dialog.create")}</span>
              <Zap className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
