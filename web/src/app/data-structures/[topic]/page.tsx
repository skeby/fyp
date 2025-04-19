// import { Params } from "@/types"
import TopicClient from "@/components/topic"

const Topic = async ({ params }: { params: { topic: string } }) => {
  const { topic } = await params
  return (
    <main className="max-w-res px-6 py-12">
      <TopicClient topic={topic} />
    </main>
  )
}

export default Topic
