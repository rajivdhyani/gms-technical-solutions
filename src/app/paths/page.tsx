import { listPaths } from "@/lib/paths";
import { PathFinder } from "@/components/PathFinder";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Career paths",
  description:
    "Pick the IT job you want — web developer, data analyst, QA engineer, cloud engineer and more — and see exactly which courses get you there, in order.",
};

export default async function PathsPage() {
  const items = await listPaths();

  return (
    <>
      <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
        What do you want to become?
      </h1>
      <p className="mb-10 max-w-2xl text-[17px] leading-8 muted">
        Most people arrive knowing the job they want, not the technology. Pick a role and we will
        show you the courses that get you there, in the order that makes sense, with the total time
        and fee.
      </p>
      <PathFinder items={items} />
    </>
  );
}
