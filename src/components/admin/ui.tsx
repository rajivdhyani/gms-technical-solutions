import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/ui";

/**
 * The admin panel now draws from the same control layer as the public site.
 * These wrappers keep the call sites unchanged.
 */

export { Field, Badge, Input, Textarea } from "@/components/ui";

export const inputClass = "input";

/** Kept so existing `style={inputStyle}` call sites keep compiling; the
 *  colours now come from the .input class. */
export const inputStyle: React.CSSProperties = {};

export function PrimaryButton(props: ComponentProps<"button">) {
  return <Button variant="primary" size="md" {...props} />;
}

export function GhostButton(props: ComponentProps<"button">) {
  return <Button variant="outline" size="md" {...props} />;
}

export function DangerButton(props: ComponentProps<"button">) {
  return <Button variant="danger" size="sm" {...props} />;
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "var(--color-surface)" }}>
      <p className="text-xs" style={{ color: "var(--color-ink-3)" }}>
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-4 border-t px-4 py-3 first:border-t-0"
      style={{ borderColor: "var(--color-line)" }}
    >
      {children}
    </div>
  );
}
