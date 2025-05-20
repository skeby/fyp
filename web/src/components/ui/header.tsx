"use client";

import { useAppUser } from "@/hooks/use-app";
import { Button } from "./button";
import Coin from "@/assets/icons/coin.svg";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOGIN_ROUTE } from "@/static";

const Header = () => {
  const { user, removeUser } = useAppUser();
  const pathname = usePathname();

  return (
    <header className="bg-secondary sticky top-0 left-0 z-50 h-12 border-b">
      <div className="max-w-res flex h-full items-center justify-between gap-3 px-6">
        <p className="font-semibold">AdaptLearn</p>
        <div className="flex items-center gap-x-2">
          {user ? (
            <>
              <Button
                variant="outline"
                className="flex h-8 items-center gap-2 rounded-lg border bg-transparent px-2 py-0"
              >
                <Coin />
                <span className="text-sm leading-2">200</span>
              </Button>
              <Button
                variant="outline"
                className="flex !size-8 items-center justify-center rounded-full bg-transparent p-0"
              >
                {user?.first_name?.charAt(0).toUpperCase()}
              </Button>
              <p
                className="text-muted-foreground cursor-pointer text-sm"
                onClick={() => removeUser()}
              >
                Log out
              </p>
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
