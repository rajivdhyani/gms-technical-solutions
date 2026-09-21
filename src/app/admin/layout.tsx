import Link from "next/link";
import { isSignedIn } from "@/lib/auth";
import { logoutAction } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin" };

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/batches", label: "Batches" },
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/instructors", label: "Instructors" },
  { href: "/admin/centres", label: "Centres" },
  { href: "/admin/appearance", label: "Appearance" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const signedIn = await isSignedIn();

  // The login page renders on its own, without the admin chrome.
  if (!signedIn) return <>{children}</>;

  return (
    <div className="-mt-4">
      <div
        className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b pb-3"
        style={{ borderColor: "var(--color-line)" }}
      >
        <nav className="flex flex-wrap items-center gap-4 text-sm">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="muted hover:text-[var(--color-ink)]">
              {l.label}
            </Link>
          ))}
        </nav>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-lg border px-3 py-1.5 text-sm"
            style={{ borderColor: "var(--color-line)" }}
          >
            Sign out
          </button>
        </form>
      </div>
      {children}
    </div>
  );
}
