import { useEffect } from 'react'
import './Button-admin.scss'
const ButtonWed = ({
    title,
    onClick = () => { },
    buttonAuth,
    disabledBtn,
    className,
}) => {
    useEffect(() => { }, [disabledBtn])
    return (
        <button
            disabled={disabledBtn}
            className={`btn ${buttonAuth ? 'btnAuth' : ''} ${className}`}
            onClick={onClick}>
            {title}
        </button>
    )
}
export default ButtonWed
