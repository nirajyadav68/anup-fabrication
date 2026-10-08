"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function CreateWorkerForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [skill, setSkill] = useState("");
  const [status, setStatus] = useState("active");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Worker name is required.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("workers")
        .insert({
          name: name.trim(),
          phone: phone.trim() || null,
          skill: skill.trim() || null,
          status,
          notes: notes.trim() || null,
        });

      if (error) {
        throw new Error(error.message);
      }

      router.push("/admin/workers");
      router.refresh();
    } catch (error) {
      console.error("Create worker error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to create worker."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-steel-200 bg-white p-6 shadow-sm"
    >
      <div className="space-y-5">

        {/* NAME */}
        <div>
          <label className="text-sm font-medium text-steel-700">
            Worker Name *
          </label>

          <input
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="Enter worker name"
            className="mt-2 w-full rounded-xl border border-steel-300 px-4 py-3 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
          />
        </div>

        {/* PHONE */}
        <div>
          <label className="text-sm font-medium text-steel-700">
            Phone Number
          </label>

          <input
            type="tel"
            value={phone}
            onChange={(event) =>
              setPhone(event.target.value)
            }
            placeholder="Enter phone number"
            className="mt-2 w-full rounded-xl border border-steel-300 px-4 py-3 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
          />
        </div>

        {/* SKILL */}
        <div>
          <label className="text-sm font-medium text-steel-700">
            Skill
          </label>

          <select
            value={skill}
            onChange={(event) =>
              setSkill(event.target.value)
            }
            className="mt-2 w-full rounded-xl border border-steel-300 bg-white px-4 py-3 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
          >
            <option value="">
              Select Skill
            </option>

            <option value="Welder">
              Welder
            </option>

            <option value="Fabricator">
              Fabricator
            </option>

            <option value="Fitter">
              Fitter
            </option>

            <option value="Painter">
              Painter
            </option>

            <option value="Installer">
              Installer
            </option>

            <option value="Electrician">
              Electrician
            </option>

            <option value="Helper">
              Helper
            </option>

            <option value="General">
              General
            </option>
          </select>
        </div>

        {/* STATUS */}
        <div>
          <label className="text-sm font-medium text-steel-700">
            Status
          </label>

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            className="mt-2 w-full rounded-xl border border-steel-300 bg-white px-4 py-3 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
          >
            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>
          </select>
        </div>

        {/* NOTES */}
        <div>
          <label className="text-sm font-medium text-steel-700">
            Notes
          </label>

          <textarea
            rows={4}
            value={notes}
            onChange={(event) =>
              setNotes(event.target.value)
            }
            placeholder="Additional worker information..."
            className="mt-2 w-full rounded-xl border border-steel-300 px-4 py-3 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
          />
        </div>

        {/* ERROR */}
        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex flex-col-reverse gap-3 border-t border-steel-100 pt-5 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={() => router.push("/admin/workers")}
            className="rounded-xl border border-steel-300 px-5 py-3 text-sm font-semibold text-steel-700 hover:bg-steel-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-signal-500 px-5 py-3 text-sm font-semibold text-white hover:bg-signal-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Creating..."
              : "Create Worker"}
          </button>

        </div>

      </div>
    </form>
  );
}