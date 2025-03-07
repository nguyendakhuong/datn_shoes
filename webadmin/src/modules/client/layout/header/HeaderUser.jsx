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

    const handleLogin = () => {
        navigate('/Login');
    };
    const handleHome = () => {
        navigate('/Home');
    };
    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    }
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
            <div className="logo" onClick={handleHome}>
                <img src={AppImages.logo} alt="Logo" />
            </div>
            <nav className="nav-menu">
                <ul>
                    <li>GIỚI THIỆU</li>
                    <li>NIKE</li>
                    <li>ADIDAS</li>
                    <li>JORDAN</li>
                    <li>YEEZY</li>
                    <li>OTHER BRANDS</li>
                </ul>
            </nav>
            <div className="header-icons">
                <FaSearch className="icon" />
                {token ? (
                    <div className="user-menu" ref={dropdownRef}>
                        <FaUser className="icon" onClick={toggleDropdown} />
                        {showDropdown && (
                            <div className="dropdown">
                                <button onClick={() => navigate('/info-user')}>Trang cá nhân</button>
                                {accountType === "admin" ? <button onClick={() => navigate('/admin')}>quản lí trang web</button> : null}
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
                        <div className="cart-icon">
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