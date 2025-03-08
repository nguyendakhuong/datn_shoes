import AppImages from '../../../../assets';
import { FaSearch, FaUser, FaShoppingCart } from 'react-icons/fa';
import './HeaderUser.scss'
import { useNavigate } from 'react-router-dom';
import APP_LOCAL from '../../../../lib/localStorage';
import { useContext, useEffect, useRef, useState } from 'react';
import UserContext from '../../../../context/use.context';
import { KEY_CONTEXT_USER } from '../../../../context/use.reducer';

const HeaderUser = () => {
    const [{ accountType }, dispatch] = useContext(UserContext);
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
                    <li onClick={handleHome}>GIỚI THIỆU</li>
                    {data.length > 0 ? data.map((v, i) => (
                        <div>
                            <li onClick={() => handleClickTrademark(v.name)}>{v.name}</li>
                        </div>
                    )) : null}
                    <li>HÃNG KHÁC</li>
                </ul>
            </nav>
            <div className="header-icons">
                <FaSearch className="icon" />
                {token ? (
                    <div className="user-menu" ref={dropdownRef}>
                        <FaUser className="icon" onClick={toggleDropdown} />
                        {showDropdown && (
                            <div className="dropdown">
                                {accountType === "admin" ? <button onClick={() => navigate('/admin')}>quản lí trang web</button> : null}
                                {accountType === "user" ? <button onClick={() => navigate('/info-user')}>Trang cá nhân</button> : null}
                                <button onClick={() => {
                                    dispatch({
                                        type: KEY_CONTEXT_USER.SET_ACCOUNT_TYPE,
                                        payload: '',
                                    })
                                    APP_LOCAL.setTokenStorage('')
                                    setShowDropdown(false)
                                    navigate('/login')
                                }}>
                                    Đăng xuất
                                </button>
                            </div>
                        )}
                        <div className="cart-icon" onClick={() => { navigate('/cart') }}>
                            <FaShoppingCart className="icon" />
                            {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
                        </div>
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