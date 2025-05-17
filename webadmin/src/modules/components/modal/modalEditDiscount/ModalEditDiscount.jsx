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
        describe:"",
        startDate: "",
        endDate: ""
    })
    const [type, setType] = useState(1);
    const [listError, setListError] = useState({
        name: "",
        promotionLevel: "", // mức khuyến mại
        promotionType: "", // hình thức khuyến mại
        conditionsOfApplication: "", // điều kiện áp dụng
        quantity: "",
        describe:"",
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
        const updateFormData = { ...formData, promotionType: type }
        if (type === 2 && updateFormData.promotionLevel > 90) {
            ToastApp.warning("Mức khuyến mại không được lớn hơn 90")
            return
        }
        if (type === 2 && !updateFormData.maximumPromotion) {
            ToastApp.warning("Khuyến mãi theo % phải có mức khuyến mãi tối đa")
            return
        }
        const errors = {};


        if (Object.keys(errors).length > 0) {
            // console.log(errors)
            ToastApp.warning("Vui lòng điền đúng thông tin!");
            return;
        }
        try {
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
                ToastApp.success('Cập nhật mã khuyến mãi thành công');
                onClose();
            } else {
                ToastApp.warning(data.message);
            }
        } catch (e) {
            console.log("Lỗi cập nhật mã khuyến mãi", e)
        }
    }

    useEffect(() => {
        if (data) {
            const { startDate, endDate,promotionType, ...restData } = data;
            setFormData({
                ...restData,
                startDate: startDate ? moment(startDate).format("YYYY-MM-DD") : "",
                endDate: endDate ? moment(endDate).format("YYYY-MM-DD") : "",
            });
            setType(promotionType)
        }
    }, [data]);

    return (
        <>
            {isOpen && (
                <div className="modal-overlay-discount-edit">
                    <div className="modal-content">
                        <h2>Thêm mã khuyến mãi</h2>
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
                                label={"Mô tả"}
                                name={"describe"}
                                validate={'required'}
                                type={'text'}
                                value={data.describe}
                                onChange={handleChange}
                            />
                            {listError.describe && <label className='error-text'>{listError.describe}</label>}
    
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
                                label={ "Mức khuyến mãi tối đa"}
                                name={"maximumPromotion"}
                                validate={'required||checkNegative||checkNumber'}
                                type={'text'}
                                value={formData.maximumPromotion}
                                onChange={handleChange}
                                readOnly={type === 1 ? true : false}
                            />
                            {listError.maximumPromotion && <label className='error-text'>{listError.maximumPromotion}</label>}
                            <InputAdmin
                                label={"Số tiền tối thiểu"}
                                name={"conditionsOfApplication"}
                                validate={'required||checkNegative||checkNumber'}
                                type={'text'}
                                value={formData.conditionsOfApplication}
                                onChange={handleChange}
                            />
                            {listError.conditionsOfApplication && <label className='error-text'>{listError.conditionsOfApplication}</label>}
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
                                validate={'checkTimeEnd'}
                                type={'date'}
                                value={formData.endDate}
                                onChange={handleChange}
                            />
                            {listError.endDate && <label className='error-text'>{listError.endDate}</label>}

                            <div className="modal-buttons">
                                <button className="exit-button" onClick={onClose}>Hủy</button>
                                <button onClick={handleSubmit} type="submit">Cập nhật</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </>
    )
}
export default ModalEditDiscount