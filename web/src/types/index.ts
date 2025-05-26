export type User = {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
};

export type Course = {
  title: string;
  description: string;
  slug: string;
  cover_image?: string;
  topics: Topic[];
};

export type Topic = {
  title: string;
  description: string;
  slug: string;
  cover_image?: string;
  questions: {
    id: string;
    question: string;
    options: { id: string; text: string }[];
    correct_answer: string;
    explanation: string;
  }[];
};

export type Params = { [key: string]: string };
