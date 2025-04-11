import { useContext, useEffect, useState } from 'react'
import './ModalProductActive.scss'
import InputAdmin from '../../input/Input-admin'
import ButtonWed from '../../button/Button-admin'
import UserContext from '../../../../context/use.context'

const ModalProductActive = () => {
    const [userCtx, dispatch] = useContext(UserContext)
    const [data, setData] = useState([])
    const [searchDataProduct, setSearchDataProduct] = useState("")
    const [dataSearch, setDataSearch] = useState([])
    const [selectedCodes, setSelectedCodes] = useState([]);
    const getProductActive = async () => {
        try {
            const response = await fetch(`http://localhost:3001/product/productActive`, {
                headers: {
                    Authorization: `Bearer`,
                    "Content-Type": "application/json"
                },
            });
            const data = await response.json();
            if (data.status === 200) {
                setData(data.data)
            }
        } catch (e) {
            console.log("Lỗi lấy thông tin giỏ hàng : ", e)
        }
    }
    const handleCheckboxChange = (e, code) => {
        if (e.target.checked) {
            setSelectedCodes((prev) => [...prev, code]);
        } else {
            setSelectedCodes((prev) => prev.filter((item) => item !== code));
        }
    }

    useEffect(() => {
        getProductActive()
    }, [])

    useEffect(() => {
        if (searchDataProduct.trim() === "") {
            setDataSearch([]);
        } else {
            const filteredData = data.filter((item) =>
                String(item.productDetailCode || "").toLowerCase().includes(searchDataProduct.toLowerCase())
            );
            setDataSearch(filteredData);
        }
    }, [searchDataProduct, data]);

    const formatter = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    });

    return (
        <div className='modal-productActive'>
            <div className='modal-productActive-header'>
                <h1>Sản phẩm đang hoạt động</h1>
                <InputAdmin
                    placeholder={"Tìm kiếm mã sản phẩm"}
                    type="text"
                    name="search"
                    value={searchDataProduct}
                    onChange={(e) => setSearchDataProduct(e.target.value)} />

            </div>
            <table className="productActive-table">
                <thead>
                    <tr>
                        <th></th>
                        <th>Mã sản phẩm</th>
                        <th>Tên sản phẩm</th>
                        <th>Ảnh</th>
                        <th>Giá</th>
                        <th>Số lượng</th>
                        <th>Trạng thái</th>
                    </tr>
                </thead>
                <tbody className="scrollable-tbody">
                    {(searchDataProduct ? dataSearch : data).length > 0 ? (
                        (searchDataProduct ? dataSearch : data).map((product, index) => (
                            <tr key={index}>
                                <td>
                                    <input
                                        type="checkbox"
                                        value={product.productDetailCode}
                                        checked={selectedCodes.includes(product.productDetailCode)}
                                        onChange={(e) => handleCheckboxChange(e, product.productDetailCode)}
                                    />
                                </td>
                                <td>{product.productDetailCode}</td>
                                <td>{product.productName}</td>
                                <td>
                                    <img className="image-productActive" src={product.idImage} alt="" />
                                </td>
                                <td>{formatter.format(product.price)}</td>
                                <td>{product.quantity}</td>
                                <td>{product.status === 1 && "Hoạt động"}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={7} style={{ textAlign: "center" }}>
                                {dataSearch ? "Không tìm thấy sản phẩm" : "Không có sản phẩm hoạt động"}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            <div className='modal-actions'>
                <button onClick={() => { userCtx.onClickConfirmModel(selectedCodes) }} className='confirm-btn'>Xác nhận</button>
            </div>
        </div>
    )
}

export default ModalProductActive