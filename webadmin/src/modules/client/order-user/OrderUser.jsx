import { useContext, useEffect, useState } from "react";
import "./OrderUser.scss";
import APP_LOCAL from "../../../lib/localStorage";
import UserContext from "../../../context/use.context";
import { KEY_CONTEXT_USER } from "../../../context/use.reducer";
import ToastApp from "../../../lib/notification/Toast";
const TABS = [
    { label: "Tất cả đơn hàng", status: "all" },
    { label: "Đơn đã xác nhận", status: "2" },
    { label: "Đơn đang giao", status: "3" },
    { label: "Đơn đã nhận", status: "5" },
    { label: "Đơn bị hủy", status: "6" },
    { label: "Đơn khách hủy", status: ["7", "8"] },
];

const OrderUser = () => {
    const [userCtx, dispatch] = useContext(UserContext)
    const [selectedTab, setSelectedTab] = useState("all");
    const [data, setData] = useState([])
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderNote, setOrderNote] = useState(null)
    const statusLabels = {
        0: "Chưa thanh toán",
        1: "Chờ xác nhận",
        2: "Đơn đã được xác nhận và chờ vận chuyển",
        3: "Đơn của bạn đang được vận chuyển",
        4: "Đơn đã thanh toán",
        5: "Đã nhận hàng",
        6: "Đơn bị hủy hàng", // hủy hàng (phía admin)
        7: "Khách hủy hàng", // boom hàng
        8: "Đơn hàng bị lỗi do không hoàn tất thanh toán"
    };
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

    const getOrderNote = async (orderCode) => {
        try {
            const response = await fetch(`http://localhost:3001/order/getOrderNote/${orderCode}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer `,
                },
            });
            const result = await response.json();
            if (result.status === 200) {
                setOrderNote(result.data)
            }
        } catch (e) {
            console.log("Lỗi lấy ghi chú: ", e)
        }
    }

    const handleClickItemOrderUser = (order) => {
        setSelectedOrder(order);
        getOrderNote(order.orderCode)
    }
    const handleCloseModal = () => {
        setSelectedOrder(null);
    }
    const handleCancelOrder = (orderCode) => {
        const token = APP_LOCAL.getTokenStorage()
        dispatch({
            type: KEY_CONTEXT_USER.SHOW_MODAL,
            payload: {
                typeModal: 'NOTIFICATION_MODAL',
                contentModel: "Xác nhận hủy đơn hàng !!!",
                onClickConfirmModel: async () => {
                    try {
                        const response = await fetch(`http://localhost:3001/order/cancelOrderUser`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ orderCode }),
                        });
                        const result = await response.json();
                        if (result.status === 200) {
                            ToastApp.success("Hủy đơn hàng thành công !")
                            getAllOrder();
                            handleCloseModal();
                        } else {
                            ToastApp.warning(result.message)
                        }
                    } catch (e) {
                        console.log("Lỗi tạo đơn hàng: ", e)
                    }
                },
            },
        })
    }
    useEffect(() => {
        getAllOrder()
    }, [])
    const filteredOrders =
        selectedTab === "all"
            ? data
            : Array.isArray(selectedTab)
                ? data.filter((order) => selectedTab.includes(order.status))
                : data.filter((order) => order.status === selectedTab);
    const sortedOrders = filteredOrders.slice().sort((a, b) => {
        return new Date(b.updatedAt) - new Date(a.updatedAt)
    })
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
                        className={selectedTab === tab.status ? "active" : "inactive"}
                        onClick={() => setSelectedTab(tab.status)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="order-list">
                {sortedOrders.length > 0 ? (
                    sortedOrders.map((order) => (
                        <div key={order.id} className="order-item" onClick={() => handleClickItemOrderUser(order)}>
                            <h3>Mã đơn: {order.orderCode}</h3>
                            <p><strong>Địa chỉ nhận hàng:</strong> {order.address}</p>
                            <p><strong>Phương thức thanh toán:</strong> {order.paymentMethod}</p>
                            <p><strong>Ngày đặt hàng:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                            <p><strong>Trạng thái:</strong>  {statusLabels[order.status]}</p>
                            <p><strong>Tổng tiền:</strong> {formatter.format(order.totalPayment)}</p>
                        </div>
                    ))
                ) : (
                    <p>Không có đơn hàng nào.</p>
                )}
            </div>
            {selectedOrder && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Chi tiết đơn hàng</h2>
                        <p><strong>Mã đơn:</strong> {selectedOrder.orderCode}</p>
                        <p><strong>Địa chỉ nhận hàng:</strong> {selectedOrder.address}</p>
                        <p><strong>Phương thức thanh toán:</strong> {selectedOrder.paymentMethod}</p>
                        <p><strong>Ngày đặt hàng:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                        <p><strong>Trạng thái:</strong> {statusLabels[selectedOrder.status]}</p>
                        <p><strong>Tổng tiền:</strong> {formatter.format(selectedOrder.totalPayment)}</p>
                        {orderNote && selectedOrder.status === "6" ? (<div>
                            <p className="order-info"><strong>{orderNote.title}</strong> </p>
                            <p className="order-info"><strong>Lí do hủy:</strong> {orderNote.content}</p>
                        </div>) : null}

                        {orderNote && selectedOrder.status === "5" ? (
                            <div>
                                <div>
                                    <p className="order-info"><strong>{orderNote.title}</strong> </p>
                                    <p className="order-info"><strong>Nội dung:</strong> {orderNote.content}</p>
                                </div>
                                <div className="image_orderUser">
                                    <span>Ảnh nhận hàng</span>
                                    <img src={orderNote.image} alt='' />
                                </div>
                            </div>
                        ) : null}

                        <div className="order-details">
                            {selectedOrder.orderDetails.map((detail, index) => (
                                <div key={index} className="product-item">
                                    <img src={detail.image} alt={detail.nameProduct} />
                                    <div>
                                        <strong>Mã đơn sản phẩm: {detail.orderCode}</strong>
                                        <p><strong>{detail.nameProduct}</strong></p>
                                        <p>Size: {detail.size}</p>
                                        <p>Số lượng: {detail.quantity}</p>
                                        <p>Giá: {formatter.format(detail.price)}</p>
                                        <p>Màu: {detail.color}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {selectedOrder.status === "1" || selectedOrder.status === "2 " ? (<button onClick={() => handleCancelOrder(selectedOrder.orderCode)}>Hủy hàng</button>) : null}

                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderUser;
