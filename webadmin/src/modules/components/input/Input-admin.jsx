import { useState } from 'react'
import './Input-admin.scss'

const InputAdmin = ({
    label,
    placeholder,
    onChange = () => { },
    iconInput,
    errorText,
    iconApp,
    type,
    validate,
    name,
    required,
    value,
    readOnly,
}) => {
    const [isFocused, setIsFocused] = useState(false)
    const handleFocus = () => {
        setIsFocused(true)
    }
    const handleBlur = () => {
        setIsFocused(false)
    }

    return (
        <div className="InputAdmin">
            <label className="InputAdmin-label">
                {label} {required && <span>*</span>}
            </label>
            <div className={`InputAdmin-input ${isFocused ? 'isFocused' : ''} `}>
                <input
                    className={`InputAdmin-input__inputText ${readOnly ? 'disable_wed_input' : ''
                        } `}
                    type={type}
                    placeholder={placeholder}
                    onChange={onChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    name={name}
                    validate={validate}
                    value={value}
                    readOnly={readOnly}
                />
                <div className="InputAdmin-input__icon">
                    {iconApp ? (
                        <img src={iconApp} alt="" />
                    ) : (
                        <i className={iconInput ? iconInput : ''}></i>
                    )}
                </div>
            </div>
            <span className="InputAdmin-errorText">{errorText}</span>
        </div>
    )
}
export default InputAdmin
