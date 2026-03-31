import axios, { AxiosProgressEvent, AxiosRequestConfig } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { getFromLocalStorage, getLocalStorageItem } from "../utils";
import { toast } from "react-toastify";

interface IPInfo {
  ip: string;
}

type MutationOptions = {
  method?: "POST" | "PUT" | "PATCH" | "DELETE";
  isFormData?: boolean;
  baseUrl?: string;
  body?: unknown;
  isAlert?: boolean;
  onProgress?: (progress: number) => void;
  type?: string; // Optional type key
  version?: string;
  chatUrl?: boolean;
};

const getApiUrl = (path: string, version?: string, chatUrl?: boolean) => {
  const cleanPath = path.replace(/^\/+/, "");
  return version === "v2" && chatUrl
    ? `/chatUrl/cv/v2/${cleanPath}`
    : version === "v2"
      ? `/api/api/cv/${version}/${cleanPath}`
      : `/api/cv/${version || "v1"}/${cleanPath}`;
};

const useMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  // Use a ref for ipAddress to avoid re-creating the callback when it changes
  const ipAddressRef = useRef<IPInfo | null>(
    getLocalStorageItem("IPINFO") as IPInfo | null
  );

  // Update the ref if ipAddress changes
  useEffect(() => {
    ipAddressRef.current = getLocalStorageItem("IPINFO") as IPInfo | null;
  }, []);

  // Track ongoing requests to prevent duplicate calls
  const pendingRequestsRef = useRef<Map<string, boolean>>(new Map());

  const mutation = useCallback(
    async (path: string, options?: MutationOptions) => {
      // Create a unique key for this request to track duplicates
      const requestKey = `${path}-${JSON.stringify(options?.body)}`;

      // Skip if this exact request is already in progress
      if (pendingRequestsRef.current.get(requestKey)) {
        return undefined;
      }

      // Mark this request as pending
      pendingRequestsRef.current.set(requestKey, true);
      setIsLoading(true);

      try {
        const token = getFromLocalStorage("ACCESS_TOKEN");
        const method = options?.method || "POST";
        const body = options?.isFormData
          ? options.body
          : JSON.stringify(options?.body);
        const headers: Record<string, string> = options?.isFormData
          ? {}
          : { "Content-Type": "application/json" };

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        if (options?.type) {
          headers["Type"] = options.type;
        }
        // Always use the current ref value
        headers["ipv4"] = ipAddressRef.current?.ip || "0.0.0.0";

        const config: AxiosRequestConfig = {
          url: getApiUrl(path, options?.version, options?.chatUrl),
          method,
          headers,
          data: body,
          timeout: 0,
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            if (options?.onProgress && progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
              );
              options.onProgress(progress);
            }
          },
        };

        const response = await axios(config);
        const results = response.data;
        const status = response.status;

        if (options?.isAlert) {
          if (results?.success) {
            toast.success(results?.message);
          } else {
            toast.error(results?.error?.message);
          }
        }

        return { results, status };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorData = error.response?.data?.error;
          let errorMessage = "Something went wrong !!";

          // Handle v2 error format
          if (options?.version === "v2" && errorData) {
            errorMessage =
              errorData?.details ||
              errorData?.title ||
              errorData?.message ||
              "Something went wrong !!";
          } else {
            // Handle v1 or legacy error format
            errorMessage =
              error.response?.data?.message ||
              (typeof errorData === "string"
                ? errorData
                : errorData?.title ||
                  errorData?.message ||
                  errorData?.details) ||
              "Something went wrong !!";
          }

          toast.error(errorMessage);
        } else {
          toast.error("Something went wrong");
        }
        return undefined;
      } finally {
        // Clear this request from pending
        pendingRequestsRef.current.delete(requestKey);
        setIsLoading(false);
      }
    },
    [] // No dependencies needed
  );

  return { mutation, isLoading };
};

export default useMutation;
