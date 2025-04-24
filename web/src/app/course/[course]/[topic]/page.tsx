// import { Params } from "@/types"
import TopicClient from "@/components/topic"
import { cookies } from "next/headers"

const Topic = async ({ params }: { params?: Promise<{ topic: string }> }) => {
  const topic = (await params)?.topic
  return (
    <main className="max-w-res px-6 py-12">
      {topic && <TopicClient topic={topic} />}
    </main>
  )
}

export default Topic
