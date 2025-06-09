"use client";

import { useAppUser } from "@/hooks/use-app";
import { useRouter } from "next-nprogress-bar";
import { useEffect, ReactNode } from "react";
import { message } from "./message-provider";

const KeyboardShortcutProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { user, removeUser } = useAppUser();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCommand = e.metaKey || e.ctrlKey; // supports macOS and Windows/Linux
      const isShift = e.shiftKey;
      const key = e.key.toLowerCase();

      if (isCommand && isShift && key === "q" && user) {
        e.preventDefault();
        message.success("Keyboard Shortcut - Logout");
        removeUser();
        // call your logout logic
      }

      if (isCommand && isShift && key === "p" && user) {
        e.preventDefault();
        message.success("Keyboard Shortcut - Open Profile");
        router.push(`/profile/${user?.username}`);
      }

      // if (isCommand && !isShift && key === "s") {
      //   e.preventDefault();
      //   message.success("Keyboard Shortcut - Open Settings");
      //   router.push("/settings");
      // }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router]);

  return <>{children}</>;
};

export default KeyboardShortcutProvider;
