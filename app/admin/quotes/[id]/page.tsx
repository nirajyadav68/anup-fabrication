import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  ImageIcon,
  Download,
  MessageCircle,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { mediaUrl } from "@/lib/supabase/storage";

import StatusBadge from "@/components/admin/StatusBadge";
import QuoteStatusForm from "@/components/admin/QuoteStatusForm";
import DeleteButton from "@/components/admin/DeleteButton";
import QuotePDF from "@/components/admin/QuotePDF";

import {
  updateQuoteStatus,
  deleteQuote,
} from "../actions";

export const metadata: Metadata = {
  title: "Quote Detail",
  robots: {
    index: false,
    follow: false,
  },
};

interface Props {
  params: {
    id: string;
  };
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

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

function formatCurrency(
  value: number | null | undefined
) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  return `₹${Number(value).toLocaleString("en-IN")}`;
}

export default async function AdminQuoteDetailPage({
  params,
}: Props) {
  const supabase = createClient();

  const {
    data: quote,
    error,
  } = await supabase
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

  if (error || !quote) {
    notFound();
  }

  const boundUpdate = updateQuoteStatus.bind(
    null,
    quote.id
  );

  const drawings = (
    quote.quote_files ?? []
  ).filter(
    (file: any) =>
      file.file_type === "drawing"
  );

  const referenceImages = (
    quote.quote_files ?? []
  ).filter(
    (file: any) =>
      file.file_type ===
      "reference_image"
  );

  // ======================================================
  // WHATSAPP
  // ======================================================

  const whatsappNumber =
    quote.whatsapp || quote.phone;

  const whatsappMessage = encodeURIComponent(
    `Hello ${quote.customer_name},

Your quotation ${quote.quote_number} from ANUP FABRICATION WORKS is ready.

Quotation Amount: ${
      quote.estimated_price
        ? `₹${Number(
            quote.estimated_price
          ).toLocaleString("en-IN")}`
        : "As discussed"
    }

Please review the quotation and let us know if you would like to proceed.

Thank you,
ANUP FABRICATION WORKS`
  );

  const cleanWhatsappNumber =
    whatsappNumber
      ? String(whatsappNumber).replace(
          /\D/g,
          ""
        )
      : "";

  const whatsappUrl =
    cleanWhatsappNumber
      ? `https://wa.me/${cleanWhatsappNumber}?text=${whatsappMessage}`
      : null;

  return (
    <div>
      {/* ==================================================
          BACK
      ================================================== */}

      <Link
        href="/admin/quotes"
        className="inline-flex items-center gap-1.5 text-sm text-steel-500 transition hover:text-navy-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Quotes
      </Link>

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-mono text-2xl font-bold text-navy-900">
            {quote.quote_number}
          </h1>

          <p className="mt-1 text-sm text-steel-500">
            Submitted{" "}
            {new Date(
              quote.created_at
            ).toLocaleString("en-IN")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">

          {/* PDF DOWNLOAD */}

          <QuotePDF
            quote={{
              quoteNumber:
                quote.quote_number,

              createdAt:
                quote.created_at,

              customerName:
                quote.customer_name,

              phone:
                quote.phone,

              email:
                quote.email,

              city:
                quote.city,

              address:
                quote.address,

              productOrProject:
                quote.product_or_project,

              serviceType:
                quote.service_type,

              material:
                quote.material,

              approximateSize:
                quote.approximate_size,

              quantity:
                quote.quantity,

              estimatedPrice:
                quote.estimated_price,

              budget:
                quote.budget,

              description:
                quote.description,
            }}
          />

          {/* WHATSAPP */}

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp Customer
            </a>
          )}

          {/* STATUS */}

          <StatusBadge
            status={quote.status}
          />
        </div>
      </div>

      {/* ==================================================
          ACTION INFO
      ================================================== */}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">

        {/* PDF INFO */}

        <div className="flex items-center gap-2 rounded-lg border border-signal-100 bg-signal-50 px-4 py-3">
          <Download className="h-4 w-4 shrink-0 text-signal-600" />

          <p className="text-sm text-signal-700">
            Download a professional quotation
            PDF using the quote information.
          </p>
        </div>

        {/* WHATSAPP INFO */}

        <div className="flex items-center gap-2 rounded-lg border border-green-100 bg-green-50 px-4 py-3">
          <MessageCircle className="h-4 w-4 shrink-0 text-green-600" />

          <p className="text-sm text-green-700">
            Open WhatsApp with a pre-filled
            quotation message.
          </p>
        </div>
      </div>

      {/* ==================================================
          STATUS WORKFLOW
      ================================================== */}

      <div className="mt-6 rounded-lg border border-steel-100 bg-white p-6">
        <h2 className="mb-4 font-display text-base font-semibold text-navy-900">
          Quote Status
        </h2>

        <QuoteStatusForm
          action={boundUpdate}
          currentStatus={quote.status}
        />
      </div>

      {/* ==================================================
          CUSTOMER / QUOTE DETAILS
      ================================================== */}

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
            value={
              quote.product_or_project
            }
          />

          <Field
            label="Material"
            value={quote.material}
          />

          <Field
            label="Approximate Size"
            value={
              quote.approximate_size
            }
          />

          <Field
            label="Quantity"
            value={quote.quantity}
          />

          <Field
            label="Budget"
            value={formatCurrency(
              quote.budget
            )}
          />

          <Field
            label="Required Date"
            value={
              quote.required_date
            }
          />
        </dl>
      </div>

      {/* ==================================================
          SMART PRICE ESTIMATE
      ================================================== */}

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
            value={
              quote.width !== null &&
              quote.width !== undefined
                ? `${quote.width}`
                : null
            }
          />

          <Field
            label="Height"
            value={
              quote.height !== null &&
              quote.height !== undefined
                ? `${quote.height}`
                : null
            }
          />

          <Field
            label="Finish"
            value={quote.finish}
          />

          <Field
            label="Estimated Price"
            value={formatCurrency(
              quote.estimated_price
            )}
          />
        </dl>

        {!quote.estimated_price && (
          <p className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            No smart price estimate was
            generated for this quote.
          </p>
        )}
      </div>

      {/* ==================================================
          DESCRIPTION
      ================================================== */}

      <div className="mt-6 rounded-lg border border-steel-100 bg-white p-6">
        <h2 className="font-display text-base font-semibold text-navy-900">
          Description
        </h2>

        <p className="mt-2 whitespace-pre-wrap text-sm text-steel-700">
          {quote.description ||
            "No description provided."}
        </p>
      </div>

      {/* ==================================================
          ATTACHMENTS
      ================================================== */}

      {(drawings.length > 0 ||
        referenceImages.length > 0) && (
        <div className="mt-6 rounded-lg border border-steel-100 bg-white p-6">

          <h2 className="font-display text-base font-semibold text-navy-900">
            Attachments
          </h2>

          <div className="mt-3 flex flex-wrap gap-3">

            {/* DRAWINGS */}

            {drawings.map(
              (file: any) => (
                <a
                  key={file.id}
                  href={
                    mediaUrl(
                      file.storage_path
                    )!
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-md border border-steel-200 px-3 py-2 text-sm text-steel-700 transition hover:border-signal-500 hover:text-signal-600"
                >
                  <FileText className="h-4 w-4" />

                  {file.original_filename ||
                    "Drawing"}
                </a>
              )
            )}

            {/* REFERENCE IMAGES */}

            {referenceImages.map(
              (file: any) => (
                <a
                  key={file.id}
                  href={
                    mediaUrl(
                      file.storage_path
                    )!
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-md border border-steel-200 px-3 py-2 text-sm text-steel-700 transition hover:border-signal-500 hover:text-signal-600"
                >
                  <ImageIcon className="h-4 w-4" />

                  {file.original_filename ||
                    "Reference Image"}
                </a>
              )
            )}
          </div>
        </div>
      )}

      {/* ==================================================
          DELETE
      ================================================== */}

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