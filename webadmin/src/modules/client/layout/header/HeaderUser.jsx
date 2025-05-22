import AppImages from '../../../../assets';
import { FaSearch, FaUser, FaShoppingCart } from 'react-icons/fa';
import './HeaderUser.scss'
import { useNavigate } from 'react-router-dom';
import APP_LOCAL from '../../../../lib/localStorage';
import { useContext, useEffect, useRef, useState } from 'react';
import UserContext from '../../../../context/use.context';
import { KEY_CONTEXT_USER } from '../../../../context/use.reducer';
import SearchInput from '../../../components/searchInput/SearchInput';

const HeaderUser = () => {
    const [{ accountType, cart }, dispatch] = useContext(UserContext);
    const [showDropdown, setShowDropdown] = useState(false);
    const cartItemCount = 3;
    const navigate = useNavigate();
    const token = APP_LOCAL.getTokenStorage();
    const dropdownRef = useRef(null);
    const [data, setData] = useState([])

    const handleLogin = () => {
        navigate('/Login');
    };
    const handleHome = () => {
        navigate('/Home');
    };
    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    }
    const getTrademarks = async () => {
        try {
            const response = await fetch(`http://localhost:3001/trademark/getTrademarks`, {
                headers: {
                    Authorization: `Bearer `,
                    "Content-Type": "application/json"
                },
            })
            const data = await response.json()
            if (data.status === 200) {
                setData(data.data)
            } else {
                console.log("Lỗi lấy thương hiệu")
            }
        } catch (e) {

        }
    }
    const handleClickTrademark = (name) => {
        navigate(`/trademarkUser/${name}`);
    }
    const changeLang = (lang) => {
        dispatch({
            type: KEY_CONTEXT_USER.SET_LANGUAGE,
            payload: lang
        })
        APP_LOCAL.setLanguageStorage(lang)
    }
    useEffect(() => {
        getTrademarks()
    }, [])
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        if (showDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showDropdown]);
    return (
        <header className="header-user">
            <div className="logo">
                <img src={AppImages.logo} alt="Logo" />
            </div>
            <nav className="nav-menu">
                <ul>
                    <li onClick={handleHome}>Trang chủ</li>
                    {/* {data.length > 0 ? data.map((v, i) => (
                        <div key={i}>
                            <li onClick={() => handleClickTrademark(v.name)}>{v.name}</li>
                        </div>
                    )) : null} */}
                    <li onClick={() => navigate('/otherTrademark/all')}>Sản phẩm</li>
                    <SearchInput />
                </ul>
            </nav>
            <div className="header-icons">
                {/* <div className="header-right">
                    <div className="icon-container">
                        <div className="icon imgVN-icon">
                            <img src={AppImages.imgVN} alt="VN Icon" className="mail-icon-img" onClick={() => changeLang("vi")} />
                        </div>
                        <div className="icon imgUK-icon">
                            <img src={AppImages.imgUK} alt="EN Icon" className="notification-icon-img" onClick={() => changeLang("en")} />
                        </div>
                    </div>
                </div> */}
                {token ? (
                    <div className="user-menu" ref={dropdownRef}>
                        <FaUser className="icon" onClick={toggleDropdown} />
                        {showDropdown && (
                            <div className="dropdown">
                                {accountType === "admin" ? <button onClick={() => navigate('/admin')}>quản lí trang web</button> : null}
                                {accountType === "user" ? <button onClick={() => navigate('/info-user')}>Trang cá nhân</button> : null}
                                {accountType === "user" ? <button onClick={() => navigate('/order-user')}>Đơn hàng</button> : null}
                                <button onClick={() => {
                                    dispatch({
                                        type: KEY_CONTEXT_USER.SET_ACCOUNT_TYPE,
                                        payload: '',
                                    })
                                    APP_LOCAL.setTokenStorage('')
                                    setShowDropdown(false)
                                    navigate('/login')
                                    localStorage.removeItem("currentUser");
                                }}>
                                    Đăng xuất
                                </button>
                            </div>
                        )}
                        {accountType === "user" ?
                            (<div className="cart-icon" onClick={() => { navigate('/cart') }}>
                                <FaShoppingCart className="icon" />
                                {cartItemCount > 0 && <span className="cart-count">{cart.length}</span>}
                            </div>)
                            : null}
                    </div>
                ) : (
                    <div className="flex">
                        <div className="login" onClick={handleLogin}>
                            Đăng nhập
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default HeaderUser;