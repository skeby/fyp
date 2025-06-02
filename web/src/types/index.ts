export type User = {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  xp: number;
  profile_picture?: string;
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
  course?: {
    title: string;
    description: string;
    slug: string;
  };
  questions: {
    id: string;
    question: string;
    options: { id: string; text: string }[];
    correct_answer: string;
    explanation: string;
    difficulty?: number;
    discrimination?: number;
    guessing_probability?: number;
  }[];
};

export type Params = { [key: string]: string };
