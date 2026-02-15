import { Course } from "@/types";
import { API_BASE_URL } from "@/static";
import ListCard from "@/components/list-card";
import { paths } from "@/services/endpoint";
import { BadgeCheck } from "lucide-react";
import { getCourses } from "@/methods";

const CoursesPage = async () => {
  const { status, message, data } = await getCourses();

  if (status === "error") {
    return (
      <main className="px-6 py-12">
        <h1 className="max-w-res text-2xl font-bold">{message}</h1>
      </main>
    );
  }
  if (!data || data?.courses.length === 0) {
    return (
      <main className="px-6 py-12">
        <h1 className="max-w-res text-2xl font-bold">No data found</h1>
      </main>
    );
  }

  return (
    <main className="px-5 py-4 min-[370px]:px-4 sm:px-6 sm:py-7">
      <div className="max-w-res">
        <h2 className="text-primary flex flex-col justify-between gap-x-2 gap-y-0.5 font-medium min-[440px]:flex-row">
          <span className="text-2xl">Courses</span>
          <div className="text-muted-foreground flex flex-row-reverse items-center justify-end gap-x-2 min-[440px]:flex-row min-[440px]:justify-start">
            <BadgeCheck strokeWidth={1.6} className="shrink-0" />
            <span className="text-sm sm:text-base">
              Hone your skills in any of these courses
            </span>
          </div>
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ...(data?.courses ?? []),
            // ...(data?.courses ?? []),
            // ...(data?.courses ?? []),
          ].map((course, index) => (
            <ListCard
              key={index}
              title={course.title}
              description={course.description}
              cover_image={course.cover_image}
              href={`/course/${course.slug}`}
            />
          ))}
        </div>
      </div>
    </main>
  );
};

export default CoursesPage;
