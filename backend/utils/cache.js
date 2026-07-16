let cachedMenu = null;

export const getCachedMenu = () => {
  return cachedMenu;
};

export const setCachedMenu = (menu) => {
  cachedMenu = menu;
};

export const clearMenuCache = () => {
  cachedMenu = null;
};
