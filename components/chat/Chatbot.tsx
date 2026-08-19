"use client";

import { useState } from "react";
import { MessageCircle, Send, X, Loader2 } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! Welcome to Anup Fabrication Works. How can I help you today?",
    },
  ]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.reply ||
            "Sorry, I couldn't understand that. Please contact us directly.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[500px] w-[350px] flex-col overflow-hidden rounded-2xl border border-navy-700 bg-navy-900 shadow-2xl">
          <div className="flex items-center justify-between bg-signal-500 p-4 text-white">
            <div>
              <h3 className="font-bold">Anup Fabrication AI</h3>
              <p className="text-xs opacity-90">Ask us anything</p>
            </div>

            <button onClick={() => setOpen(false)}>
              <X size={22} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  message.role === "user"
                    ? "ml-auto bg-signal-500 text-white"
                    : "bg-navy-800 text-white"
                }`}
              >
                {message.content}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-sm text-steel-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking...
              </div>
            )}
          </div>

          <div className="flex gap-2 border-t border-navy-700 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              placeholder="Type your message..."
              className="flex-1 rounded-lg bg-navy-800 px-3 py-2 text-sm text-white outline-none"
            />

            <button
              onClick={sendMessage}
              disabled={loading}
              className="rounded-lg bg-signal-500 p-2 text-white disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-signal-500 p-4 text-white shadow-lg transition hover:scale-105"
      >
        {open ? <X size={28} /> : <MessageCircle size={28} />}
      </button>
    </>
  );
}