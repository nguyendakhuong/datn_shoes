import { useState } from 'react';
import './OrderDetail.scss'

const OrderDetail = ({ order, onClose }) => {
    const [data] = useState(order.orderDetails);
    console.log(order)
    const statusLabels = {
        1: "Chờ xác nhận vận chuyển",
        2: "Đang giao",
        3: "Đã nhận hàng",
        4: "Hủy hàng",
        5: "Khách hủy hàng",
    };
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
                            </div>

                        </div>
                        <div className="footer">
                            <p className="order-info1"><strong>Tổng tiền:</strong> {formatter.format(order.totalPayment)}</p>
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