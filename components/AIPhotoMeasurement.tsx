"use client";

import { useEffect, useRef, useState } from "react";

type MeasurementResult = {
  object: string;
  width: number;
  height: number;
  area: number;
  unit: string;
  confidence: number;
  material: string;
  notes: string;
};

type Props = {
  onMeasurementReady?: (result: MeasurementResult) => void;
};

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function AIPhotoMeasurement({
  onMeasurementReady,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [referenceValue, setReferenceValue] = useState("");
  const [referenceUnit, setReferenceUnit] = useState("meter");

  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [result, setResult] =
    useState<MeasurementResult | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile = event.target.files?.[0];

    setError("");
    setSuccess("");
    setResult(null);

    if (!selectedFile) {
      return;
    }

    if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
      setError(
        "Please upload a JPG, PNG, or WebP image."
      );
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(
        "Image size must be 10 MB or less."
      );
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const url = URL.createObjectURL(selectedFile);

    setFile(selectedFile);
    setPreviewUrl(url);
  }

  function removeImage() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(null);
    setPreviewUrl("");
    setResult(null);
    setError("");
    setSuccess("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleAnalyze() {
    setError("");
    setSuccess("");

    if (!file) {
      setError("Please upload a fabrication photo.");
      return;
    }

    const reference = Number(referenceValue);

    if (!reference || reference <= 0) {
      setError(
        "Please enter a valid reference measurement."
      );
      return;
    }

    /*
     * Phase 2:
     * UI and measurement flow only.
     *
     * Actual Vision AI API will be connected
     * in the next phase.
     */

    setAnalyzing(true);

    await new Promise((resolve) =>
      setTimeout(resolve, 1200)
    );

    /*
     * Temporary demo result.
     *
     * This will be replaced by the real AI
     * measurement API in Phase 3.
     */
    const demoResult: MeasurementResult = {
      object: "Fabrication Gate",
      width:
        referenceUnit === "meter"
          ? Number((reference * 3.78).toFixed(2))
          : Number((reference * 3.78).toFixed(2)),
      height:
        referenceUnit === "meter"
          ? Number((reference * 2.16).toFixed(2))
          : Number((reference * 2.16).toFixed(2)),
      area: Number(
        (
          reference * 3.78 * reference * 2.16
        ).toFixed(2)
      ),
      unit: referenceUnit,
      confidence: 82,
      material: "MS Steel",
      notes:
        "AI estimated measurement. Final dimensions must be verified manually before fabrication.",
    };

    setResult(demoResult);

    setSuccess(
      "Photo analysis completed. This is currently a demo estimate."
    );

    setAnalyzing(false);

    onMeasurementReady?.(demoResult);
  }

  function useMeasurements() {
    if (!result) {
      return;
    }

    onMeasurementReady?.(result);

    setSuccess(
      "Estimated measurements are ready to use in the quote."
    );
  }

  return (
    <section className="rounded-2xl border border-steel-200 bg-white p-6 shadow-sm">
      {/* HEADER */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-signal-50 text-lg">
            🤖
          </div>

          <div>
            <h2 className="text-lg font-bold text-steel-900">
              AI Photo Measurement
            </h2>

            <p className="text-sm text-steel-500">
              Upload a fabrication photo to estimate
              dimensions.
            </p>
          </div>
        </div>
      </div>

      {/* UPLOAD */}
      <div className="mt-6">
        <label className="mb-2 block text-sm font-semibold text-steel-900">
          Fabrication Photo
        </label>

        {!previewUrl ? (
          <button
            type="button"
            onClick={() =>
              fileInputRef.current?.click()
            }
            className="flex min-h-[180px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-steel-300 bg-steel-50 px-6 py-8 text-center transition hover:border-signal-500 hover:bg-signal-50"
          >
            <span className="text-4xl">
              📷
            </span>

            <span className="mt-3 text-sm font-semibold text-steel-900">
              Upload fabrication photo
            </span>

            <span className="mt-1 text-xs text-steel-500">
              JPG, PNG or WebP · Maximum 10 MB
            </span>
          </button>
        ) : (
          <div className="overflow-hidden rounded-xl border border-steel-200">
            <div className="relative bg-steel-100">
              <img
                src={previewUrl}
                alt="Fabrication preview"
                className="max-h-[360px] w-full object-contain"
              />
            </div>

            <div className="flex flex-col gap-3 border-t border-steel-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-steel-900">
                  {file?.name}
                </p>

                {file && (
                  <p className="mt-1 text-xs text-steel-500">
                    {(
                      file.size /
                      (1024 * 1024)
                    ).toFixed(2)}{" "}
                    MB
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={removeImage}
                className="rounded-md border border-steel-300 px-4 py-2 text-sm font-semibold text-steel-700 hover:bg-steel-50"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* REFERENCE */}
      <div className="mt-6 rounded-xl border border-steel-200 bg-steel-50 p-5">
        <div>
          <h3 className="text-sm font-bold text-steel-900">
            Reference Measurement
          </h3>

          <p className="mt-1 text-xs leading-5 text-steel-500">
            For better accuracy, provide a known
            measurement visible in the photo.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="ai-reference-value"
              className="mb-1.5 block text-sm font-semibold text-steel-900"
            >
              Reference Value
            </label>

            <input
              id="ai-reference-value"
              type="number"
              min="0.01"
              step="0.01"
              value={referenceValue}
              onChange={(event) =>
                setReferenceValue(
                  event.target.value
                )
              }
              placeholder="Example: 1"
              className="w-full rounded-md border border-steel-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
            />
          </div>

          <div>
            <label
              htmlFor="ai-reference-unit"
              className="mb-1.5 block text-sm font-semibold text-steel-900"
            >
              Unit
            </label>

            <select
              id="ai-reference-unit"
              value={referenceUnit}
              onChange={(event) =>
                setReferenceUnit(
                  event.target.value
                )
              }
              className="w-full rounded-md border border-steel-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
            >
              <option value="meter">
                Meter
              </option>

              <option value="cm">
                Centimeter
              </option>

              <option value="ft">
                Feet
              </option>

              <option value="inch">
                Inch
              </option>
            </select>
          </div>
        </div>

        <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-800">
          <strong>Tip:</strong> Use a known-size
          object such as a 1-meter reference,
          standard door, tile, or another measured
          object visible in the photo.
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* SUCCESS */}
      {success && (
        <div className="mt-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* ANALYZE */}
      <div className="mt-5">
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={analyzing || !file}
          className="w-full rounded-md bg-signal-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-signal-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {analyzing
            ? "🤖 Analyzing Photo..."
            : "🤖 Analyze Photo"}
        </button>
      </div>

      {/* RESULT */}
      {result && (
        <div className="mt-6 overflow-hidden rounded-xl border border-signal-200">
          <div className="border-b border-signal-200 bg-signal-50 px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-steel-900">
                  AI Measurement Result
                </h3>

                <p className="mt-1 text-xs text-steel-500">
                  Estimated from uploaded photo
                </p>
              </div>

              <div className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-steel-700">
                {result.confidence}% confidence
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-px bg-steel-200 sm:grid-cols-4">
            <div className="bg-white p-4">
              <p className="text-xs text-steel-500">
                Object
              </p>

              <p className="mt-1 font-bold text-steel-900">
                {result.object}
              </p>
            </div>

            <div className="bg-white p-4">
              <p className="text-xs text-steel-500">
                Width
              </p>

              <p className="mt-1 font-bold text-steel-900">
                {result.width} {result.unit}
              </p>
            </div>

            <div className="bg-white p-4">
              <p className="text-xs text-steel-500">
                Height
              </p>

              <p className="mt-1 font-bold text-steel-900">
                {result.height} {result.unit}
              </p>
            </div>

            <div className="bg-white p-4">
              <p className="text-xs text-steel-500">
                Area
              </p>

              <p className="mt-1 font-bold text-steel-900">
                {result.area}{" "}
                {result.unit === "meter"
                  ? "m²"
                  : "sq.ft"}
              </p>
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-steel-500">
                Suggested Material
              </p>

              <p className="mt-1 text-sm font-semibold text-steel-900">
                {result.material}
              </p>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
              <strong>Important:</strong>{" "}
              {result.notes}
            </div>

            <button
              type="button"
              onClick={useMeasurements}
              className="w-full rounded-md border border-signal-500 px-5 py-2.5 text-sm font-semibold text-signal-700 hover:bg-signal-50 sm:w-auto"
            >
              Use Measurements in Quote
            </button>
          </div>
        </div>
      )}
    </section>
  );
}