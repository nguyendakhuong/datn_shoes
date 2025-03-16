import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import "./ProductDetail.scss";
import CardItem from "../card/CardItem";
import APP_LOCAL from "../../../lib/localStorage";
import ToastApp from "../../../lib/notification/Toast";
import UserContext from "../../../context/use.context";
import { KEY_CONTEXT_USER } from "../../../context/use.reducer";

const ProductDetail = () => {
    const { trademark, id } = useParams();
    const [userCtx, dispatch] = useContext(UserContext)
    const [data, setData] = useState(null);
    const [dataTrademark, setDataTrademark] = useState([]);
    const [selectedColor, setSelectedColor] = useState("");
    const [filteredSizes, setFilteredSizes] = useState([]);
    const [selectedSize, setSelectedSize] = useState("");
    const navigate = useNavigate()
    const getProductById = async () => {
        try {
            const response = await fetch(`http://localhost:3001/product/getProductByIdForUser/${id}`, {
                headers: {
                    Authorization: `Bearer `,
                },
            });
            const data = await response.json();
            if (data.status === 200) {
                setData(data.data);
            }
        } catch (e) {
            console.log("Lỗi lấy thông tin sản phẩm theo id: ", e);
        }
    };

    const getProductByTrademark = async () => {
        try {
            const response = await fetch(`http://localhost:3001/product/getProductByTrademark`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer `,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ trademark })
            });
            const data = await response.json();
            if (data.status === 200) {
                setDataTrademark(data.data)
            }
        } catch (e) {
            console.log("Lỗi lấy thông tin sản phẩm theo trademark: ", e);
        }
    }

    useEffect(() => {
        getProductById();
        getProductByTrademark()
    }, [id, trademark]);

    useEffect(() => {
        if (data?.productDetail.length > 0) {
            const firstColor = data.productDetail[0].color;
            setSelectedColor(firstColor);
        }
    }, [data]);

    useEffect(() => {
        if (data && selectedColor) {
            const sizes = data.productDetail.filter((item) => item.color === selectedColor);
            setFilteredSizes(sizes);
            if (sizes.length > 0) {
                setSelectedSize(sizes[0].size);
            }
        }
    }, [selectedColor, data]);

    const handleAddToCart = async () => {
        const selectedProduct = filteredSizes.find((item) => item.size === selectedSize);
        if (!selectedProduct) return;
        const token = APP_LOCAL.getTokenStorage()
        try {
            const response = await fetch(`http://localhost:3001/cart/productToCart/${selectedProduct.productDetailCode}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            });
            const data = await response.json();
            if (data.status === 200) {
                ToastApp.success("Thêm vào giỏ hàng thành công")
                const newCart = [...userCtx.cart]
                newCart.push({ id: selectedProduct.productDetailCode })
                dispatch({
                    type: KEY_CONTEXT_USER.SET_CART,
                    payload: newCart,
                })
            } else {
                ToastApp.warning(data.message)
            }
        } catch (e) {
            console.log("Lỗi thêm sản phẩm vào giỏ hàng: ", e)
        }
    };

    const handleClickItem = (v) => {
        navigate(`/productDetail/${v.trademark}/${v.id}`);
    }
    const formatter = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    });
    return (
        <div className="productDetail-container">
            {filteredSizes.length > 0 && (
                <div className="productDetail-content">
                    <div className="product-left">
                        <img
                            src={filteredSizes[0].idImage}
                            alt={data?.name}
                            className="product-image"
                        />

                    </div>
                    <div className="product-right">
                        <h2>{data?.name}</h2>
                        <p>
                            <b>Chất liệu:</b> {data?.material}
                        </p>
                        <p>
                            <b>Sản xuất:</b> {data?.origin}
                        </p>
                        <p>
                            <b>Thương hiệu:</b> {data?.trademark}
                        </p>
                        <div className="color-buttons">
                            {Array.from(new Set(data.productDetail.map((v) => v.color))).map(
                                (color, i) => (
                                    <button
                                        key={i}
                                        className={`color-button ${selectedColor === color ? "active" : ""
                                            }`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setSelectedColor(color)}
                                    ></button>
                                )
                            )}
                        </div>
                        <div className="size-buttons">
                            {filteredSizes.map((v) => (
                                <button
                                    key={v.size}
                                    className={`size-button ${selectedSize === v.size ? "active" : ""
                                        }`}
                                    onClick={() => setSelectedSize(v.size)}
                                >
                                    {v.size}
                                </button>
                            ))}
                        </div>
                        <p>
                            <b>Giá:</b>{" "}
                            {formatter.format(filteredSizes.find((v) => v.size === selectedSize)?.price || "N/A")}
                        </p>

                        <button className="add-to-cart" onClick={handleAddToCart}>
                            Thêm vào giỏ hàng
                        </button>
                    </div>
                    <div className="description">
                        <span>Mô tả</span>
                        <p className="product-description">{data?.description}</p>
                    </div>
                </div>
            )}
            <div className="product-category">
                <h3>Sản phẩm bạn có thể thích</h3>

                <div className="item-render">
                    {dataTrademark.length > 0 ? dataTrademark.map((v, i) => (
                        <div key={i}>
                            <CardItem data={v} onClickItem={handleClickItem} />
                        </div>
                    )) : <div className="text-title">
                        <span>Chưa có sản phẩm hoạt động</span>
                    </div>}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
