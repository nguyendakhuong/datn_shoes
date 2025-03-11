import { useEffect, useRef, useState } from 'react';
import './ButtonDropDown.scss'
import AppImages from '../../../assets';

const ButtonDropDown = ({ buttonItem, onItemClick, orderStatus }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [disabledItems, setDisabledItems] = useState([]);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleItemClick = (key) => {
        if (!disabledItems.includes(key) && onItemClick) {
            onItemClick(key);
            setIsOpen(false);
        }
    };

    const canItemClick = (key) => {
        if (key === 'verifyOrder') {
            return orderStatus === 'createOrder' || orderStatus === 'PaidCreateOrder';
        }
        return true;
    };

    useEffect(() => {
        const newDisabledItems = buttonItem
            ? buttonItem.filter(item => !canItemClick(item.key)).map(item => item.key)
            : [];
        setDisabledItems(newDisabledItems);
    }, [orderStatus, buttonItem]);

    return (
        <div className="dropdown" ref={dropdownRef}>
            <button className="dropdown-btn" onClick={toggleDropdown}>
                <img className='iconDropdown' src={AppImages.iconDropdown} alt='Error'></img>
            </button>
            {isOpen && (
                <ul className="dropdown-menu">
                    {buttonItem &&
                        buttonItem.map((v, i) => (
                            <li
                                key={i}
                                onClick={() => handleItemClick(v.key)}
                                className={disabledItems.includes(v.key) ? 'disabledItem' : ''}
                            >
                                {v.label}
                            </li>
                        ))}
                </ul>
            )}
        </div>
    );
};

export default ButtonDropDown;
