import { useReducer } from "react";
import UserContext from "./use.context";
import UserReducer, { InitState } from "./use.reducer";

function UserProvider({ children }) {
  const [state, dispatch] = useReducer(UserReducer, InitState);

  return (
    <UserContext.Provider value={[state, dispatch]}>
      {children}
    </UserContext.Provider>
  );
}
export default UserProvider;
