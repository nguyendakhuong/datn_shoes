import { useContext, useEffect, useState } from 'react';
import './Oder.scss';
import UserContext from '../../context/use.context';
import ButtonDropDown from '../components/dropdownbutton/ButtonDropDown';
import OrderDetail from '../components/modal/modalOrder/OrderDetail';
import InputAdmin from '../components/input/Input-admin';
import APP_LOCAL from '../../lib/localStorage';
import ToastApp from '../../lib/notification/Toast';
const Order = () => {
    const [userCtx, dispatch] = useContext(UserContext)
    const [reloadData, setReloadData] = useState(false);
    const [data, setData] = useState([])
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchDataOder, setSearchDataOrder] = useState('');
    const [dataSearch, setDataSearch] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemPage, setItemPage] = useState(5);
    const lastIndex = currentPage * itemPage;
    const firstIndex = lastIndex - itemPage;
    const records = data ? data.slice(firstIndex, lastIndex) : null
    const nPage = data ? Math.ceil(data.length / itemPage) : null;
    const numbers = [...Array(nPage + 1).keys()].slice(1)

    const getAllOrder = async () => {
        try {
            const response = await fetch(`http://localhost:3001/order/getAllOrders`, {
                headers: {
                    Authorization: `Bearer `,
                },
            });
            const data = await response.json()
            if (data.status === 200) {
                setData(data.data)
            }
        } catch (e) {
            console.log("Lỗi lấy sản phẩm người dùng: ", e)
        }
    }
    const buttonItem = [
        {
            label: "Xác nhận vận chuyển", key: 2
        },
        {
            label: "Hủy đơn hàng", key: 4
        },
        {
            label: "Xác nhận hàng", key: 3
        },
    ]
    const handleSelect = (e) => {
        setItemPage(e.target.value)
        setCurrentPage(1)
    }
    const statusLabels = {
        1: "Chờ xác nhận",
        2: "Xác nhận",
        3: "Giao hàng",
        4: "Đã thanh toán",
        5: "Đã nhận hàng",
        6: "Hủy hàng", // hủy hàng (phía admin)
        7: "Khách hủy hàng", // boom hàng
    };
    const handleInputSearch = (e) => {
        const { name, value } = e.target
        if (name === "search") {
            setSearchDataOrder(value.trim())
        }
    }
    const handleConfirmOrder = async () => { }
    const handleCancelOrder = async () => { }
    const viewOrderDetail = async (order) => {
        setSelectedOrder(order);
    }

    const verifyOrder = async (order) => {
        const token = APP_LOCAL.getTokenStorage();
        console.log(typeof (order.status))
        if (order.status !== "1") {
            return ToastApp.warning("Đơn hàng khác trạng thái tạo đơn hàng")
        }
        try {
            const response = await fetch(`http://localhost:3001/order/verifyOrder/${order.orderCode}`, {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.status === 200) {
                ToastApp.success("Xác nhận đơn hàng thành công!")
                setReloadData(true)
            } else {
                ToastApp.warning("Warning: " + data.message)
            }
        } catch (e) {
            return ToastApp.error("Error: " + e)
        }
    }
    const handleConfigOder = () => { }
    const handlePrint = () => { }
    const OrderTableRow = ({ order, handleCancelOrder, viewOrderDetail, statusLabels }) => {
        const updatedAtDate = new Date(order.updatedAt);
        const formattedUpdatedAt = `${updatedAtDate.getUTCDate() < 10 ? '0' + updatedAtDate.getUTCDate() :
            updatedAtDate.getUTCDate()}-${updatedAtDate.getUTCMonth() + 1 < 10 ? '0' + (updatedAtDate.getUTCMonth() + 1) :
                updatedAtDate.getUTCMonth() + 1}-${updatedAtDate.getUTCFullYear()}`;

        const handleItemClick = (key) => {
            if (key === 2) verifyOrder(order)
            if (key === 4) handleCancelOrder(order.orderCode)
            if (key === 3) handleConfigOder(order.orderCode)
        };
        return (
            <tr key={order.id} onClick={() => viewOrderDetail(order)}>
                <td>{order.orderCode}</td>
                <td>{order.userName}</td>
                <td>{order.phoneNumber}</td>
                {/* <td>
                    {order.orderDetails ? order?.orderDetails.map((product, index) => (
                        <div key={index} className='item-order'>
                            <div>
                                <h3>{product.nameProduct}</h3>
                            </div>
                            <span>Size : {product.size}</span>
                            <span> Số lượng: {product.quantity} </span>
                            <span> Giá : {product.price} </span>
                        </div>
                    )) : null}

                </td> */}
                <td>{formatter.format(order.totalDefault)}</td>
                <td>{formatter.format(order.totalPromotion)}</td>
                <td>{formatter.format(order.totalPayment)}</td>
                <td>{order.paymentMethod}</td>
                <td>{formattedUpdatedAt}</td>
                <td>{order.address}</td>
                <td>{statusLabels[order.status]}</td>
                <td>
                    <div className='buttonACT' onClick={(e) => { e.stopPropagation(); }}>
                        <button className='buttonPrint' onClick={(e) => { e.stopPropagation(); handlePrint(order); }}>
                            Print
                        </button>
                        <ButtonDropDown buttonItem={buttonItem} onItemClick={handleItemClick} orderStatus={order.status} />
                    </div>
                </td>
            </tr>
        );
    }
    const options = [
        { value: 10, label: '10' }
    ]
    const prePage = () => {
        if (currentPage !== 1) {
            setCurrentPage(currentPage - 1)
        }
    }
    const changePage = (id) => {
        setCurrentPage(id)
    }
    const nextPage = () => {
        if (currentPage !== nPage) {
            setCurrentPage(currentPage + 1)
        }
    }
    useEffect(() => {
        getAllOrder();
        setReloadData(false)
    }, [reloadData])

    const handleSearch = async () => {
        try {
            const response = await fetch(`http://localhost:3001/order/searchOrderByPhoneNumber`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phoneNumber: searchDataOder })
            });
            const searchData = await response.json();
            if (searchData.status === 200) {
                setDataSearch(searchData.data);
            } else {
                ToastApp.error('Error: ' + searchData.message);
            }
        } catch (e) {
            console.log("Error search:" + e)
        }
    }

    const formatter = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    });
    return (
        <div>
            {selectedOrder ? (
                <OrderDetail order={selectedOrder} onClose={() => setSelectedOrder(null)} />
            ) : (
                <div>
                    <div className='header-order'>
                        <span>Quản lí đơn hàng</span>
                        <div className='search-box-oder'>
                            <div className='input-search-order'>
                                <InputAdmin
                                    // label={"Tìm kiếm"}
                                    type="text"
                                    placeholder={"Số điện thoại ..."}
                                    name="search"
                                    value={searchDataOder}
                                    onChange={handleInputSearch} />
                            </div>
                            <div className='btn-search-order'>
                                <button onClick={handleSearch}>
                                    TÌm kiếm
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="order-table-container">
                        <table className="discount-table">
                            <thead>
                                <tr>
                                    <th>Mã đơn hàng</th>
                                    <th>Tên người đặt</th>
                                    <th>Số điện thoại</th>
                                    {/* <th>Sản phẩm</th> */}
                                    <th>Giá ban đầu </th>
                                    <th>Giá khuyến mại </th>
                                    <th>Giá thanh toán </th>
                                    <th>Hình thức thanh toán </th>
                                    <th>Thời gian</th>
                                    <th>Địa chỉ</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dataSearch.length > 0 && searchDataOder > 0 ? (
                                    dataSearch.map((order, index) => (
                                        <OrderTableRow
                                            key={index}
                                            order={order}
                                            handleConfirmOrder={handleConfirmOrder}
                                            handleCancelOrder={handleCancelOrder}
                                            viewOrderDetail={viewOrderDetail}
                                            statusLabels={statusLabels}
                                        />
                                    ))
                                ) : (
                                    records && records.length > 0 ? (
                                        records.map((order, index) => (
                                            <OrderTableRow
                                                key={index}
                                                order={order}
                                                handleConfirmOrder={handleConfirmOrder}
                                                handleCancelOrder={handleCancelOrder}
                                                viewOrderDetail={viewOrderDetail}
                                                statusLabels={statusLabels}
                                            />
                                        ))
                                    ) : null
                                )}
                            </tbody>
                        </table>
                        <nav className={`${searchDataOder ? 'inactivePagination' : null}`}>
                            {numbers && numbers.length >= 10 ? (
                                <ul className='pagination'>
                                    <li className='page-item'>
                                        <a href="#" className='pageLink' onClick={prePage}>
                                            Prev
                                        </a>
                                    </li>
                                    {numbers.length > 7 && currentPage >= 6 && (
                                        <li className='page-item'>
                                            <a href="#" className={`pageLink`} onClick={() => changePage(1)}>
                                                1
                                            </a>
                                        </li>
                                    )}
                                    {currentPage > 5 && <li className='page-item'>...</li>}

                                    {numbers
                                        .slice(currentPage > 5 ? currentPage - 3 : 0, currentPage + 3)
                                        .map((n, i) => (
                                            <li className='page-item' key={i}>
                                                <a
                                                    href="#"
                                                    className={`pageLink ${currentPage === n ? 'active' : ''}`}
                                                    onClick={() => changePage(n)}
                                                >
                                                    {n}
                                                </a>
                                            </li>
                                        ))}
                                    {currentPage < numbers.length - 3 && <li className='page-item'>...</li>}

                                    {numbers.length > 7 && currentPage < numbers.length - 3 && (
                                        <li className='page-item'>
                                            <a href="#" className={`pageLink`} onClick={() => changePage(numbers.length)}>
                                                {numbers.length}
                                            </a>
                                        </li>
                                    )}
                                    <li className='page-item'>
                                        <a href="#" className='pageLink' onClick={nextPage}>
                                            Next
                                        </a>
                                    </li>
                                    <div className='selectPagination'>
                                        <select onChange={handleSelect}>
                                            {options.map((option, index) => (
                                                <option key={index} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </ul>
                            ) : (
                                <ul className='pagination'>
                                    <li className='page-item'>
                                        <a href="#" className='pageLink' onClick={prePage}>
                                            Prev
                                        </a>
                                    </li>
                                    {
                                        numbers.map((n, i) => (
                                            <li className='page-item' key={i}>
                                                <a href="#" className={`pageLink ${currentPage === n ? 'active' : ""}`} onClick={() => changePage(n)}>
                                                    {n}
                                                </a>
                                            </li>
                                        ))
                                    }
                                    <li className='page-item'>
                                        <a href="#" className='pageLink' onClick={nextPage} >
                                            Next
                                        </a>
                                    </li>
                                    <div className='selectPagination'>
                                        <select onChange={handleSelect} value={itemPage}>
                                            {options.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </ul>
                            )}
                        </nav>



                    </div>


                </div>
            )
            }
        </div >
    );
};

export default Order;