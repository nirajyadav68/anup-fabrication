"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";
import { createReview } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center justify-center gap-2 rounded-md bg-signal-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-signal-600 disabled:opacity-70"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? "Saving..." : "Add Review"}
    </button>
  );
}

export default function NewReviewPage() {
  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    try {
      await createReview(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div>
      <Link href="/admin/reviews" className="inline-flex items-center gap-1.5 text-sm text-steel-500 hover:text-navy-900">
        <ArrowLeft className="h-4 w-4" />
        Back to Reviews
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold text-navy-900">Add Review</h1>

      <form action={handleSubmit} className="mt-6 max-w-xl space-y-5">
        <input type="hidden" name="imagePath" value={imagePaths[0] ?? ""} />

        <div>
          <label htmlFor="customerName" className="block text-sm font-medium text-navy-900">
            Customer Name
          </label>
          <input
            id="customerName"
            name="customerName"
            required
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />
        </div>

        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-navy-900">
            Rating
          </label>
          <select
            id="rating"
            name="rating"
            defaultValue="5"
            className="mt-1.5 w-full max-w-[120px] rounded-md border border-steel-300 bg-white px-3.5 py-2.5 text-sm focus:border-signal-500"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} star{n !== 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="review" className="block text-sm font-medium text-navy-900">
            Review
          </label>
          <textarea
            id="review"
            name="review"
            required
            rows={4}
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />
        </div>

        <div>
          <span className="block text-sm font-medium text-navy-900">Customer Photo <span className="text-steel-500">(optional)</span></span>
          <div className="mt-1.5">
            <ImageUploader folder="reviews" onChange={setImagePaths} />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-navy-900">
          <input type="checkbox" name="isPublished" defaultChecked className="h-4 w-4 rounded border-steel-300 text-signal-500 focus:ring-signal-500" />
          Published (visible on the public site)
        </label>

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
