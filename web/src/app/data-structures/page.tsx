"use client"

import TopicCard from "@/components/topic-card"
import { topics } from "@/static"

const DataStructures = () => {
  return (
    <main className="max-w-res px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {
        topics.map((topic, index) => 
          <TopicCard key={index} topic={topic}/>
        )
      }
    </main>
  )
}

export default DataStructures
