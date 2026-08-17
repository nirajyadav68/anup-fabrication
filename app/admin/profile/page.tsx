"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ImageUploader from "@/components/admin/ImageUploader";
import { updateProfile, changePassword } from "./actions";

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center justify-center gap-2 rounded-md bg-signal-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-signal-600 disabled:opacity-70"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? "Saving..." : label}
    </button>
  );
}

export default function AdminProfilePage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarPath, setAvatarPath] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setEmail(user.email ?? "");
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single();
      if (profile) {
        setFullName(profile.full_name ?? "");
        if (profile.avatar_url) setAvatarPath([profile.avatar_url]);
      }
      setLoading(false);
    });
  }, []);

  async function handleProfileSubmit(formData: FormData) {
    setProfileSaved(false);
    setProfileError(null);
    try {
      await updateProfile(formData);
      setProfileSaved(true);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  async function handlePasswordSubmit(formData: FormData) {
    setPasswordSaved(false);
    setPasswordError(null);
    try {
      await changePassword(formData);
      setPasswordSaved(true);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-steel-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-10">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900">Admin Profile</h1>
        <p className="mt-1 text-sm text-steel-500">{email}</p>

        <form action={handleProfileSubmit} className="mt-6 space-y-5">
          <input type="hidden" name="avatarPath" value={avatarPath[0] ?? ""} />

          <div>
            <span className="block text-sm font-medium text-navy-900">Avatar</span>
            <div className="mt-1.5">
              <ImageUploader folder="admin" initialPaths={avatarPath} onChange={setAvatarPath} />
            </div>
          </div>

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-navy-900">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
            />
          </div>

          {profileSaved && (
            <p className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              Profile updated.
            </p>
          )}
          {profileError && (
            <p role="alert" className="text-sm text-red-600">
              {profileError}
            </p>
          )}

          <SaveButton label="Save Profile" />
        </form>
      </div>

      <div className="border-t border-steel-100 pt-8">
        <h2 className="font-display text-lg font-semibold text-navy-900">Change Password</h2>
        <form action={handlePasswordSubmit} className="mt-4 space-y-5">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-navy-900">
              New Password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              minLength={8}
              required
              className="mt-1.5 w-full max-w-sm rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
            />
            <p className="mt-1 text-xs text-steel-500">At least 8 characters.</p>
          </div>

          {passwordSaved && (
            <p className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              Password updated.
            </p>
          )}
          {passwordError && (
            <p role="alert" className="text-sm text-red-600">
              {passwordError}
            </p>
          )}

          <SaveButton label="Update Password" />
        </form>
      </div>
    </div>
  );
}
