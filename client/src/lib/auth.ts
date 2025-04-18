// Get username from localStorage
export const getUsernameFromStorage = (): string | null => {
  return localStorage.getItem("username");
};

// Set username to localStorage
export const setUsernameToStorage = (username: string): void => {
  localStorage.setItem("username", username);
};

// Check if the user is an admin (would normally check with server)
export const checkIfAdmin = (): boolean => {
  const username = getUsernameFromStorage();
  return username === "admin";
};

// Add username to request headers
export const getUserHeaders = (): Record<string, string> => {
  const username = getUsernameFromStorage();
  return username ? { "x-username": username } : {};
};

// Check if a video is liked by the current user
export const isVideoLiked = (videoId: number): boolean => {
  const likedVideos = getLikedVideosFromStorage();
  return likedVideos.includes(videoId);
};

// Add a video to liked videos in localStorage
export const setLikedVideoToStorage = (videoId: number): void => {
  const likedVideos = getLikedVideosFromStorage();
  if (!likedVideos.includes(videoId)) {
    likedVideos.push(videoId);
    localStorage.setItem("likedVideos", JSON.stringify(likedVideos));
  }
};

// Remove a video from liked videos in localStorage
export const removeLikedVideoFromStorage = (videoId: number): void => {
  const likedVideos = getLikedVideosFromStorage();
  const updatedLikedVideos = likedVideos.filter(id => id !== videoId);
  localStorage.setItem("likedVideos", JSON.stringify(updatedLikedVideos));
};

// Get all liked videos from localStorage
export const getLikedVideosFromStorage = (): number[] => {
  const likedVideosStr = localStorage.getItem("likedVideos");
  if (likedVideosStr) {
    try {
      return JSON.parse(likedVideosStr);
    } catch (e) {
      return [];
    }
  }
  return [];
};
