"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { updateWebsiteSettings } from "./actions";

interface Settings {
  company_name: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  google_maps_url: string | null;
  business_hours: string | null;
  social_instagram: string | null;
  social_facebook: string | null;
  hero_title: string | null;
  hero_description: string | null;
  footer_text: string | null;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center justify-center gap-2 rounded-md bg-signal-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-signal-600 disabled:opacity-70"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? "Saving..." : "Save Settings"}
    </button>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("website_settings")
      .select("*")
      .eq("id", true)
      .single()
      .then(({ data }) => {
        setSettings(data as Settings);
        setLoading(false);
      });
  }, []);

  async function handleSubmit(formData: FormData) {
    setSaved(false);
    setError(null);
    try {
      await updateWebsiteSettings(formData);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-steel-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading settings...
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy-900">Website Settings</h1>
      <p className="mt-1 text-sm text-steel-500">
        Edit your company info here — no code changes or redeploy needed. Changes take effect
        immediately once these values are wired into the public pages (see README §9).
      </p>

      <form action={handleSubmit} className="mt-6 max-w-2xl space-y-5">
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-navy-900">
            Company Name
          </label>
          <input
            id="companyName"
            name="companyName"
            defaultValue={settings?.company_name}
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-navy-900">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              defaultValue={settings?.phone}
              className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
            />
          </div>
          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-navy-900">
              WhatsApp Number
            </label>
            <input
              id="whatsapp"
              name="whatsapp"
              defaultValue={settings?.whatsapp}
              className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-navy-900">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={settings?.email}
              className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
            />
          </div>
          <div>
            <label htmlFor="businessHours" className="block text-sm font-medium text-navy-900">
              Business Hours
            </label>
            <input
              id="businessHours"
              name="businessHours"
              defaultValue={settings?.business_hours ?? ""}
              placeholder="Mon – Sat: 9:00 AM – 7:00 PM"
              className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-navy-900">
            Address
          </label>
          <input
            id="address"
            name="address"
            defaultValue={settings?.address}
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />
        </div>

        <div>
          <label htmlFor="googleMapsUrl" className="block text-sm font-medium text-navy-900">
            Google Maps URL
          </label>
          <input
            id="googleMapsUrl"
            name="googleMapsUrl"
            defaultValue={settings?.google_maps_url ?? ""}
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="socialInstagram" className="block text-sm font-medium text-navy-900">
              Instagram URL
            </label>
            <input
              id="socialInstagram"
              name="socialInstagram"
              defaultValue={settings?.social_instagram ?? ""}
              className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
            />
          </div>
          <div>
            <label htmlFor="socialFacebook" className="block text-sm font-medium text-navy-900">
              Facebook URL
            </label>
            <input
              id="socialFacebook"
              name="socialFacebook"
              defaultValue={settings?.social_facebook ?? ""}
              className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="heroTitle" className="block text-sm font-medium text-navy-900">
            Homepage Hero Title
          </label>
          <input
            id="heroTitle"
            name="heroTitle"
            defaultValue={settings?.hero_title ?? ""}
            placeholder="Precision Fabrication. Built to Last."
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />
        </div>

        <div>
          <label htmlFor="heroDescription" className="block text-sm font-medium text-navy-900">
            Homepage Hero Description
          </label>
          <textarea
            id="heroDescription"
            name="heroDescription"
            rows={3}
            defaultValue={settings?.hero_description ?? ""}
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />
        </div>

        <div>
          <label htmlFor="footerText" className="block text-sm font-medium text-navy-900">
            Footer Text
          </label>
          <textarea
            id="footerText"
            name="footerText"
            rows={2}
            defaultValue={settings?.footer_text ?? ""}
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />
        </div>

        {saved && (
          <p className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            Settings saved.
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <SubmitButton />
      </form>
    </div>
  );
}
