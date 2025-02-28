import React from 'react';
import './Header.scss';
import AppImages from '../../../assets';

const Header = () => {
    return (
        <header className="header">
            <div className="logo">
                <img src={AppImages.logo} alt="Logo" />
            </div>
        </header>
    );
}

export default Header;
