import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/ProductForm";
import { updateProduct } from "../../actions";

export const metadata: Metadata = {
  title: "Edit Product",
  robots: { index: false, follow: false },
};

interface Props {
  params: { id: string };
}

export default async function EditProductPage({ params }: Props) {
  const supabase = createClient();
  const { data: product } = await supabase
    .from("products")
    .select(
      "id, name, slug, description, sku, material, size, weight_kg, price_type, price, stock_status, is_featured, is_published, product_images(storage_path, sort_order)"
    )
    .eq("id", params.id)
    .single();

  if (!product) notFound();

  const boundUpdate = updateProduct.bind(null, product.id);
  const imagePaths = [...(product.product_images ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => img.storage_path);

  return (
    <div>
      <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm text-steel-500 hover:text-navy-900">
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold text-navy-900">Edit Product</h1>

      <div className="mt-6">
        <ProductForm
          action={boundUpdate}
          defaultValues={{
            name: product.name,
            slug: product.slug,
            description: product.description,
            sku: product.sku,
            material: product.material,
            size: product.size,
            weightKg: product.weight_kg,
            priceType: product.price_type,
            price: product.price,
            stockStatus: product.stock_status,
            isFeatured: product.is_featured,
            isPublished: product.is_published,
            imagePaths,
          }}
        />
      </div>
    </div>
  );
}
