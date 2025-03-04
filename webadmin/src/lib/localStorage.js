export const KEY_LOCAL = {
  TOKEN: "TOKEN",
  ACCOUNT_TYPE: "ACCOUNT_TYPE",
};
const getTokenStorage = () => {
  return localStorage.getItem(KEY_LOCAL.TOKEN);
};
const setTokenStorage = (token) => {
  return localStorage.setItem(KEY_LOCAL.TOKEN, token);
};
const getAccountTypeStorage = () => {
  return localStorage.getItem(KEY_LOCAL.ACCOUNT_TYPE);
};

const setAccountTypeStorage = (type) => {
  return localStorage.setItem(KEY_LOCAL.ACCOUNT_TYPE, type);
};
const APP_LOCAL = {
  getTokenStorage,
  setTokenStorage,
  getAccountTypeStorage,
  setAccountTypeStorage,
};

export default APP_LOCAL;
