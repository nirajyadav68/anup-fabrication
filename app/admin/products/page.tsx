import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Plus, ImageOff } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { mediaUrl } from "@/lib/supabase/storage";
import DeleteButton from "@/components/admin/DeleteButton";
import ToggleSwitch from "@/components/admin/ToggleSwitch";
import { deleteProduct, toggleProductPublished } from "./actions";

export const metadata: Metadata = {
  title: "Products Management",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

function formatPrice(priceType: string, price: number | null) {
  if (priceType === "contact" || price === null) return "Contact for price";
  const formatted = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);
  return priceType === "starting_from" ? `From ${formatted}` : formatted;
}

interface Props {
  searchParams: { page?: string };
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const supabase = createClient();
  const page = Math.max(1, Number(searchParams.page ?? 1) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: products, error, count } = await supabase
    .from("products")
    .select(
      "id, name, price, price_type, stock_status, is_published, is_featured, updated_at, product_images(storage_path, sort_order)",
      { count: "exact" }
    )
    .order("updated_at", { ascending: false })
    .range(from, to);

  const totalPages = count ? Math.max(1, Math.ceil(count / PAGE_SIZE)) : 1;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">Products Management</h1>
          <p className="mt-1 text-sm text-steel-500">Your product catalogue, shown on the public Products page.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-1.5 rounded-md bg-signal-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-signal-600"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      {error && (
        <p className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
          Could not load products: {error.message}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-steel-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-steel-100 bg-steel-50 text-xs uppercase tracking-wide text-steel-500">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3">Published</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-steel-100">
            {products?.map((product) => {
              const images = [...(product.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
              const thumb = images[0] ? mediaUrl(images[0].storage_path) : null;
              return (
                <tr key={product.id}>
                  <td className="px-4 py-3">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md bg-steel-50">
                      {thumb ? (
                        <Image src={thumb} alt="" width={48} height={48} className="h-12 w-12 object-cover" unoptimized />
                      ) : (
                        <ImageOff className="h-5 w-5 text-steel-300" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-navy-900">{product.name}</td>
                  <td className="px-4 py-3 text-steel-700">{formatPrice(product.price_type, product.price)}</td>
                  <td className="px-4 py-3 text-steel-700">{product.stock_status.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3">{product.is_featured ? "Yes" : "—"}</td>
                  <td className="px-4 py-3">
                    <ToggleSwitch
                      id={product.id}
                      checked={product.is_published}
                      action={toggleProductPublished}
                      label={`Toggle ${product.name} published`}
                    />
                  </td>
                  <td className="px-4 py-3 text-steel-500">{new Date(product.updated_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/products/${product.id}/edit`} className="text-signal-600 hover:text-signal-500">
                        Edit
                      </Link>
                      <DeleteButton action={deleteProduct} id={product.id} itemLabel={product.name} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {products?.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-steel-500">
                  No products yet — add your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <Link
            href={`/admin/products?page=${Math.max(1, page - 1)}`}
            aria-disabled={page <= 1}
            className={`rounded-md border border-steel-300 px-3 py-1.5 ${page <= 1 ? "pointer-events-none opacity-40" : "hover:border-navy-900"}`}
          >
            Previous
          </Link>
          <span className="text-steel-500">
            Page {page} of {totalPages}
          </span>
          <Link
            href={`/admin/products?page=${Math.min(totalPages, page + 1)}`}
            aria-disabled={page >= totalPages}
            className={`rounded-md border border-steel-300 px-3 py-1.5 ${page >= totalPages ? "pointer-events-none opacity-40" : "hover:border-navy-900"}`}
          >
            Next
          </Link>
        </div>
      )}
    </div>
  );
}
