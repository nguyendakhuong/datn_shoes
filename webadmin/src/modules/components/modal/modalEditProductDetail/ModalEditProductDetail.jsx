import { useContext, useEffect, useState } from 'react';
import './ModalEditProductDetail.scss'
import UserContext from '../../../../context/use.context';
import ToastApp from '../../../../lib/notification/Toast';
import { Validate } from '../../../../lib/validate/Validate';
import { ParseValid } from '../../../../lib/validate/ParseValid';
import APP_LOCAL from '../../../../lib/localStorage';
import { KEY_CONTEXT_USER } from '../../../../context/use.reducer';
import InputAdmin from '../../input/Input-admin';
import Select from "react-select";
import ButtonWed from '../../button/Button-admin';

const ModalEditProductDetail = (productDetail) => {
    const [userCTX, dispatch] = useContext(UserContext);
    const [data, setData] = useState(productDetail.data);
    const [colors, setColors] = useState([]);
    const [selectedColor, setSelectedColor] = useState(null);
    const [image, setImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [listError, setListError] = useState({
        quantity: "",
        price: "",
        idSize: "",
        idColor: "",
    });
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({
            ...prev,
            [name]: value,
        }));
        const inputValue = value.trim();
        const valid = e.target.getAttribute('validate');
        const validObject = ParseValid(valid);
        const error = Validate(
            name,
            inputValue,
            validObject,
        );
        const newListError = { ...listError, [name]: error };
        setListError(newListError);
    };
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setData(prev => ({
                ...prev,
                idImage: file,
            }));
            const imageUrl = URL.createObjectURL(file);
            setImage(imageUrl);
        }
    };
    const handleChangeColor = async (selectedOption) => {
        if (!selectedOption) return;

        setSelectedColor(selectedOption);
        setData(prev => ({
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
    const onClickClone = () => {
        dispatch({
            type: KEY_CONTEXT_USER.HIDE_MODAL,
        })
    }
    useEffect(() => {
        getColor();
    }, [productDetail]);

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
        <div className="modal-editProductDetail">
            <h1>{userCTX.titleModel ?? "Cập nhật thông tin chi tiết"}</h1>
            {
                data ? (
                    <div>
                        <form onSubmit={(e) => e.preventDefault()} encType='multipart/form-data'>
                            <div>
                                <InputAdmin
                                    label={"Mã sản phẩm"}
                                    name={"productDetailCode"}
                                    value={data.productDetailCode}
                                    readOnly={true}
                                />
                                <InputAdmin
                                    label={"Số lượng"}
                                    name={"quantity"}
                                    validate={'required||checkNumber||checkNegative'}
                                    type={'number'}
                                    value={data.quantity}
                                    onChange={handleChange}
                                />
                                {listError.quantity && <label className='error-text'>{listError.quantity}</label>}
                                <InputAdmin
                                    label={"Giá bán"}
                                    name={"price"}
                                    validate={'required||checkNumber||checkNegative'}
                                    type={'text'}
                                    value={data.price}
                                    onChange={handleChange}
                                />
                                {listError.price && <label className='error-text'>{listError.price}</label>}
                                <InputAdmin
                                    label={"Size"}
                                    name={"size"}
                                    validate={'required||checkNumber||checkNegative||checkSize'}
                                    type={'text'}
                                    value={data.size}
                                    onChange={handleChange}
                                />
                                {listError.size && <label className='error-text'>{listError.size}</label>}
                            </div>
                            <div className='select-edit'>
                                <label>Màu</label>
                                <Select
                                    options={colors}
                                    styles={customStyles}
                                    onChange={(selectedOption) => handleChangeColor(selectedOption, "color", "createColor")}
                                    isClearable
                                    isSearchable
                                    placeholder="Chọn hoặc nhập màu mới ..."
                                    value={selectedColor}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && e.target.value) {
                                            const newOption = { label: e.target.value, value: e.target.value, __isNew__: true };
                                            handleChangeColor(newOption, "color", "createColor");
                                        }
                                    }} lab
                                    noOptionsMessage={() => "Không tìm thấy chất liệu"} />
                                <InputAdmin
                                    label={"Mã màu"}
                                    name={"colorCode"}
                                    validate={'required||checkColor'}
                                    type={'text'}
                                    value={data.colorCode}
                                    onChange={handleChange}
                                />
                                {listError.colorCode && <label className='error-text'>{listError.colorCode}</label>}
                            </div>
                            <div className='div-image'>
                                <div>
                                    {image ? <img src={image} alt={data.productName} /> : <img src={data.idImage} alt={data.productName} />}
                                </div>
                                <input type="file" accept="image/*" onChange={handleImageChange} />
                            </div>
                        </form>
                        <div className="btn-update-modalProductDetail">
                            <div>
                                <ButtonWed buttonAuth={false} title={"Hủy"} onClick={onClickClone} />
                            </div>
                            <div>
                                <ButtonWed
                                    buttonAuth={true}
                                    title={"OK"}
                                    onClick={() => { userCTX.onClickConfirmModel(data, selectedFile, listError, selectedColor) }}
                                />
                            </div>
                        </div>
                    </div>
                ) : ""
            }
        </div>
    )
}

export default ModalEditProductDetail