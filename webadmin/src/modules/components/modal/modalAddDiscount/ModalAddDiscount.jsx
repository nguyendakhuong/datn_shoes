import APP_LOCAL from '../../../../lib/localStorage';
import ToastApp from '../../../../lib/notification/Toast';
import { ParseValid } from '../../../../lib/validate/ParseValid';
import { Validate } from '../../../../lib/validate/Validate';
import InputAdmin from '../../input/Input-admin';
import './ModalAddDiscount.scss'
import React, { useState } from 'react';

const ModalAddDiscount = ({ isOpen, onClose }) => {
    const [data, setData] = useState({
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
        setData({ ...data, [name]: value });
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
        const newListError = { ...listError, [name]: error };
        setListError(newListError);
    }
    const handleChangeRadio = (e) => {
        setType(parseInt(e.target.value));
    }
    const clearForm = () => {
        setData({
            name: "",
            promotionLevel: "",
            conditionsOfApplication: "",
            maximumPromotion: "",
            quantity: "",
            startDate: "",
            endDate: ""
        })
    }

    const handleSubmit = async () => {
        const token = APP_LOCAL.getTokenStorage();
        try {
            if (type === 2 && data.promotionLevel > 90) {
                ToastApp.warning("Mức khuyến mại không được lớn hơn 90")
                return
            }
            setData({ ...data, promotionType: type })
            const response = await fetch('http://localhost:3001/discount/createDiscount', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)

            });
            const result = await response.json();
            if (result.status === 200) {
                ToastApp.success('Thêm mã giảm giá thành công');
                clearForm();
                onClose();
            } else {
                ToastApp.warning(data.message);
            }
        } catch (e) {
            console.log("Lỗi thêm mã giảm giá")
        }
    }
    return (
        <>
            {isOpen && (
                <div className="modal-overlay-discount">
                    <div className="modal-content">
                        <h2>Thêm mã giảm giá</h2>
                        <form onSubmit={e => e.preventDefault()}>
                            <InputAdmin
                                label={"Tên phiếu khuyến mại"}
                                name={"name"}
                                validate={'required'}
                                type={'text'}
                                value={data.name}
                                onChange={handleChange}
                            />
                            {listError.name && <label className='error-text'>{listError.name}</label>}
                            <InputAdmin
                                label={"Mức khuyến mại"}
                                name={"promotionLevel"}
                                validate={'required||checkNumber||checkNegative'}
                                type={'text'}
                                value={data.promotionLevel}
                                onChange={handleChange}
                            />
                            {listError.promotionLevel && <label className='error-text'>{listError.promotionLevel}</label>}
                            <InputAdmin
                                label={"Điều khiện áp dụng"}
                                name={"conditionsOfApplication"}
                                validate={'required'}
                                type={'text'}
                                value={data.conditionsOfApplication}
                                onChange={handleChange}
                            />
                            {listError.conditionsOfApplication && <label className='error-text'>{listError.conditionsOfApplication}</label>}
                            <div className="type-input">
                                <label>
                                    <text>Hình thức khuyến mại: </text>
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
                                validate={'required||checkNumber||checkNegative'}
                                type={'text'}
                                value={data.maximumPromotion}
                                onChange={handleChange}
                            />
                            {listError.maximumPromotion && <label className='error-text'>{listError.maximumPromotion}</label>}
                            <InputAdmin
                                label={"Số lượng"}
                                name={"quantity"}
                                validate={'required||checkNumber||checkNegative'}
                                type={'number'}
                                value={data.quantity}
                                onChange={handleChange}
                            />
                            {listError.quantity && <label className='error-text'>{listError.quantity}</label>}
                            <InputAdmin
                                label={"Ngày bắt đầu"}
                                name={"startDate"}
                                validate={'checkDate||checkTimeStart'}
                                type={'date'}
                                value={data.startDate}
                                onChange={handleChange}
                            />
                            {listError.startDate && <label className='error-text'>{listError.startDate}</label>}
                            <InputAdmin
                                label={"Ngày kết thúc"}
                                name={"endDate"}
                                validate={'checkDate||checkTimeEnd'}
                                type={'date'}
                                value={data.endDate}
                                onChange={handleChange}
                            />
                            {listError.endDate && <label className='error-text'>{listError.endDate}</label>}

                            <div className="modal-buttons">
                                <button onClick={handleSubmit} type="submit">Thêm</button>
                                <button className="exit-button" onClick={onClose}>Hủy</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </>
    )
}
export default ModalAddDiscount