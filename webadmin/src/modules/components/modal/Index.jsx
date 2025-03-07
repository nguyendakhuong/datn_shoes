import DeleteItem from "./modalDelete/ModalDelete"
import ModalEditAddress from "./modalEditAddress/ModalEditAddress"
import EditAdmin from "./modalEditAdmin/EditAdmin"
import EditProduct from "./modalEditProduct/EditProduct"
import styles from './styles.module.scss'
const { useContext } = require("react")
const { default: UserContext } = require("../../../context/use.context")
const { KEY_CONTEXT_USER } = require("../../../context/use.reducer")

export const TYPE_MODEL = {
    DELETE_ITEM: 'DELETE_ITEM',
    NOTIFICATION_MODAL: 'NOTIFICATION_MODAL',
    EDIT_PRODUCT_MODAL: 'EDIT_PRODUCT_MODAL',
    EDIT_ADMIN_MODAL: 'EDIT_ADMIN_MODAL',
    EDIT_ADDRESS_MODAL: 'EDIT_ADDRESS_MODAL',
}
const Modal = () => {
    const [{ isOpenModal, dataModal, typeModal }, dispatch] = useContext(UserContext)
    return (
        <div id="modal"
            className={styles.modal}
            onClick={e => {
                if (e.target.id === 'modal')
                    dispatch({ type: KEY_CONTEXT_USER.HIDE_MODAL })
            }}>
            <div className={styles.show_modal}>
                {typeModal === TYPE_MODEL.DELETE_ITEM && <DeleteItem />}
                {typeModal === TYPE_MODEL.EDIT_PRODUCT_MODAL && <EditProduct id={dataModal} />}
                {typeModal === TYPE_MODEL.EDIT_ADMIN_MODAL && <EditAdmin id={dataModal} />}
                {typeModal === TYPE_MODEL.EDIT_ADDRESS_MODAL && <ModalEditAddress data={dataModal} />}
            </div>

        </div>
    )
}
export default Modal
