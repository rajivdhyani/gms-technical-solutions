import Link from "next/link";
import { listProgrammes } from "@/lib/programmes";
import { listPaths } from "@/lib/paths";
import { PathFinder } from "@/components/PathFinder";
import { CourseCard } from "@/components/CourseCard";
import { btnClass } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [courses, internships, paths] = await Promise.all([
    listProgrammes("course"),
    listProgrammes("internship"),
    listPaths(),
  ]);

  return (
    <>
      <section className="mb-16 max-w-3xl">
        <h1 className="mb-4 text-4xl font-bold leading-[1.12] tracking-tight md:text-5xl">
          Become job-ready in IT — at our Dehradun centre or live online.
        </h1>
        <p className="mb-7 max-w-2xl text-[17px] leading-8 muted">
          Small batches, working instructors, and projects you can actually show an employer.
          Weekday, evening and weekend timings.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/paths" className={btnClass("primary", "lg")}>
            Find your path
          </Link>
          <Link href="/internships" className={btnClass("outline", "lg")}>
            Internships and industrial training
          </Link>
        </div>
      </section>

      <section className="mb-16">
        <PathFinder items={paths} heading="What do you want to become?" />
      </section>

      <section className="mb-16">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-2xl font-bold tracking-tight">Or browse individual courses</h2>
          <Link
            href="/courses"
            className="text-sm font-semibold hover:underline"
            style={{ color: "var(--color-accent)" }}
          >
            All courses
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.slice(0, 6).map((item) => (
            <CourseCard key={item.course.id} {...item} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-2xl font-bold tracking-tight">Internships and industrial training</h2>
          <Link
            href="/internships"
            className="text-sm font-semibold hover:underline"
            style={{ color: "var(--color-accent)" }}
          >
            Details
          </Link>
        </div>
        <p className="mb-5 muted">
          A real project and a mentor, with a certificate your college will accept.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {internships.map((item) => (
            <CourseCard key={item.course.id} {...item} />
          ))}
        </div>
      </section>
    </>
  );
}
