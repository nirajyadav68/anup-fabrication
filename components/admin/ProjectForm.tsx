"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

interface ProjectFormProps {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: {
    title: string;
    slug: string;
    description: string;
    category: string;
    isPublished: boolean;
    imagePaths: string[];
  };
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center justify-center gap-2 rounded-md bg-signal-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-signal-600 disabled:opacity-70"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? "Saving..." : label}
    </button>
  );
}

const CATEGORY_SUGGESTIONS = [
  "Gates", "Railings", "Grills", "Sheds", "Doors", "Windows", "Industrial", "Residential", "Custom Work",
];

export default function ProjectForm({ action, defaultValues }: ProjectFormProps) {
  const [imagePaths, setImagePaths] = useState<string[]>(defaultValues?.imagePaths ?? []);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    try {
      await action(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <form action={handleSubmit} className="max-w-2xl space-y-5">
      {imagePaths.map((path) => (
        <input key={path} type="hidden" name="imagePaths" value={path} />
      ))}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-navy-900">
            Project Title
          </label>
          <input
            id="title"
            name="title"
            required
            defaultValue={defaultValues?.title}
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />
        </div>
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-navy-900">
            URL Slug
          </label>
          <input
            id="slug"
            name="slug"
            required
            defaultValue={defaultValues?.slug}
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 font-mono text-sm focus:border-signal-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-navy-900">
          Category
        </label>
        <input
          id="category"
          name="category"
          list="category-suggestions"
          defaultValue={defaultValues?.category}
          placeholder="e.g. Gates"
          className="mt-1.5 w-full max-w-xs rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
        />
        <datalist id="category-suggestions">
          {CATEGORY_SUGGESTIONS.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-navy-900">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          defaultValue={defaultValues?.description}
          className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
        />
      </div>

      <div>
        <span className="block text-sm font-medium text-navy-900">Project Photos</span>
        <div className="mt-1.5">
          <ImageUploader
            folder="projects"
            multiple
            initialPaths={defaultValues?.imagePaths ?? []}
            onChange={setImagePaths}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-navy-900">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={defaultValues?.isPublished ?? false}
          className="h-4 w-4 rounded border-steel-300 text-signal-500 focus:ring-signal-500"
        />
        Published (visible on the public site)
      </label>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <SubmitButton label={defaultValues ? "Save Changes" : "Create Project"} />
    </form>
  );
}
