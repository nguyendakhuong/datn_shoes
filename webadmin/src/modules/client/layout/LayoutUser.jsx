import { Outlet } from 'react-router-dom'
import FooterUser from './footer/FooterUser'
import HeaderUser from './header/HeaderUser'
import './LayoutUser.scss'
const LayoutUser = () => {
    return (
        <div className='layout-user'>
            <div className='header'>
                <HeaderUser />
            </div>

            <div className='main-user'>
                <Outlet />
            </div>
            <FooterUser />
        </div>
    )
}

export default LayoutUser