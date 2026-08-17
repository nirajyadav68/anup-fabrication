import type { Metadata } from "next";
import GalleryGrid from "@/components/GalleryGrid";
import { getPublishedGalleryImages } from "@/lib/data/gallery";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Gallery",
  description: `Photo gallery of fabrication work from ${siteConfig.name}.`,
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const images = await getPublishedGalleryImages();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-signal-600">Photo Gallery</p>
      <h1 className="mt-2 font-display text-4xl font-bold text-navy-900 sm:text-5xl">Gallery</h1>
      <p className="mt-3 max-w-2xl text-steel-500">A closer look at our fabrication work.</p>

      {images.length === 0 ? (
        <p className="mt-10 text-steel-500">No photos published yet — check back soon.</p>
      ) : (
        <div className="mt-8">
          <GalleryGrid images={images} />
        </div>
      )}
    </section>
  );
}
