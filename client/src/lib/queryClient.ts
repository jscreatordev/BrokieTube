import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getUserHeaders } from "./auth";
import { setLikedVideoToStorage, removeLikedVideoFromStorage } from "./auth";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const userHeaders = getUserHeaders();
  
  const res = await fetch(url, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...userHeaders
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

// Like a video
export async function likeVideo(videoId: number): Promise<Response> {
  try {
    // Update the local storage first for instant feedback
    setLikedVideoToStorage(videoId);
    
    // Then make the API request
    const res = await apiRequest('POST', `/api/videos/${videoId}/like`);
    return res;
  } catch (error) {
    console.error('Error liking video:', error);
    throw error;
  }
}

// Unlike a video
export async function unlikeVideo(videoId: number): Promise<Response> {
  try {
    // Update the local storage first for instant feedback
    removeLikedVideoFromStorage(videoId);
    
    // Then make the API request
    const res = await apiRequest('POST', `/api/videos/${videoId}/unlike`);
    return res;
  } catch (error) {
    console.error('Error unliking video:', error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const userHeaders = getUserHeaders();
    
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers: userHeaders
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
