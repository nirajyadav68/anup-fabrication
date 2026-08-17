import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ImageOff } from "lucide-react";
import { getPublishedProductBySlug } from "@/lib/data/products";
import { mediaUrl } from "@/lib/supabase/storage";
import WhatsAppButton from "@/components/WhatsAppButton";
import ProductAvailability from "@/components/ProductAvailability";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getPublishedProductBySlug(params.slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getPublishedProductBySlug(params.slug);
  if (!product) notFound();

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <Link href="/products" className="inline-flex items-center gap-1.5 text-sm font-medium text-steel-500 hover:text-navy-900">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All products
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-steel-50">
            {product.images[0] ? (
              <Image
                src={mediaUrl(product.images[0])!}
                alt={product.name}
                width={600}
                height={600}
                className="h-full w-full object-cover"
                unoptimized
              />
            ) : (
              <ImageOff className="h-10 w-10 text-steel-300" />
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {product.images.slice(1).map((path) => (
                <div key={path} className="aspect-square overflow-hidden rounded-md bg-steel-50">
                  <Image src={mediaUrl(path)!} alt="" width={150} height={150} className="h-full w-full object-cover" unoptimized />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-navy-900 sm:text-4xl">{product.name}</h1>
          <div className="mt-2">
            <ProductAvailability
              productId={product.id}
              initial={{ price: product.price, priceType: product.priceType, stockStatus: product.stockStatus }}
            />
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-steel-100 py-5 text-sm">
            {product.material && (
              <div>
                <dt className="text-steel-500">Material</dt>
                <dd className="mt-0.5 font-medium text-navy-900">{product.material}</dd>
              </div>
            )}
            {product.size && (
              <div>
                <dt className="text-steel-500">Size</dt>
                <dd className="mt-0.5 font-medium text-navy-900">{product.size}</dd>
              </div>
            )}
          </dl>

          <p className="mt-5 leading-relaxed text-steel-700">{product.description}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/quote"
              className="rounded-md bg-signal-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-signal-600"
            >
              Request a Quote
            </Link>
            <WhatsAppButton
              message={`Hello, I am interested in ${product.name}. I would like to know the price and details.`}
              label="Ask About This Product"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
