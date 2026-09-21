import { listProgrammes } from "@/lib/programmes";
import { CourseCard } from "@/components/CourseCard";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Internships and industrial training",
  description:
    "Short-term internships of 1 to 2 months and full six-month industrial training in Dehradun, with a real project, a mentor and a verifiable certificate.",
};

export default async function InternshipsPage() {
  const items = await listProgrammes("internship");

  return (
    <>
      <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
        Internships and industrial training
      </h1>
      <p className="mb-10 max-w-2xl text-[17px] leading-8 muted">
        Both programmes put you on a real project with a working engineer as your mentor, at our
        Dehradun centre or joining live online. You finish with a completed project, a verifiable
        certificate and a completion letter your college will accept.
      </p>

      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <CourseCard key={item.course.id} {...item} />
        ))}
      </div>

      <h2 className="mb-4 text-2xl font-bold tracking-tight">Which one applies to you</h2>
      <div className="card overflow-hidden text-sm">
        <div className="grid gap-1 px-4 py-3 sm:grid-cols-[160px_minmax(0,1fr)]">
          <p className="font-bold">1 to 2 months</p>
          <p className="muted leading-7">
            Second and third year students who need a summer or winter internship. One project, one
            mentor, a demo at the end.
          </p>
        </div>
        <div
          className="grid gap-1 border-t px-4 py-3 sm:grid-cols-[160px_minmax(0,1fr)]"
          style={{ borderColor: "var(--color-line)" }}
        >
          <p className="font-bold">6 months</p>
          <p className="muted leading-7">
            Final year B.Tech, BCA and MCA students whose university requires industrial training.
            Includes the training report, viva preparation and placement support.
          </p>
        </div>
      </div>
    </>
  );
}
