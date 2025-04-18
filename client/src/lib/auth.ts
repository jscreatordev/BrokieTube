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
