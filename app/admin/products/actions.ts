"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { productFormSchema } from "@/lib/validations/product";

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return supabase;
}

function readProductForm(formData: FormData) {
  const imagePaths = formData.getAll("imagePaths").map(String).filter(Boolean);

  return productFormSchema.parse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    sku: formData.get("sku") ?? "",
    material: formData.get("material") ?? "",
    size: formData.get("size") ?? "",
    weightKg: formData.get("weightKg") || "",
    priceType: formData.get("priceType"),
    price: formData.get("price") || "",
    stockStatus: formData.get("stockStatus"),
    isFeatured: formData.get("isFeatured") === "on",
    isPublished: formData.get("isPublished") === "on",
    imagePaths,
  });
}

async function syncProductImages(
  supabase: ReturnType<typeof createClient>,
  productId: string,
  paths: string[]
) {
  // Simplest correct approach for a beginner-maintainable codebase:
  // replace the full image set on every save rather than diffing.
  await supabase.from("product_images").delete().eq("product_id", productId);
  if (paths.length === 0) return;

  const rows = paths.map((storage_path, index) => ({
    product_id: productId,
    storage_path,
    sort_order: index,
  }));
  const { error } = await supabase.from("product_images").insert(rows);
  if (error) throw new Error(`Could not save product images: ${error.message}`);
}

export async function createProduct(formData: FormData) {
  const supabase = await requireAdmin();
  const values = readProductForm(formData);

  const { data, error } = await supabase
    .from("products")
    .insert({
      name: values.name,
      slug: values.slug,
      description: values.description,
      sku: values.sku || null,
      material: values.material || null,
      size: values.size || null,
      weight_kg: values.weightKg === "" ? null : values.weightKg,
      price_type: values.priceType,
      price: values.priceType === "contact" || values.price === "" ? null : values.price,
      stock_status: values.stockStatus,
      is_featured: values.isFeatured,
      is_published: values.isPublished,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Could not create product: ${error?.message ?? "unknown error"}`);
  }

  await syncProductImages(supabase, data.id, values.imagePaths);

  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products");
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await requireAdmin();
  const values = readProductForm(formData);

  const { error } = await supabase
    .from("products")
    .update({
      name: values.name,
      slug: values.slug,
      description: values.description,
      sku: values.sku || null,
      material: values.material || null,
      size: values.size || null,
      weight_kg: values.weightKg === "" ? null : values.weightKg,
      price_type: values.priceType,
      price: values.priceType === "contact" || values.price === "" ? null : values.price,
      stock_status: values.stockStatus,
      is_featured: values.isFeatured,
      is_published: values.isPublished,
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Could not update product: ${error.message}`);
  }

  await syncProductImages(supabase, id, values.imagePaths);

  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    throw new Error(`Could not delete product: ${error.message}`);
  }
  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export async function toggleProductPublished(id: string, isPublished: boolean) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("products").update({ is_published: isPublished }).eq("id", id);
  if (error) {
    throw new Error(`Could not update product: ${error.message}`);
  }
  revalidatePath("/admin/products");
  revalidatePath("/products");
}
