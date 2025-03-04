import { useEffect, useState } from 'react'
import InputAdmin from '../../input/Input-admin'
import './ModalEditDiscount.scss'
import { ParseValid } from '../../../../lib/validate/ParseValid'
import { Validate } from '../../../../lib/validate/Validate'
import APP_LOCAL from '../../../../lib/localStorage'
import ToastApp from '../../../../lib/notification/Toast'
import moment from 'moment'

const ModalEditDiscount = ({ data, isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        name: "",
        promotionLevel: "", // mức khuyến mại
        promotionType: "", // hình thức khuyến mại
        conditionsOfApplication: "", // điều kiện áp dụng
        maximumPromotion: "", // hạn mức tối đa
        quantity: "",
        startDate: "",
        endDate: ""
    })
    const [type, setType] = useState(1);
    const [listError, setListError] = useState({
        name: "",
        promotionLevel: "", // mức khuyến mại
        promotionType: "", // hình thức khuyến mại
        conditionsOfApplication: "", // điều kiện áp dụng
        maximumPromotion: "", // hạn mức tối đa
        quantity: ""
    });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevFormData => ({ ...prevFormData, [name]: value }))
        const inputValue = value.trim();
        const valid = e.target.getAttribute('validate');
        const validObject = ParseValid(valid);
        const error = Validate(
            name,
            inputValue,
            validObject,
            data.startDate,
            data.endDate,
        );
        setListError(prevErrors => ({ ...prevErrors, [name]: error }));
    }
    const handleChangeRadio = (e) => {
        setType(parseInt(e.target.value));
    }

    const handleSubmit = async () => {
        const token = APP_LOCAL.getTokenStorage();
        try {
            const updateFormData = { ...formData, promotionType: type }
            if (type === 2 && updateFormData.promotionLevel > 90) {
                ToastApp.warning("Mức khuyến mại không được lớn hơn 90")
                return
            }
            const errors = {};
            Object.entries(updateFormData).forEach(([key, value]) => {
                if (key !== "deletedAt" && !value) {
                    errors[key] = "Trường này không được để trống";
                }
            });

            if (Object.keys(errors).length > 0) {
                ToastApp.warning("Vui lòng điền đúng thông tin!");
                return;
            }
            const response = await fetch('http://localhost:3001/discount/updateCreate', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateFormData)

            });
            const result = await response.json();
            if (result.status === 200) {
                ToastApp.success('Cập nhật mã giảm giá thành công');
                onClose();
            } else {
                ToastApp.warning(data.message);
            }
        } catch (e) {
            console.log("Lỗi cập nhật mã giảm giá", e)
        }
    }

    useEffect(() => {
        if (data) {
            const { startDate, endDate, ...restData } = data;
            setFormData({
                ...restData,
                startDate: startDate ? moment(startDate).format("YYYY-MM-DD") : "",
                endDate: endDate ? moment(endDate).format("YYYY-MM-DD") : "",
            });
        }
    }, [data]);

    return (
        <>
            {isOpen && (
                <div className="modal-overlay-discount-edit">
                    <div className="modal-content">
                        <h2>Thêm mã giảm giá</h2>
                        <form onSubmit={e => e.preventDefault()}>
                            <InputAdmin
                                label={"Tên phiếu khuyến mại"}
                                name={"name"}
                                validate={'required'}
                                type={'text'}
                                value={formData.name}
                                readOnly
                            />
                            {listError.name && <label className='error-text'>{listError.name}</label>}
                            <InputAdmin
                                label={"Mức khuyến mại"}
                                name={"promotionLevel"}
                                validate={'required||checkNegative||checkNumber'}
                                type={'text'}
                                value={formData.promotionLevel}
                                onChange={handleChange}
                            />
                            {listError.promotionLevel && <label className='error-text'>{listError.promotionLevel}</label>}
                            <InputAdmin
                                label={"Điều khiện áp dụng"}
                                name={"conditionsOfApplication"}
                                validate={'required'}
                                type={'text'}
                                value={formData.conditionsOfApplication}
                                onChange={handleChange}
                            />
                            {listError.conditionsOfApplication && <label className='error-text'>{listError.conditionsOfApplication}</label>}
                            <div className="type-input">
                                <label>
                                    <span>Hình thức khuyến mại: </span>
                                    <input
                                        type="radio"
                                        name="type"
                                        value={1}
                                        checked={type === 1}
                                        onChange={handleChangeRadio}
                                    />
                                    <span></span> VNĐ
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="type"
                                        value={2}
                                        checked={type === 2}
                                        onChange={handleChangeRadio}
                                    />
                                    <span></span> %
                                </label>
                            </div>
                            <InputAdmin
                                label={"Mức khuyến mại tối đa"}
                                name={"maximumPromotion"}
                                validate={'required||checkNegative||checkNumber'}
                                type={'text'}
                                value={formData.maximumPromotion}
                                onChange={handleChange}
                            />
                            {listError.maximumPromotion && <label className='error-text'>{listError.maximumPromotion}</label>}
                            <InputAdmin
                                label={"Số lượng"}
                                name={"quantity"}
                                validate={'required||checkNumber||checkNegative'}
                                type={'number'}
                                value={formData.quantity}
                                onChange={handleChange}
                            />
                            {listError.quantity && <label className='error-text'>{listError.quantity}</label>}
                            <InputAdmin
                                label={"Ngày bắt đầu"}
                                name={"startDate"}
                                validate={'checkDate||checkTimeStart'}
                                type={'date'}
                                value={formData.startDate}
                                onChange={handleChange}
                            />
                            {listError.startDate && <label className='error-text'>{listError.startDate}</label>}
                            <InputAdmin
                                label={"Ngày kết thúc"}
                                name={"endDate"}
                                validate={'checkDate||checkTimeEnd'}
                                type={'date'}
                                value={formData.endDate}
                                onChange={handleChange}
                            />
                            {listError.endDate && <label className='error-text'>{listError.endDate}</label>}

                            <div className="modal-buttons">
                                <button onClick={handleSubmit} type="submit">Cập nhật</button>
                                <button className="exit-button" onClick={onClose}>Hủy</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </>
    )
}
export default ModalEditDiscount