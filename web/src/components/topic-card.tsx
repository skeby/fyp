import { Topic } from "@/types"

const TopicCard = ({ topic }: { topic: Pick<Topic, "title" | "description" | "cover_image"> }) => {
  return (
    <div>TopicCard</div>
  )
}

export default TopicCard