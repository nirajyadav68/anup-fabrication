"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface UploadedFile {
  path: string;
  name: string;
}

interface QuoteFileUploaderProps {
  label: string;
  multiple?: boolean;
  onChange: (paths: string[]) => void;
  maxSizeMb?: number;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

export default function QuoteFileUploader({
  label,
  multiple = false,
  onChange,
  maxSizeMb = 10,
}: QuoteFileUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const selected = Array.from(fileList);
    for (const file of selected) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Only JPG, PNG and PDF files are allowed.");
        return;
      }
      if (file.size > maxSizeMb * 1024 * 1024) {
        setError(`Each file must be under ${maxSizeMb}MB.`);
        return;
      }
    }

    setUploading(true);
    const supabase = createClient();
    const uploaded: UploadedFile[] = [];

    for (const file of selected) {
      const ext = file.name.split(".").pop();
      const path = `quotes/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("media").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`);
        continue;
      }
      uploaded.push({ path, name: file.name });
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";

    const next = multiple ? [...files, ...uploaded] : uploaded.slice(0, 1);
    setFiles(next);
    onChange(next.map((f) => f.path));
  }

  function handleRemove(path: string) {
    const next = files.filter((f) => f.path !== path);
    setFiles(next);
    onChange(next.map((f) => f.path));
  }

  return (
    <div>
      {files.length > 0 && (
        <ul className="mb-2 space-y-1.5">
          {files.map((f) => (
            <li key={f.path} className="flex items-center justify-between rounded-md border border-steel-100 bg-steel-50 px-3 py-2 text-sm">
              <span className="flex items-center gap-2 truncate text-steel-700">
                <FileText className="h-4 w-4 shrink-0 text-steel-400" />
                <span className="truncate">{f.name}</span>
              </span>
              <button type="button" onClick={() => handleRemove(f.path)} aria-label={`Remove ${f.name}`} className="text-steel-400 hover:text-red-600">
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {(multiple || files.length === 0) && (
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-steel-300 px-4 py-3 text-sm text-steel-500 hover:border-signal-500 hover:text-signal-600">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Uploading..." : label}
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

      <p className="mt-1.5 text-xs text-steel-500">JPG, PNG or PDF, up to {maxSizeMb}MB each.</p>
      {error && (
        <p role="alert" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
