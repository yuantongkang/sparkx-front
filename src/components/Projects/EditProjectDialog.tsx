"use client";

import { type FormEvent, useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";

import { useI18n } from "@/i18n/client";
import { type Project } from "@/lib/projects";

type EditProjectDialogProps = {
  project: Project;
  isOpen: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (updates: { name: string; description: string }) => void;
};

type FormState = {
  name: string;
  description: string;
};

const INITIAL_FORM: FormState = {
  name: "",
  description: "",
};

export default function EditProjectDialog({
  project,
  isOpen,
  isSubmitting,
  onCancel,
  onSubmit,
}: EditProjectDialogProps) {
  const { t } = useI18n();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  // Update form when project changes
  useEffect(() => {
    if (project) {
      setForm({
        name: project.name,
        description: project.description || "",
      });
    }
  }, [project]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      return;
    }
    onSubmit({
      name: trimmedName,
      description: form.description.trim(),
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {t("projects.edit_project")}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {t("projects.edit_project_description")}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-4">
          {/* Project Name */}
          <div>
            <label
              htmlFor="edit-project-name"
              className="block text-sm font-medium text-slate-700"
            >
              {t("projects.name_label")} *
            </label>
            <input
              id="edit-project-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              disabled={isSubmitting}
              maxLength={50}
              className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:bg-slate-50 disabled:text-slate-500"
              placeholder={t("projects.name_placeholder")}
              required
            />
            <div className="mt-1 text-xs text-slate-400">
              {form.name.length} / 50
            </div>
          </div>

          {/* Project Description */}
          <div>
            <label
              htmlFor="edit-project-description"
              className="block text-sm font-medium text-slate-700"
            >
              {t("projects.description_label")}
            </label>
            <textarea
              id="edit-project-description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              disabled={isSubmitting}
              rows={3}
              maxLength={500}
              className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:bg-slate-50 disabled:text-slate-500"
              placeholder={t("projects.description_placeholder")}
            />
            <div className="mt-1 text-xs text-slate-400">
              {form.description.length} / 500
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {t("projects.cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !form.name.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("projects.saving")}
                </>
              ) : (
                t("projects.save")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
