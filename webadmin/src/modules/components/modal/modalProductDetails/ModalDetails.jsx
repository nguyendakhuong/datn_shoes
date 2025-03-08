import { useEffect, useRef, useState } from "react";
import ToastApp from "../../../../lib/notification/Toast";
import './ModalDetails.scss'

const ModalDetails = ({ id, onClose, isOpen }) => {
    const [data, setData] = useState(null);
    const dialogRef = useRef();

    const getProduct = async () => {
        try {
            const response = await fetch(`http://localhost:3001/product/getProduct/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer`
                }
            });
            const data = await response.json();
            if (data.status === 200) {
                setData(data.data);
            } else {
                onClose();
                ToastApp.warning(data.message);
            }
        } catch (e) {
            ToastApp.error("Error: " + e);
            console.log(e)
        }
    };
    const handleClickOutside = (event) => {
        if (dialogRef.current && !dialogRef.current.contains(event.target)) {
            onClose();
        }
    };
    useEffect(() => {
        if (isOpen) {
            getProduct();
        }
    }, [isOpen]);

    const formatter = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    });

    return (
        isOpen && (
            <div className="dialog-overlay" onClick={handleClickOutside}>
                <div className="dialog" ref={dialogRef}>
                    <h2>Thông tin chi tiết sản phẩm</h2>
                    {data && data.id === id ? (
                        <div>
                            <div className="dialog-content">
                                <div className="image-container">
                                    <img src={data.idImage} alt={data.productName} className="product-image" />
                                </div>
                                <div className="info-container">
                                    <p><strong>Mã sản phẩm:</strong> {data.productDetailCode}</p>
                                    <p><strong>Tên sản phẩm:</strong> {data.productName}</p>
                                    <p><strong>Số lượng:</strong> {data.quantity}</p>
                                    <p><strong>Giá bán:</strong> {formatter.format(data.price)}</p>
                                    <p><strong>Mô tả:</strong> {data.description}</p>
                                    <p><strong>Mã màu:</strong> {data.idColor}</p>
                                    <p><strong>Size:</strong> {data.idSize}</p>
                                    <p><strong>Chất liệu:</strong> {data.materialName}</p>
                                    <p><strong>Thương hiệu:</strong> {data.trademarkName}</p>
                                    <p><strong>Nơi sản Xuất:</strong> {data.originName}</p>
                                    <p><strong>Người tạo:</strong> {data.creator}</p>
                                    <p><strong>Người chỉnh sửa:</strong> {data.updater}</p>
                                    <p><strong>Trạng thái: </strong> {data.status === 1 ? "Đang hoạt động" : "Không hoạt động"}</p>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        )
    )

}
export default ModalDetails;