"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { MessageProvider } from "./message-provider";

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
      <ReactQueryDevtools
        initialIsOpen={false}
        buttonPosition="bottom-right"
        position="right"
      />
      <ProgressBar
        style="style"
        options={{
          showSpinner: false,
          easing: "ease",
          // speed: 200,
          // trickle: true,
          // trickleSpeed: 200,
        }}
        shallowRouting
      />
      <MessageProvider>{children}</MessageProvider>
    </QueryClientProvider>
  );
};

export default Providers;
