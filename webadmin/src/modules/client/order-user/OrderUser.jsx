import { useEffect, useState } from "react";
import "./OrderUser.scss";
import APP_LOCAL from "../../../lib/localStorage";
import ButtonWed from "../../components/button/Button-admin";

const TABS = [
    { label: "Tất cả đơn hàng", status: "all" },
    { label: "Chờ xác nhận", status: "1" },
    { label: "Đơn đang giao", status: "2" },
    { label: "Đơn đã nhận", status: "3" },
    { label: "Đơn bị hủy", status: "4" },
    { label: "Đơn khách hủy", status: "5" },
];

const OrderUser = () => {
    const [selectedTab, setSelectedTab] = useState("all");
    const [data, setData] = useState([])
    const getAllOrder = async () => {
        const token = APP_LOCAL.getTokenStorage()
        try {
            const response = await fetch(`http://localhost:3001/order/getAllOrderByUser`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json()
            if (data.status === 200) {
                setData(data.data)
            }
        } catch (e) {
            console.log("Lỗi lấy thông tin đơn hàng của người dùng: ", e)
        }
    }
    useEffect(() => {
        getAllOrder()
    }, [])

    const filteredOrders =
        selectedTab === "all"
            ? data
            : data.filter((order) => order.status === selectedTab);
    const formatter = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    });
    return (
        <div className="order-container">
            <div className="tabbar">
                {TABS.map((tab) => (
                    <button
                        key={tab.status}
                        className={selectedTab === tab.status ? "active" : ""}
                        onClick={() => setSelectedTab(tab.status)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="order-list">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <div key={order.id} className="order-item">
                            <h3>Mã đơn: {order.orderCode}</h3>
                            <p><strong>Địa chỉ:</strong> {order.address}</p>
                            <p><strong>Phương thức thanh toán:</strong> {order.paymentMethod}</p>
                            <p><strong>Ngày đặt hàng:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                            <p><strong>Tổng tiền:</strong> {formatter.format(order.totalPayment)}</p>
                            <div className="order-details">
                                {order.orderDetails.map((detail, index) => (
                                    <div key={index} className="product-item">
                                        <img src={detail.image} alt={detail.nameProduct} />
                                        <div>
                                            <p><strong>{detail.nameProduct}</strong></p>
                                            <p>Size: {detail.size}</p>
                                            <p>Số lượng: {detail.quantity}</p>
                                            <p>Giá: {formatter.format(detail.price)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div>
                                {order.status === "1" && <button>Hủy hàng</button>}
                                {order.status === "2" && <button>Xác nhận</button>}
                            </div>
                        </div>
                    ))
                ) : (
                    <p>Không có đơn hàng nào.</p>
                )}
            </div>
        </div>
    );
};

export default OrderUser;
