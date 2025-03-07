import { useContext, useState } from 'react'
import './ModalEditAddress.scss'
import { ParseValid } from '../../../../lib/validate/ParseValid'
import { Validate } from '../../../../lib/validate/Validate'
import ButtonWed from '../../button/Button-admin'
import InputAdmin from '../../input/Input-admin'
import UserContext from '../../../../context/use.context'
import { KEY_CONTEXT_USER } from '../../../../context/use.reducer'

const ModalEditAddress = ({ data }) => {
    const [userCTX, dispatch] = useContext(UserContext);
    const [formData, setFormData] = useState(data)
    const [listError, setListError] = useState({
        address: "",
        commune: "",
        description: "",
        district: "",
        province: ""
    })
    const handleChangInput = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        const inputValue = value.trim();
        const valid = e.target.getAttribute('validate');
        const validObject = ParseValid(valid);
        const error = Validate(
            name,
            inputValue,
            validObject,
        );
        const newListError = { ...listError, [name]: error };
        setListError(newListError);
    }
    const onClickClone = () => {
        dispatch({
            type: KEY_CONTEXT_USER.HIDE_MODAL,
        })
    }
    return (
        <div className='addressUpdate'>
            <h2>Cập nhật thông tin địa chỉ</h2>
            <div className='form-update'>
                <InputAdmin
                    name={"address"}
                    label={"Địa chỉ"}
                    placeholder={"Nhập ..."}
                    onChange={handleChangInput}
                    value={formData.address}
                    validate={'required'}
                    type={'text'}
                />
                {listError.address && <label className='error-text'>{listError.address}</label>}
                <InputAdmin
                    name={"commune"}
                    label={"Xã"}
                    placeholder={"Nhập xã..."}
                    validate={'required'}
                    type={'text'}
                    onChange={handleChangInput}
                    value={formData.commune}
                />
                {listError.commune && <label className='error-text'>{listError.commune}</label>}
                <InputAdmin
                    name={"district"}
                    label={"Quận / huyện"}
                    placeholder={"Nhập..."}
                    validate={'required'}
                    type={'text'}
                    onChange={handleChangInput}
                    value={formData.district}
                />
                {listError.district && <label className='error-text'>{listError.district}</label>}
                <InputAdmin
                    name={"province"}
                    label={"Tỉnh / Thành phố"}
                    placeholder={"Nhập ..."}
                    validate={'required'}
                    type={'text'}
                    onChange={handleChangInput}
                    value={formData.province}
                />
                {listError.province && <label className='error-text'>{listError.province}</label>}
                <InputAdmin
                    name={"description"}
                    label={"Mô tả"}
                    placeholder={"Nhập ..."}
                    type={'text'}
                    validate={'required'}
                    onChange={handleChangInput}
                    value={formData.description}
                />
                {listError.description && <label className='error-text'>{listError.description}</label>}
                <div className='btn-update'>
                    <ButtonWed title={"Hủy"} onClick={onClickClone} />
                    <ButtonWed title={"Cập nhật"} onClick={() => { userCTX.onClickConfirmModel(formData, listError) }} />
                </div>
            </div>

        </div>
    )
}
export default ModalEditAddress