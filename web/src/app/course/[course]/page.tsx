import TopicCard from "@/components/topic-card"
import { Course } from "@/types"
import { paths } from "../../../services/endpoint"
import { API_BASE_URL } from "@/static"

const CoursePage = async ({
  params,
}: {
  params?: Promise<{ course: string }>
}) => {
  const course = (await params)?.course
  console.log(API_BASE_URL)
  const res = await fetch(API_BASE_URL.concat(paths.course.get), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ slug: course }),
  })
  const json = await res.json()
  const { status, message, data } = json

  if (!res.ok || status !== "success") {
    return (
      <main className="max-w-res px-6 py-12">
        <h1 className="text-2xl font-bold">Error fetching data</h1>
      </main>
    )
  }
  if (!json || !data) {
    return (
      <main className="max-w-res px-6 py-12">
        <h1 className="text-2xl font-bold">No data found</h1>
      </main>
    )
  }

  return (
    <main className="max-w-res grid grid-cols-1 gap-6 px-6 py-12 sm:grid-cols-2 lg:grid-cols-3">
      {course &&
        ((data?.course as Course)?.topics ?? []).map((topic, index) => (
          <TopicCard key={index} course_slug={course} topic={topic} />
        ))}
    </main>
  )
}

export default CoursePage
