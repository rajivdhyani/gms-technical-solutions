"use client";

import { useId, useState } from "react";
import { Button, Field, PhoneInput, Textarea } from "@/components/ui";

type Props = {
  courseId?: number;
  batchId?: number;
  preferredMode?: "classroom" | "live_online" | "self_paced";
  ctaLabel?: string;
  compact?: boolean;
  /** Adds a free-text box, for the general contact form. */
  withMessage?: boolean;
};

type Errors = { name?: string; phone?: string; email?: string };

/** Deliberately loose — enough to catch a typo, not to police valid addresses. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function EnquiryForm({
  courseId,
  batchId,
  preferredMode,
  ctaLabel = "Book a free demo class",
  compact,
  withMessage = false,
}: Props) {
  const uid = useId();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [failed, setFailed] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const next: Errors = {};
    if (!name.trim()) next.name = "Enter your name";
    if (!/^[6-9]\d{9}$/.test(phone.replace(/\D/g, "").slice(-10)))
      next.phone = "Enter a valid 10-digit mobile number";
    // Optional, but if they typed something it should be usable.
    if (email.trim() && !EMAIL.test(email.trim())) next.email = "Enter a valid email address";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setFailed(null);
    setState("sending");
    const res = await fetch("/api/enquiries", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        phone,
        email: email.trim() || undefined,
        message,
        courseId,
        batchId,
        preferredMode,
      }),
    });
    setState(res.ok ? "done" : "idle");
    if (!res.ok) setFailed("Could not send that. Try again, or call the centre.");
  }

  if (state === "done") {
    return (
      <p
        className="rounded-lg px-3 py-2.5 text-sm font-medium"
        style={{ background: "var(--color-ok-soft)", color: "var(--color-ok)" }}
        role="status"
      >
        Got it. Someone from the centre will call you within a working day.
      </p>
    );
  }

  return (
    <form onSubmit={submit} noValidate className={compact ? "space-y-3" : "space-y-4"}>
      <Field label="Your name" htmlFor={`${uid}-name`} error={errors.name}>
        <input
          id={`${uid}-name`}
          className={["input", errors.name ? "input-error" : ""].filter(Boolean).join(" ")}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
          }}
          placeholder="Enter your full name"
          autoComplete="name"
        />
      </Field>

      <Field label="Mobile number" htmlFor={`${uid}-phone`} error={errors.phone}>
        <PhoneInput
          id={`${uid}-phone`}
          invalid={Boolean(errors.phone)}
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (errors.phone) setErrors((p) => ({ ...p, phone: undefined }));
          }}
          placeholder="10-digit mobile number"
        />
      </Field>

      <Field
        label="Email address"
        htmlFor={`${uid}-email`}
        error={errors.email}
        hint="Optional — we will send fee details and joining instructions."
      >
        <input
          id={`${uid}-email`}
          type="email"
          className={["input", errors.email ? "input-error" : ""].filter(Boolean).join(" ")}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
          }}
          placeholder="name@example.com"
          autoComplete="email"
          inputMode="email"
        />
      </Field>

      {withMessage ? (
        <Field label="Anything we should know?" htmlFor={`${uid}-message`}>
          <Textarea
            id={`${uid}-message`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Which course are you interested in?"
            rows={3}
          />
        </Field>
      ) : null}

      <Button type="submit" size="md" block disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : ctaLabel}
      </Button>

      {failed ? (
        <p className="field-error" role="alert">
          {failed}
        </p>
      ) : null}

      <p className="text-xs muted">We only use your details to contact you. No spam, ever.</p>
    </form>
  );
}
