import { eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { isSignedIn } from "@/lib/auth";
import { SITE_URL } from "@/lib/contact";
import { inr, longDate, installmentLine, MODE_LABEL } from "@/lib/format";
import { durationText, KIND_PATH } from "@/lib/programmes";
import { getTheme, THEMES } from "@/lib/theme";
import { enquiryConfirmationEmail, type OtherCourse } from "@/emails/enquiry-confirmation";

export const dynamic = "force-dynamic";

/**
 * Renders the enquiry confirmation with real data so staff can see exactly
 * what a student receives. Admin only — it exposes course and batch detail
 * and nothing should be able to enumerate it anonymously.
 */
export async function GET() {
  if (!(await isSignedIn())) {
    return new Response("Not found", { status: 404 });
  }

  const db = await getDb();
  const themeId = await getTheme();
  const accent = THEMES.find((t) => t.id === themeId)?.swatches.accent ?? "#3a3a9e";

  const [courseRow] = await db
    .select()
    .from(schema.courses)
    .where(eq(schema.courses.published, true))
    .limit(1);

  const [batchRow] = courseRow
    ? await db
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
        .where(eq(schema.batches.courseId, courseRow.id))
        .limit(1)
    : [];

  const otherRows = await db
    .select({
      id: schema.courses.id,
      title: schema.courses.title,
      tagline: schema.courses.tagline,
      slug: schema.courses.slug,
      kind: schema.courses.kind,
    })
    .from(schema.courses)
    .where(eq(schema.courses.published, true))
    .limit(5);

  const prices = await db
    .select({
      courseId: schema.batches.courseId,
      min: sql<number>`min(${schema.batches.price})`,
    })
    .from(schema.batches)
    .where(eq(schema.batches.status, "upcoming"))
    .groupBy(schema.batches.courseId);

  const others: OtherCourse[] = otherRows
    .filter((c) => c.id !== courseRow?.id)
    .slice(0, 4)
    .map((c) => {
      const p = prices.find((x) => x.courseId === c.id)?.min ?? null;
      return {
        title: c.title,
        tagline: c.tagline,
        fromPrice: p ? inr(p) : null,
        url: `${SITE_URL}${KIND_PATH[c.kind]}/${c.slug}`,
      };
    });

  const { html } = enquiryConfirmationEmail({
    name: "Priya Sharma",
    accent,
    course: courseRow
      ? {
          title: courseRow.title,
          tagline: courseRow.tagline,
          level: courseRow.level,
          sessions: courseRow.lessonCount,
          duration: durationText(courseRow),
          url: `${SITE_URL}${KIND_PATH[courseRow.kind]}/${courseRow.slug}`,
          kind: courseRow.kind,
        }
      : null,
    batch: batchRow
      ? {
          label: batchRow.label,
          startDate: longDate(batchRow.startDate),
          mode: MODE_LABEL[batchRow.mode] ?? batchRow.mode,
          centreName: batchRow.centreName,
          price: inr(batchRow.price),
          installments: installmentLine(batchRow.price, batchRow.installmentCount),
        }
      : null,
    others,
  });

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}
