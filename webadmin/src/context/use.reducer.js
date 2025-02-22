const InitState = {
  token: "",
  role: "",
  isOpenModal: false,
  dataModal: null,
  isLoading: false,
  language: "",
};
const KEY_CONTEXT_USER = {
  SET_TOKEN: "SET_TOKEN",
  SET_ROLE: "SET_ROLE",
  SET_LOADING: "SET_LOADING",
  CLEAR: "CLEAR",
  SHOW_MODAL: "SHOW_MODAL",
  HIDE_MODAL: "HIDE_MODAL",
  SET_LANGUAGE: "SET_LANGUAGE",
};
const UserReducer = (state, action) => {
  switch (action.type) {
    case KEY_CONTEXT_USER.SET_TOKEN:
      return { ...state, token: action.payload };
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
    default:
  }
};
export { InitState, KEY_CONTEXT_USER };

export default UserReducer;
