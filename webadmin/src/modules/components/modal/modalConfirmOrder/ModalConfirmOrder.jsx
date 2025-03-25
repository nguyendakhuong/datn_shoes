import { useContext, useState } from 'react';
import './ModalConfirmOrder.scss'
import UserContext from '../../../../context/use.context';

const ModalConfirmOrder = ({ orderCode }) => {
    const [userCtx, dispatch] = useContext(UserContext)
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [fileImage, setFileImage] = useState((null))
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setFileImage(file)
        if (file) {
            setImage(URL.createObjectURL(file));
        }
    };
    return (
        <div className='modal-overlay-confirmOrder'>
            <div className='modal-confirmOrder'>
                <h2>Xác nhận đơn hàng {orderCode}</h2>
                <div className='input-group'>
                    <label>Tiêu đề:</label>
                    <input
                        type='text'
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder='Nhập tiêu đề...'
                    />
                </div>
                <div className='input-group'>
                    <label>Nội dung:</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder='Nhập nội dung...'
                    />
                </div>
                <div className='input-group'>
                    <label>Hình ảnh:</label>
                    <input type='file' onChange={handleImageChange} />
                    {image && <img src={image} alt='Preview' className='image-preview' />}
                </div>
                <div className='modal-actions'>
                    <button onClick={() => { userCtx.onClickConfirmModel(title, content, fileImage) }} className='confirm-btn'>Xác nhận</button>
                </div>
            </div>
        </div>
    )
}
export default ModalConfirmOrder