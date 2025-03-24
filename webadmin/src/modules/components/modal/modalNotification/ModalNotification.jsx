import { useContext } from 'react'
import UserContext from '../../../../context/use.context'
import './ModalNotification.scss'
import { KEY_CONTEXT_USER } from '../../../../context/use.reducer'
import AppImages from '../../../../assets'
import ButtonWed from '../../button/Button-admin'

const ModalNotification = () => {
    const [userCTX, dispatch] = useContext(UserContext)
    const cloneModal = () => {
        dispatch({
            type: KEY_CONTEXT_USER.HIDE_MODAL,
        })
    }
    return (
        <div className='modal-overlay-notification' onClick={cloneModal}>
            <div className='modal' onClick={(e) => e.preventDefault()}>
                <h1>{userCTX.titleModel ?? "Thông báo"}</h1>
                <img className="icon" src={AppImages.iconNotification} alt="" />
                <label>
                    {' '}
                    {userCTX.contentModel ?? "Bạn muốn thực hiện thành động này không ?"}
                </label>
                <div className="button">
                    <div>
                        <ButtonWed buttonAuth={false} title={'Ok'} onClick={() => userCTX.onClickConfirmModel()} />
                    </div>
                </div>
            </div>

        </div>
    )
}

export default ModalNotification