import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { mediaUrl } from "@/lib/supabase/storage";
import DeleteButton from "@/components/admin/DeleteButton";
import ToggleSwitch from "@/components/admin/ToggleSwitch";
import { deleteGalleryImage, toggleGalleryPublished } from "./actions";

export const metadata: Metadata = {
  title: "Gallery Management",
  robots: { index: false, follow: false },
};

export default async function AdminGalleryPage() {
  const supabase = createClient();
  const { data: images, error } = await supabase
    .from("gallery")
    .select("id, title, storage_path, is_published, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">Gallery Management</h1>
          <p className="mt-1 text-sm text-steel-500">Standalone photos shown on the public Gallery page.</p>
        </div>
        <Link
          href="/admin/gallery/new"
          className="flex items-center gap-1.5 rounded-md bg-signal-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-signal-600"
        >
          <Plus className="h-4 w-4" />
          Add Photos
        </Link>
      </div>

      {error && (
        <p className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
          Could not load gallery: {error.message}
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images?.map((img) => (
          <div key={img.id} className="overflow-hidden rounded-lg border border-steel-100 bg-white">
            <div className="aspect-square bg-steel-50">
              <Image
                src={mediaUrl(img.storage_path)!}
                alt={img.title ?? ""}
                width={300}
                height={300}
                className="h-full w-full object-cover"
                unoptimized
              />
            </div>
            <div className="flex items-center justify-between gap-2 p-2.5">
              <ToggleSwitch
                id={img.id}
                checked={img.is_published}
                action={toggleGalleryPublished}
                label={`Toggle image published`}
              />
              <DeleteButton action={deleteGalleryImage} id={img.id} itemLabel="this photo" />
            </div>
          </div>
        ))}

        {images?.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed border-steel-300 bg-white p-10 text-center text-steel-500">
            No photos yet — add your first batch.
          </div>
        )}
      </div>
    </div>
  );
}
