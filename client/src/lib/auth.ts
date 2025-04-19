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
  return username === "admin_daniwdiawdnawidwandwndwadnwi";
};

// Add username to request headers
export const getUserHeaders = (): Record<string, string> => {
  const username = getUsernameFromStorage();
  return username ? { "x-username": username } : {};
};

// My List Management
export const getMyList = (): number[] => {
  const list = localStorage.getItem("myList");
  return list ? JSON.parse(list) : [];
};

export const addToMyList = (videoId: number) => {
  const list = getMyList();
  if (!list.includes(videoId)) {
    list.push(videoId);
    localStorage.setItem("myList", JSON.stringify(list));
  }
};

export const removeFromMyList = (videoId: number) => {
  const list = getMyList();
  const newList = list.filter(id => id !== videoId);
  localStorage.setItem("myList", JSON.stringify(newList));
};

export const isInMyList = (videoId: number): boolean => {
  const list = getMyList();
  return list.includes(videoId);
};
