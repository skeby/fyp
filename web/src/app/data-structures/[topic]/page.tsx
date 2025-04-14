// import { Params } from "@/types"
import TopicClient from "@/components/topic"

const Topic = async ({ params } : { params: { topic: string } }) => {
  return (
    <main className="max-w-res px-6 py-12">
      <TopicClient topic={params.topic} />
    </main>
  )
}

export default Topic