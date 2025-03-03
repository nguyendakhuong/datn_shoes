import { useContext } from "react"
import UserContext from "../../../../context/use.context"
import { KEY_CONTEXT_USER } from "../../../../context/use.reducer"
import styles from './styles.module.scss'
import ButtonWed from "../../button/Button-admin"
import AppImages from "../../../../assets"
const DeleteItem = () => {
    const [userCTX, dispatch] = useContext(UserContext);
    const onClickClone = () => {
        dispatch({
            type: KEY_CONTEXT_USER.HIDE_MODAL,
        })
    }
    return (
        <div className={styles.modal}>
            <div className={styles.iconClone}>
                <i onClick={onClickClone} class="bx bx-x"></i>
            </div>
            <h1>{userCTX.titleModel ?? "Thông báo"}</h1>
            <img className={styles.icon} src={AppImages.deleteModal} alt="" />
            <label>
                {userCTX.contentModel ?? "Bạn có đồng ý xóa mục này không ?"}
            </label>
            <div className={styles.button}>
                <div>
                    <ButtonWed buttonAuth={false} title={"Hủy"} onClick={onClickClone} />
                </div>
                <div>
                    <ButtonWed
                        buttonAuth={true}
                        title={"OK"}
                        onClick={() => {
                            userCTX.onClickConfirmModel(userCTX.dataModal)
                            dispatch({
                                type: KEY_CONTEXT_USER.HIDE_MODAL,
                            })
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
export default DeleteItem