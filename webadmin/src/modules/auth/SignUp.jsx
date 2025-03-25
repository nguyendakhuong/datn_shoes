import { useContext, useEffect, useState } from 'react'
import APP_LOCAL from '../../lib/localStorage'
import ToastApp from '../../lib/notification/Toast'
import styles from './auth.module.scss'
import { useNavigate } from 'react-router-dom'
import InputAdmin from '../components/input/Input-admin'
import ButtonWed from '../components/button/Button-admin'
import { ParseValid } from '../../lib/validate/ParseValid'
import { Validate } from '../../lib/validate/Validate'
import UserContext from '../../context/use.context'
import { KEY_CONTEXT_USER } from '../../context/use.reducer'
// import { TYPE_MODEL } from '../components/modal'
import AppImages from '../../assets'
import ModalAdminDetail from '../components/modal/modalAdminDetails/ModalAdminDetail'

const SignUp = () => {
    const [userCtx, dispatch] = useContext(UserContext)
    const [data, setData] = useState(null)
    // const navigate = useNavigate();
    const [status, setStatus] = useState(false)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [isButtonDisabled, setIsButtonDisabled] = useState(true)

    const [reloadData, setReloadData] = useState(false);
    const [idAdmin, setIdAdmin] = useState(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)


    const [listError, setListError] = useState({
        username: '',
        password: '',
        name: '',
    })
    const [formValue, setFormValue] = useState({
        username: '',
        password: null,
        name: null,
    })
    const clearForm = () => {
        setUsername("")
        setName("")
        setPassword("")
    };
    const handleNavigateSignUp = () => {
        setStatus(true)
    }
    const signupAdmin = () => {
        const handleBackProduct = () => {
            setStatus(false)
        }
        const handlerOnChangeInput = e => {
            const { name, value } = e.target

            if (name === 'username') setUsername(value)
            if (name === 'password') setPassword(value)
            if (name === 'name') setName(value)
            const inputValue = value.trim()
            const valid = e.target.getAttribute('validate')
            const validObject = ParseValid(valid)
            const error = Validate(name, inputValue, validObject)
            const newListError = { ...listError, [name]: error }
            setListError(newListError)
            setFormValue({ ...formValue, [name]: inputValue })

            if (Object.values(newListError).some(i => i)) {
                setIsButtonDisabled(true)
            } else {
                setIsButtonDisabled(false)
            }
        }
        const handleOnClick = async () => {
            const token = APP_LOCAL.getTokenStorage();
            try {
                const response = await fetch(`http://localhost:3001/register`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password, name }),

                })
                const data = await response.json()
                if (data.status === 201) {
                    ToastApp.success("Đăng kí thành công")
                    setReloadData(true)
                    clearForm()
                } else {
                    ToastApp.warning(data.message)
                    setStatus(false)
                }
            } catch (e) {
                console.log("Lỗi : ", e)
            }
        }
        return (
            <div className={styles.containerSignup}>
                <table className="header-table">
                    <thead>
                        <tr>
                            <th colSpan="10">
                                <div className="purple-line"></div>
                                <div className={styles.headerSignUp}>
                                    <div>
                                        <button className={styles.iconBack} onClick={handleBackProduct} >
                                            <img src={AppImages.iconBack} alt='Error icon' />
                                        </button>
                                    </div>
                                    <span>{'Đăng ký tài khoản'}</span>
                                </div>
                            </th>
                        </tr>
                    </thead>
                </table>
                <div className={styles.register}>
                    <div className={styles.register_content}>
                        <h2>Đăng ký tài khoản</h2>
                        <form onSubmit={e => e.preventDefault()}>
                            <InputAdmin
                                required={true}
                                label={'Tên đăng nhập'}
                                placeholder={'Nhập'}
                                validate={'required'}
                                onChange={handlerOnChangeInput}
                                name={'username'}
                                value={username}
                                errorText={listError.username}
                                type={'text'}
                            />
                            <InputAdmin
                                required={true}
                                label={'Tên người dùng'}
                                placeholder={'Nhập'}
                                validate={'required'}
                                onChange={handlerOnChangeInput}
                                name={'name'}
                                value={name}
                                errorText={listError.name}
                                type={'text'}
                            />

                            <InputAdmin
                                required={true}
                                label={'Mật khẩu'}
                                placeholder={'******'}
                                type={'password'}
                                validate={'required'}
                                onChange={handlerOnChangeInput}
                                name={'password'}
                                value={password}
                                errorText={listError.password}
                            />

                            <div className={styles.button}>
                                <ButtonWed
                                    title={'Đăng ký'}
                                    buttonAuth
                                    disabledBtn={isButtonDisabled}
                                    onClick={handleOnClick}
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )
    }

    const getAccounts = async () => {
        try {
            const token = APP_LOCAL.getTokenStorage();
            const res = await fetch(`http://localhost:3001/admin/getAccountsAdmin/:token`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (data.status === 200) {
                setData(data.data)
            } else {
                ToastApp.error('Error: ' + data.message)
            }

        } catch (e) {
            console.log("Lỗi lấy danh sách tài khoảng admin")
        }
    }
    const clickItem = async (id) => {
        setIdAdmin(id)
        setIsDialogOpen(true);
    }
    const handleEdit = (id, e) => {
        e.stopPropagation();
        dispatch({
            type: KEY_CONTEXT_USER.SHOW_MODAL,
            payload: {
                typeModal: "EDIT_ADMIN_MODAL",
                dataModal: id,
                titleModel: "Sửa thông tin admin!",
                onClickConfirmModel: async (data, listError) => {
                    const token = APP_LOCAL.getTokenStorage();
                    try {
                        let newErrors = { ...listError };
                        for (let key in data) {
                            if (key !== "updater" && !data[key]) {
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
                        const response = await fetch(`http://localhost:3001/admin/updateAdmin/${id}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`,
                            },
                            body: JSON.stringify(data),
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
                        console.log("Lỗi cập nhật admin: ", e)
                    }
                }
            }
        })
    }
    const handleStatus = async (e, id) => {
        e.stopPropagation();
        try {
            dispatch({ type: KEY_CONTEXT_USER.SET_LOADING, payload: true })
            const response = await fetch(`http://localhost:3001/admin/updateStatus/${id}`,
                {
                    method: 'GET',
                });
            const data = await response.json();
            if (data.status === 200) {
                ToastApp.success("Cập nhật trạng thái thành công")
                setReloadData(true)
            } else {
                ToastApp.error('Error: ' + data.message);
            }
        } catch (e) {
            console.log("Lỗi", e)
        } finally {
            dispatch({ type: KEY_CONTEXT_USER.SET_LOADING, payload: false })
        }
    }
    useEffect(() => {
        getAccounts();
        setReloadData(false);
    }, [reloadData]);
    return (
        <div className="container">
            {
                status ? (
                    <div>{signupAdmin()}</div>
                ) : <div className="product-container">
                    <table className="header-table">
                        <thead>
                            <tr>
                                <th colSpan="10">
                                    <div className="purple-line"></div>
                                    <div className={styles.createAccount}>
                                        <span>Danh sách tài khoản quản lý</span>
                                        <button className={styles.createAdminButton} onClick={handleNavigateSignUp}>+ Tạo tài khoản mới</button>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                    </table>
                    <div className="product-table-container">
                        <ModalAdminDetail isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} id={idAdmin} />
                        <table className="product-table">
                            <thead>
                                <tr>
                                    <th>Mã nhân viên</th>
                                    <th>Tên đăng nhập</th>
                                    <th>Tên</th>
                                    <th>Email</th>
                                    <th>Giới tính</th>
                                    <th>Ngày sinh</th>
                                    <th>Số điện thoại</th>
                                    <th>Chức vụ</th>
                                    <th>Người tạo</th>
                                    <th>Người cập nhật</th>
                                    <th>Trạng thái</th>
                                    <th>Cập nhật</th>
                                    { }
                                </tr>
                            </thead>
                            {
                                data ? <tbody >
                                    {data.map(account => (
                                        <tr key={account.id} onClick={() => { clickItem(account.id) }}>
                                            <td>{account.employeeCode}</td>
                                            <td>{account.username}</td>
                                            <td>{account.name}</td>
                                            <td>{account.email}</td>
                                            <td>{account.sex}</td>
                                            <td>{account.dob}</td>
                                            <td>{account.phoneNumber}</td>
                                            <td>{account.position}</td>
                                            <td>{account.creator}</td>
                                            <td>{account.updater}</td>
                                            <td><button onClick={(e) => handleStatus(e, account.id)} className={account?.status === 1 ? 'active-product' : 'inactive-product'}>
                                                {account?.status === 1 ? "Hoạt động" : "Không hoạt động"}
                                            </button></td>
                                            <td>

                                                <button onClick={(e) => handleEdit(account.id, e)}>
                                                    <img src={AppImages.editIcon} alt="Edit" style={{ width: "20px" }} />
                                                </button>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                                    : <div>
                                        Đang tải
                                    </div>
                            }
                        </table>
                    </div>
                </div>
            }
        </div>
    )
}
export default SignUp