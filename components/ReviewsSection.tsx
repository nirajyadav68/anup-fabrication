import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

async function getPublishedReviews() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, customer_name, rating, review")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(6);

  if (error || !data) return [];
  return data;
}

export default async function ReviewsSection() {
  const reviews = await getPublishedReviews();
  if (reviews.length === 0) return null;

  return (
    <section className="bg-steel-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-signal-600">Customer Reviews</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-navy-900 sm:text-4xl">What Customers Say</h2>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-lg border border-steel-100 bg-white p-6">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-signal-500 text-signal-500" : "text-steel-200"}`} />
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-steel-700">&ldquo;{r.review}&rdquo;</p>
              <p className="mt-4 text-sm font-semibold text-navy-900">{r.customer_name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
