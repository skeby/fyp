"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ProgressProvider } from "@bprogress/next/app";
import { MessageProvider } from "./message-provider";
import KeyboardShortcutProvider from "./keyboard-shortcut-provider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // staleTime: 0,
      refetchOnWindowFocus: false,
    },
  },
});

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ProgressProvider
        color="#ffffff"
        options={{ showSpinner: false }}
        shallowRouting
      >
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
          position="right"
        />
        <MessageProvider>
          <KeyboardShortcutProvider>{children}</KeyboardShortcutProvider>
        </MessageProvider>
      </ProgressProvider>
    </QueryClientProvider>
  );
};

export default Providers;
