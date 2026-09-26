import { listProgrammes } from "@/lib/programmes";
import { CourseCard } from "@/components/CourseCard";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "IT Courses in Dehradun — Full Stack, Python, Java, Data Science",
  description:
    "IT and computer science courses in Dehradun: full-stack web development, Python, Java, data science, cloud and software testing. Classroom batches at our Hathibarkala centre or live online, with weekday and weekend timings.",
  alternates: { canonical: "https://gmstechnicalsolutions.com/courses" },
};

export default async function CoursesPage() {
  const items = await listProgrammes("course");

  return (
    <>
      <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">Courses</h1>
      <p className="mb-10 max-w-2xl text-[17px] leading-8 muted">
        Every course runs as a classroom batch at our Dehradun centre, or as a live online batch.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <CourseCard key={item.course.id} {...item} />
        ))}
      </div>
    </>
  );
}
