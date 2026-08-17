import type { Metadata } from "next";
import { Mail, MailOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import DeleteButton from "@/components/admin/DeleteButton";
import ToggleSwitch from "@/components/admin/ToggleSwitch";
import RealtimeRefresher from "@/components/RealtimeRefresher";
import { markMessageRead, deleteMessage } from "./actions";

export const metadata: Metadata = {
  title: "Contact Messages",
  robots: { index: false, follow: false },
};

export default async function AdminMessagesPage() {
  const supabase = createClient();
  const { data: messages, error } = await supabase
    .from("contact_messages")
    .select("id, name, phone, email, message, is_read, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <RealtimeRefresher tables={["contact_messages"]} />
      <h1 className="font-display text-2xl font-bold text-navy-900">Contact Messages</h1>
      <p className="mt-1 text-sm text-steel-500">Messages submitted through the public Contact form.</p>

      {error && (
        <p className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
          Could not load messages: {error.message}
        </p>
      )}

      <div className="mt-6 space-y-3">
        {messages?.map((msg) => (
          <div
            key={msg.id}
            className={`rounded-lg border p-5 ${msg.is_read ? "border-steel-100 bg-white" : "border-signal-200 bg-signal-50/40"}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                {msg.is_read ? (
                  <MailOpen className="mt-0.5 h-5 w-5 shrink-0 text-steel-400" />
                ) : (
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-signal-500" />
                )}
                <div>
                  <p className="font-semibold text-navy-900">{msg.name}</p>
                  <p className="text-xs text-steel-500">
                    {msg.phone}
                    {msg.email ? ` · ${msg.email}` : ""} ·{" "}
                    {new Date(msg.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs text-steel-500">
                  Read
                  <ToggleSwitch
                    id={msg.id}
                    checked={msg.is_read}
                    action={markMessageRead}
                    label={`Mark message from ${msg.name} as read`}
                  />
                </label>
                <DeleteButton action={deleteMessage} id={msg.id} itemLabel={`message from ${msg.name}`} />
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-steel-700">{msg.message}</p>
          </div>
        ))}

        {messages?.length === 0 && (
          <div className="rounded-lg border border-dashed border-steel-300 bg-white p-10 text-center text-steel-500">
            No messages yet.
          </div>
        )}
      </div>
    </div>
  );
}
