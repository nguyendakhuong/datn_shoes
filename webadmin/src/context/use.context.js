import { createContext } from "react";
import { InitState } from "./use.reducer";

const UserContext = createContext([InitState, () => {}]);

export default UserContext;
