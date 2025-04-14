export type Topic = {
    title: string,
    description: string,
    slug: string,
    cover_image?: string
    questions: {
        id: number,
        question: string,
        options: { id: string, text: string }[],
        correct_answer: string,
        explanation: string
    }[]
}

export type Params = { [key: string]: string }