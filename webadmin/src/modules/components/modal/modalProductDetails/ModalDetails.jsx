import { useContext, useEffect, useRef, useState } from "react";
import ToastApp from "../../../../lib/notification/Toast";
import './ModalDetails.scss'
import APP_LOCAL from "../../../../lib/localStorage";
import Select from "react-select";
import InputAdmin from "../../input/Input-admin";
import { ParseValid } from "../../../../lib/validate/ParseValid";
import { Validate } from "../../../../lib/validate/Validate";
import ButtonWed from "../../button/Button-admin";
import UserContext from "../../../../context/use.context";
import { KEY_CONTEXT_USER } from "../../../../context/use.reducer";

const ModalDetails = ({ id, onClose, isOpen }) => {
    const [userCtx, dispatch] = useContext(UserContext);
    const [data, setData] = useState(null);
    const dialogRef = useRef();
    const [colors, setColors] = useState([]);
    const [selectedColor, setSelectedColor] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [dataProductDetails, setDataProductDetails] = useState({
        color: "",
        colorCode: "",
        price: "",
        quantity: "",
        size: "",
        image: "",
    })
    const [listErrorDetails, setListErrorDetails] = useState({
        quantity: "",
        colorCode: "",
        price: "",
        size: "",
    })
    const clearForm = () => {
        setDataProductDetails({
            color: '',
            colorCode: '',
            price: '',
            quantity: '',
            size: "",
            image: "",
        });
        setImagePreview(null)
        const fileInput = document.getElementById("file-upload");
        if (fileInput) {
            fileInput.value = "";
        }
    }
    const getProduct = async () => {
        try {
            const response = await fetch(`http://localhost:3001/product/getProductById/${id}`, {
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
            // ToastApp.error("Error: " + e);
            console.log(e)
        }
    };
    const getColor = async () => {
        try {
            const response = await fetch(`http://localhost:3001/color/getColor`, {
                headers: {
                    Authorization: `Bearer`,
                }
            })
            if (response.status === 200) {
                const data = await response.json()
                const formattedColors = data?.data.map((color) => ({
                    label: color.name,
                    value: color.name,
                    colorCode: color.colorCode,
                }));
                setColors(formattedColors)
            } else {
                ToastApp.error(response.message)
            }
        } catch (error) {
            console.log("Lỗi web get list color: ", error)
        }
    }
    const handleChangeColor = async (selectedOption) => {
        if (!selectedOption) return;

        setSelectedColor(selectedOption);
        setDataProductDetails(prev => ({
            ...prev,
            color: selectedOption.label,
            colorCode: selectedOption.colorCode || "",
        }));
        if (selectedOption.__isNew__) {
            const token = APP_LOCAL.getTokenStorage();
            if (!token) {
                return ToastApp.warning("Bạn cần phải đăng nhập! ")
            }
            try {
                const response = await fetch(`http://localhost:3001/color/createColor`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ color: selectedOption.label }),
                });
                const data = await response.json();

                if (data.status === 200) {
                    const newColor = { label: selectedOption.label, value: selectedOption.label, colorCode: "" };
                    setColors(prevColors => [...prevColors, newColor]);
                    setSelectedColor(newColor);
                    ToastApp.success("Thêm màu thành công!");
                } else {
                    ToastApp.error(data.message || "Lỗi khi thêm màu!");
                }
            } catch (error) {
                // ToastApp.error(error.message)
                console.log(error)
            }
        }
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImagePreview(URL.createObjectURL(file));
            setDataProductDetails(prev => ({ ...prev, image: file }));
        }
    };
    const handleClickOutside = (event) => {
        if (dialogRef.current && !dialogRef.current.contains(event.target)) {
            onClose();
            clearForm();
        }
    };
    const onChangeInput = (e) => {
        const { name, value } = e.target;
        setDataProductDetails(prev => ({ ...prev, [name]: value }));
        const inputValue = value.trim();
        const valid = e.target.getAttribute('validate');
        const validObject = ParseValid(valid);
        const error = Validate(
            name,
            inputValue,
            validObject,
        );
        const newListError = { ...listErrorDetails, [name]: error };
        setListErrorDetails(newListError);
    }

    const handleClickStatus = async (e, code) => {
        try {
            const response = await fetch(`http://localhost:3001/product/statusProductDetail/${code}`, {
                headers: {
                    Authorization: `Bearer `,
                },
            });
            const data = await response.json();
            if (data.status === 200) {
                getProduct()
                return ToastApp.success("Cập nhật thành công")

            } else {
                console.log("Lỗi cập nhật trạng thái sản phẩm chi tiết :", data.message)
            }
        } catch (e) {
            console.log("Lỗi cập nhật trạng thái sản phẩm chi tiết : ", e)
        }
    }

    const handleClickEditProductDetail = (e, code, productCode) => {
        e.stopPropagation();
        dispatch({
            type: KEY_CONTEXT_USER.SHOW_MODAL,
            payload: {
                typeModal: 'EDIT_PRODUCT_DETAIL_MODAL',
                dataModal: code,
                contentModel: "Cập nhật chi tiết sản phẩm",
                onClickConfirmModel: async (data, selectedFile, listError, selectedColor) => {
                    let newErrors = { ...listError };
                    for (let key in newErrors) {
                        if (newErrors[key]) {
                            ToastApp.warning("Vui lòng nhập đúng dữ liệu!");
                            return;
                        }
                    }
                    if (!selectedColor) {
                        ToastApp.warning("Vui lòng nhập đủ dữ liệu!");
                        return;
                    }
                    const formData = new FormData();
                    formData.append("productCode", productCode);
                    formData.append("code", data.productDetailCode);
                    formData.append("quantity", data.quantity);
                    formData.append("size", data.size);
                    formData.append("color", data.color);
                    formData.append("colorCode", data.colorCode);
                    formData.append("price", data.price);
                    if (selectedFile) {
                        formData.append("image", selectedFile)
                    } else {
                        formData.append("imageUrl", data.idImage);
                    }
                    const token = APP_LOCAL.getTokenStorage()
                    try {
                        const response = await fetch(`http://localhost:3001/product/updateProductDetail`,
                            {
                                method: 'PUT',
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                },
                                body: formData,
                            });

                        const data = await response.json();
                        if (data.status === 200) {
                            ToastApp.success('Cập nhật thành công!');
                            dispatch({ type: KEY_CONTEXT_USER.HIDE_MODAL });
                            getProduct()
                        } else {
                            ToastApp.error('Error: ' + data.message);
                        }

                    } catch (e) {
                        console.log("Lỗi cập nhật sản phẩm: ", e)
                    }
                },
            },
        })
    }


    const handleSubmit = async (id) => {
        const token = APP_LOCAL.getTokenStorage();
        let newErrors = { ...listErrorDetails };
        for (let key in dataProductDetails) {
            if (!dataProductDetails[key]) {
                ToastApp.warning("Vui lòng điền đầy đủ thông tin chi tiết sản phẩm!");
                return;
            }
        }
        for (let key in newErrors) {
            if (newErrors[key]) {
                ToastApp.warning("Vui lòng nhập đúng dữ liệu!");
                return;
            }
        }
        const formData = new FormData();
        formData.append("color", dataProductDetails.color);
        formData.append("colorCode", dataProductDetails.colorCode);
        formData.append("price", dataProductDetails.price);
        formData.append("quantity", dataProductDetails.quantity);
        formData.append("size", dataProductDetails.size);
        formData.append("image", dataProductDetails.image);

        try {
            const response = await fetch(`http://localhost:3001/product/createProductDetail/${id}`, {
                method: "POST",
                headers: {
                    // "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });
            const data = await response.json();
            if (data.status === 200) {
                ToastApp.success(data.message)
                clearForm()
                getProduct()
            } else {
                ToastApp.warning(data.message)
            }
        } catch (e) {
            console.log("Lỗi thêm mới sản phẩm: ", e)
        }
    }

    useEffect(() => {
        if (isOpen) {
            getProduct();
            getColor()
        }
    }, [isOpen]);
    const formatter = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    });
    const customStyles = {
        control: (provided) => ({
            ...provided,
            borderRadius: "8px",
            boxShadow: "none",
            textAlign: "left"
        }),
        option: (provided) => ({ ...provided, colors: "black" })
    }
    return (
        isOpen && (
            <div className="dialog-overlay-modalDetail" onClick={handleClickOutside}>
                <div className="dialog" ref={dialogRef}>
                    <h2>Sản phẩm chi tiết</h2>
                    {data && data.code === id ? (
                        <div>
                            <div className="dialog-content">
                                <div className="info-container">
                                    <p><strong>Mã sản phẩm:</strong> {data.code}</p>
                                    <p><strong>Tên sản phẩm:</strong> {data.name}</p>
                                    <p><strong>Thương hiệu:</strong> {data.trademark}</p>
                                    <p><strong>Suất xứ:</strong> {data.origin}</p>
                                    <p><strong>Chất liệu:</strong> {data.material}</p>
                                </div>
                                <p><strong>Mô tải: </strong> {data.description}</p>
                                <p><strong>Trạng thái: </strong> {data.status === 1 ? "Đang hoạt động" : "Không hoạt động"}</p>
                                <div className="productDetail">
                                    {data?.productDetail.map((productDetail, index) => (
                                        <div key={index} className="productDetail-item">
                                            <span>Mã sản phẩm: {productDetail.productDetailCode}</span>
                                            <div className="imageProductDetail">
                                                <img src={productDetail.idImage} alt="" />
                                            </div>
                                            <span>Số lượng: {productDetail.quantity}</span>
                                            <span>Size: {productDetail.size}</span>
                                            <span>Màu: {productDetail.colorName}</span>
                                            <span>Mã màu: {productDetail.color}</span>
                                            <span>Giá: {formatter.format(productDetail.price)}</span>
                                            <div className="btn-update-statusProductDetail">
                                                <button onClick={(e) => handleClickStatus(e, productDetail?.productDetailCode)} className={`${productDetail?.status === 1 ? 'active-product' : 'inactive-product'}`}>
                                                    {productDetail?.status === 1 ? "Hoạt động" : "Không hoạt động"}
                                                </button>
                                            </div>
                                            <div className="btn-update-statusProductDetail">
                                                <button className="btn-update-product" onClick={(e) => handleClickEditProductDetail(e, productDetail, data.code)}>
                                                    Sửa
                                                </button>
                                            </div>

                                        </div>
                                    ))
                                    }
                                </div>
                            </div>
                            <div>
                                <h3>Thêm sản phẩm chi tiết</h3>
                                <div className="add-productDetail">
                                    <label className='label_color'>Chọn màu</label>
                                    <div className='select'>
                                        <Select
                                            styles={customStyles}
                                            options={colors}
                                            onChange={handleChangeColor}
                                            isClearable
                                            isSearchable
                                            placeholder="Chọn hoặc nhập màu mới ..."
                                            value={selectedColor}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && e.target.value) {
                                                    const newOption = { label: e.target.value, value: e.target.value, __isNew__: true };
                                                    handleChangeColor(newOption);
                                                }
                                            }}
                                            noOptionsMessage={() => "Không tìm thấy màu"}
                                        />
                                    </div>
                                    <div className="input-colorDetail">
                                        <div className='item_color input-container'>
                                            <InputAdmin
                                                name={"color"}
                                                label={"Tên màu"}
                                                placeholder={"Nhập tên màu ..."}
                                                validate={'required'}
                                                type={'text'}
                                                onChange={(e) => onChangeInput(e)}
                                                value={dataProductDetails.color}
                                                readOnly
                                            />
                                        </div>
                                        <div className='item_colorCode input-container'>
                                            <InputAdmin
                                                name={"colorCode"}
                                                label={"Mã màu"}
                                                placeholder={"Nhập mã màu ..."}
                                                validate={'required||checkColor'}
                                                type={'text'}
                                                onChange={(e) => onChangeInput(e)}
                                                value={dataProductDetails.colorCode}
                                            />
                                            {listErrorDetails.colorCode && <label className='error-text'>{listErrorDetails.colorCode}</label>}
                                        </div>
                                        <div className='item_quantity input-container'>
                                            <InputAdmin
                                                name={"quantity"}
                                                label={"Số lượng"}
                                                placeholder={"Nhập số lượng ..."}
                                                validate={'required||checkNumber||checkNegative'}
                                                type={'number'}
                                                onChange={(e) => onChangeInput(e)}
                                                value={dataProductDetails.quantity}
                                            />
                                            {listErrorDetails.quantity && <label className='error-text'>{listErrorDetails.quantity}</label>}
                                        </div>
                                        <div className='item_price input-container'>
                                            <InputAdmin
                                                name={"price"}
                                                label={"Giá"}
                                                placeholder={"Nhập giá sản phẩm ..."}
                                                validate={'required||checkNumber||checkNegative'}
                                                type={'text'}
                                                onChange={(e) => onChangeInput(e)}
                                                value={dataProductDetails.price}
                                            />
                                            {listErrorDetails.price && <label className='error-text'>{listErrorDetails.price}</label>}
                                        </div>
                                        <div className='item_size input-container'>
                                            <InputAdmin
                                                name={"size"}
                                                label={"Kích thước"}
                                                placeholder={"Nhập size sản phẩm ..."}
                                                validate={'required||checkNumber||checkNegative||checkSize'}
                                                type={'text'}
                                                onChange={(e) => onChangeInput(e)}
                                                value={dataProductDetails.size}
                                            />
                                            {listErrorDetails.size && <label className='error-text'>{listErrorDetails.size}</label>}
                                        </div>
                                        <div className='file_inputs'>
                                            <label htmlFor="file-upload" className="btn_image">{imagePreview ? "Chọn ảnh khác" : "Thêm ảnh"}</label>
                                            <input id="file-upload" type="file" name="image" onChange={handleImageChange} />
                                            {imagePreview && (
                                                <div className="image">
                                                    <img src={imagePreview} alt="Preview" style={{ width: 100, height: 100 }} />
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                    <div className='btn_submit'>
                                        <ButtonWed
                                            title={"Thêm sản phẩm"}
                                            onClick={() => handleSubmit(data.code)} />
                                    </div>
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