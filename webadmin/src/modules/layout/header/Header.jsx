import React from 'react';
import './Header.scss';
import AppImages from '../../../assets';
import { Navigate, useNavigate } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();
    return (
        <header className="header">
            <div className="logo" onClick={() => { navigate('/Home') }}>
                <img src={AppImages.logo} alt="Logo" />
            </div>
        </header>
    );
}

export default Header;
