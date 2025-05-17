export const KEY_LOCAL = {
  TOKEN: "TOKEN",
  ACCOUNT_TYPE: "ACCOUNT_TYPE",
  CART: "CART",
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
  const user = localStorage.getItem("currentUser");
  if (!user) return [];
  const userParse = JSON.parse(user);
  const key = `CART_${userParse.username}`;
  const data = localStorage.getItem(key);

  try {
    const parsed = JSON.parse(data);
    console.log("Parsed cart:", parsed);

    if (Array.isArray(parsed)) {
      return parsed.filter((i) => i?.id);
    } else {
      console.warn("Cart is not an array, returning empty:", parsed);
      return [];
    }
  } catch (err) {
    console.error("Error parsing cart from localStorage:", err);
    return [];
  }
};

const setCart = (cart) => {
 const user = localStorage.getItem("currentUser");
  if (!user) return [];
  const userParse = JSON.parse(user);
  const key = `CART_${userParse.username}`;
  localStorage.setItem(key, (cart));
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
  getLanguageStorage,
  setLanguageStorage,
};

export default APP_LOCAL;
