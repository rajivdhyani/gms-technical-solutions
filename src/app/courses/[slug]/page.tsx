import { ProgrammeDetail } from "@/components/ProgrammeDetail";
import { getProgramme, durationText } from "@/lib/programmes";
import { SITE_URL } from "@/lib/contact";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getProgramme(slug, "course");
  if (!data) return { title: "Course not found" };

  const { course } = data;
  // "Dehradun" belongs in the title: nearly every search that should find this
  // page carries the city, and competitors all rank with it.
  const title = `${course.title} Course in Dehradun`;
  const description = [
    course.tagline,
    `${durationText(course)}, ${course.lessonCount} sessions.`,
    "Classroom batches at our Dehradun centre or live online, with weekday and weekend timings and fees payable in installments.",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/courses/${course.slug}` },
    openGraph: {
      title: `${title} | GMS Technical Solutions`,
      description,
      url: `${SITE_URL}/courses/${course.slug}`,
      type: "website",
    },
  };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProgrammeDetail slug={slug} kind="course" />;
}
