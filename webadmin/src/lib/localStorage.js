export const KEY_LOCAL = {
  TOKEN: "TOKEN",
  ACCOUNT_TYPE: "ACCOUNT_TYPE",
  CART: "CART",
  CART_ADMIN: "CART_ADMIN",
  LANGUAGE_APP: "LANGUAGE_APP",
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
const getCart = () => {
  const data = localStorage.getItem(KEY_LOCAL.CART);
  return JSON.parse(data).filter((i) => i.id);
};

const setCart = (cart) => {
  return localStorage.setItem(KEY_LOCAL.CART, cart);
};
const getCartAdmin = () => {
  const data = localStorage.getItem(KEY_LOCAL.CART_ADMIN);
  return JSON.parse(data).filter((i) => i.id);
};

const setCartAdmin = (cart) => {
  return localStorage.setItem(KEY_LOCAL.CART_ADMIN, cart);
};

const getLanguageStorage = () => {
  return localStorage.getItem(KEY_LOCAL.LANGUAGE_APP);
};

const setLanguageStorage = (language) => {
  return localStorage.setItem(KEY_LOCAL.LANGUAGE_APP, language);
};
const APP_LOCAL = {
  getTokenStorage,
  setTokenStorage,
  getAccountTypeStorage,
  setAccountTypeStorage,
  getCart,
  setCart,
  getCartAdmin,
  setCartAdmin,
  getLanguageStorage,
  setLanguageStorage,
};

export default APP_LOCAL;
