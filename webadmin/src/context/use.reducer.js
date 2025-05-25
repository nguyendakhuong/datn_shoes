import APP_LOCAL from "../lib/localStorage";

const InitState = {
  token: "",
  accountType: APP_LOCAL.getAccountTypeStorage(),
  role: "",
  isOpenModal: false,
  dataModal: null,
  isLoading: false,
  language: "",
  cart: [],
  cartAdmin: [],
};
const KEY_CONTEXT_USER = {
  SET_TOKEN: "SET_TOKEN",
  SET_ACCOUNT_TYPE: "ACCOUNT_TYPE",
  SET_ROLE: "SET_ROLE",
  SET_LOADING: "SET_LOADING",
  CLEAR: "CLEAR",
  SHOW_MODAL: "SHOW_MODAL",
  HIDE_MODAL: "HIDE_MODAL",
  SET_LANGUAGE: "SET_LANGUAGE",
  SET_CART: "SET_CART",
  SET_CART_ADMIN: "SET_CART_ADMIN",
};
const UserReducer = (state, action) => {
  switch (action.type) {
    case KEY_CONTEXT_USER.SET_TOKEN:
      return { ...state, token: action.payload };
    case KEY_CONTEXT_USER.SET_ACCOUNT_TYPE:
      APP_LOCAL.setAccountTypeStorage(action.payload);
      return { ...state, accountType: action.payload };
    case KEY_CONTEXT_USER.SET_ROLE:
      return { ...state, role: action.payload };
    case KEY_CONTEXT_USER.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case KEY_CONTEXT_USER.SHOW_MODAL:
      return {
        ...state,
        isOpenModal: true,
        titleModel: action.payload.titleModel,
        contentModel: action.payload.contentModel,
        dataModal: action.payload.dataModal,
        typeModal: action.payload.typeModal,
        onClickConfirmModel: action.payload.onClickConfirmModel,
      };
    case KEY_CONTEXT_USER.HIDE_MODAL:
      return {
        ...state,
        isOpenModal: false,
        dataModal: null,
        onClickConfirmModel: () => {},
      };
    case KEY_CONTEXT_USER.SET_LANGUAGE:
      return { ...state, language: action.payload };

    case KEY_CONTEXT_USER.SET_CART:
      APP_LOCAL.setCart(JSON.stringify(action.payload));
      return { ...state, cart: action.payload };

    case KEY_CONTEXT_USER.SET_CART_ADMIN:
      APP_LOCAL.setCartAdmin(JSON.stringify(action.payload));
      return { ...state, cartAdmin: action.payload };

    default:
      return state;
  }
};
export { InitState, KEY_CONTEXT_USER };

export default UserReducer;
