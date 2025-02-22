import { useContext, useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import UserContext from "./context/use.context";
import APP_LOCAL from "./lib/localStorage";
import { RouterProvider } from "react-router-dom";
import AppRoute from "./route";
import { ToastContainer } from "react-toastify";
import Loading from "./modules/components/loading/Loading";
import ToastApp from "./lib/notification/Toast";
import { KEY_CONTEXT_USER } from "./context/use.reducer";

function App() {
  const [{ role }, dispatch] = useContext(UserContext);
  const [isAuth, setIsAuth] = useState(APP_LOCAL.getTokenStorage);
  useEffect(() => {
    const getUser = async () => {
      const token = APP_LOCAL.getTokenStorage();
      const requestOptions = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      try {
        await fetch(
          `http://localhost:3001/account/admin/:token`,
          requestOptions
        )
          .then((res) => {
            if (res.status === 200) {
              return res.json();
            } else {
              ToastApp.error("Error: " + res.message);
            }
          })
          .then((data) => {
            dispatch({
              type: KEY_CONTEXT_USER.SET_TOKEN,
              payload: data.data.token,
            });
            dispatch({
              type: KEY_CONTEXT_USER.SET_ROLE,
              payload: data.data.role,
            });
            setIsAuth(true);
          })
          .catch((e) => {
            console.log(e);
          });
      } catch (error) {
        console.log(error);
      }
    };
    getUser();
  }, [dispatch]);
  return (
    <div>
      <RouterProvider router={AppRoute(isAuth, role)} />
      <ToastContainer />
      <Loading />
    </div>
  );
}

export default App;
