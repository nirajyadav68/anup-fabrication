"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";

import {
  quoteFormSchema,
  type QuoteFormValues,
} from "@/lib/validations/quote";

import { createClient } from "@/lib/supabase/client";
import QuoteFileUploader from "@/components/QuoteFileUploader";
import WhatsAppButton from "@/components/WhatsAppButton";
import type { Service } from "@/types";

interface MaterialRate {
  id: string;
  name: string;
  category: string;
  rate: number;
  unit: string;
  measurement_label?: string | null;
}

interface QuoteFormProps {
  services: Service[];
  materialRates: MaterialRate[];
}

export default function QuoteForm({
  services,
  materialRates,
}: QuoteFormProps) {
  const [drawingPaths, setDrawingPaths] = useState<string[]>([]);
  const [referencePaths, setReferencePaths] = useState<string[]>([]);

  const [submitState, setSubmitState] = useState<
    "idle" | "success" | "error"
  >("idle");

  const [quoteNumber, setQuoteNumber] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Calculator states
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [measurement, setMeasurement] = useState("");
  const [finish, setFinish] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      quantity: 1,
    },
  });

  const material = watch("material");
  const quantity = watch("quantity");

  // --------------------------------------------------
  // SELECTED MATERIAL
  // --------------------------------------------------

  const selectedMaterial = useMemo(() => {
    if (!material) return null;

    return (
      materialRates.find(
        (item) =>
          item.name.toLowerCase() ===
          String(material).trim().toLowerCase()
      ) ?? null
    );
  }, [material, materialRates]);

  // --------------------------------------------------
  // SELECTED FINISH
  // --------------------------------------------------

  const selectedFinish = useMemo(() => {
    if (!finish) return null;

    return (
      materialRates.find(
        (item) =>
          item.name.toLowerCase() ===
          String(finish).trim().toLowerCase()
      ) ?? null
    );
  }, [finish, materialRates]);

  // --------------------------------------------------
  // UNIT LABEL
  // --------------------------------------------------

  const measurementLabel = useMemo(() => {
    if (!selectedMaterial) return "Measurement";

    if (selectedMaterial.measurement_label) {
      return selectedMaterial.measurement_label;
    }

    switch (selectedMaterial.unit.toLowerCase()) {
      case "sqft":
        return "Area (sqft)";

      case "kg":
        return "Weight (kg)";

      case "meter":
        return "Length (meter)";

      case "running ft":
        return "Length (running ft)";

      case "piece":
        return "Pieces";

      case "hour":
        return "Hours";

      case "day":
        return "Days";

      case "liter":
        return "Volume (liter)";

      default:
        return `Quantity (${selectedMaterial.unit})`;
    }
  }, [selectedMaterial]);

  // --------------------------------------------------
  // PRICE CALCULATOR
  // --------------------------------------------------

  const estimatedPrice = useMemo(() => {
    const qty = Number(quantity) || 1;

    if (!selectedMaterial) {
      return 0;
    }

    const unit = selectedMaterial.unit.trim().toLowerCase();

    let baseAmount = 0;

    // SQFT
    if (unit === "sqft") {
      const w = Number(width);
      const h = Number(height);

      if (w <= 0 || h <= 0) {
        return 0;
      }

      baseAmount = w * h;
    }

    // METER
    else if (unit === "meter") {
      const value = Number(measurement);

      if (value <= 0) {
        return 0;
      }

      baseAmount = value;
    }

    // RUNNING FT
    else if (unit === "running ft") {
      const value = Number(measurement);

      if (value <= 0) {
        return 0;
      }

      baseAmount = value;
    }

    // KG
    else if (unit === "kg") {
      const value = Number(measurement);

      if (value <= 0) {
        return 0;
      }

      baseAmount = value;
    }

    // PIECE
    else if (unit === "piece") {
      baseAmount = qty;
    }

    // HOUR
    else if (unit === "hour") {
      const value = Number(measurement);

      if (value <= 0) {
        return 0;
      }

      baseAmount = value;
    }

    // DAY
    else if (unit === "day") {
      const value = Number(measurement);

      if (value <= 0) {
        return 0;
      }

      baseAmount = value;
    }

    // LITER
    else if (unit === "liter") {
      const value = Number(measurement);

      if (value <= 0) {
        return 0;
      }

      baseAmount = value;
    }

    // OTHER
    else {
      const value = Number(measurement);

      if (value <= 0) {
        return 0;
      }

      baseAmount = value;
    }

    let materialCost =
      baseAmount * Number(selectedMaterial.rate);

    // Finish calculation
    if (selectedFinish) {
      const finishUnit = selectedFinish.unit
        .trim()
        .toLowerCase();

      if (finishUnit === unit) {
        materialCost +=
          baseAmount * Number(selectedFinish.rate);
      }
    }

    // For piece-based pricing quantity is
    // already included in baseAmount.
    if (unit !== "piece") {
      materialCost *= qty;
    }

    return Math.round(materialCost);
  }, [
    width,
    height,
    measurement,
    quantity,
    selectedMaterial,
    selectedFinish,
  ]);

  // --------------------------------------------------
  // CUSTOMER SYNC
  // Returns the customer id (or null if it could not be
  // created / no phone or email was given).
  // --------------------------------------------------

  async function syncCustomer(
    values: QuoteFormValues
  ): Promise<string | null> {
    const supabase = createClient();

    const customerPhone = values.phone?.trim() || null;
    const customerEmail =
      values.email?.trim().toLowerCase() || null;

    // A customer should have at least phone or email
    // so that we can identify existing customers.
    if (!customerPhone && !customerEmail) {
      return null;
    }

    let existingCustomer: { id: string } | null = null;

    // Find customer by phone
    if (customerPhone) {
      const { data, error } = await supabase
        .from("customers")
        .select("id")
        .eq("phone", customerPhone)
        .maybeSingle();

      if (error) {
        console.error(
          "Customer phone lookup error:",
          error
        );
      } else if (data) {
        existingCustomer = data;
      }
    }

    // If not found by phone, find by email
    if (!existingCustomer && customerEmail) {
      const { data, error } = await supabase
        .from("customers")
        .select("id")
        .eq("email", customerEmail)
        .maybeSingle();

      if (error) {
        console.error(
          "Customer email lookup error:",
          error
        );
      } else if (data) {
        existingCustomer = data;
      }
    }

    // Existing customer → update
    if (existingCustomer) {
      const { error } = await supabase
        .from("customers")
        .update({
          name: values.customerName,
          phone: customerPhone,
          whatsapp: values.whatsapp || null,
          email: customerEmail,
          city: values.city || null,
          address: values.address || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingCustomer.id);

      if (error) {
        console.error(
          "Customer update error:",
          error
        );
      }

      return existingCustomer.id;
    }

    // New customer → create
    const { data: newCustomer, error } = await supabase
      .from("customers")
      .insert({
        name: values.customerName,
        phone: customerPhone,
        whatsapp: values.whatsapp || null,
        email: customerEmail,
        city: values.city || null,
        address: values.address || null,
      })
      .select("id")
      .single();

    if (error || !newCustomer) {
      console.error(
        "Customer creation error:",
        error
      );

      return null;
    }

    return newCustomer.id;
  }

  // --------------------------------------------------
  // SUBMIT QUOTE
  // --------------------------------------------------

  async function onSubmit(values: QuoteFormValues) {
    setSubmitState("idle");
    setSubmitError(null);

    const supabase = createClient();

    // Create or update the customer first so the
    // quote can be linked to it.
    const customerId = await syncCustomer(values);

    const { data: quote, error: quoteError } =
      await supabase
        .from("quotes")
        .insert({
          customer_id: customerId,

          customer_name: values.customerName,
          phone: values.phone,
          whatsapp: values.whatsapp || null,
          email:
            values.email?.trim().toLowerCase() || null,
          city: values.city || null,
          address: values.address || null,

          service_type:
            values.serviceType || null,

          product_or_project:
            values.productOrProject || null,

          material:
            values.material || null,

          approximate_size:
            values.approximateSize || null,

          width: width
            ? Number(width)
            : null,

          height: height
            ? Number(height)
            : null,

          finish:
            finish || null,

          estimated_price:
            estimatedPrice || null,

          quantity:
            values.quantity === ""
              ? null
              : values.quantity,

          budget:
            values.budget === ""
              ? null
              : values.budget,

          required_date:
            values.requiredDate || null,

          description:
            values.description,

          status: "new",
        })
        .select("id, quote_number")
        .single();

    if (quoteError || !quote) {
      console.error(
        "Quote submission error:",
        quoteError
      );

      setSubmitState("error");

      setSubmitError(
        "Could not submit your request. Please try again, or contact us on WhatsApp."
      );

      return;
    }

    // --------------------------------------------------
    // CUSTOMER ACTIVITY
    // --------------------------------------------------

    // Create a customer activity when the quote is created.
    // Activity failure should not stop the quote submission.
    if (customerId) {
      const { error: activityError } = await supabase.rpc(
        "create_customer_quote_activity",
        {
          p_customer_id: customerId,
          p_quote_id: quote.id,
          p_title: `Quote ${quote.quote_number || "created"}`,
          p_description:
            values.productOrProject ||
            values.serviceType ||
            "New quote request submitted",
        }
      );

      if (activityError) {
        console.error(
          "Customer activity creation error:",
          activityError
        );
      }
    }

    // --------------------------------------------------
    // FILE REFERENCES
    // --------------------------------------------------

    const fileRows = [
      ...drawingPaths.map(
        (storage_path) => ({
          quote_id: quote.id,
          storage_path,
          file_type: "drawing" as const,
        })
      ),

      ...referencePaths.map(
        (storage_path) => ({
          quote_id: quote.id,
          storage_path,
          file_type:
            "reference_image" as const,
        })
      ),
    ];

    if (fileRows.length > 0) {
      const { error: fileError } =
        await supabase
          .from("quote_files")
          .insert(fileRows);

      if (fileError) {
        console.error(
          "Quote file save error:",
          fileError
        );
      }
    }

    // --------------------------------------------------
    // SUCCESS
    // --------------------------------------------------

    setQuoteNumber(
      quote.quote_number
    );

    setSubmitState("success");

    reset();

    setWidth("");
    setHeight("");
    setMeasurement("");
    setFinish("");

    setDrawingPaths([]);
    setReferencePaths([]);
  }

  // --------------------------------------------------
  // SUCCESS SCREEN
  // --------------------------------------------------

  if (submitState === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle2
          className="h-10 w-10 text-green-600"
          aria-hidden="true"
        />

        <p className="font-display text-lg font-semibold text-navy-900">
          Quote request received
        </p>

        {quoteNumber && (
          <p className="font-mono text-sm text-steel-600">
            Reference:{" "}
            <span className="font-semibold">
              {quoteNumber}
            </span>
          </p>
        )}

        <p className="text-sm text-steel-500">
          Status:{" "}
          <span className="font-medium text-navy-900">
            New
          </span>{" "}
          — we&apos;ll review it and get back to you.
        </p>

        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <WhatsAppButton
            message={`Hello, I just submitted quote request ${
              quoteNumber ?? ""
            } and wanted to follow up.`}
          />

          <button
            type="button"
            onClick={() =>
              setSubmitState("idle")
            }
            className="text-sm font-semibold text-signal-600 hover:text-signal-500"
          >
            Submit another request
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // MAIN FORM
  // --------------------------------------------------

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5"
    >
      {/* CUSTOMER INFORMATION */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="customerName"
            className="block text-sm font-medium text-navy-900"
          >
            Full Name
          </label>

          <input
            id="customerName"
            {...register("customerName")}
            aria-invalid={
              !!errors.customerName
            }
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />

          {errors.customerName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.customerName.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-navy-900"
          >
            Phone Number
          </label>

          <input
            id="phone"
            type="tel"
            {...register("phone")}
            aria-invalid={
              !!errors.phone
            }
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />

          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">
              {errors.phone.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="whatsapp"
            className="block text-sm font-medium text-navy-900"
          >
            WhatsApp Number{" "}
            <span className="text-steel-500">
              (optional)
            </span>
          </label>

          <input
            id="whatsapp"
            type="tel"
            {...register("whatsapp")}
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />

          {errors.whatsapp && (
            <p className="mt-1 text-sm text-red-600">
              {errors.whatsapp.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-navy-900"
          >
            Email{" "}
            <span className="text-steel-500">
              (optional)
            </span>
          </label>

          <input
            id="email"
            type="email"
            {...register("email")}
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />

          {errors.email && (
            <p className="mt-1 text-sm text-red-600">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      {/* LOCATION */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-navy-900"
          >
            City
          </label>

          <input
            id="city"
            {...register("city")}
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />
        </div>

        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-navy-900"
          >
            Address
          </label>

          <input
            id="address"
            {...register("address")}
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />
        </div>
      </div>

      {/* SERVICE */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="serviceType"
            className="block text-sm font-medium text-navy-900"
          >
            Service Type
          </label>

          <select
            id="serviceType"
            {...register("serviceType")}
            className="mt-1.5 w-full rounded-md border border-steel-300 bg-white px-3.5 py-2.5 text-sm focus:border-signal-500"
          >
            <option value="">
              Select a service
            </option>

            {services.map(
              (service) => (
                <option
                  key={service.id}
                  value={service.name}
                >
                  {service.name}
                </option>
              )
            )}

            <option value="Other">
              Other / Not Sure
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor="productOrProject"
            className="block text-sm font-medium text-navy-900"
          >
            Product / Project
          </label>

          <input
            id="productOrProject"
            {...register(
              "productOrProject"
            )}
            placeholder="e.g. Sliding gate for main entrance"
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />
        </div>
      </div>

      {/* MATERIAL */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div>
          <label
            htmlFor="material"
            className="block text-sm font-medium text-navy-900"
          >
            Material
          </label>

          <select
            id="material"
            {...register("material")}
            className="mt-1.5 w-full rounded-md border border-steel-300 bg-white px-3.5 py-2.5 text-sm focus:border-signal-500"
          >
            <option value="">
              Select material
            </option>

            {materialRates
              .filter(
                (item) =>
                  item.category ===
                    "material" ||
                  item.category ===
                    "product"
              )
              .map((item) => (
                <option
                  key={item.id}
                  value={item.name}
                >
                  {item.name} — ₹
                  {item.rate.toLocaleString(
                    "en-IN"
                  )}
                  /{item.unit}
                </option>
              ))}
          </select>
        </div>

        {/* APPROXIMATE SIZE */}

        <div>
          <label
            htmlFor="approximateSize"
            className="block text-sm font-medium text-navy-900"
          >
            Approximate Size
          </label>

          <input
            id="approximateSize"
            {...register(
              "approximateSize"
            )}
            placeholder="e.g. 10ft x 6ft"
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />
        </div>

        {/* QUANTITY */}

        <div>
          <label
            htmlFor="quantity"
            className="block text-sm font-medium text-navy-900"
          >
            Quantity
          </label>

          <input
            id="quantity"
            type="number"
            min="1"
            {...register("quantity")}
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />

          {errors.quantity && (
            <p className="mt-1 text-sm text-red-600">
              {errors.quantity.message}
            </p>
          )}
        </div>
      </div>

      {/* SMART PRICE ESTIMATOR */}

      <div className="rounded-xl border border-steel-200 bg-steel-50 p-5">
        <div className="mb-4">
          <h3 className="font-display text-lg font-semibold text-navy-900">
            Smart Price Estimator
          </h3>

          <p className="mt-1 text-sm text-steel-500">
            Select a material and enter the
            required measurement.
          </p>
        </div>

        {/* SQFT */}

        {selectedMaterial?.unit
          .toLowerCase() ===
          "sqft" && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="width"
                className="block text-sm font-medium text-navy-900"
              >
                Width (ft)
              </label>

              <input
                id="width"
                type="number"
                min="0"
                step="0.1"
                value={width}
                onChange={(event) =>
                  setWidth(
                    event.target.value
                  )
                }
                placeholder="e.g. 10"
                className="mt-1.5 w-full rounded-md border border-steel-300 bg-white px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="height"
                className="block text-sm font-medium text-navy-900"
              >
                Height (ft)
              </label>

              <input
                id="height"
                type="number"
                min="0"
                step="0.1"
                value={height}
                onChange={(event) =>
                  setHeight(
                    event.target.value
                  )
                }
                placeholder="e.g. 6"
                className="mt-1.5 w-full rounded-md border border-steel-300 bg-white px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>
        )}

        {/* NON-SQFT */}

        {selectedMaterial &&
          selectedMaterial.unit.toLowerCase() !==
            "sqft" && (
            <div>
              <label
                htmlFor="measurement"
                className="block text-sm font-medium text-navy-900"
              >
                {measurementLabel}
              </label>

              <input
                id="measurement"
                type="number"
                min="0"
                step="0.01"
                value={measurement}
                onChange={(event) =>
                  setMeasurement(
                    event.target.value
                  )
                }
                placeholder={`Enter ${selectedMaterial.unit}`}
                className="mt-1.5 w-full rounded-md border border-steel-300 bg-white px-3.5 py-2.5 text-sm"
              />
            </div>
          )}

        {/* FINISH */}

        <div className="mt-5">
          <label
            htmlFor="finish"
            className="block text-sm font-medium text-navy-900"
          >
            Finish
          </label>

          <select
            id="finish"
            value={finish}
            onChange={(event) =>
              setFinish(
                event.target.value
              )
            }
            className="mt-1.5 w-full rounded-md border border-steel-300 bg-white px-3.5 py-2.5 text-sm"
          >
            <option value="">
              No finish / Select finish
            </option>

            {materialRates
              .filter(
                (item) =>
                  item.category ===
                  "finishing"
              )
              .map((item) => (
                <option
                  key={item.id}
                  value={item.name}
                >
                  {item.name} — ₹
                  {item.rate.toLocaleString(
                    "en-IN"
                  )}
                  /{item.unit}
                </option>
              ))}
          </select>
        </div>

        {/* RATE INFO */}

        {selectedMaterial && (
          <div className="mt-5 rounded-lg border border-steel-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-steel-500">
              Selected Material
            </p>

            <p className="mt-1 font-semibold text-navy-900">
              {selectedMaterial.name}
            </p>

            <p className="mt-1 text-sm text-steel-600">
              ₹
              {selectedMaterial.rate.toLocaleString(
                "en-IN"
              )}
              /{selectedMaterial.unit}
            </p>
          </div>
        )}

        {selectedFinish && (
          <div className="mt-3 rounded-lg border border-steel-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-steel-500">
              Selected Finish
            </p>

            <p className="mt-1 font-semibold text-navy-900">
              {selectedFinish.name}
            </p>

            <p className="mt-1 text-sm text-steel-600">
              ₹
              {selectedFinish.rate.toLocaleString(
                "en-IN"
              )}
              /{selectedFinish.unit}
            </p>
          </div>
        )}

        {/* ESTIMATED PRICE */}

        {estimatedPrice > 0 && (
          <div className="mt-5 rounded-lg border border-signal-200 bg-white p-5">
            <p className="text-sm text-steel-600">
              Estimated Fabrication Cost
            </p>

            <p className="mt-1 text-3xl font-bold text-navy-900">
              ₹
              {estimatedPrice.toLocaleString(
                "en-IN"
              )}
            </p>

            <p className="mt-2 text-xs text-steel-500">
              This is an approximate estimate.
              Final pricing may vary based on
              design, material quality, site
              conditions, labour and installation
              requirements.
            </p>
          </div>
        )}
      </div>

      {/* BUDGET / DATE */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="budget"
            className="block text-sm font-medium text-navy-900"
          >
            Budget (₹){" "}
            <span className="text-steel-500">
              (optional)
            </span>
          </label>

          <input
            id="budget"
            type="number"
            min="0"
            {...register("budget")}
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm"
          />

          {errors.budget && (
            <p className="mt-1 text-sm text-red-600">
              {errors.budget.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="requiredDate"
            className="block text-sm font-medium text-navy-900"
          >
            Required Date
          </label>

          <input
            id="requiredDate"
            type="date"
            {...register(
              "requiredDate"
            )}
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm"
          />
        </div>
      </div>

      {/* DESCRIPTION */}

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-navy-900"
        >
          Description
        </label>

        <textarea
          id="description"
          rows={5}
          {...register("description")}
          aria-invalid={
            !!errors.description
          }
          placeholder="Tell us what you need fabricated, and any details that matter."
          className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm"
        />

        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* FILE UPLOADS */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <span className="block text-sm font-medium text-navy-900">
            Upload Drawing
          </span>

          <div className="mt-1.5">
            <QuoteFileUploader
              label="Upload a drawing"
              onChange={
                setDrawingPaths
              }
            />
          </div>
        </div>

        <div>
          <span className="block text-sm font-medium text-navy-900">
            Reference Images
          </span>

          <div className="mt-1.5">
            <QuoteFileUploader
              label="Upload reference images"
              multiple
              onChange={
                setReferencePaths
              }
            />
          </div>
        </div>
      </div>

      {/* ERROR */}

      {submitState === "error" && (
        <p
          role="alert"
          className="text-sm text-red-600"
        >
          {submitError}
        </p>
      )}

      {/* SUBMIT */}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-signal-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-signal-600 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting && (
          <Loader2
            className="h-4 w-4 animate-spin"
            aria-hidden="true"
          />
        )}

        {isSubmitting
          ? "Submitting..."
          : "Submit Quote Request"}
      </button>
    </form>
  );
}