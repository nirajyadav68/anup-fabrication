"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface UploadedImage {
  path: string;
  url: string;
}

interface ImageUploaderProps {
  /** Storage subfolder inside the "media" bucket, e.g. "products", "services". */
  folder: string;
  /** Already-uploaded images (edit mode), as storage paths. */
  initialPaths?: string[];
  /** Allow more than one image. Defaults to false (single image). */
  multiple?: boolean;
  /** Called whenever the set of uploaded storage paths changes. */
  onChange: (paths: string[]) => void;
  maxSizeMb?: number;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

function publicUrlFor(path: string) {
  const supabase = createClient();
  return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
}

export default function ImageUploader({
  folder,
  initialPaths = [],
  multiple = false,
  onChange,
  maxSizeMb = 5,
}: ImageUploaderProps) {
  const [images, setImages] = useState<UploadedImage[]>(
    initialPaths.map((path) => ({ path, url: publicUrlFor(path) }))
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function emitChange(next: UploadedImage[]) {
    setImages(next);
    onChange(next.map((img) => img.path));
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const files = Array.from(fileList);
    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Only JPG, PNG and WEBP images are allowed.");
        return;
      }
      if (file.size > maxSizeMb * 1024 * 1024) {
        setError(`Each image must be under ${maxSizeMb}MB.`);
        return;
      }
    }

    setUploading(true);
    const supabase = createClient();
    const uploaded: UploadedImage[] = [];

    for (const file of files) {
      const ext = file.name.split(".").pop();
      const path = `${folder}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("media").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`);
        continue;
      }
      uploaded.push({ path, url: publicUrlFor(path) });
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";

    emitChange(multiple ? [...images, ...uploaded] : uploaded.slice(0, 1));
  }

  async function handleRemove(path: string) {
    const supabase = createClient();
    await supabase.storage.from("media").remove([path]);
    emitChange(images.filter((img) => img.path !== path));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((img) => (
          <div key={img.path} className="group relative h-24 w-24 overflow-hidden rounded-md border border-steel-100">
            <Image src={img.url} alt="" fill className="object-cover" unoptimized />
            <button
              type="button"
              onClick={() => handleRemove(img.path)}
              aria-label="Remove image"
              className="absolute right-1 top-1 rounded-full bg-navy-900/80 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {(multiple || images.length === 0) && (
          <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-steel-300 text-steel-500 hover:border-signal-500 hover:text-signal-600">
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Upload className="h-5 w-5" />
                <span className="text-xs">Upload</span>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              multiple={multiple}
              className="sr-only"
              onChange={(e) => handleFiles(e.target.files)}
              disabled={uploading}
            />
          </label>
        )}
      </div>
      <p className="mt-2 text-xs text-steel-500">JPG, PNG or WEBP, up to {maxSizeMb}MB each.</p>
      {error && (
        <p role="alert" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
