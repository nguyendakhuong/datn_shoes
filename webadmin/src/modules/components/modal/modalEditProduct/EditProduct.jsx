import { useContext, useEffect, useState } from 'react';
import './EditProdcut.scss'
import UserContext from '../../../../context/use.context';
import { KEY_CONTEXT_USER } from '../../../../context/use.reducer';
import ButtonWed from '../../button/Button-admin';
import InputAdmin from '../../input/Input-admin';
import ToastApp from '../../../../lib/notification/Toast';
import APP_LOCAL from '../../../../lib/localStorage';
import Select from "react-select";

const EditProduct = ({ id }) => {
    const [userCTX, dispatch] = useContext(UserContext);
    const [data, setData] = useState([]);
    const [trademark, setTrademark] = useState([]);
    const [origin, setOrigin] = useState([]);
    const [material, setMaterial] = useState([]);
    const [colors, setColors] = useState([]);
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
                setData(data.data);
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
    };
    const handleChangeSelect = async (selectedOption, name, nameAPI) => {
        if (!selectedOption) return;
        const token = APP_LOCAL.getTokenStorage();
        if (!token) {
            return ToastApp.warning("Bạn cần phải đăng nhập! ")
        }
        setData(prev => ({
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
    const handleUpdate = () => {
        dispatch({ type: KEY_CONTEXT_USER.HIDE_MODAL });
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
                                <img src={data.idImage} alt={data.productName} />
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
                                    label={"Mã màu"}
                                    name={"colorCode"}
                                    validate={'required||checkColor'}
                                    type={'text'}
                                    value={data.idColor}
                                    onChange={handleChange}
                                />
                                <InputAdmin
                                    label={"Số lượng"}
                                    name={"quantity"}
                                    validate={'required||checkNumber'}
                                    type={'number'}
                                    value={data.quantity}
                                    onChange={handleChange}
                                />
                                <InputAdmin
                                    label={"Giá bán"}
                                    name={"price"}
                                    validate={'required||checkNumber'}
                                    type={'text'}
                                    value={data.price}
                                    onChange={handleChange}
                                />
                                <InputAdmin
                                    label={"Size"}
                                    name={"size"}
                                    validate={'required||checkNumber'}
                                    type={'text'}
                                    value={data.idSize}
                                    onChange={handleChange}
                                />
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
                                <div className='select-item'>
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
                                </div>
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
                                    onClick={handleUpdate}
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