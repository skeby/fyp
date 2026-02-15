import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star } from "lucide-react";
import BadgeDisplay from "@/components/badge-display";
import { getProfile } from "@/methods";
import { Metadata } from "next";
import { defaultMetadata } from "@/static";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const username = (await params)?.username;

  const { data } = await getProfile({ username });

  if (!data?.user) {
    return {
      title: "Profile not found",
      description: "The requested profile could not be found.",
    };
  }

  const { first_name, last_name, profile_picture, badges } = data.user;

  return {
    title: `AdaptLearn - ${first_name} ${last_name}`,
    description: `Profile of ${first_name} ${last_name}`,
    keywords: [
      ...(badges ?? []).map((badge) => badge.name),
      ...(Array.isArray(defaultMetadata.keywords)
        ? defaultMetadata.keywords
        : typeof defaultMetadata.keywords === "string"
          ? defaultMetadata.keywords.split(", ")
          : []),
    ],
    openGraph: {
      title: `AdaptLearn - ${first_name} ${last_name}`,
      description: `Profile of ${first_name} ${last_name}`,
      images: profile_picture ? [{ url: profile_picture }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `AdaptLearn - ${first_name} ${last_name}`,
      description: `Profile of ${first_name} ${last_name}`,
      images: profile_picture ? [profile_picture] : undefined,
    },
  };
}

const UserProfile = async ({
  params,
}: {
  params?: Promise<{ username: string }>;
}) => {
  const username = (await params)?.username;

  const { status, message, data } = username
    ? await getProfile({ username })
    : { status: "error", message: "Profile not found" };

  const user = data?.user || null;

  if (status === "error") {
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

  if (!user) {
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
    <main className="px-1.5 py-3 min-[370px]:px-2 sm:px-6 sm:py-12">
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
