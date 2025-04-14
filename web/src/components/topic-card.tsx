import { Topic } from "@/types"
import { Card, CardContent, CardDescription, CardTitle } from "./ui/card"
import Link from "next/link"
import Image from "next/image"

const TopicCard = ({ topic }: { topic: Pick<Topic, "title" | "description" | "slug" | "cover_image"> }) => {
  return (
    <Link href={`/data-structures/${topic.slug}`}>
      <Card className="rounded-xl overflow-hidden gap-0">
        {topic.cover_image && <Image priority quality={100} src={topic.cover_image} alt={`${topic.title} cover image`} width={800} height={350} className="h-36 w-full object-center" />}
        <CardContent className="flex flex-col space-y-2 p-4">
          <CardTitle>{topic.title}</CardTitle>
          <CardDescription>{topic.description}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  )
}

export default TopicCard