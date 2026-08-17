import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import { getPublishedProducts } from "@/lib/data/products";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Products",
  description: `Browse the product catalogue from ${siteConfig.name}.`,
  alternates: { canonical: "/products" },
};

export default async function ProductsPage() {
  const products = await getPublishedProducts();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-signal-600">Catalogue</p>
      <h1 className="mt-2 font-display text-4xl font-bold text-navy-900 sm:text-5xl">Products</h1>
      <p className="mt-3 max-w-2xl text-steel-500">
        Standard items shown below — most of our work is custom-sized, so if you don&apos;t see
        exactly what you need, request a quote and we&apos;ll fabricate it to spec.
      </p>

      {products.length === 0 ? (
        <p className="mt-10 text-steel-500">
          No products published yet — check back soon, or{" "}
          <a href="/contact" className="text-signal-600 hover:text-signal-500">
            contact us
          </a>{" "}
          about a custom job.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
