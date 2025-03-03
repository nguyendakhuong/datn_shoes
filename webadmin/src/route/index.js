import { createBrowserRouter } from "react-router-dom";
import LayoutWeb from "../modules/layout/LayoutWeb";
import Main from "../modules/Main";
import ErrorPage from "../lib/errorpage/ErrorPage";
import Login from "../modules/auth/Login";
import User from "../modules/User/User";
import SignUp from "../modules/auth/SignUp";
import Product from "../modules/product/Product";
import Order from "../modules/order/Order";
import Statistical from "../modules/statistical/Statistical";
import DiscountCode from "../modules/discount/DiscountCode";

const AppRoute = (isAuth, accountType) => {
  const route = [
    {
      path: "/",
      element: <Main />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    ...(isAuth && accountType === "admin"
      ? [
          {
            path: "/admin",
            element: <LayoutWeb />,
            children: [
              { index: true, element: <User /> },
              { path: "users", element: <User /> },
              { path: "accountAdmin", element: <SignUp /> },
              { path: "product", element: <Product /> },
              { path: "order", element: <Order /> },
              { path: "statistical", element: <Statistical /> },
              { path: "discount", element: <DiscountCode /> },
            ],
          },
        ]
      : [
          {
            path: "*",
            element: <ErrorPage />,
          },
        ]),
  ];

  return createBrowserRouter(route);
};
export default AppRoute;
