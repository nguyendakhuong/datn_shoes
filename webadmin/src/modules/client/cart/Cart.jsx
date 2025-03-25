import { useContext, useEffect, useState } from 'react';
import APP_LOCAL from '../../../lib/localStorage';
import './Cart.scss'
import AppImages from '../../../assets';
import ToastApp from '../../../lib/notification/Toast';
import InputAdmin from '../../components/input/Input-admin';
import ButtonWed from '../../components/button/Button-admin';
import ModalPayment from '../../components/modal/modalPayment/ModalPayment';
import UserContext from '../../../context/use.context';
import { KEY_CONTEXT_USER } from '../../../context/use.reducer';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
    const [userCtx, dispatch] = useContext(UserContext)
    const navigate = useNavigate()
    const [data, setData] = useState([])
    const [quantities, setQuantities] = useState({});
    const [selectedItems, setSelectedItems] = useState([]);
    const [total, setTotal] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dataPayment, setDataPayment] = useState([])

    const getCartByUser = async () => {
        const token = APP_LOCAL.getTokenStorage()
        try {
            const response = await fetch(`http://localhost:3001/cart/getCartByUser`, {
                headers: {
                    Authorization: `Bearer ${token}`,
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
    const handleCheckboxChange = (productDetailCode) => {
        setSelectedItems(prev =>
            prev.includes(productDetailCode)
                ? prev.filter(id => id !== productDetailCode)
                : [...prev, productDetailCode]
        );
    };

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
        const token = APP_LOCAL.getTokenStorage()
        const idArray = Array.isArray(id) ? id : [id]
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
                getCartByUser()
                const newCart = userCtx.cart.filter(c => c.id !== id)
                dispatch({
                    type: KEY_CONTEXT_USER.SET_CART,
                    payload: newCart,
                })
            } else {
                console.log("Lỗi lấy thông tin giỏ hàng: ", data.message)
            }
        } catch (e) {
            console.log("Lỗi lấy thông tin giỏ hàng : ", e)
        }
    }
    const handlePay = () => {
        if (selectedItems.length === 0) {
            return ToastApp.warning("Vui lòng chọn 1 sản phẩm để thanh toán")
        }
        const selectedProducts = data
            .filter(item => selectedItems.includes(item.productDetailCode))
            .map(item => ({
                image: item.image,
                name: item.productName,
                colorName: item.colorName,
                quantity: quantities[item.productDetailCode] ?? 1,
                price: item.price,
                productDetailCode: item.productDetailCode,
                size: item.size,
            }));
        setDataPayment(selectedProducts)
        setIsModalOpen(true);
    }
    const handleCloseModal = () => {
        setIsModalOpen(false);
    }
    useEffect(() => {
        getCartByUser()
    }, [])

    useEffect(() => {
        const totalAmount = data.reduce((sum, item) => {
            if (selectedItems.includes(item.productDetailCode)) {
                const quantity = quantities[item.productDetailCode] ?? 1;
                return sum + item.price * quantity;
            }
            return sum;
        }, 0);
        setTotal(totalAmount);
    }, [data, quantities, selectedItems]);

    const formatter = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    });
    return (
        <div className='cart-container'>
            <div className='cart'>
                <h1>Giỏ hàng của bạn</h1>
                {data && data.length > 0 ? (
                    data.map((cart, i) => (
                        <div key={i} className='cart-item'>
                            <input
                                type='checkbox'
                                checked={selectedItems.includes(cart.productDetailCode)}
                                onChange={() => handleCheckboxChange(cart.productDetailCode)}
                            />
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
                    Bạn chưa có sản phẩm trong giỏ hàng
                </div>)}
            </div>
            <div className='form-total'>
                <div className='total'>
                    <h2>Tổng tiền thanh toán:</h2>
                    <p>{formatter.format(total)}</p>
                </div>
                <div className='btn-total'>
                    <ButtonWed title={"Đặt hàng"} onClick={handlePay} />
                </div>
            </div>
            <ModalPayment data={dataPayment} total={total} isOpen={isModalOpen} onClose={handleCloseModal} />
        </div>
    )
}
export default Cart