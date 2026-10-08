import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditInventoryForm from "./EditInventoryForm";

export const dynamic = "force-dynamic";

export default async function EditInventoryPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: item, error } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !item) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          href={`/admin/inventory/${item.id}`}
          className="text-sm font-medium text-signal-600 hover:text-signal-700"
        >
          ← Back to Material
        </Link>

        <h1 className="mt-3 font-display text-2xl font-bold text-navy-900">
          Edit Material
        </h1>

        <p className="mt-1 text-sm text-steel-500">
          Update material information and pricing.
        </p>
      </div>

      <div className="rounded-xl border border-steel-200 bg-white p-6">
        <EditInventoryForm item={item} />
      </div>
    </div>
  );
}