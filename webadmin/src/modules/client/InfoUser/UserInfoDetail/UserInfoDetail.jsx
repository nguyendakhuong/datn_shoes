import { useEffect, useState } from 'react'
import APP_LOCAL from '../../../../lib/localStorage'
import './UserInfroDetail.scss'
import InputAdmin from '../../../components/input/Input-admin'
import ButtonWed from '../../../components/button/Button-admin'
import { ParseValid } from '../../../../lib/validate/ParseValid'
import { Validate } from '../../../../lib/validate/Validate'
import ToastApp from '../../../../lib/notification/Toast'

const UserInfoDetail = () => {
    const [data, setData] = useState({
        email: "",
        name: "",
        username: "",
        dob: "",
        sex: "",
        id: "",
        phoneNumber: ""
    })
    const [typeSex, setTypeSex] = useState(1)

    const [reloadData, setReloadData] = useState(false)
    const [listError, setListError] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        dob: ""
    })
    const getUser = async () => {
        const token = APP_LOCAL.getTokenStorage()
        try {
            const response = await fetch(`http://localhost:3001/user`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            const data = await response.json()
            if (data.status === 200) {
                setData(data.data)
            }
        } catch (e) {
            console.log("Lỗi lấy thông tin người dùng: ", e)
        }
    }
    const handleChangeRadio = (e) => {
        setTypeSex(parseInt(e.target.value));
    }
    const handleChangInput = (e) => {
        const { name, value } = e.target;
        setData({ ...data, [name]: value });
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
    const handleUpdateUser = async () => {
        let newErrors = { ...listError };
        let updateData = { ...data, sex: typeSex === 1 ? "Nam" : "Nữ" }
        for (let key in updateData) {
            if (!updateData[key]) {
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
            const response = await fetch(`http://localhost:3001/user/updateUser`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer`,
                },
                body: JSON.stringify(updateData),
            });
            const result = await response.json()
            if (result.status === 200) {
                ToastApp.success("Cập nhật thành công!")
                setReloadData(true)
            } else {
                ToastApp.warning(result.message)
            }
        } catch (e) {
            console.log("Lỗi cập nhật thông tin người dùng: ", e)
        }
    }
    useEffect(() => {
        getUser()
        setReloadData(false)
    }, [reloadData])
    useEffect(() => {
        if (data?.sex) {
            setTypeSex(data.sex === "Nam" ? 1 : 2);
        }
    }, [data])
    return (
        <div className='userInfoDetail'>
            <h2>Cập nhật thông tin</h2>
            {data ? (
                <div className='form-update'>
                    <InputAdmin
                        name={"username"}
                        label={"Tên đăng nhập"}
                        onChange={handleChangInput}
                        value={data.username}
                        readOnly
                    />
                    <InputAdmin
                        name={"name"}
                        label={"Tên người dùng"}
                        placeholder={"Nhập tên..."}
                        validate={'required||maxLength:30'}
                        type={'text'}
                        onChange={handleChangInput}
                        value={data.name}
                    />
                    {listError.name && <label className='error-text'>{listError.name}</label>}
                    <InputAdmin
                        name={"email"}
                        label={"Email"}
                        placeholder={"Nhập email..."}
                        validate={'required||regEmail'}
                        type={'text'}
                        onChange={handleChangInput}
                        value={data.email}
                    />
                    {listError.email && <label className='error-text'>{listError.email}</label>}
                    <div className="type-input">
                        <label>
                            Giới tính:
                        </label>
                        <div>
                            <input
                                type="radio"
                                name="type"
                                value={1}
                                checked={typeSex === 1}
                                onChange={handleChangeRadio}
                            />
                            <span></span> Nam
                        </div>
                        <div>
                            <input
                                type="radio"
                                name="type"
                                value={2}
                                checked={typeSex === 2}
                                onChange={handleChangeRadio}
                            />
                            <span></span> Nữ
                        </div>
                    </div>
                    <InputAdmin
                        name={"phoneNumber"}
                        label={"Số diện thoại"}
                        placeholder={"Nhập số điện thoại ..."}
                        validate={'required||checkNumber||checkPhoneNumber'}
                        type={'text'}
                        onChange={handleChangInput}
                        value={data.phoneNumber}
                    />
                    {listError.phoneNumber && <label className='error-text'>{listError.phoneNumber}</label>}
                    <InputAdmin
                        name={"dob"}
                        label={"Ngày sinh"}
                        type={'date'}
                        validate={'checkYear'}
                        onChange={handleChangInput}
                        value={data.dob ? data.dob.split('T')[0] : ""}
                    />
                    {listError.dob && <label className='error-text'>{listError.dob}</label>}
                    <div className='btn-update'>
                        <ButtonWed title={"Cập nhật"} onClick={handleUpdateUser} />
                    </div>
                </div>
            ) : (
                <div>
                    Đang tải ...
                </div>
            )}
        </div>
    )
}
export default UserInfoDetail