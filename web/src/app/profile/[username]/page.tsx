import { paths } from "@/services/endpoint";
import { API_BASE_URL } from "@/static";
import { Course, User } from "@/types";

const UserProfile = async ({
  params,
}: {
  params?: Promise<{ username: string }>;
}) => {
  const username = (await params)?.username;

  const res = await fetch(API_BASE_URL.concat(paths.user.profile), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // body: JSON.stringify({ slug: course }),
      cache: "no-cache",
    });
    const json = await res.json();
    const { status, message, data } = json as {
      status: "error" | "success";
      message: string;
      data?: { user: User }
    };

    const user = data?.user || null
  
    if (!res.ok || status !== "success") {
      return (
        <main className="px-6 py-12">
          <h1 className="max-w-res text-2xl font-bold">Error fetching data</h1>
        </main>
      );
    }
    if (!json || !data || !user) {
      return (
        <main className="px-6 py-12">
          <h1 className="max-w-res text-2xl font-bold">User</h1>
        </main>
      );
    }

  return <div>User: {JSON.stringify(user)}</div>;
};

export default UserProfile;
