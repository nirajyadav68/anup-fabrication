"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

interface ProductFormProps {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: {
    name: string;
    slug: string;
    description: string;
    sku: string | null;
    material: string | null;
    size: string | null;
    weightKg: number | null;
    priceType: "fixed" | "starting_from" | "contact";
    price: number | null;
    stockStatus: "in_stock" | "out_of_stock" | "made_to_order";
    isFeatured: boolean;
    isPublished: boolean;
    imagePaths: string[];
  };
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center justify-center gap-2 rounded-md bg-signal-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-signal-600 disabled:opacity-70"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? "Saving..." : label}
    </button>
  );
}

export default function ProductForm({ action, defaultValues }: ProductFormProps) {
  const [imagePaths, setImagePaths] = useState<string[]>(defaultValues?.imagePaths ?? []);
  const [priceType, setPriceType] = useState(defaultValues?.priceType ?? "contact");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    try {
      await action(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <form action={handleSubmit} className="max-w-2xl space-y-5">
      {imagePaths.map((path) => (
        <input key={path} type="hidden" name="imagePaths" value={path} />
      ))}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-navy-900">
            Product Name
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={defaultValues?.name}
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />
        </div>
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-navy-900">
            URL Slug
          </label>
          <input
            id="slug"
            name="slug"
            required
            defaultValue={defaultValues?.slug}
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 font-mono text-sm focus:border-signal-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-navy-900">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          defaultValue={defaultValues?.description}
          className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="sku" className="block text-sm font-medium text-navy-900">
            SKU
          </label>
          <input
            id="sku"
            name="sku"
            defaultValue={defaultValues?.sku ?? ""}
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />
        </div>
        <div>
          <label htmlFor="material" className="block text-sm font-medium text-navy-900">
            Material
          </label>
          <input
            id="material"
            name="material"
            placeholder="MS / SS 304 ..."
            defaultValue={defaultValues?.material ?? ""}
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />
        </div>
        <div>
          <label htmlFor="size" className="block text-sm font-medium text-navy-900">
            Size
          </label>
          <input
            id="size"
            name="size"
            placeholder='e.g. 6ft x 4ft'
            defaultValue={defaultValues?.size ?? ""}
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="weightKg" className="block text-sm font-medium text-navy-900">
            Weight (kg)
          </label>
          <input
            id="weightKg"
            name="weightKg"
            type="number"
            step="0.01"
            min="0"
            defaultValue={defaultValues?.weightKg ?? ""}
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />
        </div>
        <div>
          <label htmlFor="priceType" className="block text-sm font-medium text-navy-900">
            Price Type
          </label>
          <select
            id="priceType"
            name="priceType"
            value={priceType}
            onChange={(e) => setPriceType(e.target.value as typeof priceType)}
            className="mt-1.5 w-full rounded-md border border-steel-300 bg-white px-3.5 py-2.5 text-sm focus:border-signal-500"
          >
            <option value="contact">Contact for Price</option>
            <option value="fixed">Fixed Price</option>
            <option value="starting_from">Starting From</option>
          </select>
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-navy-900">
            Price (₹)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            disabled={priceType === "contact"}
            defaultValue={defaultValues?.price ?? ""}
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500 disabled:bg-steel-50 disabled:text-steel-400"
          />
        </div>
      </div>

      <div>
        <label htmlFor="stockStatus" className="block text-sm font-medium text-navy-900">
          Stock Status
        </label>
        <select
          id="stockStatus"
          name="stockStatus"
          defaultValue={defaultValues?.stockStatus ?? "made_to_order"}
          className="mt-1.5 w-full max-w-xs rounded-md border border-steel-300 bg-white px-3.5 py-2.5 text-sm focus:border-signal-500"
        >
          <option value="in_stock">In Stock</option>
          <option value="out_of_stock">Out of Stock</option>
          <option value="made_to_order">Made to Order</option>
        </select>
      </div>

      <div>
        <span className="block text-sm font-medium text-navy-900">Product Images</span>
        <div className="mt-1.5">
          <ImageUploader
            folder="products"
            multiple
            initialPaths={defaultValues?.imagePaths ?? []}
            onChange={setImagePaths}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-navy-900">
          <input
            type="checkbox"
            name="isFeatured"
            defaultChecked={defaultValues?.isFeatured ?? false}
            className="h-4 w-4 rounded border-steel-300 text-signal-500 focus:ring-signal-500"
          />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm text-navy-900">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={defaultValues?.isPublished ?? false}
            className="h-4 w-4 rounded border-steel-300 text-signal-500 focus:ring-signal-500"
          />
          Published (visible on the public site)
        </label>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <SubmitButton label={defaultValues ? "Save Changes" : "Create Product"} />
    </form>
  );
}
