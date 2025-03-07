import { useState } from "react";
import "./InfoUser.scss";
import UserInfoDetail from "./UserInfoDetail/UserInfoDetail";
import ChangePassword from "./changPassword/ChangPassword";
import ShippingAddress from "./shippingAddress/ShippingAddress";


const InfoUser = () => {
    const [activeTab, setActiveTab] = useState(0);

    const renderContent = () => {
        switch (activeTab) {
            case 0:
                return <UserInfoDetail />;
            case 1:
                return <ChangePassword />;
            case 2:
                return <ShippingAddress />;
            default:
                return null;
        }
    };

    return (
        <div className="info-user-container">
            <div className="tab-bar">
                <button className={activeTab === 0 ? "active" : ""} onClick={() => setActiveTab(0)}>
                    Thông tin người dùng
                </button>
                <button className={activeTab === 1 ? "active" : ""} onClick={() => setActiveTab(1)}>
                    Đổi mật khẩu
                </button>
                <button className={activeTab === 2 ? "active" : ""} onClick={() => setActiveTab(2)}>
                    Địa chỉ nhận hàng
                </button>
            </div>
            <div className="tab-content">{renderContent()}</div>
        </div>
    );
};

export default InfoUser;
