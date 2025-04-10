"use client"

import TopicCard from "@/components/topic-card"
import { topics } from "@/static"

const DataStructures = () => {
  return (
    <main className="max-w-res px-6 py-12">
      {
        topics.map((topic, index) => 
          <TopicCard key={index} topic={topic}/>
        )
      }
    </main>
  )
}

export default DataStructures
