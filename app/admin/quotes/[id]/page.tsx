import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { mediaUrl } from "@/lib/supabase/storage";
import StatusBadge from "@/components/admin/StatusBadge";
import QuoteStatusForm from "@/components/admin/QuoteStatusForm";
import DeleteButton from "@/components/admin/DeleteButton";
import { updateQuoteStatus, deleteQuote } from "../actions";

export const metadata: Metadata = {
  title: "Quote Detail",
  robots: { index: false, follow: false },
};

interface Props {
  params: { id: string };
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  if (value === null || value === undefined || value === "") return null;

  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-steel-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-navy-900">
        {value}
      </dd>
    </div>
  );
}

export default async function AdminQuoteDetailPage({ params }: Props) {
  const supabase = createClient();

  const { data: quote } = await supabase
    .from("quotes")
    .select(`
      id,
      quote_number,
      customer_name,
      phone,
      whatsapp,
      email,
      city,
      address,
      service_type,
      product_or_project,
      material,
      approximate_size,
      width,
      height,
      finish,
      estimated_price,
      quantity,
      budget,
      required_date,
      description,
      status,
      created_at,
      quote_files(
        id,
        storage_path,
        file_type,
        original_filename
      )
    `)
    .eq("id", params.id)
    .single();

  if (!quote) notFound();

  const boundUpdate = updateQuoteStatus.bind(null, quote.id);

  const drawings = (quote.quote_files ?? []).filter(
    (f: any) => f.file_type === "drawing"
  );

  const referenceImages = (quote.quote_files ?? []).filter(
    (f: any) => f.file_type === "reference_image"
  );

  return (
    <div>
      {/* Back */}
      <Link
        href="/admin/quotes"
        className="inline-flex items-center gap-1.5 text-sm text-steel-500 hover:text-navy-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Quotes
      </Link>

      {/* Header */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-mono text-2xl font-bold text-navy-900">
            {quote.quote_number}
          </h1>

          <p className="mt-1 text-sm text-steel-500">
            Submitted{" "}
            {new Date(quote.created_at).toLocaleString("en-IN")}
          </p>
        </div>

        <StatusBadge status={quote.status} />
      </div>

      {/* Status Workflow */}
      <div className="mt-6 rounded-lg border border-steel-100 bg-white p-6">
        <h2 className="mb-4 font-display text-base font-semibold text-navy-900">
          Quote Status
        </h2>

        <QuoteStatusForm
          action={boundUpdate}
          currentStatus={quote.status}
        />
      </div>

      {/* Customer / Quote Details */}
      <div className="mt-6 rounded-lg border border-steel-100 bg-white p-6">
        <h2 className="font-display text-base font-semibold text-navy-900">
          Quote Information
        </h2>

        <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field
            label="Customer Name"
            value={quote.customer_name}
          />

          <Field
            label="Phone"
            value={quote.phone}
          />

          <Field
            label="WhatsApp"
            value={quote.whatsapp}
          />

          <Field
            label="Email"
            value={quote.email}
          />

          <Field
            label="City"
            value={quote.city}
          />

          <Field
            label="Address"
            value={quote.address}
          />

          <Field
            label="Service Type"
            value={quote.service_type}
          />

          <Field
            label="Product / Project"
            value={quote.product_or_project}
          />

          <Field
            label="Material"
            value={quote.material}
          />

          <Field
            label="Approximate Size"
            value={quote.approximate_size}
          />

          <Field
            label="Quantity"
            value={quote.quantity}
          />

          <Field
            label="Budget"
            value={
              quote.budget
                ? `₹${Number(quote.budget).toLocaleString("en-IN")}`
                : null
            }
          />

          <Field
            label="Required Date"
            value={quote.required_date}
          />
        </dl>
      </div>

      {/* Smart Price Estimate */}
      <div className="mt-6 rounded-xl border border-signal-200 bg-signal-50 p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-600">
              Smart Calculator
            </p>

            <h2 className="mt-1 font-display text-xl font-bold text-navy-900">
              Smart Price Estimate
            </h2>
          </div>

          <div className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-signal-700">
            Estimated
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field
            label="Width"
            value={quote.width ? `${quote.width}` : null}
          />

          <Field
            label="Height"
            value={quote.height ? `${quote.height}` : null}
          />

          <Field
            label="Finish"
            value={quote.finish}
          />

          <Field
            label="Estimated Price"
            value={
              quote.estimated_price
                ? `₹${Number(
                    quote.estimated_price
                  ).toLocaleString("en-IN")}`
                : null
            }
          />
        </dl>

        {!quote.estimated_price && (
          <p className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            No smart price estimate was generated for this quote.
          </p>
        )}
      </div>

      {/* Description */}
      <div className="mt-6 rounded-lg border border-steel-100 bg-white p-6">
        <h2 className="font-display text-base font-semibold text-navy-900">
          Description
        </h2>

        <p className="mt-2 whitespace-pre-wrap text-sm text-steel-700">
          {quote.description || "No description provided."}
        </p>
      </div>

      {/* Attachments */}
      {(drawings.length > 0 || referenceImages.length > 0) && (
        <div className="mt-6 rounded-lg border border-steel-100 bg-white p-6">
          <h2 className="font-display text-base font-semibold text-navy-900">
            Attachments
          </h2>

          <div className="mt-3 flex flex-wrap gap-3">
            {drawings.map((f: any) => (
              <a
                key={f.id}
                href={mediaUrl(f.storage_path)!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-md border border-steel-200 px-3 py-2 text-sm text-steel-700 hover:border-signal-500 hover:text-signal-600"
              >
                <FileText className="h-4 w-4" />
                Drawing
              </a>
            ))}

            {referenceImages.map((f: any) => (
              <a
                key={f.id}
                href={mediaUrl(f.storage_path)!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-md border border-steel-200 px-3 py-2 text-sm text-steel-700 hover:border-signal-500 hover:text-signal-600"
              >
                <ImageIcon className="h-4 w-4" />
                Reference Image
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Delete */}
      <div className="mt-6">
        <DeleteButton
          action={deleteQuote}
          id={quote.id}
          itemLabel={`quote ${quote.quote_number}`}
        />
      </div>
    </div>
  );
}