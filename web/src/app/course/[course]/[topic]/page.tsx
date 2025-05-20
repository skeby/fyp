// import { Params } from "@/types"
import TopicClient from "@/components/topic";

const Topic = async ({ params }: { params?: Promise<{ topic: string }> }) => {
  const topic = (await params)?.topic;
  return (
    <main className="flex h-full min-h-[calc(100vh-48px)] w-full flex-col">
      {topic && <TopicClient topic={topic} />}
    </main>
  );
};

export default Topic;
