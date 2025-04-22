const auth = "/auth"
const course = "/course"

export const API_BASE_URL =
  process.env.BASE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:2000"

export const paths = {
  auth: {
    signup: auth.concat("/signup"),
    login: auth.concat("/login"),
  },
  course: {
    get: course,
    topic: {
      get: course.concat("/topic"),
    },
  },
}
