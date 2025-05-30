"use client";

import { useAppUser } from "@/hooks/use-app";
import { Button } from "./button";
import Coin from "@/assets/icons/coin.svg";
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

const Header = () => {
  const { user, removeUser, loading } = useAppUser();
  const pathname = usePathname();
  const { course } = useParams();

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
    {
      href: `/profile/${user?.username}`,
      title: "Profile",
      show: !!user,
    },
    {
      href: "/settings",
      title: "Settings",
    },
  ];

  return (
    <header className="bg-secondary sticky top-0 left-0 z-50 h-12 border-b px-6">
      <div className="max-w-res flex h-full items-center justify-between gap-3">
        <div className="flex h-full items-center space-x-2">
          <Link href="/" className="mr-6">
            <p className="font-extrabold">AdaptLearn</p>
          </Link>
          {navLinks
            .filter(
              (link) => typeof link.show === "undefined" || link.show === true,
            )
            .map((link, index) => {
              const isActive = link.href === pathname;
              return (
                <Link
                  key={index}
                  href={link.href}
                  className={`flex h-full items-center justify-center duration-200 ${isActive ? "border-b border-white" : ""}`}
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
        <div className="flex items-center gap-x-2">
          {user || loading ? (
            <>
              {/* <Button
                loading={loading}
                variant="outline"
                className="flex h-8 items-center gap-2 rounded-lg border bg-transparent px-2 py-0"
              >
                <Coin />
                <span className="text-sm leading-2">200</span>
              </Button> */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    loading={loading}
                    variant="outline"
                    className="flex !size-8 items-center justify-center rounded-full bg-transparent p-0"
                  >
                    {user?.first_name?.charAt(0).toUpperCase()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {/* <DropdownMenuLabel>My Account</DropdownMenuLabel> */}
                  <DropdownMenuLabel>
                    {user?.first_name} {user?.last_name}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <Link href={`/profile/${user?.username}`}>
                      <DropdownMenuItem>
                        Profile
                        <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/settings">
                      <DropdownMenuItem>
                        Settings
                        <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                      </DropdownMenuItem>
                    </Link>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => removeUser()}>
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
                    className="flex h-8 items-center gap-2 border bg-transparent px-4 py-0 text-sm"
                  >
                    Login
                  </Button>
                </Link>
              )}
              {pathname !== "/signup" && (
                <Link href="/signup">
                  <Button className="flex h-8 items-center gap-2 border px-3 py-0 text-sm">
                    Sign Up
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
