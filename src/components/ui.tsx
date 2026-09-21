import type { ComponentProps, ReactNode } from "react";

/**
 * The shared control layer. Before this existed the same button was rewritten
 * inline in six places with four different paddings; anything visual that
 * repeats belongs here so it can only look one way.
 *
 * The styles themselves live in globals.css as plain classes rather than
 * Tailwind utilities, so a control renders identically whether it is a
 * <button>, an <a> or a next/link.
 */

export type ButtonVariant = "primary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";
export type BadgeTone = "accent" | "ok" | "warn" | "neutral";

/** For links and anchors that should look like buttons. */
export function btnClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  opts?: { block?: boolean; className?: string },
) {
  return [
    "btn",
    `btn-${variant}`,
    `btn-${size}`,
    opts?.block ? "btn-block" : "",
    opts?.className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  variant = "primary",
  size = "md",
  block,
  className,
  type = "button",
  ...rest
}: ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
}) {
  return <button type={type} className={btnClass(variant, size, { block, className })} {...rest} />;
}

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={["badge", `badge-${tone}`, className ?? ""].filter(Boolean).join(" ")}>
      {children}
    </span>
  );
}

/**
 * A labelled field. Real <label> text rather than a placeholder standing in
 * for one, so the label survives typing.
 */
export function Field({
  label,
  hint,
  error,
  htmlFor,
  span,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  span?: boolean;
  children: ReactNode;
}) {
  const note = error ? (
    <span className="field-error" role="alert">
      {error}
    </span>
  ) : hint ? (
    <span className="field-hint">{hint}</span>
  ) : null;

  // Given an id, associate with `for`. Without one — the admin panel's call
  // sites pass no id — wrap the control so the label still associates.
  if (!htmlFor) {
    return (
      <label className={span ? "block sm:col-span-2" : "block"}>
        <span className="field-label">{label}</span>
        {children}
        {note}
      </label>
    );
  }

  return (
    <div className={span ? "sm:col-span-2" : undefined}>
      <label className="field-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {note}
    </div>
  );
}

export function Input({
  invalid,
  className,
  ...rest
}: ComponentProps<"input"> & { invalid?: boolean }) {
  return (
    <input
      className={["input", invalid ? "input-error" : "", className ?? ""].filter(Boolean).join(" ")}
      {...rest}
    />
  );
}

export function Textarea({
  invalid,
  className,
  ...rest
}: ComponentProps<"textarea"> & { invalid?: boolean }) {
  return (
    <textarea
      className={["input", invalid ? "input-error" : "", className ?? ""].filter(Boolean).join(" ")}
      {...rest}
    />
  );
}

/** Indian mobile field, with the country code fixed rather than typed. */
export function PhoneInput({
  invalid,
  ...rest
}: ComponentProps<"input"> & { invalid?: boolean }) {
  return (
    <div className={["input-group", invalid ? "input-error" : ""].filter(Boolean).join(" ")}>
      <span className="input-prefix">+91</span>
      <input className="input" inputMode="numeric" autoComplete="tel-national" {...rest} />
    </div>
  );
}
