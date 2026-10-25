"use client";

import { useActionState } from "react";
import { requestLink, type LoginState } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(requestLink, null);
  return (
    <form action={action} className="mt-8 space-y-4">
      <label className="block text-sm text-espresso/80">
        Email
        <input
          required
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          className="mt-1 w-full rounded-lg border border-espresso/25 bg-white/70 px-4 py-3 text-base text-espresso placeholder:text-espresso/40 focus:border-terracotta-deep focus:outline-none focus:ring-2 focus:ring-terracotta/25"
          placeholder="you@example.com"
        />
      </label>
      <button type="submit" disabled={pending} className="btn btn-solid w-full text-center disabled:opacity-60">
        {pending ? "Sending…" : "Email me a sign-in link"}
      </button>
      <p role="status" className="min-h-6 text-sm text-espresso/80">{state?.message}</p>
    </form>
  );
}
