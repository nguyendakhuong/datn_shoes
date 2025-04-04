import { useContext, useEffect, useState } from 'react';
import InputAdmin from '../../input/Input-admin';
import './ModalPayment.scss'
import ButtonWed from '../../button/Button-admin';
import APP_LOCAL from '../../../../lib/localStorage';
import ToastApp from '../../../../lib/notification/Toast';
import Select from "react-select";
import UserContext from '../../../../context/use.context';
import { KEY_CONTEXT_USER } from '../../../../context/use.reducer';
import { useNavigate } from 'react-router-dom';

const ModalPayment = ({ data, total, isOpen, onClose }) => {
    const [userCtx, dispatch] = useContext(UserContext)
    const [discount, setDiscount] = useState("")
    const [discountAPI, setDiscountAPI] = useState()
    const [totalAfterDiscount, setTotalAfterDiscount] = useState(0)
    const [discountAmount, setDiscountAmount] = useState(0)
    const [type, setType] = useState(1);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [dataAddress, setDataAddress] = useState([]);
    const [dataUser, setDataUser] = useState(null);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [dataOrder, setDataOrder] = useState(null);
    const navigate = useNavigate()

    const handleDiscount = async () => {
        if (!discount) {
            return ToastApp.warning("Vui lòng nhập mã giảm giá!")
        }
        const token = APP_LOCAL.getTokenStorage()
        try {
            const response = await fetch('http://localhost:3001/discount/useDiscount', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ discount, total })
            });
            const result = await response.json();
            if (result.status === 200) {
                ToastApp.success("Sử dụng phiếu giảm giá thành công")
                setDiscountAPI(result.discount)
                setTotalAfterDiscount(result.data)
                setDiscountAmount(result.totalPromotion)
                setDiscount("")
            } else {
                ToastApp.warning(result.message);
            }
        } catch (e) {
            console.log("Lỗi sử dụng mã giảm giá: ", e)
        }
    }
    const handleChangeRadio = (e) => {
        setType(parseInt(e.target.value));
    }
    const handlePayment = async () => {
        if (!dataUser.name || !dataUser.phoneNumber) {
            return ToastApp.warning("Vui lòng thêm thông tin cá nhân")
        }
        if (!selectedAddress) {
            return ToastApp.warning("Vui lòng chọn địa chỉ")
        }
        const token = APP_LOCAL.getTokenStorage()
        dispatch({
            type: KEY_CONTEXT_USER.SHOW_MODAL,
            payload: {
                typeModal: 'NOTIFICATION_MODAL',
                contentModel: "Xác nhận thanh toán hóa đơn !!!",
                onClickConfirmModel: async () => {
                    try {
                        if (type === 1) {
                            const body = {
                                userName: dataUser.name,
                                phoneNumber: dataUser.phoneNumber,
                                address: selectedAddress,
                                totalDefault: total,
                                totalPromotion: discountAmount || 0,
                                totalPayment: totalAfterDiscount > 0 ? totalAfterDiscount : total,
                                discount: discountAPI?.name || "",
                                product: data,
                            };
                            const response = await fetch(`http://localhost:3001/order/createOrder`, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(body),
                            });
                            const result = await response.json();
                            if (result.status === 200) {
                                ToastApp.success(result.message)
                                const id = data.map(v => v.productDetailCode);
                                const newCart = userCtx.cart.filter(c => !id.includes(c.id));
                                dispatch({
                                    type: KEY_CONTEXT_USER.SET_CART,
                                    payload: newCart,
                                })
                                onClose()
                                setOrderSuccess(true);
                            } else {
                                ToastApp.warning(result.message)
                            }
                        }
                        if (type === 2) {
                            const body = {
                                address: selectedAddress,
                                totalDefault: total,
                                totalPromotion: discountAmount || 0,
                                totalPayment: totalAfterDiscount > 0 ? totalAfterDiscount : total,
                                discount: discountAPI?.name || "",
                                product: data,
                            };
                            const response = await fetch(`http://localhost:3001/payment/createOrderPayment`, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(body),
                            });
                            const result = await response.json();
                            if (result.status === 200) {
                                ToastApp.success(result.message)
                                const id = data.map(v => v.productDetailCode);
                                const newCart = userCtx.cart.filter(c => !id.includes(c.id));
                                dispatch({
                                    type: KEY_CONTEXT_USER.SET_CART,
                                    payload: newCart,
                                })
                                onClose()
                                // setOrderSuccess(true);
                                setDataOrder(result.data)
                            } else {
                                ToastApp.warning(result.message)
                            }
                        }
                    } catch (e) {
                        console.log("Lỗi tạo đơn hàng: ", e)
                    }
                },
            },
        })
    }
    const getAddress = async () => {
        const token = APP_LOCAL.getTokenStorage()
        try {
            const response = await fetch(`http://localhost:3001/address`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            const data = await response.json()

            if (data.status === 200) {
                setDataAddress(data.data)
            }
        } catch (e) {
            console.log("Lỗi lấy thông tin người dùng: ", e)
        }
    }
    const getUser = async () => {
        const token = APP_LOCAL.getTokenStorage()
        try {
            const response = await fetch(`http://localhost:3001/user`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            const data = await response.json()
            if (data.status === 200) {
                setDataUser(data.data)
            }
        } catch (e) {
            console.log("Lỗi lấy thông tin người dùng: ", e)
        }
    }
    const createVnpPayment = async (orderCode, totalPayment, bankCode = "") => {
        try {
            dispatch({ type: KEY_CONTEXT_USER.SET_LOADING, payload: true })
            const response = await fetch(`http://localhost:3001/payment/createPayment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    orderId: orderCode,
                    amount: totalPayment,
                    bankCode: bankCode,
                }),
            });
            const result = await response.json();
            if (result.status === 200) {
                window.location.href = result.data;
            } else {
                console.log("Lỗi VNP: ", result.message)
            }
        } catch (error) {
            console.log("Lỗi khi thanh toán:", error);
        } finally {
            dispatch({ type: KEY_CONTEXT_USER.SET_LOADING, payload: false })
        }
    };
    useEffect(() => {
        getAddress()
        getUser()
    }, [])
    useEffect(() => {
        if (orderSuccess) {
            navigate("/home");
        }
    }, [orderSuccess]);

    useEffect(() => {
        if (dataOrder) {
            createVnpPayment(dataOrder.orderCode, dataOrder.totalPayment)
        }
    }, [dataOrder])

    const formatter = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    });
    const options = dataAddress.map((item) => ({
        value: item.id,
        label: `${item.address} - ${item.commune} - ${item.district} - ${item.province}`,
    }));
    return (
        <>
            {isOpen && (
                <div className='modal-pay' onClick={onClose}>
                    <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                        <div className='item-order-payment'>
                            <h3>Chi tiết hóa đơn</h3>
                            {data.map((v, i) => (
                                <div key={i} >
                                    <div className='item'>
                                        <div className='item-image'>
                                            <img src={v.image} alt={v.name} />
                                        </div>
                                        <div>
                                            <h4>Tên: {v.name}</h4>
                                            <p>Màu : {v.colorName}</p>
                                            <p>Giá : {formatter.format(v.price)}</p>
                                            <p>Số lượng : {v.quantity}</p>
                                        </div>
                                    </div>
                                    <hr />
                                </div>
                            ))}
                        </div>

                        <div>
                            <div className='form-discount'>
                                <InputAdmin
                                    label={"Mã giảm giá"}
                                    name={"discount"}
                                    type={"text"}
                                    value={discount}
                                    onChange={(e) => setDiscount(e.target.value)}
                                    placeholder={"Nhập mã giảm giá"}
                                />
                                <div>
                                    <ButtonWed title={"Áp dụng"} onClick={handleDiscount} />
                                </div>
                            </div>
                            <div>
                                {discountAPI ? (
                                    <div className='flex'>
                                        <span>Mã giảm giá : {discountAPI.name}</span>
                                        <span>Hình thức: {discountAPI.promotionType === 1 ? "Giảm tiền" : "Giảm theo %"}</span>
                                        <span>Mô tải: {discountAPI.conditionsOfApplication}</span>
                                        <span>
                                            Hạn mức tối đa: {discountAPI.maximumPromotion ? `${formatter.format(discountAPI.maximumPromotion)}` : "0đ"}
                                        </span>

                                        <span>Mức giảm giá: {discountAPI.promotionLevel > 100 ? `${formatter.format(discountAPI.promotionLevel)}` : discountAPI.promotionLevel + "%"}</span>
                                    </div>
                                ) : null}
                                <div className='flex'>
                                    <span>Số tiền ban đầu: {formatter.format(total)}</span>
                                    <span>Số tiền sau giảm giá:   {totalAfterDiscount > 0 ? formatter.format(totalAfterDiscount) : formatter.format(total)}</span>
                                </div>
                            </div>
                            <div className="type-input">
                                <label>
                                    <span>Hình thức thanh toán:</span>
                                    <input
                                        type="radio"
                                        name="type"
                                        value={1}
                                        checked={type === 1}
                                        onChange={handleChangeRadio}
                                    />
                                    <span></span> COD
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="type"
                                        value={2}
                                        checked={type === 2}
                                        onChange={handleChangeRadio}
                                    />
                                    <span></span> VNP
                                </label>
                            </div>
                            <div className='select-address'>
                                <h4>Chọn địa chỉ:</h4>
                                <Select
                                    options={options}
                                    value={options.find((option) => option.value === selectedAddress)}
                                    onChange={(selected) => setSelectedAddress(selected.label)}
                                    placeholder="Chọn địa chỉ..."
                                />
                            </div>
                            <div className='info-user'>
                                <span>Tên người tạo đơn hàng: {dataUser.name}</span>
                                <span>Số điện thoại: {dataUser.phoneNumber}</span>
                                <span>Email: {dataUser.email}</span>
                            </div>
                            <div className='flex-total'>
                                <span>Số tiền bạn cần thành toán: </span>
                                <p>{totalAfterDiscount > 0 ? formatter.format(totalAfterDiscount) : formatter.format(total)}</p>
                            </div>
                            <div className='btn-payment'>
                                <ButtonWed title={"Thanh toán hóa đơn"} onClick={handlePayment} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>

    )
}
export default ModalPayment