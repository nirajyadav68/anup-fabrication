"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  FileText,
  RefreshCw,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);
  const [loading, setLoading] = useState(true);

  async function loadNotifications() {
    setLoading(true);

    const supabase = createClient();

    const { data, error } = await supabase
      .from("notifications")
      .select(
        "id, title, message, type, reference_id, is_read, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Notifications error:", error);
    } else {
      setNotifications(data ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter(
    (item) => !item.is_read
  ).length;

  async function markAsRead(id: string) {
    const supabase = createClient();

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    setNotifications((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, is_read: true }
          : item
      )
    );
  }

  async function markAllAsRead() {
    const supabase = createClient();

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("is_read", false);

    if (error) {
      console.error(error);
      return;
    }

    setNotifications((current) =>
      current.map((item) => ({
        ...item,
        is_read: true,
      }))
    );
  }

  async function deleteNotification(id: string) {
    const supabase = createClient();

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    setNotifications((current) =>
      current.filter((item) => item.id !== id)
    );
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <Bell className="h-7 w-7 text-signal-500" />

            <h1 className="font-display text-3xl font-bold text-navy-900">
              Notifications
            </h1>
          </div>

          <p className="mt-1 text-sm text-steel-500">
            Manage your latest website notifications.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadNotifications}
            className="flex items-center gap-2 rounded-md border border-steel-200 bg-white px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-steel-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="flex items-center gap-2 rounded-md bg-signal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-signal-600"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-steel-200 bg-white p-5">
          <p className="text-sm text-steel-500">
            Total Notifications
          </p>

          <p className="mt-2 text-3xl font-bold text-navy-900">
            {notifications.length}
          </p>
        </div>

        <div className="rounded-xl border border-steel-200 bg-white p-5">
          <p className="text-sm text-steel-500">
            Unread
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {unreadCount}
          </p>
        </div>

        <div className="rounded-xl border border-steel-200 bg-white p-5">
          <p className="text-sm text-steel-500">
            Read
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {notifications.length - unreadCount}
          </p>
        </div>
      </div>

      {/* NOTIFICATION LIST */}
      <div className="overflow-hidden rounded-xl border border-steel-200 bg-white">
        {loading ? (
          <div className="p-10 text-center text-sm text-steel-500">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="mx-auto h-10 w-10 text-steel-300" />

            <h2 className="mt-4 font-semibold text-navy-900">
              No notifications
            </h2>

            <p className="mt-1 text-sm text-steel-500">
              New quote requests will appear here.
            </p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`border-b border-steel-100 p-5 last:border-b-0 ${
                  notification.is_read
                    ? "bg-white"
                    : "bg-signal-50"
                }`}
              >
                <div className="flex gap-4">
                  {/* ICON */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-900 text-white">
                    {notification.type === "quote" ? (
                      <FileText className="h-5 w-5" />
                    ) : (
                      <Bell className="h-5 w-5" />
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row">
                      <div>
                        <div className="flex items-center gap-2">
                          {!notification.is_read && (
                            <span className="h-2 w-2 rounded-full bg-red-500" />
                          )}

                          <h3 className="font-semibold text-navy-900">
                            {notification.title}
                          </h3>
                        </div>

                        <p className="mt-1 text-sm text-steel-600">
                          {notification.message}
                        </p>

                        <p className="mt-2 text-xs text-steel-400">
                          {formatDate(notification.created_at)}
                        </p>
                      </div>

                      {/* ACTIONS */}
                      <div className="flex shrink-0 items-center gap-2">
                        {notification.reference_id && (
                          <Link
                            href={`/admin/quotes/${notification.reference_id}`}
                            onClick={() =>
                              markAsRead(notification.id)
                            }
                            className="flex items-center gap-1 rounded-md bg-navy-900 px-3 py-2 text-xs font-semibold text-white hover:bg-navy-800"
                          >
                            View Quote
                          </Link>
                        )}

                        {!notification.is_read && (
                          <button
                            type="button"
                            onClick={() =>
                              markAsRead(notification.id)
                            }
                            title="Mark as read"
                            className="rounded-md border border-steel-200 p-2 text-steel-600 hover:bg-steel-50"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            deleteNotification(
                              notification.id
                            )
                          }
                          title="Delete notification"
                          className="rounded-md border border-red-200 p-2 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}