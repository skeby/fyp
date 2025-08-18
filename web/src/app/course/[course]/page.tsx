import { Course } from "@/types";
import { API_BASE_URL } from "@/static";
import ListCard from "@/components/list-card";
import { paths } from "@/services/endpoint";
import { BadgeCheck } from "lucide-react";

const CoursePage = async ({
  params,
}: {
  params?: Promise<{ course: string }>;
}) => {
  const course = (await params)?.course;
  const res = await fetch(API_BASE_URL.concat(paths.course.getOne), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ slug: course }),
    cache: "no-cache",
  });
  const json = await res.json();
  const { status, message, data } = json as {
    status: "error" | "success";
    message: string;
    data?: { course: Course };
  };

  if (!res.ok || status !== "success") {
    return (
      <main className="px-6 py-12">
        <h1 className="max-w-res text-2xl font-bold">Error fetching data</h1>
      </main>
    );
  }
  if (!json || !data) {
    return (
      <main className="px-6 py-12">
        <h1 className="max-w-res text-2xl font-bold">No data found</h1>
      </main>
    );
  }

  return (
    <main className="px-1.5 py-8 min-[370px]:px-2 sm:px-6 sm:py-12">
      <div className="max-w-res">
        <h2 className="text-primary flex flex-col justify-between gap-x-2 gap-y-0.5 font-medium sm:flex-row">
          <span className="text-2xl">{data?.course?.title}</span>
          <div className="text-muted-foreground flex flex-row-reverse items-center justify-end gap-x-2 sm:flex-row sm:justify-start">
            <BadgeCheck strokeWidth={1.6} className="shrink-0" />
            <span className="text-sm sm:text-base">
              Hone your skills in any of these{" "}
              {data?.course?.title?.toLowerCase()} topics
            </span>
          </div>
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {course &&
            (data?.course?.topics ?? []).map((topic, index) => (
              <ListCard
                key={index}
                title={topic.title}
                description={topic.description}
                cover_image={topic.cover_image}
                href={`/course/${course}/${topic.slug}`}
              />
            ))}
        </div>
      </div>
    </main>
  );
};

export default CoursePage;
