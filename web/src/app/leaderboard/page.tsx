"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import { useAppQuery } from "@/hooks/use-app";
import { cn } from "@/lib/utils";
import { paths } from "@/services/endpoint";
import { User } from "@/types";
import { Medal, Trophy } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

const PAGE_LIMIT = 10;

const Leaderboard = () => {
  const [page, setPage] = useState(1);
  const [allUsers, setAllUsers] = useState<(User & { rank: number })[]>([]);

  const { data, isLoading, isFetching } = useAppQuery<{
    leaderboard: (User & { rank: number })[];
    page_info: {
      current_page: number;
      total_users: number;
      total_pages: number;
    };
  }>({
    queryKey: ["leaderboard", { page }],
    path: paths.user.leaderboard,
    method: "post",
    data: { page, limit: PAGE_LIMIT },
    refetchOnMount: true,
  });

  // Update allUsers when new data is fetched
  useEffect(() => {
    if (data && data?.data && data?.data?.leaderboard) {
      if (page === 1) {
        // First page - replace all data
        setAllUsers(data.data.leaderboard);
      } else {
        // Subsequent pages - append to existing data
        setAllUsers((prev) => [...prev, ...(data?.data?.leaderboard || [])]);
      }
    }
  }, [data, page]);

  const pageInfo = data?.data?.page_info;
  const hasMorePages = pageInfo
    ? pageInfo.current_page < pageInfo.total_pages
    : false;

  const handleLoadMore = () => {
    if (!isFetching && hasMorePages) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="px-6 py-12">
      <div className="max-w-res">
        <h2 className="text-primary flex justify-between gap-x-2 font-medium">
          <span className="text-2xl">Leaderboard</span>
          <div className="text-muted-foreground flex items-center gap-x-2">
            <Trophy strokeWidth={1.6} />
            <span>Top performing users</span>
          </div>
        </h2>
        <div className="mt-6">
          {isLoading && page === 1 ? (
            <div className="mx-auto flex h-full w-fit items-center justify-center gap-2">
              <Spinner className="size-6" />{" "}
              <span className="text-sm">Loading</span>
            </div>
          ) : allUsers.length === 0 ? (
            <div className="bg-card/30 border-border rounded-lg border p-8 text-center">
              <Trophy className="text-muted-foreground mx-auto mb-2 h-12 w-12 opacity-50" />
              <h3 className="mb-1 text-lg font-medium">No data available</h3>
              <p className="text-muted-foreground">
                The leaderboard is currently empty.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {allUsers.map((user, index) => (
                <LeaderboardItem
                  key={`${user.rank}-${index}`}
                  user={user}
                  rank={user.rank}
                />
              ))}

              {hasMorePages && (
                <div className="mt-6 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={isFetching}
                    className="min-w-32"
                  >
                    {isFetching ? (
                      <>
                        <Spinner className="mr-2 size-4" />
                        Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </Button>
                </div>
              )}

              {pageInfo && (
                <div className="mt-4 text-center">
                  <span className="text-muted-foreground text-sm">
                    Showing {allUsers.length} of {pageInfo.total_users} users
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface LeaderboardItemProps {
  user: User;
  rank: number;
}

export function LeaderboardItem({ user, rank }: LeaderboardItemProps) {
  const { username, first_name, xp, profile_picture, email } = user;

  // Get initials for avatar fallback
  const getInitials = () => {
    if (first_name) {
      return first_name.charAt(0).toUpperCase();
    }
    return username?.charAt(0).toUpperCase() || email.charAt(0).toUpperCase();
  };

  // Determine if this is a top 3 position
  const isTopThree = rank <= 3;

  // Get rank badge based on position
  const getRankBadge = () => {
    if (rank === 1) {
      return (
        <div className="bg-chart-1 border-background absolute -top-1 -left-1 rounded-full border-2 p-1.5 shadow-lg">
          <Trophy className="text-background h-4 w-4" />
        </div>
      );
    } else if (rank === 2) {
      return (
        <div className="bg-chart-2 border-background absolute -top-1 -left-1 rounded-full border-2 p-1.5 shadow-lg">
          <Medal className="text-background h-4 w-4" />
        </div>
      );
    } else if (rank === 3) {
      return (
        <div className="bg-chart-3 border-background absolute -top-1 -left-1 rounded-full border-2 p-1.5 shadow-lg">
          <Medal className="text-background h-4 w-4" />
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-between rounded-lg border p-4 transition-all",
        isTopThree
          ? "bg-card/60 border-primary/20 shadow-md"
          : "bg-card/30 border-border hover:bg-card/50",
      )}
    >
      {getRankBadge()}

      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
            rank === 1
              ? "bg-chart-1/20 text-chart-1"
              : rank === 2
                ? "bg-chart-2/20 text-chart-2"
                : rank === 3
                  ? "bg-chart-3/20 text-chart-3"
                  : "bg-muted text-muted-foreground",
          )}
        >
          {rank}
        </div>

        <div className="relative">
          <Avatar
            className={cn(
              "h-12 w-12 border-2",
              rank === 1
                ? "border-chart-1"
                : rank === 2
                  ? "border-chart-2"
                  : rank === 3
                    ? "border-chart-3"
                    : "border-transparent",
            )}
          >
            <AvatarImage
              src={profile_picture || "/placeholder.svg"}
              alt={username}
            />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </div>

        <Link href={`/profile/${username}`}>
          <div className="flex flex-col">
            <div className="font-medium">{username}</div>
            <div className="text-muted-foreground text-sm">{first_name}</div>
          </div>
        </Link>
      </div>

      <div className="flex items-center">
        <div
          className={cn(
            "rounded-full px-3 py-1 font-semibold",
            rank === 1
              ? "bg-chart-1/20 text-chart-1"
              : rank === 2
                ? "bg-chart-2/20 text-chart-2"
                : rank === 3
                  ? "bg-chart-3/20 text-chart-3"
                  : "bg-primary/10 text-primary",
          )}
        >
          {xp.toLocaleString()} XP
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
