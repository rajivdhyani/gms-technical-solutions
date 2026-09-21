"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, asc } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireAdmin, signIn, signOut } from "@/lib/auth";

function str(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}
function num(fd: FormData, key: string) {
  const n = Number(str(fd, key));
  return Number.isFinite(n) ? n : 0;
}
function optNum(fd: FormData, key: string) {
  const raw = str(fd, key);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/* ------------------------------------------------------------------ auth */

export async function loginAction(_prev: string | null, fd: FormData) {
  const ok = await signIn(str(fd, "password"));
  if (!ok) return "That password is not right.";
  redirect("/admin");
}

export async function logoutAction() {
  await signOut();
  redirect("/admin/login");
}

/* --------------------------------------------------------------- courses */

export async function saveCourse(fd: FormData) {
  await requireAdmin();
  const db = await getDb();
  const id = optNum(fd, "id");

  const title = str(fd, "title");
  if (!title) return;

  const values = {
    title,
    slug: str(fd, "slug") || slugify(title),
    tagline: str(fd, "tagline") || null,
    description: str(fd, "description") || null,
    level: (str(fd, "level") || "beginner") as "beginner" | "intermediate" | "advanced",
    kind: (str(fd, "kind") || "course") as "course" | "internship",
    durationWeeks: num(fd, "durationWeeks"),
    durationLabel: str(fd, "durationLabel") || null,
    lessonCount: num(fd, "lessonCount"),
    selfPacedPrice: optNum(fd, "selfPacedPrice"),
    published: str(fd, "published") === "on",
  };

  if (id) await db.update(schema.courses).set(values).where(eq(schema.courses.id, id));
  else await db.insert(schema.courses).values(values);

  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  revalidatePath("/");
  redirect("/admin/courses");
}

export async function toggleCoursePublished(fd: FormData) {
  await requireAdmin();
  const db = await getDb();
  const id = num(fd, "id");
  await db
    .update(schema.courses)
    .set({ published: str(fd, "published") !== "true" })
    .where(eq(schema.courses.id, id));
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  revalidatePath("/");
}

export async function deleteCourse(fd: FormData) {
  await requireAdmin();
  const db = await getDb();
  const id = num(fd, "id");
  await db.delete(schema.batches).where(eq(schema.batches.courseId, id));
  await db.delete(schema.courses).where(eq(schema.courses.id, id));
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  revalidatePath("/");
}

/* --------------------------------------------------------------- batches */

export async function saveBatch(fd: FormData) {
  await requireAdmin();
  const db = await getDb();
  const id = optNum(fd, "id");

  const values = {
    courseId: num(fd, "courseId"),
    mode: str(fd, "mode") as "classroom" | "live_online",
    centreId: str(fd, "mode") === "classroom" ? optNum(fd, "centreId") : null,
    instructorId: optNum(fd, "instructorId"),
    label: str(fd, "label"),
    startDate: str(fd, "startDate"),
    endDate: str(fd, "endDate") || null,
    schedule: str(fd, "schedule"),
    capacity: num(fd, "capacity"),
    seatsTaken: num(fd, "seatsTaken"),
    price: num(fd, "price"),
    installmentCount: Math.max(1, num(fd, "installmentCount")),
    status: (str(fd, "status") || "upcoming") as "upcoming" | "running" | "closed",
  };

  if (!values.courseId || !values.label || !values.startDate) return;

  if (id) await db.update(schema.batches).set(values).where(eq(schema.batches.id, id));
  else await db.insert(schema.batches).values(values);

  revalidatePath("/admin/batches");
  revalidatePath("/courses");
  revalidatePath("/");
  redirect("/admin/batches");
}

export async function deleteBatch(fd: FormData) {
  await requireAdmin();
  const db = await getDb();
  await db.delete(schema.batches).where(eq(schema.batches.id, num(fd, "id")));
  revalidatePath("/admin/batches");
  revalidatePath("/courses");
}

/* ----------------------------------------------------------- instructors */

export async function saveInstructor(fd: FormData) {
  await requireAdmin();
  const db = await getDb();
  const id = optNum(fd, "id");
  const values = { name: str(fd, "name"), bio: str(fd, "bio") || null };
  if (!values.name) return;

  if (id) await db.update(schema.instructors).set(values).where(eq(schema.instructors.id, id));
  else await db.insert(schema.instructors).values(values);
  revalidatePath("/admin/instructors");
  revalidatePath("/courses");
}

export async function deleteInstructor(fd: FormData) {
  await requireAdmin();
  const db = await getDb();
  const id = num(fd, "id");
  // Keep the batches; just unassign, so removing someone never deletes classes.
  await db
    .update(schema.batches)
    .set({ instructorId: null })
    .where(eq(schema.batches.instructorId, id));
  await db.delete(schema.instructors).where(eq(schema.instructors.id, id));
  revalidatePath("/admin/instructors");
  revalidatePath("/admin/batches");
  revalidatePath("/courses");
}

/* --------------------------------------------------------------- centres */

export async function saveCentre(fd: FormData) {
  await requireAdmin();
  const db = await getDb();
  const id = optNum(fd, "id");
  const name = str(fd, "name");
  if (!name) return;

  const values = {
    name,
    slug: str(fd, "slug") || slugify(name),
    address: str(fd, "address"),
    city: str(fd, "city"),
    phone: str(fd, "phone"),
    whatsapp: str(fd, "whatsapp") || null,
    mapsUrl: str(fd, "mapsUrl") || null,
  };

  if (id) await db.update(schema.centres).set(values).where(eq(schema.centres.id, id));
  else await db.insert(schema.centres).values(values);
  revalidatePath("/admin/centres");
  revalidatePath("/contact");
}

export async function deleteCentre(fd: FormData) {
  await requireAdmin();
  const db = await getDb();
  const id = num(fd, "id");
  await db.update(schema.batches).set({ centreId: null }).where(eq(schema.batches.centreId, id));
  await db.delete(schema.centres).where(eq(schema.centres.id, id));
  revalidatePath("/admin/centres");
  revalidatePath("/admin/batches");
}

/* ------------------------------------------------------------- enquiries */

export async function setEnquiryStatus(fd: FormData) {
  await requireAdmin();
  const db = await getDb();
  const id = num(fd, "id");
  const status = str(fd, "status") as "new" | "called" | "demo_booked" | "joined" | "lost";
  await db.update(schema.enquiries).set({ status }).where(eq(schema.enquiries.id, id));
  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
}

export async function deleteEnquiry(fd: FormData) {
  await requireAdmin();
  const db = await getDb();
  await db.delete(schema.enquiries).where(eq(schema.enquiries.id, num(fd, "id")));
  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
}

/* ------------------------------------------------------------ curriculum */

/** The public page shows courses.lesson_count, so keep it true after every change. */
async function recountLessons(courseId: number) {
  const db = await getDb();
  const rows = await db
    .select({ id: schema.lessons.id })
    .from(schema.lessons)
    .innerJoin(schema.modules, eq(schema.lessons.moduleId, schema.modules.id))
    .where(eq(schema.modules.courseId, courseId));
  await db
    .update(schema.courses)
    .set({ lessonCount: rows.length })
    .where(eq(schema.courses.id, courseId));
}

async function refreshCurriculum(courseId: number) {
  await recountLessons(courseId);
  revalidatePath(`/admin/courses/${courseId}/curriculum`);
  revalidatePath("/courses");
  revalidatePath("/internships");
  revalidatePath("/");
}

export async function addModule(fd: FormData) {
  await requireAdmin();
  const db = await getDb();
  const courseId = num(fd, "courseId");
  const title = str(fd, "title");
  if (!courseId || !title) return;

  const siblings = await db
    .select({ position: schema.modules.position })
    .from(schema.modules)
    .where(eq(schema.modules.courseId, courseId));
  const next = siblings.reduce((m, s) => Math.max(m, s.position), 0) + 1;

  await db.insert(schema.modules).values({ courseId, title, position: next });
  await refreshCurriculum(courseId);
}

export async function renameModule(fd: FormData) {
  await requireAdmin();
  const db = await getDb();
  const title = str(fd, "title");
  if (!title) return;
  await db
    .update(schema.modules)
    .set({ title })
    .where(eq(schema.modules.id, num(fd, "id")));
  await refreshCurriculum(num(fd, "courseId"));
}

export async function deleteModule(fd: FormData) {
  await requireAdmin();
  const db = await getDb();
  const id = num(fd, "id");
  await db.delete(schema.lessons).where(eq(schema.lessons.moduleId, id));
  await db.delete(schema.modules).where(eq(schema.modules.id, id));
  await refreshCurriculum(num(fd, "courseId"));
}

export async function moveModule(fd: FormData) {
  await requireAdmin();
  const db = await getDb();
  const courseId = num(fd, "courseId");
  const id = num(fd, "id");
  const dir = str(fd, "dir");

  const mods = await db
    .select()
    .from(schema.modules)
    .where(eq(schema.modules.courseId, courseId))
    .orderBy(asc(schema.modules.position), asc(schema.modules.id));

  const i = mods.findIndex((m) => m.id === id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= mods.length) return;

  [mods[i], mods[j]] = [mods[j], mods[i]];
  // Rewrite every position, so a previously inconsistent order self-heals.
  for (let k = 0; k < mods.length; k++) {
    await db
      .update(schema.modules)
      .set({ position: k + 1 })
      .where(eq(schema.modules.id, mods[k].id));
  }
  await refreshCurriculum(courseId);
}

export async function addLesson(fd: FormData) {
  await requireAdmin();
  const db = await getDb();
  const moduleId = num(fd, "moduleId");
  const title = str(fd, "title");
  if (!moduleId || !title) return;

  const siblings = await db
    .select({ position: schema.lessons.position })
    .from(schema.lessons)
    .where(eq(schema.lessons.moduleId, moduleId));
  const next = siblings.reduce((m, s) => Math.max(m, s.position), 0) + 1;

  await db.insert(schema.lessons).values({
    moduleId,
    title,
    position: next,
    freePreview: str(fd, "freePreview") === "on",
  });
  await refreshCurriculum(num(fd, "courseId"));
}

export async function updateLesson(fd: FormData) {
  await requireAdmin();
  const db = await getDb();
  const title = str(fd, "title");
  if (!title) return;
  await db
    .update(schema.lessons)
    .set({ title, freePreview: str(fd, "freePreview") === "on" })
    .where(eq(schema.lessons.id, num(fd, "id")));
  await refreshCurriculum(num(fd, "courseId"));
}

export async function deleteLesson(fd: FormData) {
  await requireAdmin();
  const db = await getDb();
  await db.delete(schema.lessons).where(eq(schema.lessons.id, num(fd, "id")));
  await refreshCurriculum(num(fd, "courseId"));
}

export async function moveLesson(fd: FormData) {
  await requireAdmin();
  const db = await getDb();
  const moduleId = num(fd, "moduleId");
  const id = num(fd, "id");
  const dir = str(fd, "dir");

  const items = await db
    .select()
    .from(schema.lessons)
    .where(eq(schema.lessons.moduleId, moduleId))
    .orderBy(asc(schema.lessons.position), asc(schema.lessons.id));

  const i = items.findIndex((l) => l.id === id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= items.length) return;

  [items[i], items[j]] = [items[j], items[i]];
  for (let k = 0; k < items.length; k++) {
    await db
      .update(schema.lessons)
      .set({ position: k + 1 })
      .where(eq(schema.lessons.id, items[k].id));
  }
  await refreshCurriculum(num(fd, "courseId"));
}
