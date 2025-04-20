import { Topic } from "@/types"

export const topics: Topic[] = new Array(4).fill(0).map(() => ({
  title: "Arrays",
  description: "This topic is a test of your understanding of arrays",
  slug: "arrays",
  cover_image: "/images/cover-image.png",
  questions: [
    {
      id: 1,
      question: "Which data structure uses LIFO (Last In First Out)?",
      options: [
        { id: "a", text: "Queue" },
        { id: "b", text: "Stack" },
        { id: "c", text: "Linked List" },
        { id: "d", text: "Array" },
      ],
      correct_answer: "b",
      explanation:
        "A stack follows the Last In First Out (LIFO) principle, where the last element added is the first one to be removed. This is similar to a stack of plates where you can only take the top plate.",
    },
    {
      id: 2,
      question: "Which of the following is not a linear data structure?",
      options: [
        { id: "a", text: "Array" },
        { id: "b", text: "Linked List" },
        { id: "c", text: "Queue" },
        { id: "d", text: "Tree" },
      ],
      correct_answer: "d",
      explanation:
        "Trees are non-linear data structures that have a hierarchical relationship between elements. Arrays, linked lists, and queues are all linear data structures where elements are arranged in a sequential manner.",
    },
    {
      id: 3,
      question:
        "What is the time complexity of searching in a binary search tree?",
      options: [
        { id: "a", text: "O(1)" },
        { id: "b", text: "O(n)" },
        { id: "c", text: "O(log n)" },
        { id: "d", text: "O(n²)" },
      ],
      correct_answer: "c",
      explanation:
        "The time complexity for searching in a balanced binary search tree is O(log n) because each comparison allows us to eliminate half of the remaining tree. This is much more efficient than linear search (O(n)) for large datasets.",
    },
  ],
}))
