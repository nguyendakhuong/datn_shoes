export const KEY_LOCAL = {
  TOKEN: "TOKEN",
};

const getTokenStorage = () => {
  return localStorage.getItem(KEY_LOCAL.TOKEN);
};

const setTokenStorage = (token) => {
  return localStorage.setItem(KEY_LOCAL.TOKEN, token);
};
const APP_LOCAL = {
  getTokenStorage,
  setTokenStorage,
};

export default APP_LOCAL;
