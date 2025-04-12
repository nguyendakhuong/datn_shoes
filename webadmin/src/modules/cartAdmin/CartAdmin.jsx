import { useContext, useEffect, useState } from 'react'
import './CartAdmin.scss'
import APP_LOCAL from '../../lib/localStorage'
import UserContext from '../../context/use.context'
import { useNavigate } from 'react-router-dom'
import ButtonWed from '../components/button/Button-admin'
import AppImages from '../../assets'
import ToastApp from '../../lib/notification/Toast'
import { KEY_CONTEXT_USER } from '../../context/use.reducer'
import InputAdmin from '../components/input/Input-admin'
import { ParseValid } from '../../lib/validate/ParseValid'
import { Validate } from '../../lib/validate/Validate'

const CartAdmin = () => {
    const [{ cartAdmin }, dispatch] = useContext(UserContext)
    const [data, setData] = useState([])
    const [dataProductActive, setDataProductActive] = useState([])
    const [dataOrderDetail, setDataOrderDetail] = useState([])
    const [total, setTotal] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [name, setName] = useState("");
    const [discount, setDiscount] = useState("");
    const [discountAPI, setDiscountAPI] = useState(null)
    const [totalAfterDiscount, setTotalAfterDiscount] = useState(0)
    const [discountAmount, setDiscountAmount] = useState(0)
    const [selectedOrderCode, setSelectedOrderCode] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [listError, setListError] = useState({
        name: "",
        phoneNumber: "",
    })
    const handleInput = (e) => {
        const { name, value } = e.target;
        const inputValue = value.trim();
        if (name === 'name') {
            setName(inputValue);
        }
        if (name === 'phoneNumber') {
            setPhoneNumber(inputValue);
        }
        const valid = e.target.getAttribute('validate');
        const validObject = ParseValid(valid);
        const error = Validate(
            name,
            inputValue,
            validObject,
            data.startDate,
            data.endDate,
        );
        const newListError = { ...listError, [name]: error };
        setListError(newListError);
    }
    const getProductActive = async () => {
        try {
            const response = await fetch(`http://localhost:3001/product/productActive`, {
                headers: {
                    Authorization: `Bearer`,
                    "Content-Type": "application/json"
                },
            });
            const data = await response.json();
            if (data.status === 200) {
                setDataProductActive(data.data)
            }
        } catch (e) {
            console.log("Lỗi lấy thông tin giỏ hàng : ", e)
        }
    }
    const getOrderByAdmin = async () => {
        try {
            const response = await fetch(`http://localhost:3001/order/getOrderAdmin`, {
                headers: {
                    Authorization: `Bearer`,
                    "Content-Type": "application/json"
                },
            });
            const data = await response.json();
            if (data.status === 200) {
                setData(data.data)
            } else {
                setData([])
            }
        } catch (e) {
            console.log("Lỗi lấy thông tin hóa đơn : ", e)
        }
    }
    const getOrderAdminByCode = async () => {
        try {
            const response = await fetch(`http://localhost:3001/order/getOrderAdminByCode/${selectedOrderCode}`, {
                headers: {
                    Authorization: `Bearer`,
                },
            });
            const data = await response.json();
            if (data.status === 200) {
                setDataOrderDetail(data.data)
            } else {
                setData([])
            }
        } catch (e) {
            console.log("Lỗi lấy thông tin hóa đơn : ", e)
        }
    }

    const handlePay = () => {
        if (!name || !phoneNumber) {
            return ToastApp.warning("Vui lòng thêm thông tin cá nhân")
        }
        let newErrors = { ...listError };
        for (let key in newErrors) {
            if (newErrors[key]) {
                ToastApp.warning("Vui lòng nhập đúng dữ liệu!");
                return;
            }
        }
        dispatch({
            type: KEY_CONTEXT_USER.SHOW_MODAL,
            payload: {
                typeModal: 'NOTIFICATION_MODAL',
                contentModel: "Xác nhận thanh toán đơn hàng !!!",
                onClickConfirmModel: async () => {
                    try {
                        const response = await fetch(`http://localhost:3001/order/payOrderAdmin/${selectedOrderCode}`, {
                            method: "POST",
                            headers: {
                                Authorization: `Bearer `,
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                name,
                                phoneNumber,
                                discountCode: discountAPI?.name || "",
                                totalDefault: total,
                                totalPromotion: discountAmount || 0,
                                totalPayment: totalAfterDiscount > 0 ? totalAfterDiscount : total,
                            })
                        });
                        const result = await response.json();
                        if (result.status === 200) {
                            ToastApp.success("Thành công !")
                            dispatch({ type: KEY_CONTEXT_USER.HIDE_MODAL, payload: true })
                            window.location.reload();
                        } else {
                            ToastApp.warning(result.message)
                        }
                    } catch (e) {
                        console.log("Lỗi xóa hóa đơn: ", e)
                    }
                },
            },
        })
    }
    const handleDiscount = async () => {
        if (!discount) {
            return ToastApp.warning("Vui lòng nhập mã giảm giá!")
        }
        if (!phoneNumber) {
            return ToastApp.warning("Vui lòng nhập số điện thoại")
        }
        if (!name) {
            return ToastApp.warning("Vui lòng nhập họ và tên")
        }
        let newErrors = { ...listError };
        for (let key in newErrors) {
            if (newErrors[key]) {
                ToastApp.warning("Vui lòng nhập đúng dữ liệu!");
                return;
            }
        }
        try {
            const response = await fetch('http://localhost:3001/discount/useDiscountAdmin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer `
                },
                body: JSON.stringify({ discount, total, phoneNumber })
            });
            const result = await response.json();
            if (result.status === 200) {
                ToastApp.success("Sử dụng phiếu khuyến mại thành công")
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
    const handleAddOrder = () => {
        dispatch({
            type: KEY_CONTEXT_USER.SHOW_MODAL,
            payload: {
                typeModal: "NOTIFICATION_MODAL",
                contentModel: "Bạn xác nhận tạo hóa đơn !",
                onClickConfirmModel: async () => {
                    const token = APP_LOCAL.getTokenStorage()
                    try {
                        const response = await fetch(`http://localhost:3001/order/createOrderAdmin`, {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json"
                            },
                        });
                        const result = await response.json();
                        if (result.status === 200) {
                            ToastApp.success("Tạo hóa đơn thành công !")
                            dispatch({ type: KEY_CONTEXT_USER.HIDE_MODAL, payload: true })
                            getOrderByAdmin()
                        } else {
                            ToastApp.warning(result.message)
                        }
                    } catch (e) {
                        console.log("Lỗi tạo hóa đơn: ", e)
                    }
                }
            }
        })
    }
    const handleAddProductToOrder = (product) => {
        if (!selectedOrderCode) {
            return ToastApp.warning("Vui lòng chọn một hóa đơn !")
        }
        dispatch({
            type: KEY_CONTEXT_USER.SHOW_MODAL,
            payload: {
                typeModal: "NOTIFICATION_MODAL",
                contentModel: "Bạn xác nhận chọn sản phẩm " + product.productDetailCode + " vào hóa đơn mã " + selectedOrderCode,
                onClickConfirmModel: async () => {
                    try {
                        const response = await fetch(`http://localhost:3001/order/addProductToOrderAdmin/${selectedOrderCode}`, {
                            method: "POST",
                            headers: {
                                Authorization: `Bearer `,
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(product)
                        });
                        const result = await response.json();
                        if (result.status === 200) {
                            ToastApp.success("Thêm sản phẩm thành công !")
                            dispatch({ type: KEY_CONTEXT_USER.HIDE_MODAL, payload: true })
                            getOrderAdminByCode()
                        } else {
                            ToastApp.warning(result.message)
                        }
                    } catch (e) {
                        console.log("Lỗi tạo hóa đơn: ", e)
                    }
                }
            }
        })
    }
    const handleDeleteOrderAdmin = (orderCode) => {
        dispatch({
            type: KEY_CONTEXT_USER.SHOW_MODAL,
            payload: {
                typeModal: "NOTIFICATION_MODAL",
                contentModel: "Bạn xác nhận xóa hóa đơn " + orderCode + " này không !",
                onClickConfirmModel: async () => {
                    const token = APP_LOCAL.getTokenStorage()
                    try {
                        const response = await fetch(`http://localhost:3001/order/deleteOrderAdminByCode/${orderCode}`, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json"
                            },
                        });
                        const result = await response.json();
                        if (result.status === 200) {
                            ToastApp.success("Xóa hóa đơn thành công !")
                            dispatch({ type: KEY_CONTEXT_USER.HIDE_MODAL, payload: true })
                            getOrderByAdmin()
                        } else {
                            ToastApp.warning(result.message)
                        }
                    } catch (e) {
                        console.log("Lỗi xóa hóa đơn: ", e)
                    }
                }
            }
        })
    }
    const handleDeleteOrderDetail = (orderDetailCode) => {
        dispatch({
            type: KEY_CONTEXT_USER.SHOW_MODAL,
            payload: {
                typeModal: "NOTIFICATION_MODAL",
                contentModel: "Bạn xác nhận xóa sản phẩm này không !",
                onClickConfirmModel: async () => {
                    const token = APP_LOCAL.getTokenStorage()
                    try {
                        const response = await fetch(`http://localhost:3001/order/deleteOrderDetail/${orderDetailCode}`, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json"
                            },
                        });
                        const result = await response.json();
                        if (result.status === 200) {
                            ToastApp.success("Xóa hóa đơn thành công !")
                            dispatch({ type: KEY_CONTEXT_USER.HIDE_MODAL, payload: true })
                            getOrderAdminByCode()
                        } else {
                            ToastApp.warning(result.message)
                        }
                    } catch (e) {
                        console.log("Lỗi xóa hóa đơn: ", e)
                    }
                }
            }
        })
    }
    const handleUpdateQuantityProduct = (orderDetailCode) => {
        dispatch({
            type: KEY_CONTEXT_USER.SHOW_MODAL,
            payload: {
                typeModal: "EDIT_ORDER_PRODUCT",
                titleModel: "Cập nhật số lượng !",
                onClickConfirmModel: async (quantity, listError) => {
                    const parsedQuantity = Number(quantity);
                    if (listError.quantity) {
                        return ToastApp.warning("Vui lòng sửa các lỗi trước khi tiếp tục");
                    }
                    if (parsedQuantity <= 0) {
                        return ToastApp.warning("Số lượng phải lớn hơn 0")
                    }
                    try {
                        const response = await fetch(`http://localhost:3001/order/updateQuantityOrderDetail/${orderDetailCode}`, {
                            method: "POST",
                            headers: {
                                Authorization: `Bearer `,
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({ quantity: parsedQuantity })
                        });
                        const result = await response.json();
                        if (result.status === 200) {
                            ToastApp.success("Thành công !")
                            dispatch({ type: KEY_CONTEXT_USER.HIDE_MODAL, payload: true })
                            getOrderAdminByCode()
                        } else {
                            ToastApp.warning(result.message)
                        }
                    } catch (e) {
                        console.log("Lỗi xóa hóa đơn: ", e)
                    }
                }
            }
        })
    }

    useEffect(() => {
        getOrderByAdmin()
        getProductActive()
    }, [])

    useEffect(() => {
        if (selectedOrderCode) getOrderAdminByCode()
    }, [selectedOrderCode])

    useEffect(() => {
        const totalAmount = dataOrderDetail.reduce((sum, item) => {
            return sum + item.price * item.quantity;
        }, 0);
        setTotal(totalAmount);
    }, [dataOrderDetail]);

    const formatter = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    });
    const filteredProducts = dataProductActive.filter(product =>
        String(product.productDetailCode).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className='cartAdmin-container'>
            <div className='cart'>
                <div className='cartAdmin-header'>
                    <h1>Hóa đơn tại quầy</h1>
                    <button onClick={handleAddOrder}>Thêm hóa đơn</button>
                </div>
                <div className="table-wrapper">
                    <h3>Danh sách đơn hàng</h3>
                    <div className="table-scroll">
                        <table className="cartAdmin-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Mã hóa đơn</th>
                                    <th>Tên nhân viên</th>
                                    <th>Hình thức thanh toán</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày tạo</th>
                                    <th>Xóa</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length > 0 ? (
                                    data.map((order, index) => (
                                        <tr key={index} onClick={() => setSelectedOrderCode(order.orderCode)} className='orderAdmin'>
                                            <td>
                                                <input
                                                    type="radio"
                                                    name="orderRadio"
                                                    value={order.orderCode}
                                                    checked={selectedOrderCode === order.orderCode}
                                                    onChange={() => setSelectedOrderCode(order.orderCode)}
                                                />
                                            </td>
                                            <td>{order.orderCode}</td>
                                            <td>{order.creator}</td>
                                            <td>{order.paymentMethod}</td>
                                            <td>{order.status === "0" && "Chưa thanh toán"}</td>
                                            <td>{new Date(order.updatedAt).toLocaleDateString("vi-VN")}</td>
                                            <td>
                                                <img className='image' src={AppImages.deleteIcon} alt='' onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteOrderAdmin(order.orderCode);
                                                }} />
                                            </td>
                                        </tr>

                                    ))
                                )
                                    : (
                                        <tr>
                                            <td colSpan={7} style={{ textAlign: 'center' }}>Chưa có hóa đơn nào !</td>
                                        </tr>
                                    )

                                }
                            </tbody>
                        </table>
                    </div>
                </div>
                <div>
                    <h3>Giỏ hàng hóa đơn {selectedOrderCode}</h3>
                    <table className="discount-table">
                        <thead>
                            <tr>
                                <th>Mã sản phẩm</th>
                                <th>Tên sản phẩm</th>
                                <th>Màu</th>
                                <th>Kích thước</th>
                                <th>Số lượng</th>
                                <th>Giá</th>
                                <th>Thành tiền</th>
                                <th>Xóa</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataOrderDetail.length > 0 ? (
                                dataOrderDetail.map((product, index) => (
                                    <tr key={index} className='orderAdmin' onClick={() => handleUpdateQuantityProduct(product.orderDetailCode)}>
                                        <td>{product.productDetailCode}</td>
                                        <td>{product.nameProduct}</td>
                                        <td>{product.color}</td>
                                        <td>{product.size}</td>
                                        <td>{product.quantity}</td>
                                        <td>{formatter.format(product.price)}</td>
                                        <td>{formatter.format(product.price * product.quantity)}</td>
                                        <td>
                                            <img className='image' src={AppImages.deleteIcon} alt='' onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteOrderDetail(product.orderDetailCode);
                                            }} />
                                        </td>
                                    </tr>

                                ))
                            )
                                : null}
                        </tbody>
                    </table>
                </div>

                <div className="table-wrapper">
                    <div className='cartAdmin-header'>
                        <h3>Danh sách sản phẩm hoạt động</h3>
                        <input
                            type="text"
                            placeholder="Tìm theo mã sản phẩm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ marginBottom: 10, padding: 5, width: '30%' }}
                        />
                    </div>
                    <table className="product-table">
                        <thead>
                            <tr>
                                <th>Mã sản phẩm</th>
                                <th>Tên sản phẩm</th>
                                <th>Màu</th>
                                <th>Kích thước</th>
                                <th>Giá</th>
                                <th>Số lượng</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                    </table>

                    <div className="product-table-scroll">
                        <table className="product-table">
                            <tbody>
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((product, index) => (
                                        <tr
                                            key={index}
                                            onClick={() => handleAddProductToOrder(product)}
                                            className="product-row"
                                        >
                                            <td>{product.productDetailCode}</td>
                                            <td>{product.productName}</td>
                                            <td>{product.colorName}</td>
                                            <td>{product.sizeName}</td>
                                            <td>{formatter.format(product.price)}</td>
                                            <td>{product.quantity}</td>
                                            <td>{product.status === 1 ? "Hoạt động" : "Lỗi"}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: "center" }}>
                                            Không có sản phẩm nào hoạt động !
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className='form-total'>
                <div className='input-info'>
                    <InputAdmin
                        label={"Mã hóa đơn"}
                        readOnly={true}
                        value={selectedOrderCode}
                    />
                    <InputAdmin
                        label={"Họ và tên"}
                        name={"name"}
                        type={"text"}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={"Họ và tên"}
                        validate={'required'}
                    />
                    {listError.name && <label className='error-text'>{listError.name}</label>}
                    <InputAdmin
                        label={"Số điện thoại"}
                        name={"phoneNumber"}
                        type={"text"}
                        value={phoneNumber}
                        onChange={handleInput}
                        placeholder={"Số điện thoại"}
                        validate={'required||checkPhoneNumber'}
                        readOnly={discountAPI ? true : false}
                    />
                    {listError.phoneNumber && <label className='error-text'>{listError.phoneNumber}</label>}
                </div>
                <div className='form-discount'>
                    <InputAdmin
                        label={"Mã khuyến mãi"}
                        name={"discount"}
                        type={"text"}
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        placeholder={"Nhập mã khuyến mãi"}
                    />
                    <div>
                        <ButtonWed title={"Áp dụng"} onClick={handleDiscount} />
                    </div>
                </div>
                <div>
                    {discountAPI ? (
                        <div className='flex'>
                            <span>Mã khuyến mãi : {discountAPI.name}</span>
                            <span>Hình thức: {discountAPI.promotionType === 1 ? "Giảm tiền" : "Giảm theo %"}</span>
                            <span>Mô tải: {discountAPI.conditionsOfApplication}</span>
                            <span>
                                Hạn mức tối đa: {discountAPI.maximumPromotion ? `${formatter.format(discountAPI.maximumPromotion)}` : "0đ"}
                            </span>

                            <span>Tích kiệm:  {discountAPI.promotionLevel > 100 ? `${formatter.format(discountAPI.promotionLevel)}` : discountAPI.promotionLevel + "%"}</span>
                        </div>
                    ) : null}
                    <div className='flex'>
                        <span>Số tiền ban đầu: {formatter.format(total)}</span>
                        <span>Số tiền sau khuyến mãi:   {totalAfterDiscount > 0 ? formatter.format(totalAfterDiscount) : formatter.format(total)}</span>
                    </div>
                </div>
                <div className='flex-total'>
                    <span>Số tiền bạn cần thành toán: </span>
                    <p>{totalAfterDiscount > 0 ? formatter.format(totalAfterDiscount) : formatter.format(total)}</p>
                </div>
                <div className='btn-payment'>
                    <ButtonWed title={"Thanh toán hóa đơn"} onClick={handlePay} />
                </div>
            </div>
        </div>
    )
}

export default CartAdmin