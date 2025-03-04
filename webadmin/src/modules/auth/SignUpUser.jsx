import { useNavigate } from 'react-router-dom';
import InputAdmin from '../components/input/Input-admin';
import styles from './auth.module.scss';
import { useContext, useState } from 'react';
import UserContext from '../../context/use.context';
import { ParseValid } from '../../lib/validate/ParseValid';
import { Validate } from '../../lib/validate/Validate';
import ButtonWed from '../components/button/Button-admin';
import ToastApp from '../../lib/notification/Toast';
import AppImages from '../../assets';


const SignUpUser = () => {
    const navigate = useNavigate();
    const [userCtx, dispatch] = useContext(UserContext);
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [listError, setListError] = useState({
        username: '',
        password: '',
        name: ''
    });
    const [formValue, setFormValue] = useState({
        username: null,
        password: null,
        name: null
    });

    const handlerOnChangeInput = e => {
        const { name, value } = e.target;
        if (name === 'username') setUsername(value);
        if (name === 'name') setName(value);
        if (name === 'password') setPassword(value);

        const inputValue = value.trim();
        const valid = e.target.getAttribute('validate');
        const validObject = ParseValid(valid);
        const error = Validate(name, inputValue, validObject);
        const newListError = { ...listError, [name]: error };
        setListError(newListError);
        setFormValue({ ...formValue, [name]: inputValue });

        if (Object.values(newListError).some(i => i)) {
            setIsButtonDisabled(true);
        } else {
            setIsButtonDisabled(false);
        }
    };
    const handleLogin = () => {
        navigate('/login');
    }

    const handleOnClick = async () => {
        try {
            await fetch(`http://localhost:3001/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, name, password }),
            }).then(res => {
                return res.json();
            }).then(data => {
                if (data.status === 201) {
                    ToastApp.success("Đăng ký thành công");
                    navigate('/login');
                } else {
                    ToastApp.warning('Error: ' + data.message);
                }

            }).catch(e => {
                console.log("Error đăng kí : ", e);
            });
        } catch (e) {
            ToastApp.error(e.message);
        }
    };


    return (
        <div className={styles.login}>
            <div className={styles.login_content}>
                <div className={styles.login_image}>
                    <img src={AppImages.login} alt="Login" />
                </div>
                <div className={styles.login_form}>
                    <h2>Đăng ký</h2>
                    <form onSubmit={e => e.preventDefault()}>
                        <InputAdmin
                            required={true}
                            label={'Tên đăng nhập'}
                            placeholder={'Nhập ...'}
                            validate={'required'}
                            onChange={handlerOnChangeInput}
                            name={'username'}
                            value={username}
                            errorText={listError.username}
                            type={'text'}
                        />
                        <InputAdmin
                            required={true}
                            label={'Tên sử dụng'}
                            placeholder={'Nhập ...'}
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

                        <div className={styles}>
                            <ButtonWed
                                title={'Đăng ký'}
                                buttonAuth
                                disabledBtn={isButtonDisabled}
                                onClick={handleOnClick}
                            />
                        </div>
                    </form>
                    <div className={styles.signUP}>
                        <label> Bạn đã có tài khoản?</label>
                        <label className={styles.signUpNow} onClick={handleLogin}>Đăng nhập ngay</label>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default SignUpUser;
