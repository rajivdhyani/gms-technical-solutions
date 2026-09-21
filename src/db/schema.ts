import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const centres = sqliteTable("centres", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  phone: text("phone").notNull(),
  whatsapp: text("whatsapp"),
  lat: real("lat"),
  lng: real("lng"),
  mapsUrl: text("maps_url"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const instructors = sqliteTable("instructors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  bio: text("bio"),
  photoUrl: text("photo_url"),
});

export const courses = sqliteTable("courses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  tagline: text("tagline"),
  description: text("description"),
  level: text("level", { enum: ["beginner", "intermediate", "advanced"] }).notNull().default("beginner"),
  kind: text("kind", { enum: ["course", "internship"] }).notNull().default("course"),
  durationWeeks: integer("duration_weeks").notNull().default(12),
  durationLabel: text("duration_label"),
  lessonCount: integer("lesson_count").notNull().default(0),
  selfPacedPrice: integer("self_paced_price"),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const modules = sqliteTable("modules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  position: integer("position").notNull().default(0),
});

export const lessons = sqliteTable("lessons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  moduleId: integer("module_id").notNull().references(() => modules.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  videoId: text("video_id"),
  freePreview: integer("free_preview", { mode: "boolean" }).notNull().default(false),
  position: integer("position").notNull().default(0),
});

export const batches = sqliteTable("batches", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  mode: text("mode", { enum: ["classroom", "live_online"] }).notNull(),
  centreId: integer("centre_id").references(() => centres.id),
  instructorId: integer("instructor_id").references(() => instructors.id),
  label: text("label").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  schedule: text("schedule").notNull(),
  capacity: integer("capacity").notNull().default(20),
  seatsTaken: integer("seats_taken").notNull().default(0),
  price: integer("price").notNull(),
  installmentCount: integer("installment_count").notNull().default(1),
  status: text("status", { enum: ["upcoming", "running", "closed"] }).notNull().default("upcoming"),
}, (t) => [index("batches_course_idx").on(t.courseId, t.status)]);

export const enquiries = sqliteTable("enquiries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  courseId: integer("course_id").references(() => courses.id),
  batchId: integer("batch_id").references(() => batches.id),
  preferredMode: text("preferred_mode", { enum: ["classroom", "live_online", "self_paced"] }),
  message: text("message"),
  source: text("source").default("website"),
  status: text("status", { enum: ["new", "called", "demo_booked", "joined", "lost"] }).notNull().default("new"),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
}, (t) => [index("enquiries_status_idx").on(t.status, t.createdAt)]);

export const enrolments = sqliteTable("enrolments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studentName: text("student_name").notNull(),
  phone: text("phone").notNull(),
  courseId: integer("course_id").notNull().references(() => courses.id),
  batchId: integer("batch_id").references(() => batches.id),
  mode: text("mode", { enum: ["classroom", "live_online", "self_paced"] }).notNull(),
  totalFee: integer("total_fee").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const payments = sqliteTable("payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  enrolmentId: integer("enrolment_id").notNull().references(() => enrolments.id, { onDelete: "cascade" }),
  installmentNo: integer("installment_no").notNull().default(1),
  amount: integer("amount").notNull(),
  dueDate: text("due_date").notNull(),
  paidAt: text("paid_at"),
  gatewayRef: text("gateway_ref"),
});

export const attendance = sqliteTable("attendance", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  enrolmentId: integer("enrolment_id").notNull().references(() => enrolments.id, { onDelete: "cascade" }),
  sessionDate: text("session_date").notNull(),
  status: text("status", { enum: ["present", "absent", "late"] }).notNull(),
});

export type Course = typeof courses.$inferSelect;
export type Batch = typeof batches.$inferSelect;
export type Centre = typeof centres.$inferSelect;
export type Enquiry = typeof enquiries.$inferSelect;

export const paths = sqliteTable("paths", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  tagline: text("tagline"),
  description: text("description"),
  outcome: text("outcome"),
  position: integer("position").notNull().default(0),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
});

export const pathCourses = sqliteTable("path_courses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pathId: integer("path_id").notNull().references(() => paths.id, { onDelete: "cascade" }),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  position: integer("position").notNull().default(0),
  note: text("note"),
}, (t) => [index("path_courses_idx").on(t.pathId, t.position)]);

export type Path = typeof paths.$inferSelect;

/**
 * Site-wide settings the admin panel can change at runtime. Key/value so a
 * new setting needs no migration — see drizzle/0002_settings.sql.
 */
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export type Setting = typeof settings.$inferSelect;
