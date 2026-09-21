import { NextResponse } from "next/server";
import { and, eq, ne, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { sendEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/contact";
import { inr, longDate, installmentLine, MODE_LABEL } from "@/lib/format";
import { durationText, KIND_PATH } from "@/lib/programmes";
import { getTheme, THEMES } from "@/lib/theme";
import {
  enquiryConfirmationEmail,
  type BatchSummary,
  type CourseSummary,
  type OtherCourse,
} from "@/emails/enquiry-confirmation";

export const dynamic = "force-dynamic";

const MODES = new Set(["classroom", "live_online", "self_paced"]);

/** Matches the client-side check in EnquiryForm. Email is optional; a supplied
 *  one has to be usable, or staff cannot reply to it. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const rawPhone = typeof body.phone === "string" ? body.phone.replace(/\D/g, "") : "";
  const phone = rawPhone.slice(-10);
  const preferredMode = typeof body.preferredMode === "string" ? body.preferredMode : null;
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const courseId = typeof body.courseId === "number" ? body.courseId : null;
  const batchId = typeof body.batchId === "number" ? body.batchId : null;

  if (name.length < 2) {
    return NextResponse.json({ error: "Enter your name" }, { status: 400 });
  }
  if (!/^[6-9]\d{9}$/.test(phone)) {
    return NextResponse.json({ error: "Enter a valid 10-digit mobile number" }, { status: 400 });
  }
  if (preferredMode && !MODES.has(preferredMode)) {
    return NextResponse.json({ error: "Unknown mode" }, { status: 400 });
  }
  if (email && !EMAIL.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  const db = await getDb();
  await db.insert(schema.enquiries).values({
    name,
    phone,
    email: email || null,
    courseId,
    batchId,
    preferredMode: preferredMode as "classroom" | "live_online" | "self_paced" | null,
    message: typeof body.message === "string" ? body.message.slice(0, 1000) : null,
    source: "website",
    status: "new",
  });

  // The lead is saved by this point. Everything below is best effort: a mail
  // problem must never turn a captured enquiry into an error for the visitor.
  let emailOutcome: unknown = null;
  if (email) {
    try {
      emailOutcome = await sendConfirmation({ db, name, email, courseId, batchId });
    } catch (err) {
      emailOutcome = { ok: false, reason: "threw", detail: String(err) };
      console.error("Enquiry confirmation email failed:", err);
    }
  }

  // Surfaced only in development, so the send can be diagnosed without
  // digging through server logs. Production always returns the bare ok.
  if (process.env.NODE_ENV === "development") {
    return NextResponse.json({ ok: true, _email: emailOutcome }, { status: 201 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}

async function sendConfirmation({
  db,
  name,
  email,
  courseId,
  batchId,
}: {
  db: Awaited<ReturnType<typeof getDb>>;
  name: string;
  email: string;
  courseId: number | null;
  batchId: number | null;
}) {
  // Keeps the email's accent in step with the theme chosen in the admin panel.
  const themeId = await getTheme();
  const accent = THEMES.find((t) => t.id === themeId)?.swatches.accent ?? "#3a3a9e";

  let course: CourseSummary | null = null;
  let batch: BatchSummary | null = null;

  if (courseId) {
    const [row] = await db.select().from(schema.courses).where(eq(schema.courses.id, courseId));
    if (row) {
      course = {
        title: row.title,
        tagline: row.tagline,
        level: row.level,
        sessions: row.lessonCount,
        duration: durationText(row),
        url: `${SITE_URL}${KIND_PATH[row.kind]}/${row.slug}`,
        kind: row.kind,
      };
    }
  }

  if (batchId) {
    const [row] = await db
      .select({
        label: schema.batches.label,
        startDate: schema.batches.startDate,
        mode: schema.batches.mode,
        price: schema.batches.price,
        installmentCount: schema.batches.installmentCount,
        centreName: schema.centres.name,
      })
      .from(schema.batches)
      .leftJoin(schema.centres, eq(schema.batches.centreId, schema.centres.id))
      .where(eq(schema.batches.id, batchId));
    if (row) {
      batch = {
        label: row.label,
        startDate: longDate(row.startDate),
        mode: MODE_LABEL[row.mode] ?? row.mode,
        centreName: row.centreName,
        price: inr(row.price),
        installments: installmentLine(row.price, row.installmentCount),
      };
    }
  }

  // A few other published programmes, with the cheapest upcoming price each.
  const otherRows = await db
    .select({
      id: schema.courses.id,
      title: schema.courses.title,
      tagline: schema.courses.tagline,
      slug: schema.courses.slug,
      kind: schema.courses.kind,
    })
    .from(schema.courses)
    .where(
      courseId
        ? and(eq(schema.courses.published, true), ne(schema.courses.id, courseId))
        : eq(schema.courses.published, true),
    )
    .limit(4);

  const prices = await db
    .select({
      courseId: schema.batches.courseId,
      min: sql<number>`min(${schema.batches.price})`,
    })
    .from(schema.batches)
    .where(eq(schema.batches.status, "upcoming"))
    .groupBy(schema.batches.courseId);

  const others: OtherCourse[] = otherRows.map((c) => {
    const p = prices.find((x) => x.courseId === c.id)?.min ?? null;
    return {
      title: c.title,
      tagline: c.tagline,
      fromPrice: p ? inr(p) : null,
      url: `${SITE_URL}${KIND_PATH[c.kind]}/${c.slug}`,
    };
  });

  const { subject, html, text } = enquiryConfirmationEmail({ name, accent, course, batch, others });

  const result = await sendEmail({
    to: email,
    subject,
    html,
    text,
    idempotencyKey: `enquiry:${email}:${courseId ?? "none"}:${batchId ?? "none"}`,
  });

  if (!result.ok && result.reason !== "not-configured") {
    console.error("Resend rejected the confirmation email:", result.reason, result.detail);
  }
  return result;
}
