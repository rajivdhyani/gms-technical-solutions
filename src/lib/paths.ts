import { getDb, schema } from "@/db";
import { eq, and, asc, inArray, sql } from "drizzle-orm";

/** All published paths, with the courses that make them up. */
export async function listPaths() {
  const db = await getDb();

  const paths = await db
    .select()
    .from(schema.paths)
    .where(eq(schema.paths.published, true))
    .orderBy(asc(schema.paths.position), asc(schema.paths.id));

  if (paths.length === 0) return [];

  const steps = await db
    .select({
      pathId: schema.pathCourses.pathId,
      position: schema.pathCourses.position,
      courseId: schema.courses.id,
      title: schema.courses.title,
      slug: schema.courses.slug,
      durationWeeks: schema.courses.durationWeeks,
    })
    .from(schema.pathCourses)
    .innerJoin(schema.courses, eq(schema.courses.id, schema.pathCourses.courseId))
    .where(
      inArray(
        schema.pathCourses.pathId,
        paths.map((p) => p.id),
      ),
    )
    .orderBy(asc(schema.pathCourses.position));

  return paths.map((path) => {
    const mine = steps.filter((s) => s.pathId === path.id);
    return {
      path,
      steps: mine,
      weeks: mine.reduce((n, s) => n + s.durationWeeks, 0),
    };
  });
}

/** One path with its full course detail, prices and the soonest start date. */
export async function getPath(slug: string) {
  const db = await getDb();

  const [path] = await db.select().from(schema.paths).where(eq(schema.paths.slug, slug));
  if (!path) return null;

  const steps = await db
    .select({
      position: schema.pathCourses.position,
      note: schema.pathCourses.note,
      course: schema.courses,
    })
    .from(schema.pathCourses)
    .innerJoin(schema.courses, eq(schema.courses.id, schema.pathCourses.courseId))
    .where(eq(schema.pathCourses.pathId, path.id))
    .orderBy(asc(schema.pathCourses.position));

  const courseIds = steps.map((s) => s.course.id);

  const prices = courseIds.length
    ? await db
        .select({
          courseId: schema.batches.courseId,
          min: sql<number>`min(${schema.batches.price})`,
          soonest: sql<string>`min(${schema.batches.startDate})`,
        })
        .from(schema.batches)
        .where(
          and(
            inArray(schema.batches.courseId, courseIds),
            eq(schema.batches.status, "upcoming"),
            eq(schema.batches.mode, "classroom"),
          ),
        )
        .groupBy(schema.batches.courseId)
    : [];

  const withPrice = steps.map((s) => ({
    ...s,
    price: prices.find((p) => p.courseId === s.course.id)?.min ?? null,
    soonest: prices.find((p) => p.courseId === s.course.id)?.soonest ?? null,
  }));

  return {
    path,
    steps: withPrice,
    weeks: steps.reduce((n, s) => n + s.course.durationWeeks, 0),
    total: withPrice.reduce((n, s) => n + (s.price ?? 0), 0),
    startsFrom: withPrice
      .map((s) => s.soonest)
      .filter(Boolean)
      .sort()[0] as string | undefined,
  };
}
