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
    const navigate = useNavigate()
    const [data, setData] = useState([])
    const [quantities, setQuantities] = useState({});
    const [selectedItems, setSelectedItems] = useState([]);
    const [total, setTotal] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [name, setName] = useState("");
    const [discount, setDiscount] = useState("");
    const [discountAPI, setDiscountAPI] = useState()
    const [totalAfterDiscount, setTotalAfterDiscount] = useState(0)
    const [discountAmount, setDiscountAmount] = useState(0)
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

    const getCartByAdmin = async () => {
        try {
            const response = await fetch(`http://localhost:3001/cart/getCartByAdmin`, {
                headers: {
                    Authorization: `Bearer`,
                    "Content-Type": "application/json"
                },
            });
            const data = await response.json();
            if (data.status === 200) {
                setData(data.data)
                setQuantities(prevQuantities => {
                    const newQuantities = { ...prevQuantities };
                    data.data.forEach(item => {
                        newQuantities[item.productDetailCode] = newQuantities[item.productDetailCode] || 1;
                    });
                    return newQuantities;
                });
            } else {
                setData([])
            }
        } catch (e) {
            console.log("Lỗi lấy thông tin giỏ hàng : ", e)
        }
    }
    const increase = (productDetailCode, maxQuantity) => {
        setQuantities(prev => ({
            ...prev,
            [productDetailCode]: Math.min((prev[productDetailCode] || 1) + 1, maxQuantity),
        }));
    };

    const decrease = (productDetailCode) => {
        setQuantities(prev => ({
            ...prev,
            [productDetailCode]: prev[productDetailCode] > 1 ? prev[productDetailCode] - 1 : 1,
        }));
    };
    const handleDeleteItem = async (id) => {
        const idArray = Array.isArray(id) ? id : [id]
        const token = APP_LOCAL.getTokenStorage()
        try {
            const response = await fetch(`http://localhost:3001/cart/deleteItemCart`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(idArray)
            });
            const data = await response.json();
            if (data.status === 200) {
                ToastApp.success("Xóa thành công")
                getCartByAdmin()
                const newCart = cartAdmin.filter(c => c.id !== id)
                dispatch({
                    type: KEY_CONTEXT_USER.SET_CART_ADMIN,
                    payload: newCart,
                })
            } else {
                console.log(data.message)
            }
        } catch (e) {
            console.log("Lỗi lấy thông tin giỏ hàng : ", e)
        }
    }
    const clearForm = () => {
        setName("")
        setPhoneNumber("")
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
        const selectedProducts = data
            .map(item => ({
                image: item.image,
                name: item.productName,
                colorName: item.colorName,
                quantity: quantities[item.productDetailCode] ?? 1,
                price: item.price,
                productDetailCode: item.productDetailCode,
                size: item.size,
            }));


        dispatch({
            type: KEY_CONTEXT_USER.SHOW_MODAL,
            payload: {
                typeModal: 'NOTIFICATION_MODAL',
                contentModel: "Xác nhận thanh toán đơn hàng !!!",
                onClickConfirmModel: async () => {
                    try {
                        const body = {
                            userName: name,
                            phoneNumber: phoneNumber,
                            totalDefault: total,
                            totalPromotion: discountAmount || 0,
                            totalPayment: totalAfterDiscount > 0 ? totalAfterDiscount : total,
                            discount: discountAPI?.name || "",
                            product: selectedProducts,
                        };
                        const response = await fetch(`http://localhost:3001/order/orderCartAdmin`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer `,
                            },
                            body: JSON.stringify(body),
                        });
                        const result = await response.json();
                        if (result.status === 200) {
                            ToastApp.success(result.message)
                            const id = data.map(v => v.productDetailCode);
                            const newCart = cartAdmin.filter(c => !id.includes(c.id));
                            dispatch({
                                type: KEY_CONTEXT_USER.SET_CART_ADMIN,
                                payload: newCart,
                            })
                            getCartByAdmin()
                            clearForm()
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
                console.log(result)
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

    useEffect(() => {
        getCartByAdmin()
    }, [])
    useEffect(() => {
        const totalAmount = data.reduce((sum, item) => {

            const quantity = quantities[item.productDetailCode] ?? 1;
            return sum + item.price * quantity;


        }, 0);
        setTotal(totalAmount);
    }, [data, quantities, selectedItems]);

    const formatter = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    });
    return (
        <div className='cartAdmin-container'>
            <div className='cart'>
                <h1>Đơn hàng tại quầy</h1>
                {data && data.length > 0 ? (
                    data.map((cart, i) => (
                        <div key={i} className='cart-item'>
                            <div className='cart-image' >
                                <img src={cart.image} alt={cart.productName} />
                            </div>
                            <div className='cart-info'>
                                <h3>{cart.productName}</h3>
                                <span>Sản xuất: {cart.origin}</span>
                                <span>Thương hiệu: {cart.trademark}</span>
                            </div>
                            <div className='cartItem-color'>
                                <span>Màu: {cart.colorName}</span>
                                <div
                                    className="card-color"
                                    style={{ backgroundColor: cart.color }}
                                ></div>
                            </div>

                            <span className='cart-size'>Size:<p>{cart.size}</p> </span>
                            <div className='btn-quantity'>
                                <button
                                    onClick={() => decrease(cart.productDetailCode)}
                                    disabled={quantities[cart.productDetailCode] === 1}
                                    className={`btn-decrease ${quantities[cart.productDetailCode] === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
                                >-</button>
                                <span className="text-quantity">{quantities[cart.productDetailCode] ?? 1}</span>
                                <button
                                    onClick={() => increase(cart.productDetailCode, cart.quantity)}
                                    disabled={quantities[cart.productDetailCode] >= cart.quantity}
                                    className={`btn-increase ${quantities[cart.productDetailCode] >= cart.quantity ? "opacity-50 cursor-not-allowed" : ""}`}
                                >+</button>
                            </div>
                            <span className='cart-price'>Giá:<p>{formatter.format(cart.price)}</p> </span>
                            <div className='icon-delete'>
                                <img alt='xóa' src={AppImages.deleteIcon} onClick={() => handleDeleteItem(cart.productDetailCode)} />
                            </div>
                        </div>
                    ))
                ) : (<div>
                    Bạn chưa có sản phẩm
                </div>)}
            </div>
            <div className='form-total'>
                <div className='input-info'>
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