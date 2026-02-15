import { AxiosResponse } from "axios";
import axiosClient from "./axios-client";
import { message } from "@/components/misc/message-provider";

const auth = "/auth";
const user = "/user";
const course = "/course";
const topic = course.concat("/topic");

export const paths = {
  auth: {
    signup: auth.concat("/signup"),
    login: auth.concat("/login"),
  },
  user: {
    profile: {
      get: user.concat("/profile"),
      getMe: user.concat("/profile/me"),
      update: user.concat("/profile/update"),
    },
    leaderboard: user.concat("/leaderboard"),
  },
  course: {
    getOne: course.concat("/"),
    getAll: course.concat("/all"),
    topic: {
      get: topic,
      start: topic.concat("/start-test"),
      submit: topic.concat("/submit-answer"),
    },
  },
};

let hide: any;

export const apiCall = async (
  body: any,
  path: string,
  method: string,
  extraHeaders?: any,
  headers?: any,
  params?: any,
  showLoader: boolean | string = false,
  showSuccess: boolean = true,
  showError: boolean = true,
) => {
  const messageId = "apicall-message-id";
  try {
    const client = await axiosClient();
    let res: AxiosResponse | null = null;

    if (extraHeaders) {
      client.defaults.headers.common = {
        ...client.defaults.headers.common,
        ...extraHeaders,
      };
    }

    if (headers) {
      client.defaults.headers = {
        ...client.defaults.headers,
        ...headers,
      };
    }

    // if (showLoader && typeof window !== "undefined")
    // hide = message.loading({
    //   content: showLoader === true ? "Loading" : showLoader,
    //   duration: 0,
    //   key: messageId,
    // })
    switch (method) {
      case "post":
        res = await client.post(path, body, { params });
        break;
      case "get":
        res = await client.get(path, { params });
        break;
      case "put":
        res = await client.put(path, body, { params });
        break;
      case "delete":
        res = await client.delete(path, { params });
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    // if (!res) {
    //   throw new Error("Empty response from server")
    // }

    if (hide && typeof window !== "undefined") {
      hide();
    }

    const responseData: any = res?.data;
    if (responseData?.status === "success" || responseData?.success === true) {
      if (
        method !== "get" &&
        typeof window !== "undefined" &&
        responseData?.message &&
        !!showSuccess
      ) {
        message.success(responseData?.message);
      }
      return responseData;
    } else {
      const errorMessage = responseData?.message || "Something went wrong!";
      if (
        method !== "get" &&
        typeof window !== "undefined" &&
        errorMessage &&
        !!showError
      ) {
        message.error(errorMessage, 6);
      }
      return responseData;
    }
  } catch (error: any) {
    const errorMessage = error?.message
      ? error?.message
      : "Something went wrong!";
    // const errorMessage = "Something went wrong!"
    if (typeof window !== "undefined" && !!showError) {
      message.error(errorMessage, 6);
      hide && hide();
    }
    return error;
  } finally {
    if (hide && typeof window !== "undefined") {
      hide();
      // message.destroy(messageId)
    }
  }
};
