import { Course } from "@/types";
import { API_BASE_URL } from "@/static";
import ListCard from "@/components/list-card";
import { paths } from "@/services/endpoint";

const CoursesPage = async () => {
  const res = await fetch(API_BASE_URL.concat(paths.course.getAll), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    // body: JSON.stringify({ slug: course }),
    cache: "no-cache",
  });
  const json = await res.json();
  const { status, message, data } = json;

  if (!res.ok || status !== "success") {
    return (
      <main className="max-w-res px-6 py-12">
        <h1 className="text-2xl font-bold">Error fetching data</h1>
      </main>
    );
  }
  if (!json || !data) {
    return (
      <main className="max-w-res px-6 py-12">
        <h1 className="text-2xl font-bold">No data found</h1>
      </main>
    );
  }

  return (
    <main className="max-w-res grid grid-cols-1 gap-6 px-6 py-12 sm:grid-cols-2 lg:grid-cols-3">
      {((data?.courses ?? []) as Course[]).map((course, index) => (
        <ListCard
          key={index}
          title={course.title}
          description={course.description}
          cover_image={course.cover_image}
          href={`/course/${course.slug}`}
        />
      ))}
    </main>
  );
};

export default CoursesPage;
