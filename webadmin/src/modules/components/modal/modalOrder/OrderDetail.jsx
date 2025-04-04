import { useContext, useEffect, useState } from 'react';
import './OrderDetail.scss'
import APP_LOCAL from '../../../../lib/localStorage';
import UserContext from '../../../../context/use.context';
import { KEY_CONTEXT_USER } from '../../../../context/use.reducer';
import ToastApp from '../../../../lib/notification/Toast';

const OrderDetail = ({ order, onClose }) => {
    const [data] = useState(order.orderDetails);
    const [orderNote, setOrderNote] = useState(null)
    const [userCtx, dispatch] = useContext(UserContext)
    const statusLabels = {
        0: "Chưa thanh toán",
        1: "Chờ xác nhận",
        2: "Đơn đã được xác nhận và chờ vận chuyển",
        3: "Đơn của đang được vận chuyển",
        4: "Đơn đã thanh toán",
        5: "Đã nhận hàng",
        6: "Đơn bị hủy hàng", // hủy hàng (phía admin)
        7: "Khách hủy hàng", // boom hàng
        8: "Đơn hàng bị lỗi do không hoàn tất thanh toán"
    };
    const getOrderNote = async () => {
        try {
            const response = await fetch(`http://localhost:3001/order/getOrderNote/${order.orderCode}`, {
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
    const handleVerifyOrder = (orderCode) => {
        const token = APP_LOCAL.getTokenStorage()
        dispatch({
            type: KEY_CONTEXT_USER.SHOW_MODAL,
            payload: {
                typeModal: 'NOTIFICATION_MODAL',
                contentModel: "Xác nhận đơn hàng !!!",
                onClickConfirmModel: async () => {
                    try {
                        const response = await fetch(`http://localhost:3001/order/verifyOrder/${orderCode}`, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                        });
                        const result = await response.json();
                        if (result.status === 200) {
                            ToastApp.success("Xác nhận đơn hàng thành công !")
                            onClose()
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
    const handleDeliveryOrder = (orderCode) => {
        const token = APP_LOCAL.getTokenStorage()
        dispatch({
            type: KEY_CONTEXT_USER.SHOW_MODAL,
            payload: {
                typeModal: 'NOTIFICATION_MODAL',
                contentModel: "Xác nhận giao hàng đơn hàng !!!",
                onClickConfirmModel: async () => {
                    try {
                        const response = await fetch(`http://localhost:3001/order/deliveryOrder`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ orderCode }),
                        });
                        const result = await response.json();
                        if (result.status === 200) {
                            ToastApp.success("Xác nhận vận chuyển đơn hàng thành công !")
                            onClose()
                        } else {
                            ToastApp.warning(result.message)
                        }
                    } catch (e) {
                        console.log("Lỗi vận chuyển đơn hàng: ", e)
                    }
                },
            },
        })
    }
    const handleConfirmOrder = (orderCode) => {
        dispatch({
            type: KEY_CONTEXT_USER.SHOW_MODAL,
            payload: {
                typeModal: "CONFIRM_ORDER",
                dataModal: orderCode,
                onClickConfirmModel: async (title, content, fileImage) => {
                    const token = APP_LOCAL.getTokenStorage();
                    if (!title) return ToastApp.warning("Thiếu tiêu đề !")
                    if (!content) return ToastApp.warning("Thiếu nội dung !")
                    if (!fileImage) return ToastApp.warning("Thiếu ảnh nhận hàng !")
                    const formData = new FormData();
                    formData.append("title", title);
                    formData.append("content", content);
                    formData.append("orderCode", orderCode);
                    formData.append("image", fileImage);
                    try {
                        const response = await fetch(`http://localhost:3001/order/confirmOrderByAdmin`, {
                            method: "POST",
                            headers: {
                                "Authorization": `Bearer ${token}`,
                            },
                            body: formData
                        });
                        const result = await response.json();
                        if (result.status === 200) {
                            ToastApp.success("Xác nhận đã giao đơn hàng thành công!");
                            onClose()
                            dispatch({ type: KEY_CONTEXT_USER.HIDE_MODAL });

                        }
                    } catch (e) {
                        console.log("Lỗi nhận đơn hàng: ", e)
                    }
                }
            }
        })
    }
    const handleCancelOrder = (orderCode) => {
        dispatch({
            type: KEY_CONTEXT_USER.SHOW_MODAL,
            payload: {
                typeModal: "CANCEL_ORDER",
                dataModal: orderCode,
                onClickConfirmModel: async (title, content) => {
                    const token = APP_LOCAL.getTokenStorage();
                    if (!title) return ToastApp.warning("Thiếu tiêu đề !")
                    if (!content) return ToastApp.warning("Thiếu nội dung !")
                    try {
                        const response = await fetch(`http://localhost:3001/order/cancelOrderAdmin`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`,
                            },
                            body: JSON.stringify({ title, content, orderCode }),
                        });
                        const result = await response.json();
                        if (result.status === 200) {
                            ToastApp.success("Hủy đơn hàng thành công!");
                            dispatch({ type: KEY_CONTEXT_USER.HIDE_MODAL });
                            onClose()
                        }
                    } catch (e) {
                        console.log("Lỗi hủy đơn hàng: ", e)
                    }
                }
            }
        })
    }
    useEffect(() => {
        getOrderNote()
    }, [data])

    const formatter = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    });
    const updatedAtDate = new Date(order.updatedAt);
    const formattedUpdatedAt = `${updatedAtDate.getUTCDate() < 10 ? '0' + updatedAtDate.getUTCDate() :
        updatedAtDate.getUTCDate()}-${updatedAtDate.getUTCMonth() + 1 < 10 ? '0' + (updatedAtDate.getUTCMonth() + 1) :
            updatedAtDate.getUTCMonth() + 1}-${updatedAtDate.getUTCFullYear()}`;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2>Chi tiết đơn hàng</h2>
                {data ? (
                    <>
                        <div className="modal1-content">
                            <div className='left-content'>
                                {data.map((item, index) => (
                                    <div key={index} className="item-container">
                                        <img src={item.image} alt='' />
                                        <div className="info">
                                            <p><strong>Mã đơn sản phẩm:  {item.orderDetailCode}</strong></p>
                                            <p><strong>{item.nameProduct}</strong></p>
                                            <div className="flex">
                                                <p>Size:<strong> {item.size}</strong></p>
                                                <p>Màu:<strong> {item.color}</strong></p>
                                                <p>x<strong>{item.quantity}</strong></p>
                                            </div>

                                            <p>Giá<strong> {formatter.format(item.price)}</strong></p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className='right-content'>
                                <p className="order-info"><strong>Mã đơn hàng:</strong> {order.orderCode}</p>
                                <p className="order-info"><strong>Mã người dùng:</strong> {order.customerCode}</p>
                                <p className="order-info"><strong>Tên:</strong> {order.userName}</p>
                                <p className="order-info"><strong>Số điện thoại:</strong> {order.phoneNumber}</p>
                                <p className="order-info"><strong>Địa chỉ nhận hàng:</strong> {order.address}</p>
                                <p className="order-info"><strong>Thời gian:</strong> {formattedUpdatedAt}</p>
                                <p className="order-info"><strong>Trạng thái:</strong> {statusLabels[order.status]}</p>
                                <hr className="order-divider" />
                                {orderNote && order.status === "6" ? (
                                    <div>
                                        <p className="order-info"><strong>{orderNote.title}</strong> </p>
                                        <p className="order-info"><strong>Lí do hủy:</strong> {orderNote.content}</p>
                                    </div>
                                ) : null}
                                {orderNote && order.status === "5" ? (
                                    <div className='flex'>
                                        <div>
                                            <p className="order-info"><strong>{orderNote.title}</strong> </p>
                                            <p className="order-info"><strong>Nội dung:</strong> {orderNote.content}</p>
                                        </div>
                                        <div>
                                            <img src={orderNote.image} alt='' />
                                        </div>
                                    </div>
                                ) : null}
                            </div>

                        </div>
                        <div className="footer">
                            <p className="order-info1"><strong>Tổng tiền:</strong> {formatter.format(order.totalPayment)}</p>
                            {order.status === "1" ? (<button className='btn-btn' onClick={() => handleVerifyOrder(order.orderCode)}>Xác nhận đơn hàng</button>) : null}
                            {order.status === "2" ? (<button className='btn-btn' onClick={() => handleDeliveryOrder(order.orderCode)}>Giao hàng</button>) : null}
                            {order.status === "1" || order.status === "2" ? (<button className='btn-btn' onClick={() => handleCancelOrder(order.orderCode)}>Hủy hàng</button>) : null}
                            {order.status === "3" ? (<button className='btn-btn' onClick={() => handleConfirmOrder(order.orderCode)}>Xác nhận hàng</button>) : null}
                        </div>
                    </>
                ) : (
                    <div>Đang tải</div>
                )}
            </div>
        </div>
    )
}
export default OrderDetail