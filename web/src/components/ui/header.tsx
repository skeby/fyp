"use client";

import { useAppUser } from "@/hooks/use-app";
import { Button } from "./button";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { LOGIN_ROUTE } from "@/static";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { unslugify } from "@/lib/utils";
import { Star, Menu, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

const Header = () => {
  const { user, removeUser, loading } = useAppUser();
  const pathname = usePathname();
  const { course } = useParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu toggle

  const navLinks = [
    {
      href: `/course/${course}`,
      title: typeof course === "string" ? unslugify(course) : "",
      show: !!course,
    },
    {
      href: "/courses",
      title: "Courses",
    },
    // {
    //   href: `/profile/${user?.username}`,
    //   title: "Profile",
    //   show: !!user,
    // },
    {
      href: "/leaderboard",
      title: "Leaderboard",
    },
  ];

  const filteredNavLinks = navLinks.filter(
    (link) => typeof link.show === "undefined" || link.show === true,
  );

  return (
    <header className="bg-background sticky top-0 left-0 z-50 h-14 border-b px-1.5 min-[370px]:px-2 sm:px-6">
      <div className="max-w-res flex h-full items-center justify-between gap-3">
        <Link
          href="/"
          className="mr-6 flex items-center gap-2 sm:w-full sm:max-w-[115px]"
        >
          <Image src="/logo.png" alt="AdaptLearn" width={28} height={28} />
          <span className="text-sm font-semibold">AdaptLearn</span>
        </Link>

        <div className="hidden h-full flex-1 items-center justify-center space-x-2 sm:flex">
          {filteredNavLinks.map((link, index) => {
            const isActive = link.href === pathname;
            return (
              <Link
                key={index}
                href={link.href}
                className={`h-fit items-center justify-center duration-200`}
              >
                <span
                  className={`px-2 py-1.5 text-sm font-medium capitalize duration-200 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                >
                  {link.title}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-x-2 sm:w-full sm:max-w-[115px]">
          <Button
            variant="ghost"
            size="sm"
            className="flex h-8 w-8 items-center justify-center p-0 sm:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <motion.div
              animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </motion.div>
          </Button>

          {user || loading ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    loading={loading}
                    variant="outline"
                    className="flex h-8 items-center gap-2 rounded-sm border bg-transparent px-2 py-0"
                  >
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span className="text-sm leading-2">{user?.xp ?? 0}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 pt-2">
                  <DropdownMenuLabel className="flex justify-between gap-5">
                    <div className="space-y-2">
                      <p className="text-base font-medium">XP</p>
                      <p className="text-xs">
                        You have{" "}
                        <span className="font-bold">{user?.xp ?? 0}</span> XP
                      </p>
                    </div>
                    <Star className="h-12 shrink-0 fill-yellow-500 text-yellow-500" />
                  </DropdownMenuLabel>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    loading={loading}
                    variant="outline"
                    className="flex size-8! items-center justify-center rounded-full bg-transparent p-0"
                  >
                    <Avatar className="size-full!">
                      <AvatarImage
                        src={user?.profile_picture}
                        alt={`${user?.first_name} ${user?.last_name}`}
                      />
                      <AvatarFallback className="text-sm">
                        {user?.first_name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 p-1">
                  <DropdownMenuLabel className="text-base font-semibold">
                    {user?.first_name} {user?.last_name}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <Link href={`/profile/${user?.username}`}>
                      <DropdownMenuItem className="cursor-pointer">
                        Profile
                        <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                      </DropdownMenuItem>
                    </Link>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => removeUser()}
                  >
                    Log out
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              {pathname !== LOGIN_ROUTE && (
                <Link href={LOGIN_ROUTE}>
                  <Button
                    variant="outline"
                    className="flex h-8 items-center gap-2 rounded-sm border bg-transparent px-4 py-0 text-sm"
                  >
                    Login
                  </Button>
                </Link>
              )}
              {pathname !== "/signup" && (
                <Link href="/signup">
                  <Button className="flex h-8 items-center gap-2 rounded-sm border px-3 py-0 text-sm">
                    Sign Up
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="bg-background absolute top-12 left-0 w-full border-b shadow-lg sm:hidden"
          >
            <nav className="flex flex-col py-2">
              {filteredNavLinks.map((link, index) => {
                const isActive = link.href === pathname;
                return (
                  <Link
                    key={index}
                    href={link.href}
                    className={`hover:text-primary px-3 py-3 text-sm font-medium capitalize duration-200 min-[370px]:px-4 ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.title}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
