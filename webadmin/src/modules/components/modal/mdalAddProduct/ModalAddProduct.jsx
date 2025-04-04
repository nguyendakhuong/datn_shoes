import { useEffect, useState } from 'react';
import InputAdmin from '../../input/Input-admin'
import './ModalAddProduct.scss'
import ToastApp from '../../../../lib/notification/Toast';
import Select from "react-select";
import ButtonWed from '../../button/Button-admin';
import APP_LOCAL from '../../../../lib/localStorage';
import { ParseValid } from '../../../../lib/validate/ParseValid';
import { Validate } from '../../../../lib/validate/Validate';

const ModalAddProduct = ({ isOpen, onClose }) => {

    const [trademark, setTrademark] = useState([]);
    const [origin, setOrigin] = useState([]);
    const [material, setMaterial] = useState([]);

    const [listError, setListError] = useState({
        name: "Không được để trống",
        description: "Không được để trống",
    });

    const [dataCreateProduct, setDataCreateProduct] = useState({
        name: '',
        description: '',
        material: '', // chất liệu
        origin: '', // xuất xứ
        trademark: '', // thương hiệu
    });

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
        const inputValue = value.trim();
        const valid = e.target.getAttribute('validate');
        const validObject = ParseValid(valid);
        const error = Validate(
            name,
            inputValue,
            validObject,
        )
        const newListError = { ...listError, [name]: error };
        setListError(newListError);
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
                        const newTrademark = { label: data.data.name, value: data.data.brandCode };
                        setTrademark(prevTrademark => [...prevTrademark, newTrademark]);
                        setDataCreateProduct(prev => ({
                            ...prev,
                            trademark: newTrademark
                        }));
                        ToastApp.success("Thêm thương hiệu thành công!");
                    }
                    if (name === 'origin') {
                        const newOrigin = { label: data.data.name, value: data.data.originCode };
                        setOrigin(prevTrademark => [...prevTrademark, newOrigin]);
                        setDataCreateProduct(prev => ({
                            ...prev,
                            origin: newOrigin
                        }));
                        ToastApp.success("Thêm xuất xứ thành công!");
                    }
                    if (name === 'material') {
                        const newMaterial = { label: data.data.name, value: data.data.materialCode };
                        setMaterial(prevTrademark => [...prevTrademark, newMaterial]);
                        setDataCreateProduct(prev => ({
                            ...prev,
                            material: newMaterial
                        }));
                        ToastApp.success("Thêm xuất xứ thành công!");
                    }

                } else {
                    ToastApp.error(data.message);
                }
            } catch (error) {
                // ToastApp.error(error.message)
                console.log(error)
            }
        }
    }

    const clearForm = () => {
        setDataCreateProduct({
            name: '',
            description: '',
            material: '',
            origin: '',
            trademark: ''
        });
    }

    const handleSubmit = async () => {
        const token = APP_LOCAL.getTokenStorage();
        let newErrors = { ...listError };

        for (let key in dataCreateProduct) {
            if (!dataCreateProduct[key]) {
                ToastApp.warning("Vui lòng điền đầy đủ thông tin sản phẩm!");
                return;
            }
        }
        for (let key in newErrors) {
            if (newErrors[key]) {
                ToastApp.warning("Vui lòng nhập đúng dữ liệu!");
                return;
            }
        }
        try {
            const response = await fetch(`http://localhost:3001/product/createProduct`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(dataCreateProduct),
            });
            const data = await response.json();
            if (data.status === 200) {
                ToastApp.success("Thêm sản phẩm thành công !")
                clearForm()
                onClose()
            } else {
                ToastApp.warning(data.message)
            }
        } catch (error) {
            console.log("Lỗi: ", error)
        }

    }
    useEffect(() => {
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
    return (
        <>
            {isOpen && (
                <div className="modal-overlay-product" onClick={onClose}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Thêm sản phẩm</h2>
                        <form onSubmit={e => e.preventDefault()} >
                            <InputAdmin
                                label={"Tên sản phẩm"}
                                name={"name"}
                                validate={'required'}
                                type={'text'}
                                value={dataCreateProduct.name}
                                onChange={onChangeInput}
                            />
                            {listError.name && <label className='error-text'>{listError.name}</label>}
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
                        </form>
                        <div className='btn_submit'>
                            <ButtonWed
                                title={"Thêm sản phẩm"}
                                onClick={handleSubmit} />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
export default ModalAddProduct