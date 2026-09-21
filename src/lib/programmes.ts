import { getDb, schema } from "@/db";
import { eq, and, asc, inArray, sql } from "drizzle-orm";

export type Kind = "course" | "internship";

export const KIND_PATH: Record<Kind, string> = {
  course: "/courses",
  internship: "/internships",
};

/** A programme's detail: the record itself, its upcoming batches and its syllabus. */
export async function getProgramme(slug: string, kind: Kind) {
  const db = await getDb();

  const [course] = await db
    .select()
    .from(schema.courses)
    .where(and(eq(schema.courses.slug, slug), eq(schema.courses.kind, kind)));

  if (!course) return null;

  const batches = await db
    .select({
      id: schema.batches.id,
      label: schema.batches.label,
      mode: schema.batches.mode,
      startDate: schema.batches.startDate,
      capacity: schema.batches.capacity,
      seatsTaken: schema.batches.seatsTaken,
      price: schema.batches.price,
      installmentCount: schema.batches.installmentCount,
      centreName: schema.centres.name,
      centreWhatsapp: schema.centres.whatsapp,
      centrePhone: schema.centres.phone,
    })
    .from(schema.batches)
    .leftJoin(schema.centres, eq(schema.batches.centreId, schema.centres.id))
    .leftJoin(schema.instructors, eq(schema.batches.instructorId, schema.instructors.id))
    .where(and(eq(schema.batches.courseId, course.id), eq(schema.batches.status, "upcoming")))
    .orderBy(asc(schema.batches.startDate));

  const modules = await db
    .select()
    .from(schema.modules)
    .where(eq(schema.modules.courseId, course.id))
    .orderBy(asc(schema.modules.position));

  const moduleIds = modules.map((m) => m.id);
  const lessons = moduleIds.length
    ? await db
        .select()
        .from(schema.lessons)
        .where(inArray(schema.lessons.moduleId, moduleIds))
        .orderBy(asc(schema.lessons.position))
    : [];

  return { course, batches, modules, lessons };
}

export type EntryMode = "classroom" | "live_online";

/**
 * The order the detail page offers modes in. The card must quote a price from the
 * first available mode in this same order, because that is the tab the detail page
 * opens on — otherwise the listing and the page a click away disagree.
 */
const MODE_ORDER: EntryMode[] = ["classroom", "live_online"];

/**
 * Published programmes of one kind, with the price a visitor will actually see
 * when they click through, and the mode it belongs to.
 */
export async function listProgrammes(kind: Kind) {
  const db = await getDb();

  const courses = await db
    .select()
    .from(schema.courses)
    .where(and(eq(schema.courses.published, true), eq(schema.courses.kind, kind)))
    .orderBy(asc(schema.courses.id));

  const batchMins = await db
    .select({
      courseId: schema.batches.courseId,
      mode: schema.batches.mode,
      min: sql<number>`min(${schema.batches.price})`,
    })
    .from(schema.batches)
    .where(eq(schema.batches.status, "upcoming"))
    .groupBy(schema.batches.courseId, schema.batches.mode);

  return courses.map((course) => {
    const priceFor = (mode: EntryMode): number | null => {
      const found = batchMins.find((b) => b.courseId === course.id && b.mode === mode);
      return found?.min ?? null;
    };

    const entryMode = MODE_ORDER.find((m) => priceFor(m) !== null) ?? null;

    return {
      course,
      fromPrice: entryMode ? priceFor(entryMode) : null,
      fromMode: entryMode,
    };
  });
}

export function durationText(course: { durationLabel: string | null; durationWeeks: number }) {
  return course.durationLabel ?? `${course.durationWeeks} weeks`;
}
