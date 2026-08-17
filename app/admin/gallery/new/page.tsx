"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";
import { addGalleryImages } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center justify-center gap-2 rounded-md bg-signal-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-signal-600 disabled:opacity-70"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? "Saving..." : "Add to Gallery"}
    </button>
  );
}

export default function NewGalleryPage() {
  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    try {
      await addGalleryImages(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div>
      <Link href="/admin/gallery" className="inline-flex items-center gap-1.5 text-sm text-steel-500 hover:text-navy-900">
        <ArrowLeft className="h-4 w-4" />
        Back to Gallery
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold text-navy-900">Add Photos</h1>

      <form action={handleSubmit} className="mt-6 max-w-xl space-y-5">
        {imagePaths.map((path) => (
          <input key={path} type="hidden" name="imagePaths" value={path} />
        ))}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-navy-900">
            Title / Caption <span className="text-steel-500">(optional, applies to all)</span>
          </label>
          <input
            id="title"
            name="title"
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />
        </div>

        <div>
          <span className="block text-sm font-medium text-navy-900">Photos</span>
          <div className="mt-1.5">
            <ImageUploader folder="gallery" multiple onChange={setImagePaths} />
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <SubmitButton />
      </form>
    </div>
  );
}
