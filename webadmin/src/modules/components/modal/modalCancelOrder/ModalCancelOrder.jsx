import { useContext, useState } from 'react'
import './ModalCancelOrder.scss'
import InputAdmin from '../../input/Input-admin'
import APP_LOCAL from '../../../../lib/localStorage'
import ToastApp from '../../../../lib/notification/Toast'
import UserContext from '../../../../context/use.context'
import { KEY_CONTEXT_USER } from '../../../../context/use.reducer'

const ModalCancelOrder = ({ orderCode }) => {
    const [userCtx, dispatch] = useContext(UserContext)
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    return (
        <div className='modal-overlay-cancelOrder' onClick={(e) => e.preventDefault()}>
            <h1 className='modal-title'>Xác nhận hủy đơn hàng {orderCode}!</h1>
            <div className="modal-body">
                <InputAdmin
                    label={"Tiêu đề"}
                    placeholder="Nhập tiêu đề lý do hủy..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <InputAdmin
                    label={"Lý do"}
                    placeholder="Nhập nội dung lý do hủy..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
            </div>
            <div className="modal-footer">
                <button className="btn btn-confirm" onClick={() => { userCtx.onClickConfirmModel(title, content) }}>Xác nhận</button>
            </div>
        </div>
    )
}
export default ModalCancelOrder