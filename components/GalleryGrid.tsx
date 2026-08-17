"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface GalleryImage {
  id: string;
  title: string | null;
  url: string;
}

export default function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState<GalleryImage | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setActive(img)}
            className="aspect-square overflow-hidden rounded-md bg-steel-50"
            aria-label={img.title ? `View ${img.title}` : "View photo"}
          >
            <Image
              src={img.url}
              alt={img.title ?? ""}
              width={300}
              height={300}
              className="h-full w-full object-cover transition-transform hover:scale-105"
              unoptimized
            />
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/90 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setActive(null)}
            className="absolute right-5 top-5 text-white"
          >
            <X className="h-7 w-7" />
          </button>
          <figure onClick={(e) => e.stopPropagation()}>
            <Image
              src={active.url}
              alt={active.title ?? ""}
              width={1000}
              height={1000}
              className="max-h-[80vh] w-auto rounded-md object-contain"
              unoptimized
            />
            {active.title && <figcaption className="mt-2 text-center text-sm text-steel-300">{active.title}</figcaption>}
          </figure>
        </div>
      )}
    </>
  );
}
