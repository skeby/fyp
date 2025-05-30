import { setCookieWithEvent } from "@/lib/utils";
import { apiCall } from "@/services/endpoint";
import { AUTH_TOKEN, LOGIN_ROUTE, protectedRoutes, USER } from "@/static";
import { User } from "@/types";
import {
  QueryFilters,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

interface MutationData<T> {
  mutationKey: any[];
  path: string;
  onSuccess?: (data: {
    data?: T;
    message: string;
    status: "success" | "error";
  }) => void;
  onError?: (data?: any) => void;
  method?: string;
  extraHeaders?: any;
  headers?: any;
  params?: any;
  showLoader?: boolean | string;
  showMessage?: boolean;
  removeQueries?: boolean;
}

interface QueryData {
  data?: any;
  queryKey: any[];
  path: string;
  enabled?: boolean;
  refetchOnMount?: boolean;
  extraHeaders?: any;
  headers?: any;
  params?: any;
  showLoader?: boolean | string;
  showMessage?: boolean;
  gcTime?: number;
  staleTime?: number;
  method?: string;
}

export const useAppMutation = <T>(mutationData: MutationData<T>) => {
  const {
    mutationKey,
    path,
    onSuccess,
    onError,
    method = "post",
    extraHeaders,
    headers,
    params,
    showLoader,
    showMessage,
    removeQueries,
  } = mutationData ?? {};
  const queryClient = useQueryClient();

  return useMutation<
    {
      data?: T;
      message: string;
      status: "success" | "error";
    },
    any,
    unknown
  >({
    mutationKey,
    mutationFn: (data: any) => {
      return apiCall(
        data,
        path,
        method,
        extraHeaders,
        headers,
        params,
        showLoader,
        showMessage,
      );
    },
    onSuccess: (data) => {
      if (data?.status === "success") {
        const predicate: QueryFilters["predicate"] = (query) => {
          return query.queryKey[0] === mutationKey[0];
        };
        queryClient.invalidateQueries({
          predicate,
        });
        if (removeQueries) {
          queryClient.removeQueries({
            predicate,
          });
        }
        onSuccess && onSuccess(data);
      } else {
        if (onError) onError(data);
      }
    },
    onError: () => {
      if (onError) onError();
    },
  });
};

export const useAppQuery = <T>(queryData: QueryData) => {
  const {
    data,
    queryKey,
    path,
    enabled,
    refetchOnMount,
    extraHeaders,
    headers,
    params,
    showLoader,
    showMessage = false,
    gcTime,
    staleTime,
    method = "get",
  } = queryData;
  return useQuery<{ data?: T; message: string; status: "success" | "error" }>({
    queryKey,
    queryFn: () =>
      apiCall(
        data ?? {},
        path,
        method,
        extraHeaders,
        headers,
        params,
        showLoader,
        showMessage,
      ),
    enabled,
    gcTime,
    staleTime,
    refetchOnMount: refetchOnMount ?? false,
  });
};

export const useAppUser = () => {
  const [user, setUserState] = useState<User | null>(() =>
    JSON.parse(Cookies.get(USER) ?? "null"),
  );
  const [loading, setLoading] = useState(true);

  const setUser = (user: User, token?: string) => {
    setCookieWithEvent(USER, JSON.stringify(user), { expires: 14 });
    if (token) {
      setCookieWithEvent(AUTH_TOKEN, token, { expires: 14 });
    }
  };

  const removeUser = () => {
    // Remove the USER cookie and trigger the cookieChange event
    Cookies.remove(USER);
    const event = new CustomEvent("cookieChange", {
      detail: { name: USER, value: null },
    });
    window.dispatchEvent(event);

    // Optionally, remove the token cookie as well
    Cookies.remove(AUTH_TOKEN);

    // FIX: Doesn't redirect for some reason
    if (
      protectedRoutes.some((r) =>
        typeof r === "string"
          ? r === window.location.pathname
          : r.test(window.location.pathname),
      )
    ) {
      window.location.pathname = `${LOGIN_ROUTE}`;
      window.location.search = `?next=${window.location.pathname}`;
    }
  };

  useEffect(() => {
    const handleCookieChange = (event: CustomEvent) => {
      if (event.detail.name === USER) {
        setUserState(JSON.parse(event.detail.value));
      }
    };

    window.addEventListener(
      "cookieChange",
      handleCookieChange as EventListener,
    );

    return () => {
      window.removeEventListener(
        "cookieChange",
        handleCookieChange as EventListener,
      );
    };
  }, []);

  useEffect(() => {
    const userCookie = JSON.parse(Cookies.get(USER) ?? "null");
    if (user || !userCookie) {
      setLoading(false);
    }
  }, [user]);

  return { user, setUser, removeUser, loading };
};
