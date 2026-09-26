import { ProgrammeDetail } from "@/components/ProgrammeDetail";
import { getProgramme, durationText } from "@/lib/programmes";
import { SITE_URL } from "@/lib/contact";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getProgramme(slug, "internship");
  if (!data) return { title: "Internship not found" };

  const { course } = data;
  const title = `${course.title} in Dehradun`;
  const description = [
    course.tagline,
    `${durationText(course)} with a real project, a working engineer as mentor, and a verifiable certificate your college will accept.`,
    "At our Dehradun centre or joining live online.",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/internships/${course.slug}` },
    openGraph: {
      title: `${title} | GMS Technical Solutions`,
      description,
      url: `${SITE_URL}/internships/${course.slug}`,
      type: "website",
    },
  };
}

export default async function InternshipPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProgrammeDetail slug={slug} kind="internship" />;
}
