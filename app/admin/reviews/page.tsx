import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import DeleteButton from "@/components/admin/DeleteButton";
import ToggleSwitch from "@/components/admin/ToggleSwitch";
import { deleteReview, toggleReviewPublished } from "./actions";

export const metadata: Metadata = {
  title: "Reviews",
  robots: { index: false, follow: false },
};

export default async function AdminReviewsPage() {
  const supabase = createClient();
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("id, customer_name, rating, review, is_published, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">Reviews</h1>
          <p className="mt-1 text-sm text-steel-500">Customer reviews shown on the public site.</p>
        </div>
        <Link
          href="/admin/reviews/new"
          className="flex items-center gap-1.5 rounded-md bg-signal-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-signal-600"
        >
          <Plus className="h-4 w-4" />
          Add Review
        </Link>
      </div>

      {error && (
        <p className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
          Could not load reviews: {error.message}
        </p>
      )}

      <div className="mt-6 space-y-3">
        {reviews?.map((r) => (
          <div key={r.id} className="rounded-lg border border-steel-100 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-navy-900">{r.customer_name}</p>
                <div className="mt-1 flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-signal-500 text-signal-500" : "text-steel-200"}`} />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ToggleSwitch id={r.id} checked={r.is_published} action={toggleReviewPublished} label={`Toggle review from ${r.customer_name} published`} />
                <DeleteButton action={deleteReview} id={r.id} itemLabel={`review from ${r.customer_name}`} />
              </div>
            </div>
            <p className="mt-3 text-sm text-steel-700">{r.review}</p>
          </div>
        ))}

        {reviews?.length === 0 && (
          <div className="rounded-lg border border-dashed border-steel-300 bg-white p-10 text-center text-steel-500">
            No reviews yet — add your first one.
          </div>
        )}
      </div>
    </div>
  );
}
