import { useNavigate } from 'react-router-dom';
import InputAdmin from '../components/input/Input-admin';
import styles from './styles.module.scss';
import { useContext, useState } from 'react';
import UserContext from '../../context/use.context';
import { ParseValid } from '../../lib/validate/ParseValid';
import { Validate } from '../../lib/validate/Validate';
import ButtonWed from '../components/button/Button-admin';
import { KEY_CONTEXT_USER } from '../../context/use.reducer';
import ToastApp from '../../lib/notification/Toast';
import APP_LOCAL from '../../lib/localStorage';
import stylesBtn from '../auth/styles.module.scss'
import AppImages from '../../assets';


const Login = () => {
    const navigate = useNavigate();
    const [userCtx, dispatch] = useContext(UserContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [listError, setListError] = useState({
        email: '',
        password: '',
    });
    const [formValue, setFormValue] = useState({
        email: null,
        password: null,
    });

    const handlerOnChangeInput = e => {
        const { name, value } = e.target;

        if (name === 'email') setEmail(value);
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

    const handleOnClick = async () => {
        try {
            await fetch(`http://localhost:3001/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            }).then(res => {
                return res.json();
            }).then(data => {
                if (data.status === 200) {
                    APP_LOCAL.setTokenStorage(data.data.token);
                    dispatch({
                        type: KEY_CONTEXT_USER.SET_TOKEN,
                        payload: data.data.token
                    });
                    dispatch({
                        type: KEY_CONTEXT_USER.SET_ROLE,
                        payload: data.data.role
                    });
                    ToastApp.success(data.message);
                    navigate('/admin');
                } else {
                    ToastApp.warning('Error: ' + data.message);
                }

            }).catch(e => {
                console.log("Error login : ", e);
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
                    <h2>Đăng nhập</h2>
                    <form onSubmit={e => e.preventDefault()}>
                        <InputAdmin
                            required={true}
                            label={'Email'}
                            placeholder={'Nhập ...'}
                            validate={'required|regEmail'}
                            onChange={handlerOnChangeInput}
                            name={'email'}
                            value={email}
                            errorText={listError.email}
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

                        <div className={stylesBtn}>
                            <ButtonWed
                                title={'Đăng nhập'}
                                buttonAuth
                                disabledBtn={isButtonDisabled}
                                onClick={handleOnClick}
                            />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default Login;
