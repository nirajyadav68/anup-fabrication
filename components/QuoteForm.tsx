"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { quoteFormSchema, type QuoteFormValues } from "@/lib/validations/quote";
import { createClient } from "@/lib/supabase/client";
import QuoteFileUploader from "@/components/QuoteFileUploader";
import WhatsAppButton from "@/components/WhatsAppButton";
import { siteConfig } from "@/lib/site-config";
import type { Service } from "@/types";

interface QuoteFormProps {
  services: Service[];
}

export default function QuoteForm({ services }: QuoteFormProps) {
  const [drawingPaths, setDrawingPaths] = useState<string[]>([]);
  const [referencePaths, setReferencePaths] = useState<string[]>([]);
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">("idle");
  const [quoteNumber, setQuoteNumber] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
  });

  async function onSubmit(values: QuoteFormValues) {
    setSubmitState("idle");
    setSubmitError(null);

    const supabase = createClient();

    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .insert({
        customer_name: values.customerName,
        phone: values.phone,
        whatsapp: values.whatsapp || null,
        email: values.email || null,
        city: values.city || null,
        address: values.address || null,
        service_type: values.serviceType || null,
        product_or_project: values.productOrProject || null,
        material: values.material || null,
        approximate_size: values.approximateSize || null,
        quantity: values.quantity === "" ? null : values.quantity,
        budget: values.budget === "" ? null : values.budget,
        required_date: values.requiredDate || null,
        description: values.description,
      })
      .select("id, quote_number")
      .single();

    if (quoteError || !quote) {
      setSubmitState("error");
      setSubmitError("Could not submit your request. Please try again, or contact us on WhatsApp.");
      return;
    }

    const fileRows = [
      ...drawingPaths.map((storage_path) => ({ quote_id: quote.id, storage_path, file_type: "drawing" as const })),
      ...referencePaths.map((storage_path) => ({ quote_id: quote.id, storage_path, file_type: "reference_image" as const })),
    ];

    if (fileRows.length > 0) {
      await supabase.from("quote_files").insert(fileRows);
      // Non-fatal if this fails — the quote itself is already saved.
    }

    setQuoteNumber(quote.quote_number);
    setSubmitState("success");
    reset();
    setDrawingPaths([]);
    setReferencePaths([]);
  }

  if (submitState === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle2 className="h-10 w-10 text-green-600" aria-hidden="true" />
        <p className="font-display text-lg font-semibold text-navy-900">Quote request received</p>
        {quoteNumber && (
          <p className="font-mono text-sm text-steel-600">
            Reference: <span className="font-semibold">{quoteNumber}</span>
          </p>
        )}
        <p className="text-sm text-steel-500">
          Status: <span className="font-medium text-navy-900">New</span> — we&apos;ll review it and get back to you.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <WhatsAppButton
            message={`Hello, I just submitted quote request ${quoteNumber ?? ""} and wanted to follow up.`}
          />
          <button
            type="button"
            onClick={() => setSubmitState("idle")}
            className="text-sm font-semibold text-signal-600 hover:text-signal-500"
          >
            Submit another request
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="customerName" className="block text-sm font-medium text-navy-900">
            Full Name
          </label>
          <input
            id="customerName"
            {...register("customerName")}
            aria-invalid={!!errors.customerName}
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />
          {errors.customerName && <p className="mt-1 text-sm text-red-600">{errors.customerName.message}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-navy-900">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            {...register("phone")}
            aria-invalid={!!errors.phone}
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="whatsapp" className="block text-sm font-medium text-navy-900">
            WhatsApp Number <span className="text-steel-500">(optional)</span>
          </label>
          <input
            id="whatsapp"
            type="tel"
            {...register("whatsapp")}
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />
          {errors.whatsapp && <p className="mt-1 text-sm text-red-600">{errors.whatsapp.message}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-navy-900">
            Email <span className="text-steel-500">(optional)</span>
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-navy-900">
            City
          </label>
          <input
            id="city"
            {...register("city")}
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-navy-900">
            Address
          </label>
          <input
            id="address"
            {...register("address")}
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="serviceType" className="block text-sm font-medium text-navy-900">
            Service Type
          </label>
          <select
            id="serviceType"
            {...register("serviceType")}
            className="mt-1.5 w-full rounded-md border border-steel-300 bg-white px-3.5 py-2.5 text-sm focus:border-signal-500"
          >
            <option value="">Select a service</option>
            {services.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
            <option value="Other">Other / Not Sure</option>
          </select>
        </div>
        <div>
          <label htmlFor="productOrProject" className="block text-sm font-medium text-navy-900">
            Product / Project
          </label>
          <input
            id="productOrProject"
            {...register("productOrProject")}
            placeholder="e.g. Sliding gate for main entrance"
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="material" className="block text-sm font-medium text-navy-900">
            Material
          </label>
          <input
            id="material"
            {...register("material")}
            placeholder="MS / SS 304 ..."
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />
        </div>
        <div>
          <label htmlFor="approximateSize" className="block text-sm font-medium text-navy-900">
            Approximate Size
          </label>
          <input
            id="approximateSize"
            {...register("approximateSize")}
            placeholder='e.g. 8ft x 5ft'
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />
        </div>
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-navy-900">
            Quantity
          </label>
          <input
            id="quantity"
            type="number"
            min="1"
            {...register("quantity")}
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-navy-900">
            Budget (₹) <span className="text-steel-500">(optional)</span>
          </label>
          <input
            id="budget"
            type="number"
            min="0"
            {...register("budget")}
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />
        </div>
        <div>
          <label htmlFor="requiredDate" className="block text-sm font-medium text-navy-900">
            Required Date
          </label>
          <input
            id="requiredDate"
            type="date"
            {...register("requiredDate")}
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-navy-900">
          Description
        </label>
        <textarea
          id="description"
          rows={5}
          {...register("description")}
          aria-invalid={!!errors.description}
          placeholder="Tell us what you need fabricated, and any details that matter."
          className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <span className="block text-sm font-medium text-navy-900">Upload Drawing</span>
          <div className="mt-1.5">
            <QuoteFileUploader label="Upload a drawing" onChange={setDrawingPaths} />
          </div>
        </div>
        <div>
          <span className="block text-sm font-medium text-navy-900">Reference Images</span>
          <div className="mt-1.5">
            <QuoteFileUploader label="Upload reference images" multiple onChange={setReferencePaths} />
          </div>
        </div>
      </div>

      {submitState === "error" && (
        <p role="alert" className="text-sm text-red-600">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-signal-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-signal-600 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {isSubmitting ? "Submitting..." : "Submit Quote Request"}
      </button>
    </form>
  );
}
