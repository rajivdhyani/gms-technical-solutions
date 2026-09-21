"use client";

import { useActionState } from "react";
import { loginAction } from "../actions";
import { inputClass, inputStyle, PrimaryButton } from "@/components/admin/ui";

export default function LoginPage() {
  const [error, formAction, pending] = useActionState(loginAction, null);

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-1 text-2xl font-medium">Admin sign in</h1>
      <p className="mb-6 text-sm muted">Enter the admin password to manage the site.</p>

      <form action={formAction} className="card space-y-3 p-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Password</span>
          <input
            type="password"
            name="password"
            autoFocus
            autoComplete="current-password"
            suppressHydrationWarning
            className={inputClass}
            style={inputStyle}
          />
        </label>
        <PrimaryButton type="submit" disabled={pending}>
          {pending ? "Checking…" : "Sign in"}
        </PrimaryButton>
        {error ? (
          <p className="text-sm" style={{ color: "#d05a55" }}>
            {error}
          </p>
        ) : null}
      </form>
    </div>
  );
}
