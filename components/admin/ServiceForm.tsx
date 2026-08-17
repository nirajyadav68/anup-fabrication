"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

interface ServiceFormProps {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: {
    name: string;
    slug: string;
    shortDescription: string;
    description: string;
    imagePath: string | null;
    isEnabled: boolean;
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

export default function ServiceForm({ action, defaultValues }: ServiceFormProps) {
  const [imagePath, setImagePath] = useState(defaultValues?.imagePath ?? "");
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
    <form action={handleSubmit} className="max-w-xl space-y-5">
      <input type="hidden" name="imagePath" value={imagePath} />

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-navy-900">
          Service Name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={defaultValues?.name}
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
          placeholder="ms-fabrication"
          className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 font-mono text-sm focus:border-signal-500"
        />
        <p className="mt-1 text-xs text-steel-500">Lowercase letters, numbers and hyphens only.</p>
      </div>

      <div>
        <label htmlFor="shortDescription" className="block text-sm font-medium text-navy-900">
          Short Description
        </label>
        <input
          id="shortDescription"
          name="shortDescription"
          required
          defaultValue={defaultValues?.shortDescription}
          className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          placeholder="Shown on the service card"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-navy-900">
          Full Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          defaultValue={defaultValues?.description}
          className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          placeholder="Shown on the service detail page"
        />
      </div>

      <div>
        <span className="block text-sm font-medium text-navy-900">Service Image</span>
        <div className="mt-1.5">
          <ImageUploader
            folder="services"
            initialPaths={defaultValues?.imagePath ? [defaultValues.imagePath] : []}
            onChange={(paths) => setImagePath(paths[0] ?? "")}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-navy-900">
        <input
          type="checkbox"
          name="isEnabled"
          defaultChecked={defaultValues?.isEnabled ?? true}
          className="h-4 w-4 rounded border-steel-300 text-signal-500 focus:ring-signal-500"
        />
        Enabled (visible on the public site)
      </label>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <SubmitButton label={defaultValues ? "Save Changes" : "Create Service"} />
    </form>
  );
}
