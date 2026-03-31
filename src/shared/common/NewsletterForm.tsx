"use client";

import { useState } from "react";
import useMutation from "@/shared/hooks/useMutation";

interface Props {
  source: "footer" | "blog";
  inputClassName?: string;
  buttonClassName?: string;
  wrapperClassName?: string;
}

export default function NewsletterForm({
  source,
  inputClassName,
  buttonClassName,
  wrapperClassName,
}: Props) {
  const { mutation, isLoading } = useMutation();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }
    const res = await mutation("public/newsletter", {
      method: "POST",
      body: { email: trimmed, source },
      isAlert: false,
    });
    if (res?.results?.success) {
      setDone(true);
    } else {
      setError(res?.results?.message ?? "Something went wrong.");
    }
  };

  if (done) {
    return (
      <p className="text-sm font-semibold text-green-400">
        ✓ You&apos;re subscribed!
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={wrapperClassName ?? "flex flex-col gap-2"}
    >
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={
            inputClassName ??
            "flex-1 px-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand"
          }
        />
        <button
          type="submit"
          disabled={isLoading}
          className={
            buttonClassName ??
            "bg-brand hover:bg-brand-600 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60 whitespace-nowrap"
          }
        >
          {isLoading ? "Subscribing…" : "Subscribe"}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </form>
  );
}
