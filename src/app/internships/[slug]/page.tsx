import { ProgrammeDetail } from "@/components/ProgrammeDetail";
import { getProgramme } from "@/lib/programmes";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getProgramme(slug, "internship");
  if (!data) return { title: "Internship not found" };
  return {
    title: `${data.course.title} in Dehradun`,
    description: data.course.tagline ?? undefined,
  };
}

export default async function InternshipPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProgrammeDetail slug={slug} kind="internship" />;
}
