import Link from "next/link";

import CreateWorkerForm from "./CreateWorkerForm";

export default function NewWorkerPage() {
  return (
    <main className="min-h-screen bg-steel-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">

        <div>
          <Link
            href="/admin/workers"
            className="text-sm font-medium text-steel-500 hover:text-steel-900"
          >
            ← Back to Workers
          </Link>

          <h1 className="mt-2 text-3xl font-bold text-steel-900">
            Add Worker
          </h1>

          <p className="mt-1 text-sm text-steel-500">
            Add a fabrication worker to your team.
          </p>
        </div>

        <CreateWorkerForm />

      </div>
    </main>
  );
}