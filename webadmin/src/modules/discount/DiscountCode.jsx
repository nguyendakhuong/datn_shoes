import { useContext, useEffect, useState } from "react";
import ModalAddDiscount from "../components/modal/modalAddDiscount/ModalAddDiscount"
import './DiscountCode.scss'
import UserContext from "../../context/use.context";
import { KEY_CONTEXT_USER } from "../../context/use.reducer";
import ToastApp from "../../lib/notification/Toast";
import moment from 'moment';
import AppImages from "../../assets";
import ModalEditDiscount from "../components/modal/modalEditDiscount/ModalEditDiscount";
const DiscountCode = () => {
    const [userCtx, dispatch] = useContext(UserContext)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);
    const [data, setData] = useState(null);
    const [reload, setReloadData] = useState(false);
    const [selectedDiscount, setSelectedDiscount] = useState(null);
    const getDiscountCode = async () => {
        try {
            dispatch({ type: KEY_CONTEXT_USER.SET_LOADING, payload: true })
            const response = await fetch(`http://localhost:3001/discount/getDiscounts`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer`
                    },
                });
            const data = await response.json();
            if (data.status === 200) {
                setData(data.data)
            } else {
                ToastApp.error('Error: ' + data.message);
            }
        } catch (e) {
            console.log("Error: " + e)
        } finally {
            dispatch({ type: KEY_CONTEXT_USER.SET_LOADING, payload: false })
        }
    }

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsModalOpenEdit(false)
    };

    const handleDeleteItem = (e, value) => {
        e.stopPropagation();
        dispatch({
            type: KEY_CONTEXT_USER.SHOW_MODAL,
            payload: {
                typeModal: 'DELETE_ITEM',
                dataModal: value.id,
                contentModel: "Bạn có chắc chắn muốn xóa mã khuyến mãi " + value.name + " không?",
                onClickConfirmModel: async () => {
                    try {
                        const response = await fetch(`http://localhost:3001/discount/deleteDiscount/${value?.id}`,
                            {
                                method: 'GET',
                                headers: {
                                    'Authorization': `Bearer`
                                },

                            });
                        const data = await response.json();
                        if (data.status === 200) {
                            ToastApp.success('Xóa thành công');
                            setReloadData(true);
                        } else {
                            ToastApp.error('Error: ' + data.message);
                        }

                    } catch (e) {
                        console.log("Lỗi xóa sản phẩm: ", e)
                    }
                },
            },
        })
    }
    const handelClickItem = (e, value) => {
        e.stopPropagation()
        setSelectedDiscount(value);
        setIsModalOpenEdit(true);
    }
    useEffect(() => {
        getDiscountCode();
        setReloadData(false);
    }, [isModalOpen, reload, isModalOpenEdit])

    const formatter = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    });
    return (
        <div className="discount-container">
            <table className="header-table">
                <thead>
                    <tr>
                        <th colSpan="10" className="flex header-discount">
                            <span>Quản lí mã khuyến mãi</span>
                            <button className="discount-button" onClick={handleOpenModal}>+ Thêm mã khuyến mãi</button>
                        </th>
                    </tr>
                </thead>
            </table>
            <div className="discount-table-container">
                <table className="discount-table">
                    <thead>
                        <tr>
                            <th>Mã khuyến mãi</th>
                            <th>Tên khuyến mãi</th>
                            <th>Mức khuyến mại</th>
                            <th>Hình thức khuyến mại</th>
                            <th>Mô tả</th>
                            <th>Hạn mức tối đa</th>
                            <th>Số lượng</th>
                            <th>Ngày bắt đầu</th>
                            <th>Ngày kết thúc</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    {
                        data ? <tbody>
                            {data.map(value => (
                                <tr key={value.id} onClick={(e) => { handelClickItem(e, value) }}>
                                    <td>{value.promotionCode}</td>
                                    <td>{value.name}</td>
                                    <td>{value.promotionLevel > 100 ? formatter.format(value.promotionLevel) : `${value.promotionLevel}%`}</td>
                                    <td>{value.promotionType === 1 ? "Giảm tiền trực tiếp" : "Giảm theo %"}</td>
                                    <td>{value.conditionsOfApplication}</td>
                                    <td>{formatter.format(value.maximumPromotion)}</td>
                                    <td>{value.quantity}</td>
                                    <td>{value.startDate ? moment(value.startDate).format('DD/MM/YYYY') : "null"}</td>
                                    <td>{value.endDate ? moment(value.endDate).format('DD/MM/YYYY') : "null"}</td>
                                    <td className={
                                        value.endDate && value.startDate &&
                                            moment(value.endDate).isAfter(value.startDate) &&
                                            moment(value.endDate).isAfter(moment()) &&
                                            moment(value.startDate).isBefore(moment())
                                            ? 'active' : 'inactive'}>
                                        {value.endDate && value.startDate &&
                                            moment(value.endDate).isAfter(value.startDate) &&
                                            moment(value.endDate).isAfter(moment()) &&
                                            moment(value.startDate).isBefore(moment())
                                            ? <span className="active-text">Hoạt động</span>
                                            : <span className="inactive-text">Không hoạt động</span>}
                                    </td>

                                    <td>
                                        <div onClick={(e) => handleDeleteItem(e, value)}>
                                            <img src={AppImages.deleteIcon} alt="Delete" style={{ width: '20px' }} />
                                        </div>
                                    </td>
                                </tr>

                            ))}
                        </tbody> : null
                    }
                </table>
            </div>
            <ModalAddDiscount isOpen={isModalOpen} onClose={handleCloseModal} />
            <ModalEditDiscount data={selectedDiscount} isOpen={isModalOpenEdit} onClose={handleCloseModal} />
        </div>
    )
}
export default DiscountCode