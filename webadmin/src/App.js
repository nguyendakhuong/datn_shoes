import { useContext, useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import UserContext from "./context/use.context";
import APP_LOCAL from "./lib/localStorage";
import { RouterProvider } from "react-router-dom";
import AppRoute from "./route";
import { ToastContainer } from "react-toastify";
import Loading from "./modules/components/loading/Loading";
import ToastApp from "./lib/notification/Toast";
import Modal from "./modules/components/modal/Index";
import { KEY_CONTEXT_USER } from "./context/use.reducer";

function App() {
  const [{ isOpenModal, accountType }, dispatch] = useContext(UserContext);
  const [isAuth, setIsAuth] = useState(APP_LOCAL.getTokenStorage);
  const user = localStorage.getItem("currentUser");
  useEffect(() => {
    const checkLogin = async () => {
      const token = APP_LOCAL.getTokenStorage();
      try {
        const res = await fetch(`http://localhost:3001/admin/${token}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.status === 200) {
          setIsAuth(true);
          dispatch({
            type: KEY_CONTEXT_USER.SET_TOKEN,
            payload: APP_LOCAL.getTokenStorage(),
          });
          dispatch({
            type: KEY_CONTEXT_USER.SET_ACCOUNT_TYPE,
            payload: data?.data?.accountType,
          });
          if (data?.role) {
            dispatch({
              type: KEY_CONTEXT_USER.SET_ROLE,
              payload: data?.role,
            });
          }
        } else {
          ToastApp.error("Error: " + data.message);
          setIsAuth(false);
          APP_LOCAL.setTokenStorage("");
        }
      } catch (error) {
        setIsAuth(false);
        APP_LOCAL.setTokenStorage("");
      }
    };
    const getCart = async () => {
      try {
        console.log(user);
        if (user) {
          const cartLocal = APP_LOCAL.getCart();
          console.log(cartLocal);
          dispatch({ type: KEY_CONTEXT_USER.SET_CART, payload: cartLocal });
        }
      } catch (error) {
        console.log("Lỗi lấy giỏ hàng: ", error);
      }
    };
    checkLogin();
    getCart();
  }, [dispatch, user]);

  return (
    <div>
      <RouterProvider router={AppRoute(isAuth, accountType)} />
      <ToastContainer />
      <Loading />
      {isOpenModal && <Modal />}
    </div>
  );
}

export default App;
