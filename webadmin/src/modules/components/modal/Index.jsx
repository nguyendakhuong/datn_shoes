import ModalCancelOrder from "./modalCancelOrder/ModalCancelOrder"
import ModalConfirmOrder from "./modalConfirmOrder/ModalConfirmOrder"
import DeleteItem from "./modalDelete/ModalDelete"
import ModalEditAddress from "./modalEditAddress/ModalEditAddress"
import EditAdmin from "./modalEditAdmin/EditAdmin"
import ModalEditOrderProduct from "./modalEditOrderProduct/ModalEditOrderProduct"
import EditProduct from "./modalEditProduct/EditProduct"
import ModalEditProductDetail from "./modalEditProductDetail/ModalEditProductDetail"
import ModalNotification from "./modalNotification/ModalNotification"
import ModalProductActive from "./modalProductActive/ModalProductActive"
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
    EDIT_PRODUCT_DETAIL_MODAL: 'EDIT_PRODUCT_DETAIL_MODAL',
    CANCEL_ORDER: "CANCEL_ORDER",
    CONFIRM_ORDER: "CONFIRM_ORDER",
    PRODUCTS_AT_COUNTER: "PRODUCTS_AT_COUNTER",
    EDIT_ORDER_PRODUCT: "EDIT_ORDER_PRODUCT"

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
                {typeModal === TYPE_MODEL.EDIT_PRODUCT_DETAIL_MODAL && <ModalEditProductDetail data={dataModal} />}
                {typeModal === TYPE_MODEL.NOTIFICATION_MODAL && <ModalNotification data={dataModal} />}
                {typeModal === TYPE_MODEL.CONFIRM_ORDER && <ModalConfirmOrder orderCode={dataModal} />}
                {typeModal === TYPE_MODEL.CANCEL_ORDER && <ModalCancelOrder orderCode={dataModal} />}
                {typeModal === TYPE_MODEL.PRODUCTS_AT_COUNTER && <ModalProductActive data={dataModal} />}
                {typeModal === TYPE_MODEL.EDIT_ORDER_PRODUCT && <ModalEditOrderProduct data={dataModal} />}
            </div>

        </div>
    )
}
export default Modal
