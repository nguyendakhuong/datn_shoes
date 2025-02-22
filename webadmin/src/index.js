import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import UserProvider from "./context/use.provider";
import "./lib/locales/index";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <UserProvider>
    <App />
  </UserProvider>
);

reportWebVitals();
