import { paths } from "@/services/endpoint";
import { API_BASE_URL } from "@/static";
import type { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star } from "lucide-react";
import ProfileActions from "@/components/profile-actions";
import BadgeDisplay from "@/components/badge-display";

const UserProfile = async ({
  params,
}: {
  params?: Promise<{ username: string }>;
}) => {
  const username = (await params)?.username;

  const res = await fetch(API_BASE_URL.concat(paths.user.profile.get), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username }),
    cache: "no-cache",
  });

  const json = await res.json();
  const { status, message, data } = json as {
    status: "error" | "success";
    message: string;
    data?: { user: User };
  };

  const user = data?.user || null;

  if (!res.ok || status !== "success") {
    return (
      <main className="container mx-auto px-6 py-12">
        <Card className="mx-auto max-w-2xl">
          <CardContent className="pt-6">
            <h1 className="text-destructive text-2xl font-bold">
              Error fetching profile
            </h1>
            <p className="text-muted-foreground mt-2">
              {message || "Unable to load user profile"}
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!json || !data || !user) {
    return (
      <main className="container mx-auto px-6 py-12">
        <Card className="mx-auto max-w-2xl">
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold">User not found</h1>
            <p className="text-muted-foreground mt-2">
              The requested user profile could not be found.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="px-6 py-12">
      <div className="max-w-res grid grid-cols-1 gap-6">
        {/* Profile Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col items-start gap-4 sm:flex-row">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={user.profile_picture}
                    alt={`${user.first_name} ${user.last_name}`}
                  />
                  <AvatarFallback className="text-lg">
                    {user.first_name[0]}
                    {user.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl text-wrap">
                    {user.first_name} {user.last_name}
                  </CardTitle>
                  <p className="text-muted-foreground">@{user.username}</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {user.email}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Experience Points */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Experience Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-primary text-3xl font-bold">
                {user.xp?.toLocaleString() || 0} XP
              </div>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Badges ({user.badges?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.badges && user.badges.length > 0 ? (
                <BadgeDisplay badges={user.badges} />
              ) : (
                <p className="text-muted-foreground">No badges earned yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Profile Actions - Only visible to profile owner */}
        {/* <div className="">
          <ProfileActions profileUser={user} />
        </div> */}
      </div>
    </main>
  );
};

export default UserProfile;
