"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_STATUSES = [
  "pending",
  "in_progress",
  "on_hold",
  "quality_check",
  "completed",
] as const;

type ProductionStatus =
  (typeof ALLOWED_STATUSES)[number];

function getOrderStatus(
  productionStatus: ProductionStatus
) {
  switch (productionStatus) {
    case "in_progress":
    case "on_hold":
    case "quality_check":
      return "in_production";

    case "completed":
      return "ready";

    case "pending":
    default:
      return "confirmed";
  }
}

export async function updateProductionJob(
  jobId: string,
  formData: FormData
) {
  const supabase = createClient();

  // -----------------------------
  // GET FORM DATA
  // -----------------------------

  const status = String(
    formData.get("status") || ""
  ).trim() as ProductionStatus;

  const progressRaw = Number(
    formData.get("progress")
  );

  const workerId = String(
    formData.get("workerId") || ""
  ).trim();

  const expectedDate = String(
    formData.get("expectedDate") || ""
  ).trim();

  const notes = String(
    formData.get("notes") || ""
  ).trim();

  // -----------------------------
  // VALIDATION
  // -----------------------------

  if (!ALLOWED_STATUSES.includes(status)) {
    throw new Error(
      "Invalid production status."
    );
  }

  if (
    !Number.isFinite(progressRaw) ||
    progressRaw < 0 ||
    progressRaw > 100
  ) {
    throw new Error(
      "Progress must be between 0 and 100."
    );
  }

  if (!workerId) {
    throw new Error(
      "Please select a worker."
    );
  }

  const progress = Math.round(progressRaw);

  // -----------------------------
  // GET PRODUCTION JOB
  // -----------------------------

  const {
    data: job,
    error: jobError,
  } = await supabase
    .from("production_jobs")
    .select(`
      id,
      order_id,
      worker_id,
      assigned_worker
    `)
    .eq("id", jobId)
    .single();

  if (jobError || !job) {
    throw new Error(
      "Production job not found."
    );
  }

  // -----------------------------
  // GET WORKER
  // -----------------------------

  const {
    data: worker,
    error: workerError,
  } = await supabase
    .from("workers")
    .select(`
      id,
      name,
      phone,
      skill,
      status
    `)
    .eq("id", workerId)
    .single();

  if (workerError || !worker) {
    throw new Error(
      "Selected worker not found."
    );
  }

  // Only active workers
  if (worker.status !== "active") {
    throw new Error(
      "Selected worker is inactive."
    );
  }

  // -----------------------------
  // COMPLETION DATE
  // -----------------------------

  const completedAt =
    status === "completed"
      ? new Date().toISOString()
      : null;

  // -----------------------------
  // UPDATE PRODUCTION JOB
  // -----------------------------

  const {
    error: updateError,
  } = await supabase
    .from("production_jobs")
    .update({
      status,
      progress,

      // New proper relationship
      worker_id: worker.id,

      // Keep old field synchronized
      assigned_worker: worker.name,

      expected_date:
        expectedDate || null,

      notes:
        notes || null,

      completed_at: completedAt,

      updated_at:
        new Date().toISOString(),
    })
    .eq("id", jobId);

  if (updateError) {
    console.error(
      "Production update error:",
      updateError
    );

    throw new Error(
      updateError.message
    );
  }

  // -----------------------------
  // SYNC ORDER STATUS
  // -----------------------------

  if (job.order_id) {
    const orderStatus =
      getOrderStatus(status);

    const {
      error: orderError,
    } = await supabase
      .from("orders")
      .update({
        status: orderStatus,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", job.order_id);

    if (orderError) {
      throw new Error(
        `Production updated, but order status could not be synced: ${orderError.message}`
      );
    }
  }

  // -----------------------------
  // REFRESH PAGES
  // -----------------------------

  revalidatePath(
    "/admin/production"
  );

  revalidatePath(
    `/admin/production/${jobId}`
  );

  revalidatePath(
    "/admin/orders"
  );

  if (job.order_id) {
    revalidatePath(
      `/admin/orders/${job.order_id}`
    );
  }

  revalidatePath(
    "/admin/dashboard"
  );
}