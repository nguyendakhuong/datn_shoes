import { useState } from 'react'
import './ChangPassword.scss'
import InputAdmin from '../../../components/input/Input-admin';
import ButtonWed from '../../../components/button/Button-admin';
import { Validate } from '../../../../lib/validate/Validate';
import { ParseValid } from '../../../../lib/validate/ParseValid';
import ToastApp from '../../../../lib/notification/Toast';
import APP_LOCAL from '../../../../lib/localStorage';

const ChangePassword = () => {
    const [data, setData] = useState({
        password: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [listError, setListError] = useState({
        password: "",
        newPassword: "",
        confirmPassword: "",

    })
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
    const clearForm = () => {
        setData({
            password: "",
            newPassword: "",
            confirmPassword: ""
        })
    }
    const handleChangPassword = async () => {
        const newErrors = { ...listError }
        for (let key in data) {
            if (!data[key]) {
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
        if (data.newPassword !== data.confirmPassword) {
            return ToastApp.warning("Mật khẩu không khớp")
        }
        try {
            const token = APP_LOCAL.getTokenStorage()
            const response = await fetch(`http://localhost:3001/user/changPassword`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });
            const result = await response.json()
            if (result.status === 200) {
                ToastApp.success("Đổi mật khẩu thành công!")
                clearForm()
            } else {
                ToastApp.warning(result.message)
            }

        } catch (e) {
            console.log("Lỗi đổi mật khẩu: ", e)
        }
    }
    return (
        <div className='changPassword'>
            <h2>Thay đổi mật khẩu</h2>
            {
                <div className='form-changPassword'>
                    <InputAdmin
                        name={"password"}
                        label={"Mật khẩu hiện tại"}
                        placeholder={"Nhập mật khẩu..."}
                        validate={'required'}
                        type={'password'}
                        onChange={handleChangInput}
                        value={data.password}
                    />
                    {listError.password && <label className='error-text'>{listError.password}</label>}
                    <InputAdmin
                        name={"newPassword"}
                        label={"Mật khẩu mới"}
                        placeholder={"Nhập tên..."}
                        validate={'required'}
                        type={'password'}
                        onChange={handleChangInput}
                        value={data.newPassword}
                    />
                    {listError.newPassword && <label className='error-text'>{listError.newPassword}</label>}
                    <InputAdmin
                        name={"confirmPassword"}
                        label={"Nhập lại mật khẩu mới"}
                        placeholder={"Nhập tên..."}
                        validate={'required'}
                        type={'password'}
                        onChange={handleChangInput}
                        value={data.confirmPassword}
                    />
                    {listError.confirmPassword && <label className='error-text'>{listError.confirmPassword}</label>}

                    <div className='btn-changPassword'>
                        <ButtonWed title={"Đổi mật khẩu"} onClick={handleChangPassword} />
                    </div>
                </div>
            }
        </div>
    )
}

export default ChangePassword