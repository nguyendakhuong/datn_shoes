import { useContext, useEffect, useState } from 'react'
import APP_LOCAL from '../../../../lib/localStorage'
import './ShippingAddress.scss'
import InputAdmin from '../../../components/input/Input-admin'
import ButtonWed from '../../../components/button/Button-admin'
import { ParseValid } from '../../../../lib/validate/ParseValid'
import { Validate } from '../../../../lib/validate/Validate'
import ToastApp from '../../../../lib/notification/Toast'
import UserContext from '../../../../context/use.context'
import { KEY_CONTEXT_USER } from '../../../../context/use.reducer'
const ShippingAddress = () => {
    const [userCtx, dispatch] = useContext(UserContext)
    const [formData, setFormData] = useState({
        address: "", // địa chỉ
        commune: "", // xã
        description: "",
        district: "", // quận / huyện
        province: "" // tỉnh / thành phố
    })
    const [reloadData, setReloadData] = useState(false)
    const [data, setData] = useState([])
    const [listError, setListError] = useState({
        address: "",
        commune: "",
        description: "",
        district: "",
        province: ""
    })
    const handleChangInput = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
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
    }
    const clearForm = () => {
        setFormData({
            address: "",
            commune: "",
            description: "",
            district: "",
            province: ""
        })
    }

    const getAddress = async () => {
        const token = APP_LOCAL.getTokenStorage()
        try {
            const response = await fetch(`http://localhost:3001/address`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            const data = await response.json()

            if (data.status === 200) {
                setData(data.data)
                clearForm()
            }
        } catch (e) {
            console.log("Lỗi lấy thông tin người dùng: ", e)
        }
    }
    const handleUpdateAddress = async () => {
        let newErrors = { ...listError };
        const token = APP_LOCAL.getTokenStorage()
        for (let key in formData) {
            if (!formData[key]) {
                ToastApp.warning("Vui lòng điền đầy đủ thông tin!");
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
            const response = await fetch(`http://localhost:3001/address/createAddress`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });
            const result = await response.json()
            if (result.status === 200) {
                ToastApp.success("Cập nhật thành công!")
                setReloadData(true)
            } else {
                ToastApp.warning(result.message)
            }
        } catch (e) {
            console.log("Lỗi thêm địa chỉ: ", e)
        }
    }
    const handleDeleteAddress = async (id) => {
        try {
            const response = await fetch(`http://localhost:3001/address/deleteAddress/${id}`, {
                headers: {
                    Authorization: `Bearer`,
                },
            })
            const data = await response.json()

            if (data.status === 200) {
                setReloadData(true)
                ToastApp.success("Xóa thành công !")
            }
        } catch (e) {
            console.log("Lỗi xóa địa chỉ: ", e)
        }
    }
    const handleClickItemAddress = async (value) => {
        dispatch({
            type: KEY_CONTEXT_USER.SHOW_MODAL,
            payload: {
                typeModal: 'EDIT_ADDRESS_MODAL',
                dataModal: value,
                titleModel: "Sửa thông tin địa chỉ",
                onClickConfirmModel: async (formData, listError) => {
                    const token = APP_LOCAL.getTokenStorage();
                    try {
                        let newErrors = { ...listError };
                        for (let key in formData) {
                            if (!formData[key]) {
                                ToastApp.warning("Vui lòng điền đầy đủ thông tin!");
                                return;
                            }
                        }
                        for (let key in newErrors) {
                            if (newErrors[key]) {
                                ToastApp.warning("Vui lòng nhập đúng dữ liệu!");
                                return;
                            }
                        }
                        const response = await fetch(`http://localhost:3001/address/updateAddress/${value.id}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`,
                            },
                            body: JSON.stringify(formData),
                        });
                        const result = await response.json();
                        if (result.status === 200) {
                            ToastApp.success("Cập nhật thành công!");
                            setReloadData(true)
                            dispatch({ type: KEY_CONTEXT_USER.HIDE_MODAL });
                        } else {
                            ToastApp.warning(result.message || "Cập nhật thất bại!");
                        }
                    } catch (e) {
                        console.log("Lỗi cập nhật địa chỉ: ", e)
                    }
                }
            }
        })
    }
    useEffect(() => {
        getAddress()
        setReloadData(false)
    }, [reloadData])
    return (
        <div className='addressCreate'>
            <div className='form-create'>
                <InputAdmin
                    name={"address"}
                    label={"Địa chỉ"}
                    placeholder={"Nhập ..."}
                    onChange={handleChangInput}
                    value={formData.address}
                    validate={'required'}
                    type={'text'}
                />
                {listError.address && <label className='error-text'>{listError.address}</label>}
                <InputAdmin
                    name={"commune"}
                    label={"Xã"}
                    placeholder={"Nhập xã..."}
                    validate={'required'}
                    type={'text'}
                    onChange={handleChangInput}
                    value={formData.commune}
                />
                {listError.commune && <label className='error-text'>{listError.commune}</label>}
                <InputAdmin
                    name={"district"}
                    label={"Quận / huyện"}
                    placeholder={"Nhập..."}
                    validate={'required'}
                    type={'text'}
                    onChange={handleChangInput}
                    value={formData.district}
                />
                {listError.district && <label className='error-text'>{listError.district}</label>}
                <InputAdmin
                    name={"province"}
                    label={"Tỉnh / Thành phố"}
                    placeholder={"Nhập ..."}
                    validate={'required'}
                    type={'text'}
                    onChange={handleChangInput}
                    value={formData.province}
                />
                {listError.province && <label className='error-text'>{listError.province}</label>}
                <InputAdmin
                    name={"description"}
                    label={"Mô tả"}
                    placeholder={"Nhập ..."}
                    type={'text'}
                    validate={'required'}
                    onChange={handleChangInput}
                    value={formData.description}
                />
                {listError.description && <label className='error-text'>{listError.description}</label>}
                <div className='btn-create'>
                    <ButtonWed title={"Thêm địa chỉ"} onClick={handleUpdateAddress} />
                </div>
            </div>
            {
                data.length >= 1 ? data.map((value, index) => (
                    <div key={index} className='infoAddress'>
                        <div className='iconDeleteAddress' onClick={() => { handleDeleteAddress(value.id) }}>X</div>
                        <span onClick={() => { handleClickItemAddress(value) }}>Địa chỉ: {value.address} - {value.commune} - {value.district} - {value.province}</span>
                    </div>
                )) : (<div className='textNoAddress'>
                    <span>Bạn không có địa chỉ</span>
                </div>)
            }

        </div>
    )
}

export default ShippingAddress