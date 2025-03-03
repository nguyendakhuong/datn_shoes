import { useContext, useEffect, useState } from 'react';
import './EditAdmin.scss'
import ToastApp from '../../../../lib/notification/Toast';
import APP_LOCAL from '../../../../lib/localStorage';
import UserContext from '../../../../context/use.context';
import InputAdmin from '../../input/Input-admin';
import ButtonWed from '../../button/Button-admin';
import { ParseValid } from '../../../../lib/validate/ParseValid';
import { Validate } from '../../../../lib/validate/Validate';
import { KEY_CONTEXT_USER } from '../../../../context/use.reducer';

const EditAdmin = ({ id }) => {
    const [userCTX, dispatch] = useContext(UserContext);
    const [data, setData] = useState(null)
    const [listError, setListError] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        position: "",
        sex: "",
        address: ""
    });

    const getAdmin = async () => {
        const token = APP_LOCAL.getTokenStorage()
        try {
            const response = await fetch(`http://localhost:3001/admin/getAdminId/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.status === 200) {
                setData(data.data);
            } else {
                ToastApp.warning(data.message);
            }
        } catch (e) {
            console.log(e)
        }
    };
    const handleChange = (e) => {
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
    const onClickClone = () => {
        dispatch({
            type: KEY_CONTEXT_USER.HIDE_MODAL,
        })
    }
    useEffect(() => {
        getAdmin();
    }, [id]);

    return (
        <div className='modal-editAdmin'>
            <h1>{userCTX.titleModel ?? "Thông báo"}</h1>
            {
                data ? (
                    <form onSubmit={(e) => e.preventDefault()}>
                        <InputAdmin
                            label={"Mã tài khoản"}
                            name={"employeeCode"}
                            value={data.employeeCode}
                            readOnly={true}
                        />
                        <InputAdmin
                            label={"Tên đăng nhập"}
                            name={"username"}
                            validate={'required'}
                            type={'text'}
                            value={data.username}
                            readOnly
                        />
                        <InputAdmin
                            label={"Tên người dùng"}
                            name={"name"}
                            validate={'required'}
                            type={'text'}
                            value={data.name}
                            onChange={handleChange}
                        />
                        {listError.name && <label className='error-text'>{listError.name}</label>}
                        <InputAdmin
                            label={"Email"}
                            name={"email"}
                            validate={'required||regEmail'}
                            type={'text'}
                            value={data.email}
                            onChange={handleChange}
                        />
                        {listError.email && <label className='error-text'>{listError.email}</label>}
                        <InputAdmin
                            label={"Số điện thoại"}
                            name={"phoneNumber"}
                            validate={'required'}
                            type={'text'}
                            value={data.phoneNumber}
                            onChange={handleChange}
                        />
                        {listError.phoneNumber && <label className='error-text'>{listError.phoneNumber}</label>}
                        <InputAdmin
                            label={"Địa chỉ"}
                            name={"address"}
                            validate={'required'}
                            type={'text'}
                            value={data.address}
                            onChange={handleChange}
                        />
                        {listError.address && <label className='error-text'>{listError.address}</label>}
                        <InputAdmin
                            label={"Chức vụ"}
                            name={"position"}
                            validate={'required'}
                            type={'text'}
                            value={data.position}
                            onChange={handleChange}
                        />
                        {listError.position && <label className='error-text'>{listError.position}</label>}
                        <InputAdmin
                            label={"Giới tính"}
                            name={"sex"}
                            validate={'required'}
                            type={'text'}
                            value={data.sex}
                            onChange={handleChange}
                        />
                        {listError.sex && <label className='error-text'>{listError.sex}</label>}
                        <InputAdmin
                            label={"Ngày sinh"}
                            name={"dob"}
                            validate={'required'}
                            type={'date'}
                            value={data.dob}
                            onChange={handleChange}
                        />

                        <div className="button">
                            <div>
                                <ButtonWed buttonAuth={false} title={"Hủy"} onClick={onClickClone} />
                            </div>
                            <div>
                                <ButtonWed
                                    buttonAuth={true}
                                    title={"OK"}
                                    onClick={() => { userCTX.onClickConfirmModel(data, listError) }}
                                />
                            </div>
                        </div>
                    </form>
                ) : null
            }
        </div>
    )
}

export default EditAdmin