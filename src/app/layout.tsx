import type { Metadata } from "next";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import { CONTACT, SITE_URL } from "@/lib/contact";
import { btnClass } from "@/components/ui";
import { getTheme } from "@/lib/theme";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "IT Training Institute in Dehradun — GMS Technical Solutions",
    template: "%s | GMS Technical Solutions",
  },
  description:
    "IT and computer science training in Dehradun — full-stack development, Java, Python, data science and cloud. Classroom batches at our Hathibarkala centre or live online, with weekday and weekend timings, internships and six-month industrial training.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "GMS Technical Solutions",
    url: SITE_URL,
    title: "IT Training Institute in Dehradun — GMS Technical Solutions",
    description:
      "Classroom and live online IT training in Dehradun. Full-stack development, Java, Python, data science and cloud, with internships and industrial training.",
  },
};

const NAV = [
  { href: "/paths", label: "Career paths" },
  { href: "/courses", label: "Courses" },
  { href: "/internships", label: "Internships" },
  { href: "/contact", label: "Contact" },
];

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Chosen in the admin panel at /admin/appearance.
  const theme = await getTheme();

  return (
    <html lang="en" data-theme={theme} className={jakarta.variable}>
      <body suppressHydrationWarning>
        <header
          className="sticky top-0 z-50 border-b backdrop-blur"
          style={{
            borderColor: "var(--color-line)",
            background: "color-mix(in oklab, var(--color-bg) 86%, transparent)",
          }}
        >
          <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-5 gap-y-3 px-5 py-3.5">
            <Link href="/" className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[13px] font-bold"
                style={{ background: "var(--color-accent)", color: "var(--color-on-accent)" }}
              >
                G
              </span>
              <span className="whitespace-nowrap text-[15px] font-bold tracking-tight">
                GMS Technical Solutions
              </span>
            </Link>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium transition-colors muted hover:text-[var(--color-ink)]"
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/contact" className={btnClass("primary", "sm")}>
                Book a demo
              </Link>
            </div>
          </nav>
        </header>

        <main className="mx-auto max-w-5xl px-5 py-12">{children}</main>

        <footer
          className="mt-20 border-t px-5 py-10 text-sm"
          style={{ borderColor: "var(--color-line)" }}
        >
          <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
            <div>
              <p className="mb-2 text-[15px] font-bold tracking-tight">GMS Technical Solutions</p>
              <p className="leading-7 muted">
                Offline classes at our Dehradun centre, and live online batches anywhere in India.
              </p>
            </div>
            <div>
              <p className="mb-2 font-semibold">Visit us</p>
              <p className="leading-7 muted">
                {CONTACT.addressLines.map((line) => (
                  <span key={line}>
                    {line}
                    <br />
                  </span>
                ))}
                <a
                  href={CONTACT.mapsUrl}
                  className="font-medium hover:underline"
                  style={{ color: "var(--color-accent)" }}
                >
                  Get directions
                </a>
              </p>
            </div>
            <div>
              <p className="mb-2 font-semibold">Talk to us</p>
              <p className="leading-7 muted">
                <a
                  href={`tel:${CONTACT.phone}`}
                  className="font-medium hover:underline"
                  style={{ color: "var(--color-accent)" }}
                >
                  {CONTACT.phoneDisplay}
                </a>
                <br />
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="font-medium hover:underline"
                  style={{ color: "var(--color-accent)" }}
                >
                  {CONTACT.email}
                </a>
                <br />
                {CONTACT.hours}
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
