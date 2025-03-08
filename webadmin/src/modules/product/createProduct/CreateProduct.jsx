import './CreateProduct.scss';
import InputAdmin from '../../components/input/Input-admin';
import { useEffect, useState } from 'react';
import { Validate } from '../../../lib/validate/Validate';
import { ParseValid } from '../../../lib/validate/ParseValid';
import ToastApp from '../../../lib/notification/Toast';
import APP_LOCAL from '../../../lib/localStorage';
import Select from "react-select";
import ButtonWed from '../../components/button/Button-admin';
const CreateProduct = ({ handleBack }) => {
    const [colors, setColors] = useState([]);
    const [trademark, setTrademark] = useState([]);
    const [origin, setOrigin] = useState([]);
    const [material, setMaterial] = useState([]);
    const [selectedColor, setSelectedColor] = useState([]);
    const [imagePreview, setImagePreview] = useState({});

    const [listError, setListError] = useState({
        name: "Không được để trống",
        description: "Không được để trống",

    });
    const [listErrorDetails, setListErrorDetails] = useState({
        quantity: {},
        colorCode: {},
        price: {},
        size: {},
    })

    const [dataCreateProduct, setDataCreateProduct] = useState({
        name: '',
        description: '',
        material: '', // chất liệu
        origin: '', // xuất xứ
        trademark: '', // thương hiệu

    });
    const [dataProductDetails, setDataProductDetails] = useState([])

    const clearForm = () => {
        setDataCreateProduct({
            name: '',
            description: '',
            material: '',
            origin: '',
            trademark: ''
        });
        setDataProductDetails([]);
        setImagePreview({})
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

    const onChangeInput = (e, index) => {
        const { name, value } = e.target;
        setDataCreateProduct({ ...dataCreateProduct, [name]: value });

        setDataProductDetails(prev => {
            if (name === "colorCode") {
                const updatedColor = prev[index].color;
                return prev.map(item =>
                    item.color === updatedColor ? { ...item, colorCode: value } : item
                );
            } else {
                return prev.map((detail, i) =>
                    i === index ? { ...detail, [name]: value } : detail
                );
            }
        });

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

        setListErrorDetails(prevErrors => {
            const newErrors = { ...prevErrors };
            if (!newErrors[index]) {
                newErrors[index] = {};
            }
            newErrors[index][name] = error;

            return newErrors;
        });
    }

    const handleChangeSelect = async (selectedOption, name, nameAPI) => {
        if (!selectedOption) return;
        const token = APP_LOCAL.getTokenStorage();
        if (!token) {
            return ToastApp.warning("Bạn cần phải đăng nhập! ")
        }
        setDataCreateProduct(prev => ({
            ...prev,
            [name]: selectedOption
        }));

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
                        setDataCreateProduct(prev => ({
                            ...prev,
                            trademark: selectedOption
                        }));
                        ToastApp.success("Thêm thương hiệu thành công!");
                    }
                    if (name === 'origin') {
                        const newOrigin = { label: selectedOption.label, value: selectedOption.label };
                        setOrigin(prevTrademark => [...prevTrademark, newOrigin]);
                        setDataCreateProduct(prev => ({
                            ...prev,
                            origin: selectedOption
                        }));
                        ToastApp.success("Thêm xuất xứ thành công!");
                    }
                    if (name === 'material') {
                        const newMaterial = { label: selectedOption.label, value: selectedOption.label };
                        setMaterial(prevTrademark => [...prevTrademark, newMaterial]);
                        setDataCreateProduct(prev => ({
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

    const handleChangeColor = async (selectedOption) => {

        if (!selectedOption) return;
        const token = APP_LOCAL.getTokenStorage();
        if (!token) {
            return ToastApp.warning("Bạn cần phải đăng nhập! ")
        }
        setSelectedColor(selectedOption);


        setDataProductDetails(prev => {
            const existingItem = prev.find(item => item.color === selectedOption.label);
            const colorCode = selectedOption.colorCode || (existingItem ? existingItem.colorCode : "");
            const image = existingItem ? existingItem.image : null;
            return prev.map(item =>
                item.color === selectedOption.label
                    ? { ...item, colorCode, image }
                    : item
            ).concat({
                quantity: '',
                price: '',
                color: selectedOption.label,
                colorCode,
                size: '',
                image,
            });
        });
        if (selectedOption.__isNew__) {
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
                ToastApp.error(error.message)
            }
        }
    }

    const handleImageChange = (e, index) => {
        const file = e.target.files[0];
        if (!file) return;
        if (index < 0 || index >= dataProductDetails.length) return;

        const objectURL = URL.createObjectURL(file);
        const updatedColor = dataProductDetails[index].color;

        setDataProductDetails(prev => prev.map(item =>
            item.color === updatedColor
                ? { ...item, image: file }
                : item
        ));

        setImagePreview(prev => {
            const newPreview = { ...prev };
            dataProductDetails.forEach((item, i) => {
                if (item.color === updatedColor) {
                    newPreview[i] = objectURL;
                }
            });
            return newPreview;
        });
    };

    const handleDeleteItem = (index) => {
        setDataProductDetails((prev) => {
            const updatedList = prev.filter((_, i) => i !== index);
            setImagePreview(updatedList.map(item => item.image || null));
            return updatedList;
        });
    };

    const handleSubmit = async () => {
        const token = APP_LOCAL.getTokenStorage();
        let newErrors = { ...listError };

        for (let key in dataCreateProduct) {
            if (!dataCreateProduct[key]) {
                ToastApp.warning("Vui lòng điền đầy đủ thông tin sản phẩm!");
                return;
            }
        }

        if (dataProductDetails.length === 0) {
            return ToastApp.warning("Cần thêm chi tiết sản phẩm ở khi chọn màu")
        }
        for (let item of dataProductDetails) {
            for (let key in item) {
                if (!item[key]) {
                    ToastApp.warning("Vui lòng điền đầy đủ thông tin chi tiết sản phẩm!");
                    return;
                }
            }
        }
        for (let key in newErrors) {
            if (newErrors[key]) {
                ToastApp.warning("Vui lòng nhập đúng dữ liệu!");
                return;
            }
        }
        const checkDuplicateSize = {};
        for (let item of dataProductDetails) {
            const { color, size } = item;
            const key = `${color}-${size}`;

            if (checkDuplicateSize[key]) {
                return ToastApp.warning(`Màu ${color} đã tồn tại kích thước ${size}, vui lòng chọn size khác!`);
            }

            checkDuplicateSize[key] = true;
        }
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', dataCreateProduct.name);
            formDataToSend.append('description', dataCreateProduct.description);
            formDataToSend.append('trademark', dataCreateProduct.trademark.label);
            formDataToSend.append('origin', dataCreateProduct.origin.label);
            formDataToSend.append('material', dataCreateProduct.material.label);
            dataProductDetails.forEach((item, index) => {
                formDataToSend.append(`details[${index}][color]`, item.color);
                formDataToSend.append(`details[${index}][colorCode]`, item.colorCode);
                formDataToSend.append(`details[${index}][price]`, item.price);
                formDataToSend.append(`details[${index}][quantity]`, item.quantity);
                formDataToSend.append(`details[${index}][size]`, item.size);
                formDataToSend.append(`image`, item.image);
            });

            const response = await fetch(`http://localhost:3001/product/createProduct`, {
                method: "POST",
                headers: {
                    // "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: formDataToSend,
            });
            const data = await response.json();
            if (data.status === 200) {
                ToastApp.success(data.message)
                clearForm()
            } else {
                ToastApp.warning(data.message)
            }
        } catch (error) {
            console.log("Lỗi: ", error)
        }
    }

    useEffect(() => {
        getColor();
        getTrademark();
        getMaterial();
        getOrigin();
    }, [])
    const customStyles = {
        control: (provided) => ({
            ...provided,
            borderRadius: "8px",
            boxShadow: "none",
            textAlign: "left"
        }),
        option: (provided) => ({ ...provided, colors: "black" })
    }
    console.log(imagePreview)
    return (
        <div className='CreateProduct-container'>
            <table className='header-table'>
                <thead>
                    <tr>
                        <th colSpan='1'>
                            <div className='headerCreateProduct'>
                                <div className='button-back-product'>
                                    <button onClick={handleBack}>Quay lại</button>
                                </div>
                                <span>Thêm sản phẩm</span>
                            </div>
                        </th>
                    </tr>
                </thead>
            </table>
            <div className='form_add'>
                <form
                    onSubmit={(e) => e.preventDefault()}
                    encType='multipart/form-data'
                    onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}>
                    <div className='item-flex '>
                        <div className='item_name input-product'>
                            <InputAdmin
                                name={"name"}
                                label={"Tên sản phẩm"}
                                placeholder={"Nhập tên sản phẩm ..."}
                                validate={'required||minLength:1||maxLength:30'}
                                type={'text'}
                                onChange={onChangeInput}
                                value={dataCreateProduct.name}
                            />
                            {listError.name && <label className='error-text'>{listError.name}</label>}
                        </div>
                        <div className='item_trademark input-product'>
                            <label>Thương hiệu</label>
                            <div className='select-item'>
                                <Select
                                    options={trademark}
                                    styles={customStyles}
                                    onChange={(selectedOption) => handleChangeSelect(selectedOption, "trademark", "createTrademark")}
                                    isClearable
                                    isSearchable
                                    placeholder="Chọn hoặc nhập thương hiệu mới ..."
                                    value={dataCreateProduct.trademark}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && e.target.value) {
                                            const newOption = { label: e.target.value, value: e.target.value, __isNew__: true };
                                            handleChangeSelect(newOption, "trademark", "createTrademark");
                                        }
                                    }}
                                    noOptionsMessage={() => "Không tìm thấy thương hiệu"} />
                            </div>
                        </div>
                        <div className='item_origin input-product'>
                            <label>Xuất xứ</label>
                            <div className='select-item'>
                                <Select
                                    options={origin}
                                    styles={customStyles}
                                    onChange={(selectedOption) => handleChangeSelect(selectedOption, "origin", "createOrigin")}
                                    isClearable
                                    isSearchable
                                    placeholder="Chọn hoặc nhập xuất xứ mới ..."
                                    value={dataCreateProduct.origin}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && e.target.value) {
                                            const newOption = { label: e.target.value, value: e.target.value, __isNew__: true };
                                            handleChangeSelect(newOption, "origin", "createOrigin");
                                        }
                                    }}
                                    noOptionsMessage={() => "Không tìm thấy thương hiệu"} />
                            </div>

                        </div>
                        <div className='item_material input-product'>
                            <label>Chất liệu</label>
                            <div className='select-item'>
                                <Select
                                    options={material}
                                    styles={customStyles}
                                    onChange={(selectedOption) => handleChangeSelect(selectedOption, "material", "createMaterial")}
                                    isClearable
                                    isSearchable
                                    placeholder="Chọn hoặc nhập chất liệu mới ..."
                                    value={dataCreateProduct.material}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && e.target.value) {
                                            const newOption = { label: e.target.value, value: e.target.value, __isNew__: true };
                                            handleChangeSelect(newOption, "material", "createMaterial");
                                        }
                                    }}
                                    noOptionsMessage={() => "Không tìm thấy chất liệu"} />
                            </div>
                        </div>
                    </div>
                    <div className='textarea input-container'>
                        <textarea
                            placeholder={"Nhập mô tả sản phẩm ..."}
                            onChange={onChangeInput}
                            name={'description'}
                            value={dataCreateProduct.description || ''}
                            validate={'required'}
                        ></textarea>
                        {listError.description && <label className='error-text'>{listError.description}</label>}
                    </div>
                    <div>
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
                        {
                            dataProductDetails.length > 0 ?
                                (
                                    dataProductDetails.map((detail, index) => (
                                        <div key={index} className='item-flex center'>
                                            <button className="delete-button" onClick={() => handleDeleteItem(index)}>X</button>
                                            <div className='item_color input-container'>
                                                <InputAdmin
                                                    name={"color"}
                                                    label={"Tên màu"}
                                                    placeholder={"Nhập tên màu ..."}
                                                    validate={'required'}
                                                    type={'text'}
                                                    onChange={(e) => onChangeInput(e, index)}
                                                    value={detail.color}
                                                    readOnly={true}
                                                />
                                            </div>
                                            <div className='item_colorCode input-container'>
                                                <InputAdmin
                                                    name={"colorCode"}
                                                    label={"Mã màu"}
                                                    placeholder={"Nhập mã màu ..."}
                                                    validate={'required||checkColor'}
                                                    type={'text'}
                                                    onChange={(e) => onChangeInput(e, index)}
                                                    value={detail.colorCode}
                                                />

                                                {listErrorDetails[index]?.colorCode && <label className='error-text'>{listErrorDetails[index]?.colorCode}</label>}
                                            </div>
                                            <div className='item_quantity input-container'>
                                                <InputAdmin
                                                    name={"quantity"}
                                                    label={"Số lượng"}
                                                    placeholder={"Nhập số lượng ..."}
                                                    validate={'required||checkNumber||checkNegative'}
                                                    type={'number'}
                                                    onChange={(e) => onChangeInput(e, index)}
                                                    value={detail.quantity}
                                                />
                                                {listErrorDetails[index]?.quantity && <label className='error-text'>{listErrorDetails[index]?.quantity}</label>}
                                            </div>
                                            <div className='item_price input-container'>
                                                <InputAdmin
                                                    name={"price"}
                                                    label={"Giá"}
                                                    placeholder={"Nhập giá sản phẩm ..."}
                                                    validate={'required||checkNumber||checkNegative'}
                                                    type={'text'}
                                                    onChange={(e) => onChangeInput(e, index)}
                                                    value={detail.price}
                                                />
                                                {listErrorDetails[index]?.price && <label className='error-text'>{listErrorDetails[index]?.price}</label>}
                                            </div>
                                            <div className='item_size input-container'>
                                                <InputAdmin
                                                    name={"size"}
                                                    label={"Kích thước"}
                                                    placeholder={"Nhập size sản phẩm ..."}
                                                    validate={'required||checkNumber||checkNegative'}
                                                    type={'text'}
                                                    onChange={(e) => onChangeInput(e, index)}
                                                    value={detail.size}
                                                />
                                                {listErrorDetails[index]?.size && <label className='error-text'>{listErrorDetails[index]?.size}</label>}
                                            </div>
                                            <div className="file_inputs">
                                                <div>
                                                    <label htmlFor={`file-upload-${index}`} className="btn_image">{imagePreview[index] ? "Chọn ảnh khác" : "Thêm ảnh"}</label>
                                                    <input id={`file-upload-${index}`} type="file" name="image" onChange={(e) => handleImageChange(e, index)} />
                                                </div>
                                                {imagePreview[index] && (
                                                    <div className="image">
                                                        <img src={imagePreview[index]} alt="Preview" style={{ width: 100, height: 100 }} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : <div></div>
                        }
                    </div>
                    <div className='btn_submit'>
                        <ButtonWed
                            title={"Thêm sản phẩm"}
                            onClick={handleSubmit} />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProduct;