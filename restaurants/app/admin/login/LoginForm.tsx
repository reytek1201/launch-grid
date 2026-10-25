"use client";

import { useActionState } from "react";
import { requestLink, type LoginState } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(requestLink, null);
  return (
    <form action={action} className="mt-8 space-y-4">
      <label className="block text-sm text-cream/80">
        Email
        <input
          required
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          className="mt-1 w-full rounded-lg border border-cream/30 bg-black/30 px-4 py-3 text-base text-cream placeholder:text-cream/45 focus:border-[#f2b27a] focus:outline-none focus:ring-0"
          placeholder="you@example.com"
        />
      </label>
      <button type="submit" disabled={pending} className="btn btn-terra w-full text-center disabled:opacity-60">
        {pending ? "Sending…" : "Email me a sign-in link"}
      </button>
      <p role="status" className="min-h-6 text-sm text-cream/85">{state?.message}</p>
    </form>
  );
}
