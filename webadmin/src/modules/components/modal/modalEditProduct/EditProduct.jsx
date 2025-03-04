import { useContext, useEffect, useState } from 'react';
import './EditProdcut.scss'
import UserContext from '../../../../context/use.context';
import { KEY_CONTEXT_USER } from '../../../../context/use.reducer';
import ButtonWed from '../../button/Button-admin';
import InputAdmin from '../../input/Input-admin';
import ToastApp from '../../../../lib/notification/Toast';
import APP_LOCAL from '../../../../lib/localStorage';
import Select from "react-select";
import { ParseValid } from '../../../../lib/validate/ParseValid';
import { Validate } from '../../../../lib/validate/Validate';


const EditProduct = ({ id }) => {
    const [userCTX, dispatch] = useContext(UserContext);
    const [data, setData] = useState({});
    const [trademark, setTrademark] = useState([]);
    const [origin, setOrigin] = useState([]);
    const [material, setMaterial] = useState([]);
    const [colors, setColors] = useState([]);
    const [image, setImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const [listError, setListError] = useState({
        quantity: "",
        price: "",
        idSize: "",
        idColor: "",
    });
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const imageUrl = URL.createObjectURL(file);
            setImage(imageUrl);
        }
    };

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
                const filteredData = {
                    ...data.data,
                    trademark: "",
                    origin: "",
                    material: "",
                    idColor: "",
                    color: ""
                };
                setData(filteredData);
            } else {
                ToastApp.warning(data.message);
            }
        } catch (e) {
            ToastApp.error("Error: " + e);
            console.log(e)
        }
    };

    const getTrademark = async () => {
        try {
            const response = await fetch(`http://localhost:3001/trademark/getTrademark`, {
                headers: {
                    Authorization: `Bearer`,
                }
            })
            if (response.status === 200) {
                const data = await response.json()
                const formattedTrademark = data?.data.map((trademark) => ({
                    label: trademark.name,
                    value: trademark.brandCode,
                }));
                setTrademark(formattedTrademark)
            } else {
                ToastApp.error(response.message)
            }
        } catch (error) {
            console.log("Lỗi web get list trademark: ", error)
        }
    }
    const getOrigin = async () => {
        try {
            const response = await fetch(`http://localhost:3001/origin/getOrigin`, {
                headers: {
                    Authorization: `Bearer`,
                }
            })
            if (response.status === 200) {
                const data = await response.json()
                const formattedOrigin = data?.data.map((origin) => ({
                    label: origin.name,
                    value: origin.originCode,
                }));
                setOrigin(formattedOrigin)
            } else {
                ToastApp.error(response.message)
            }
        } catch (error) {
            console.log("Lỗi web get list trademark: ", error)
        }
    }
    const getMaterial = async () => {
        try {
            const response = await fetch(`http://localhost:3001/material/getMaterial`, {
                headers: {
                    Authorization: `Bearer`,
                }
            })
            if (response.status === 200) {
                const data = await response.json()
                const formattedMaterial = data?.data.map((material) => ({
                    label: material.name,
                    value: material.materialCode,
                }));
                setMaterial(formattedMaterial)
            } else {
                ToastApp.error(response.message)
            }
        } catch (error) {
            console.log("Lỗi web get list material: ", error)
        }
    }
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
    const handleChangeSelect = async (selectedOption, name, nameAPI) => {
        if (!selectedOption) return;
        const token = APP_LOCAL.getTokenStorage();
        if (!token) {
            return ToastApp.warning("Bạn cần phải đăng nhập! ")
        }

        if (name !== "color") {
            setData(prev => ({
                ...prev,
                [name]: selectedOption,

            }));
        }
        if (name === "color") {
            setData(prev => ({
                ...prev,
                [name]: selectedOption,
                idColor: selectedOption.colorCode
            }));
        }

        if (name === "color" && selectedOption.__isNew__) {
            try {
                const response = await fetch(`http://localhost:3001/${name}/${nameAPI}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ color: selectedOption.label }),
                });
                const data = await response.json();
                if (data.status === 200) {
                    const newColor = {
                        label: selectedOption.label,
                        value: selectedOption.label,
                        colorCode: selectedOption.colorCode || ""
                    };
                    setColors(prevColors => [...prevColors, newColor]);
                    setData(prev => ({
                        ...prev,
                        idColor: selectedOption.colorCode
                    }));
                    return ToastApp.success("Thêm màu thành công!");
                } else {
                    return ToastApp.warning(data.message)
                }
            } catch (e) {
                ToastApp.error(e.message)
            }
        }
        if (selectedOption.__isNew__) {
            try {
                const response = await fetch(`http://localhost:3001/${name}/${nameAPI}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ name: selectedOption.label }),
                });
                const data = await response.json();

                if (data.status === 200) {
                    if (name === 'trademark') {
                        const newTrademark = { label: selectedOption.label, value: selectedOption.label };
                        setTrademark(prevTrademark => [...prevTrademark, newTrademark]);
                        setData(prev => ({
                            ...prev,
                            trademark: selectedOption
                        }));
                        ToastApp.success("Thêm thương hiệu thành công!");
                    }
                    if (name === 'origin') {
                        const newOrigin = { label: selectedOption.label, value: selectedOption.label };
                        setOrigin(prevTrademark => [...prevTrademark, newOrigin]);
                        setData(prev => ({
                            ...prev,
                            origin: selectedOption
                        }));
                        ToastApp.success("Thêm xuất xứ thành công!");
                    }
                    if (name === 'material') {
                        const newMaterial = { label: selectedOption.label, value: selectedOption.label };
                        setMaterial(prevTrademark => [...prevTrademark, newMaterial]);
                        setData(prev => ({
                            ...prev,
                            material: selectedOption
                        }));
                        ToastApp.success("Thêm xuất xứ thành công!");
                    }
                } else {
                    ToastApp.error(data.message);
                }
            } catch (error) {
                ToastApp.error(error.message)
            }
        }
    }

    const onClickClone = () => {
        dispatch({
            type: KEY_CONTEXT_USER.HIDE_MODAL,
        })
    }
    const handleUpdate = async () => {
        const token = APP_LOCAL.getTokenStorage()
        try {
            let newErrors = { ...listError };
            for (let key in newErrors) {
                if (newErrors[key]) {
                    ToastApp.warning("Vui lòng nhập đúng dữ liệu!");
                    return;
                }
            }
            const formDataToSend = new FormData();
            formDataToSend.append('name', data.productName);
            formDataToSend.append('idProduct', data.idProduct);
            formDataToSend.append('productDetailCode', data.productDetailCode);
            formDataToSend.append('trademark', data.trademark.value);
            formDataToSend.append('origin', data.origin.value);
            formDataToSend.append('material', data.material.value);
            formDataToSend.append('color', data.color.value);
            formDataToSend.append('idColor', data.idColor)
            formDataToSend.append('idSize', data.idSize)
            formDataToSend.append('quantity', data.quantity)
            formDataToSend.append('price', data.price)
            if (selectedFile) {
                formDataToSend.append('image', selectedFile);
            } else {
                formDataToSend.append('imageUrl', data.idImage);
            }
            for (let [key, value] of formDataToSend.entries()) {
                if (value === undefined || value === null || value === "") {
                    ToastApp.warning("Nhập đủ thông tin")
                    console.error(`Lỗi: Trường "${key}" không được để trống.`);
                    return;
                }
            }
            const response = await fetch(`http://localhost:3001/product/updateProduct`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formDataToSend,
            });
            const result = await response.json()
            if (result.status === 200) {
                dispatch({ type: KEY_CONTEXT_USER.HIDE_MODAL });
                ToastApp.success("Cập nhật thành công!")
            } else {
                ToastApp.warning("Lỗi cập nhật: ", result.message)
            }

        } catch (e) {
            console.log("Lỗi cập nhật sản phẩm")
        }
    }

    useEffect(() => {
        getProduct();
        getTrademark();
        getOrigin();
        getMaterial();
        getColor();
    }, [id]);

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
        <div className="modal-editProduct">
            <h1>{userCTX.titleModel ?? "Thông báo"}</h1>
            {
                data ? (
                    <div>
                        <form onSubmit={(e) => e.preventDefault()} encType='multipart/form-data'>
                            <div>
                                <div>
                                    {image ? <img src={image} alt={data.productName} /> : <img src={data.idImage} alt={data.productName} />}
                                </div>
                                <input type="file" accept="image/*" onChange={handleImageChange} />
                            </div>
                            <div>
                                <InputAdmin
                                    label={"Mã sản phẩm"}
                                    name={"productDetailCode"}
                                    value={data.productDetailCode}
                                    readOnly={true}
                                />

                                <InputAdmin
                                    label={"Tên sản phẩm"}
                                    name={"name"}
                                    value={data.productName}
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
                                    name={"idSize"}
                                    validate={'required||checkNumber||checkNegative'}
                                    type={'number'}
                                    value={data.idSize}
                                    onChange={handleChange}
                                />
                                {listError.idSize && <label className='error-text'>{listError.idSize}</label>}
                            </div>
                            <div className='select-edit'>
                                <label>Thương hiệu</label>
                                <Select
                                    options={trademark}
                                    styles={customStyles}
                                    onChange={(selectedOption) => handleChangeSelect(selectedOption, "trademark", "createTrademark")}
                                    isClearable
                                    isSearchable
                                    placeholder="Chọn hoặc nhập thương hiệu mới ..."
                                    value={data.trademark}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && e.target.value) {
                                            const newOption = { label: e.target.value, value: e.target.value, __isNew__: true };
                                            handleChangeSelect(newOption, "trademark", "createTrademark");
                                        }
                                    }}
                                    noOptionsMessage={() => "Không tìm thấy thương hiệu"} />
                                <label>Xuất xứ</label>

                                <Select
                                    options={origin}
                                    styles={customStyles}
                                    onChange={(selectedOption) => handleChangeSelect(selectedOption, "origin", "createOrigin")}
                                    isClearable
                                    isSearchable
                                    placeholder="Chọn hoặc nhập xuất xứ mới ..."
                                    value={data.origin}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && e.target.value) {
                                            const newOption = { label: e.target.value, value: e.target.value, __isNew__: true };
                                            handleChangeSelect(newOption, "origin", "createOrigin");
                                        }
                                    }}
                                    noOptionsMessage={() => "Không tìm thấy thương hiệu"} />

                                <label>Chất liệu</label>
                                <Select
                                    options={material}
                                    styles={customStyles}
                                    onChange={(selectedOption) => handleChangeSelect(selectedOption, "material", "createMaterial")}
                                    isClearable
                                    isSearchable
                                    placeholder="Chọn hoặc nhập chất liệu mới ..."
                                    value={data.material}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && e.target.value) {
                                            const newOption = { label: e.target.value, value: e.target.value, __isNew__: true };
                                            handleChangeSelect(newOption, "material", "createMaterial");
                                        }
                                    }}
                                    noOptionsMessage={() => "Không tìm thấy chất liệu"} />

                                <label>Màu</label>
                                <Select
                                    options={colors}
                                    styles={customStyles}
                                    onChange={(selectedOption) => handleChangeSelect(selectedOption, "color", "createColor")}
                                    isClearable
                                    isSearchable
                                    placeholder="Chọn hoặc nhập màu mới ..."
                                    value={data.color}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && e.target.value) {
                                            const newOption = { label: e.target.value, value: e.target.value, __isNew__: true };
                                            handleChangeSelect(newOption, "color", "createColor");
                                        }
                                    }} lab
                                    noOptionsMessage={() => "Không tìm thấy chất liệu"} />

                                <InputAdmin
                                    label={"Mã màu"}
                                    name={"idColor"}
                                    validate={'required||checkColor'}
                                    type={'text'}
                                    value={data.idColor}
                                    onChange={handleChange}
                                />
                                {listError.idColor && <label className='error-text'>{listError.idColor}</label>}
                            </div>
                        </form>
                        <div className="button">
                            <div>
                                <ButtonWed buttonAuth={false} title={"Hủy"} onClick={onClickClone} />
                            </div>
                            <div>
                                <ButtonWed
                                    buttonAuth={true}
                                    title={"OK"}
                                    // onClick={handleUpdate}
                                    onClick={() => { userCTX.onClickConfirmModel(data, selectedFile, listError) }}
                                />
                            </div>
                        </div>
                    </div>
                ) : ""
            }

        </div>
    )

}
export default EditProduct