import { useContext, useState } from 'react';
import './ModalEditOrderProduct.scss'
import UserContext from '../../../../context/use.context';
import InputAdmin from '../../input/Input-admin';
import ButtonWed from '../../button/Button-admin';
import { ParseValid } from '../../../../lib/validate/ParseValid';
import { Validate } from '../../../../lib/validate/Validate';
import { KEY_CONTEXT_USER } from '../../../../context/use.reducer';

const ModalEditOrderProduct = () => {
    const [userCTX, dispatch] = useContext(UserContext);
    const [quantity, setQuantity] = useState(null)

    const [listError, setListError] = useState({
        quantity: ""
    });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setQuantity(value);
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
        <div className='modal-editOrderProduct'>
            <h1>{userCTX.titleModel ?? "Thông báo"}</h1>
            <InputAdmin
                label={"Số lượng"}
                name={"quantity"}
                validate={'required||checkNumber'}
                type={'text'}
                value={quantity}
                onChange={handleChange}
            />
            {listError.quantity && <label className='error-text'>{listError.quantity}</label>}
            <div className="button">
                <div>
                    <ButtonWed buttonAuth={false} title={"Hủy"} onClick={onClickClone} />
                </div>
                <div>
                    <ButtonWed
                        buttonAuth={true}
                        title={"OK"}
                        onClick={() => { userCTX.onClickConfirmModel(quantity, listError) }}
                    />
                </div>
            </div>
        </div>
    )
}
export default ModalEditOrderProduct