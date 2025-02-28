import { Outlet } from "react-router-dom";
import Header from "./header/Header";
import Footer from "./footer/Footer";
import './LayoutWeb.scss'
import CONFIG_ADMIN from "../../lib/configs/sidebarNav";
import Sidebar from "../components/sidebar/Sidebar-admin";
function LayoutWeb() {
    return (
        <div className="layout">
            <Header />
            <div className="main">
                <div className="main__sidebar">
                    <Sidebar sidebarNav={CONFIG_ADMIN.sidebarNav} />
                </div>
                <div className="main__outlet">
                    <Outlet />
                </div>
            </div>
            <Footer />
        </div>
    )
}
export default LayoutWeb