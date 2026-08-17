"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2 } from "lucide-react";
import { contactFormSchema, type ContactFormValues } from "@/lib/validations";

export default function ContactForm() {
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
  });

  async function onSubmit(values: ContactFormValues) {
    setSubmitState("idle");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Request failed");
      setSubmitState("success");
      reset();
    } catch {
      setSubmitState("error");
    }
  }

  if (submitState === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle2 className="h-10 w-10 text-green-600" aria-hidden="true" />
        <p className="font-display text-lg font-semibold text-navy-900">Message sent</p>
        <p className="text-sm text-steel-500">
          Thanks for reaching out — we&apos;ll get back to you shortly.
        </p>
        <button
          type="button"
          onClick={() => setSubmitState("idle")}
          className="mt-2 text-sm font-semibold text-signal-600 hover:text-signal-500"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-navy-900">
          Name
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-steel-300 focus:border-signal-500"
          placeholder="Your full name"
        />
        {errors.name && (
          <p id="name-error" className="mt-1 text-sm text-red-600">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-navy-900">
          Phone
        </label>
        <input
          id="phone"
          type="tel"
          {...register("phone")}
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? "phone-error" : undefined}
          className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-steel-300 focus:border-signal-500"
          placeholder="10-digit mobile number"
        />
        {errors.phone && (
          <p id="phone-error" className="mt-1 text-sm text-red-600">
            {errors.phone.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-navy-900">
          Email <span className="text-steel-500">(optional)</span>
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-steel-300 focus:border-signal-500"
          placeholder="you@example.com"
        />
        {errors.email && (
          <p id="email-error" className="mt-1 text-sm text-red-600">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-navy-900">
          Message
        </label>
        <textarea
          id="message"
          rows={5}
          {...register("message")}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
          className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-steel-300 focus:border-signal-500"
          placeholder="Tell us what you need fabricated..."
        />
        {errors.message && (
          <p id="message-error" className="mt-1 text-sm text-red-600">
            {errors.message.message}
          </p>
        )}
      </div>

      {submitState === "error" && (
        <p role="alert" className="text-sm text-red-600">
          Something went wrong sending your message. Please try again, or contact us on
          WhatsApp instead.
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-signal-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-signal-600 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {isSubmitting ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
