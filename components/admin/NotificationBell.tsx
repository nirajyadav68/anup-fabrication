"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

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

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadNotifications() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("notifications")
      .select(
        "id, title, message, type, reference_id, is_read, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Notification loading error:", error);
      setLoading(false);
      return;
    }

    setNotifications(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    const supabase = createClient();

    loadNotifications();

    // Unique channel name prevents Next.js development/HMR
    // from reusing an already subscribed channel.
    const channelName = `admin-notifications-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const newNotification =
            payload.new as Notification;

          setNotifications((current) =>
            [newNotification, ...current].slice(0, 10)
          );
        }
      );

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log("Notification realtime connected");
      }

      if (status === "CHANNEL_ERROR") {
        console.error(
          "Notification realtime channel error"
        );
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  async function markAsRead(id: string) {
    const supabase = createClient();

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) {
      console.error(
        "Mark notification as read error:",
        error
      );
      return;
    }

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, is_read: true }
          : notification
      )
    );
  }

  function formatTime(date: string) {
    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <div className="relative">
      {/* Notification Button */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notifications"
        className="relative rounded-md p-2 text-steel-300 transition hover:bg-navy-800 hover:text-white"
      >
        <Bell className="h-5 w-5" />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-steel-200 bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-steel-100 px-4 py-3">
            <div>
              <h3 className="font-semibold text-navy-900">
                Notifications
              </h3>

              <p className="text-xs text-steel-500">
                {unreadCount} unread
              </p>
            </div>

            <button
              type="button"
              onClick={loadNotifications}
              className="text-xs font-medium text-signal-600 hover:text-signal-500"
            >
              Refresh
            </button>
          </div>

          {/* Notifications */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center text-sm text-steel-500">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-steel-500">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-b border-steel-100 p-4 ${
                    notification.is_read
                      ? "bg-white"
                      : "bg-signal-50"
                  }`}
                >
                  <div className="flex gap-3">
                    {!notification.is_read && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                    )}

                    <div className="min-w-0 flex-1">
                      {notification.reference_id ? (
                        <Link
                          href={`/admin/quotes/${notification.reference_id}`}
                          onClick={() =>
                            markAsRead(notification.id)
                          }
                          className="block"
                        >
                          <p className="text-sm font-semibold text-navy-900 hover:text-signal-600">
                            {notification.title}
                          </p>

                          <p className="mt-1 text-xs text-steel-600">
                            {notification.message}
                          </p>
                        </Link>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-navy-900">
                            {notification.title}
                          </p>

                          <p className="mt-1 text-xs text-steel-600">
                            {notification.message}
                          </p>
                        </>
                      )}

                      <p className="mt-2 text-[11px] text-steel-400">
                        {formatTime(
                          notification.created_at
                        )}
                      </p>

                      {!notification.is_read && (
                        <button
                          type="button"
                          onClick={() =>
                            markAsRead(notification.id)
                          }
                          className="mt-2 text-[11px] font-semibold text-signal-600 hover:text-signal-500"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-steel-100 px-4 py-3">
            <Link
              href="/admin/quotes"
              onClick={() => setOpen(false)}
              className="text-sm font-semibold text-signal-600 hover:text-signal-500"
            >
              View all quote requests →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}