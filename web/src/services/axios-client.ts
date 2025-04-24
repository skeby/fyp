import axios from "axios"
import Cookies from "js-cookie"
import { API_BASE_URL, AUTH_TOKEN } from "./endpoint"
// import { cookies } from "next/headers"

const client = axios.create({
  baseURL:
    process.env.BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://adaptlearn-api.onrender.com",
  headers: {
    Accept: "application/json",
  },
  timeout: 60000,
  timeoutErrorMessage: "Request timed out. Please try again.",
})

// Intercept all requests
client.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => Promise.reject(error)
)

// Intercept all responses
client.interceptors.response.use(
  async (response) => {
    return response
  },
  async (error) => {
    const status = error?.response?.status
    if (status === 401) {
      if (typeof window !== "undefined") {
        Cookies.remove(AUTH_TOKEN)
        // localStorage.removeItem(USER)
      }
      // message.error("Session expired. Please login again.")
      // window.history.pushState({}, "", "/login")
      return null
    } else if (
      status >= 400 &&
      status <= 500
      // (status >= 500 && status < 600)
    ) {
      return Promise.reject({
        message: error.response?.data?.message,
      })
    }

    if (error?.message === "Network Error") {
      return Promise.reject({
        message: "Please check your internet connection and try again.",
      })
    }

    return Promise.reject(error)
  }
)

export default async () => {
  if (typeof window !== "undefined") {
    const token = Cookies.get(AUTH_TOKEN)
    if (token) client.defaults.headers.Authorization = `Bearer ${token}`
  }
  return client
}
