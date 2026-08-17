import { createPublicClient } from "@/lib/supabase/public";

export interface PublicProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  material: string | null;
  size: string | null;
  priceType: "fixed" | "starting_from" | "contact";
  price: number | null;
  stockStatus: "in_stock" | "out_of_stock" | "made_to_order";
  isFeatured: boolean;
  images: string[]; // storage paths, already sorted
}

export async function getPublishedProducts(): Promise<PublicProduct[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, slug, description, material, size, price_type, price, stock_status, is_featured, product_images(storage_path, sort_order)"
    )
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    material: row.material,
    size: row.size,
    priceType: row.price_type,
    price: row.price,
    stockStatus: row.stock_status,
    isFeatured: row.is_featured,
    images: [...(row.product_images ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => img.storage_path),
  }));
}

export async function getPublishedProductBySlug(slug: string): Promise<PublicProduct | undefined> {
  const products = await getPublishedProducts();
  return products.find((p) => p.slug === slug);
}

export function formatProductPrice(priceType: PublicProduct["priceType"], price: number | null) {
  if (priceType === "contact" || price === null) return "Contact for Price";
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
  return priceType === "starting_from" ? `From ${formatted}` : formatted;
}
