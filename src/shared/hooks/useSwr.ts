import useSWR, { SWRConfiguration } from "swr";
import { getFromLocalStorage } from "../utils";

interface SwrCustomOptions extends SWRConfiguration {
  version?: string;
  chatUrl?: boolean;
}

const useSwr = (path: string | null, options?: SwrCustomOptions) => {
  const fetcher = async (url: string) => {
    const accessToken = getFromLocalStorage("ACCESS_TOKEN");
    const headers: {
      Authorization?: string;

      "Content-Type"?: string;

      Range?: string;

      "Content-Length"?: string;
    } = {};

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    headers["Content-Type"] = "application/json";
    headers["Range"] = "1";
    headers["Content-Length"] = "1";

    const res = await fetch(url, {
      method: "GET",
      headers,
    });
    let data;
    try {
      data = await res.json();
    } catch {
      data = { error: "Invalid JSON response" };
    }
    return { data, res };
  };

  const { data, error, mutate, isValidating, isLoading } = useSWR(
    path ? `/api/${path}` : null,
    fetcher,
    {
      ...options,
      revalidateOnFocus: false,
    }
  );

  return {
    data: data?.data,
    error,
    isValidating,
    isLoading,
    mutate,
    pagination: data?.data?.pagination,
  };
};

export default useSwr;
