import Link from "next/link";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { mediaUrl } from "@/lib/supabase/storage";
import { formatProductPrice, type PublicProduct } from "@/lib/data/products";

export default function ProductCard({ product }: { product: PublicProduct }) {
  const thumb = product.images[0] ? mediaUrl(product.images[0]) : null;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-steel-100 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex aspect-[4/3] items-center justify-center bg-steel-50">
        {thumb ? (
          <Image
            src={thumb}
            alt={product.name}
            width={400}
            height={300}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            unoptimized
          />
        ) : (
          <ImageOff className="h-8 w-8 text-steel-300" aria-hidden="true" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-base font-semibold text-navy-900">{product.name}</h3>
        {product.material && <p className="mt-1 text-xs text-steel-500">{product.material}</p>}
        <p className="mt-2 font-mono text-sm font-semibold text-signal-600">
          {formatProductPrice(product.priceType, product.price)}
        </p>
      </div>
    </Link>
  );
}
