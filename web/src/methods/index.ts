import { paths } from "@/services/endpoint";
import { API_BASE_URL } from "@/static";
import { Course, User } from "@/types";

interface GetCoursesResponse {
  status: "error" | "success";
  message: string;
  data?: { courses: Course[] } | null;
}

interface GetCourseResponse {
  status: "error" | "success";
  message: string;
  data?: { course: Course } | null;
}

interface GetProfileResponse {
  status: "error" | "success";
  message: string;
  data?: { user: User } | null;
}

export const getCourses = async (): Promise<GetCoursesResponse> => {
  try {
    const res = await fetch(API_BASE_URL.concat(paths.course.getAll), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    });
    const json = await res.json();
    return json as {
      status: "error" | "success";
      message: string;
      data?: { courses: Course[] };
    };
  } catch (error: any) {
    return {
      status: "error" as const,
      message:
        error?.message ||
        error?.data?.message ||
        error?.error ||
        "Error fetching courses",
      data: null,
    };
  }
};

export const getCourse = async ({
  slug,
}: {
  slug: string;
}): Promise<GetCourseResponse> => {
  try {
    const res = await fetch(API_BASE_URL.concat(paths.course.getOne), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ slug }),
      cache: "no-cache",
    });
    const json = await res.json();
    return json as {
      status: "error" | "success";
      message: string;
      data?: { course: Course };
    };
  } catch (error: any) {
    return {
      status: "error" as const,
      message:
        error?.message ||
        error?.data?.message ||
        error?.error ||
        `Error fetching course: "${slug}"`,
      data: null,
    };
  }
};

export const getProfile = async ({
  username,
}: {
  username: string;
}): Promise<GetProfileResponse> => {
  try {
    const res = await fetch(API_BASE_URL.concat(paths.user.profile.get), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
      cache: "no-cache",
    });

    const json = await res.json();
    return json as {
      status: "error" | "success";
      message: string;
      data?: { user: User };
    };
  } catch (error: any) {
    return {
      status: "error" as const,
      message:
        error?.message ||
        error?.data?.message ||
        error?.error ||
        `Error fetching profile: "${username}"`,
      data: null,
    };
  }
};
