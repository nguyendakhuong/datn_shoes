import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./ProductDetail.scss";

const ProductDetail = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [selectedColor, setSelectedColor] = useState(""); // Màu đã chọn
    const [filteredSizes, setFilteredSizes] = useState([]); // Danh sách size theo màu
    const [selectedSize, setSelectedSize] = useState(""); // Kích thước đã chọn

    const getProductById = async () => {
        try {
            const response = await fetch(`http://localhost:3001/product/getProductById/${id}`, {
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

    useEffect(() => {
        getProductById();
    }, []);
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

    const handleAddToCart = () => {
        const selectedProduct = filteredSizes.find((item) => item.size === selectedSize);
        if (!selectedProduct) return;
        console.log("Thêm vào giỏ hàng:", {
            productId: data.code,
            name: data.name,
            color: selectedColor,
            size: selectedSize,
            price: selectedProduct.price,
            quantity: 1,
        });
        // alert("Sản phẩm đã được thêm vào giỏ hàng!");
    };
    console.log(filteredSizes)
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
                        <p className="product-description">{data?.description}</p>
                    </div>
                    <div className="product-right">
                        <h2>{data?.name}</h2>
                        <p>
                            <b>Chất liệu:</b> {data?.material}
                        </p>
                        <p>
                            <b>Xuất xứ:</b> {data?.origin}
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
                            {filteredSizes.find((v) => v.size === selectedSize)?.price || "N/A"}
                        </p>

                        <button className="add-to-cart" onClick={handleAddToCart}>
                            Thêm vào giỏ hàng
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;
