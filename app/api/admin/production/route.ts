import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = createClient();

    // Check login
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const orderId = String(body.orderId || "").trim();
    const workerId = String(body.workerId || "").trim();
    const priority = String(body.priority || "normal").trim();

    const startDate = body.startDate || null;
    const expectedDate = body.expectedDate || null;
    const notes = String(body.notes || "").trim();

    // -----------------------------
    // VALIDATION
    // -----------------------------

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required." },
        { status: 400 }
      );
    }

    if (!workerId) {
      return NextResponse.json(
        { error: "Worker is required." },
        { status: 400 }
      );
    }

    const allowedPriorities = [
      "low",
      "normal",
      "high",
      "urgent",
    ];

    if (!allowedPriorities.includes(priority)) {
      return NextResponse.json(
        { error: "Invalid priority." },
        { status: 400 }
      );
    }

    // -----------------------------
    // GET ORDER
    // -----------------------------

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        customer_id,
        status
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    // Don't allow cancelled orders
    if (order.status === "cancelled") {
      return NextResponse.json(
        { error: "Cancelled orders cannot be sent to production." },
        { status: 400 }
      );
    }

    // -----------------------------
    // GET WORKER
    // -----------------------------

    const { data: worker, error: workerError } = await supabase
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
      return NextResponse.json(
        { error: "Worker not found." },
        { status: 404 }
      );
    }

    // Only active workers
    if (worker.status !== "active") {
      return NextResponse.json(
        { error: "Selected worker is inactive." },
        { status: 400 }
      );
    }

    // -----------------------------
    // CHECK DUPLICATE PRODUCTION JOB
    // -----------------------------

    const { data: existingJob, error: existingJobError } =
      await supabase
        .from("production_jobs")
        .select(`
          id,
          job_number,
          status
        `)
        .eq("order_id", orderId)
        .maybeSingle();

    if (existingJobError) {
      console.error(
        "Existing production job check error:",
        existingJobError
      );

      return NextResponse.json(
        { error: existingJobError.message },
        { status: 500 }
      );
    }

    if (existingJob) {
      return NextResponse.json(
        {
          error: "A production job already exists for this order.",
          jobId: existingJob.id,
          jobNumber: existingJob.job_number,
          status: existingJob.status,
        },
        { status: 409 }
      );
    }

    // -----------------------------
    // CREATE PRODUCTION JOB
    // -----------------------------

    const { data: job, error: jobError } = await supabase
      .from("production_jobs")
      .insert({
        order_id: order.id,
        customer_id: order.customer_id || null,

        // NEW: proper worker relationship
        worker_id: worker.id,

        // Keep old field for compatibility
        assigned_worker: worker.name,

        priority,

        status: "pending",
        progress: 0,

        start_date: startDate || null,
        expected_date: expectedDate || null,

        notes: notes || null,
      })
      .select(`
        id,
        job_number,
        order_id,
        customer_id,
        worker_id,
        assigned_worker,
        status,
        priority,
        progress,
        expected_date
      `)
      .single();

    if (jobError || !job) {
      console.error("Create production job error:", jobError);

      return NextResponse.json(
        {
          error:
            jobError?.message ||
            "Failed to create production job.",
        },
        { status: 500 }
      );
    }

    // -----------------------------
    // SUCCESS
    // -----------------------------

    return NextResponse.json(
      {
        success: true,
        jobId: job.id,
        jobNumber: job.job_number,
        orderId: job.order_id,
        workerId: worker.id,
        workerName: worker.name,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Production API error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected server error.",
      },
      { status: 500 }
    );
  }
}