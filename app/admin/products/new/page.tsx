import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductForm from "@/components/admin/ProductForm";
import { createProduct } from "../actions";

export const metadata: Metadata = {
  title: "Add Product",
  robots: { index: false, follow: false },
};

export default function NewProductPage() {
  return (
    <div>
      <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm text-steel-500 hover:text-navy-900">
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold text-navy-900">Add Product</h1>

      <div className="mt-6">
        <ProductForm action={createProduct} />
      </div>
    </div>
  );
}
