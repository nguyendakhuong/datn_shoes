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

function App() {
  const [{ isOpenModal }, dispatch] = useContext(UserContext);
  const [isAuth, setIsAuth] = useState(false);
  const [router, setRouter] = useState(null);
  const [accountType, setAccountType] = useState("");
  useEffect(() => {
    const checkLogin = async () => {
      const token = APP_LOCAL.getTokenStorage();
      if (!token) {
        setIsAuth(false);
        return;
      }
      try {
        const res = await fetch(`http://localhost:3001/admin/:token`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.status === 200) {
          const data = await res.json();
          if (data?.data?.accountType) {
            setAccountType(data?.data?.accountType);
            setIsAuth(true);
          } else {
            setIsAuth(false);
          }
        } else {
          ToastApp.error("Error: " + res.statusText);
          setIsAuth(false);
        }
      } catch (error) {
        console.log(error);
        setIsAuth(false);
      }
    };
    checkLogin();
  }, [dispatch]);

  useEffect(() => {
    if (accountType && isAuth) {
      setRouter(AppRoute(isAuth, accountType));
    }
  }, [isAuth, accountType]);
  return (
    <div>
      {router ? <RouterProvider router={router} /> : <Loading />}
      <ToastContainer />
      <Loading />
      {isOpenModal && <Modal />}
    </div>
  );
}

export default App;
