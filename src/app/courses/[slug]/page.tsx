import { ProgrammeDetail } from "@/components/ProgrammeDetail";
import { getProgramme } from "@/lib/programmes";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getProgramme(slug, "course");
  if (!data) return { title: "Course not found" };
  return { title: data.course.title, description: data.course.tagline ?? undefined };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProgrammeDetail slug={slug} kind="course" />;
}
