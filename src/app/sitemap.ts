import type { MetadataRoute } from "next";
import { asc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { SITE_URL } from "@/lib/contact";
import { KIND_PATH } from "@/lib/programmes";

/**
 * Built from the database rather than hand-listed, so a course added in the
 * admin panel appears in the sitemap without a code change.
 *
 * force-dynamic because the content lives in D1: a sitemap baked at build time
 * would go stale the first time someone publishes a course.
 */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/courses`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/paths`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/internships`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  try {
    const db = await getDb();

    const [programmes, paths, centres] = await Promise.all([
      db
        .select({ slug: schema.courses.slug, kind: schema.courses.kind })
        .from(schema.courses)
        .where(eq(schema.courses.published, true))
        .orderBy(asc(schema.courses.id)),
      db
        .select({ slug: schema.paths.slug })
        .from(schema.paths)
        .where(eq(schema.paths.published, true))
        .orderBy(asc(schema.paths.position)),
      db.select({ slug: schema.centres.slug }).from(schema.centres),
    ]);

    return [
      ...staticPages,
      ...programmes.map((p) => ({
        url: `${SITE_URL}${KIND_PATH[p.kind]}/${p.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...paths.map((p) => ({
        url: `${SITE_URL}/paths/${p.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
      ...centres.map((c) => ({
        url: `${SITE_URL}/centres/${c.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ];
  } catch {
    // A database hiccup should still leave Google a valid sitemap of the
    // pages that do not depend on it.
    return staticPages;
  }
}
