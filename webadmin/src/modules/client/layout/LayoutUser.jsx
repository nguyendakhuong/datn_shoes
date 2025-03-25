import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react';
import FooterUser from './footer/FooterUser'
import HeaderUser from './header/HeaderUser'
import './LayoutUser.scss'

const LayoutUser = () => {
    return (
        <div className='layout-user-layout'>
            <div className='header-user-layout'>
                <HeaderUser />
            </div>

            <div className='main-user-layout'>
                <Outlet />
            </div>
            <div className='footer-user-layout'>
                <FooterUser />
            </div>
        </div>
    )
}

export default LayoutUser