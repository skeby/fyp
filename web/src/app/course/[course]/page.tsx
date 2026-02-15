import ListCard from "@/components/list-card";
import { BadgeCheck } from "lucide-react";
import { getCourse } from "@/methods";
import { Metadata } from "next";
import { defaultMetadata } from "@/static";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ course: string }>;
}): Promise<Metadata> {
  const course = (await params)?.course;
  const { data } = await getCourse({ slug: course });

  if (!data?.course) {
    return {
      title: "Course not found",
      description: "The requested course could not be found.",
    };
  }

  const { title, description, cover_image, topics } = data.course;

  return {
    title: `AdaptLearn - ${title || "Course"}`,
    description,
    keywords: [
      ...(topics ?? []).map((topic) => topic.title),
      ...(Array.isArray(defaultMetadata.keywords)
        ? defaultMetadata.keywords
        : typeof defaultMetadata.keywords === "string"
          ? defaultMetadata.keywords.split(", ")
          : []),
    ],
    openGraph: {
      title: `AdaptLearn - ${title || "Course"}`,
      description,
      images: cover_image ? [{ url: cover_image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `AdaptLearn - ${title || "Course"}`,
      description,
      images: cover_image ? [cover_image] : undefined,
    },
  };
}

const CoursePage = async ({
  params,
}: {
  params?: Promise<{ course: string }>;
}) => {
  const course = (await params)?.course;

  const { status, message, data } = course
    ? await getCourse({ slug: course })
    : { status: "error", message: "Course not found" };

  if (status === "error") {
    return (
      <main className="px-6 py-12">
        <h1 className="max-w-res text-2xl font-bold">{message}</h1>
      </main>
    );
  }
  if (!data || !data?.course) {
    return (
      <main className="px-6 py-12">
        <h1 className="max-w-res text-2xl font-bold">No data found</h1>
      </main>
    );
  }

  return (
    <main className="px-5 py-4 min-[370px]:px-4 sm:px-6 sm:py-7">
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
