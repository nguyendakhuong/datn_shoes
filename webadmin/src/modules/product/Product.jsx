
import { useContext, useEffect, useState } from 'react';
import './Product.scss';
import CreateProduct from './createProduct/CreateProduct';
import APP_LOCAL from '../../lib/localStorage';
import ToastApp from '../../lib/notification/Toast';
import AppImages from '../../assets';
import { KEY_CONTEXT_USER } from '../../context/use.reducer';
import UserContext from '../../context/use.context';
import ModalDetails from '../components/modal/modalProductDetails/ModalDetails';
const Product = () => {
    const [navigateCreate, setNavigateCreate] = useState(false);
    const [{ }, dispatch] = useContext(UserContext);
    const [searchData, setSearchData] = useState('');
    const [reloadData, setReloadData] = useState(false);
    const [idProduct, setIdProduct] = useState(null);
    const [data, setData] = useState([])
    const [filteredData, setFilteredData] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const getProducts = async () => {
        try {
            const response = await fetch(`http://localhost:3001/product/getProducts`, {
                headers: {
                    Authorization: `Bearer`,
                },
            });
            const data = await response.json();

            if (data.status === 200) {
                setData(data.data)
            } else {
                ToastApp.error(data.message)
            }
        } catch (e) {
            console.log("Lỗi lấy sản phẩm: ", e)
        }

    }

    const handleInputSearch = (e) => {
        const { name, value } = e.target
        if (name === "search") {
            setSearchData(value.trim())
        }
    }
    const handleEdit = () => {

    }
    const handleDelete = (product, e) => {
        e.stopPropagation();
        dispatch({
            type: KEY_CONTEXT_USER.SHOW_MODAL,
            payload: {
                typeModal: 'DELETE_ITEM',
                dataModal: product?.dataValues?.id,
                contentModel: "Bạn có chắc chắn muốn xóa sản phẩm " + product?.dataValues?.productDetailCode + " không?",
                onClickConfirmModel: async () => {
                    try {
                        const response = await fetch(`http://localhost:3001/product/delete/${product?.dataValues?.id}`,
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
    const handleClickItem = (product) => {
        setIdProduct(product?.dataValues?.id)
    }

    const handleStatus = async (e, id) => {
        e.stopPropagation();
        try {
            dispatch({ type: KEY_CONTEXT_USER.SET_LOADING, payload: true })
            const response = await fetch(`http://localhost:3001/product/statusProduct/${id}`,
                {
                    method: 'GET',
                });
            const data = await response.json();
            if (data.status === 200) {
                ToastApp.success("Cập nhật trạng thái thành công")
                setReloadData(true)
            } else {
                ToastApp.error('Error: ' + data.message);
            }
        } catch (e) {
            console.log("Lỗi", e)
        } finally {
            dispatch({ type: KEY_CONTEXT_USER.SET_LOADING, payload: false })
        }
    }

    const TableRow = ({ product, handleEdit, handleDelete, handleClick, handleClickStatus }) => {
        const buttonClass = product?.dataValues?.status === 1 ? 'active-product' : 'inactive-product';
        const formatter = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        });
        return (
            <tr onClick={() => { setIsDialogOpen(true); handleClick(product) }}>
                <td>{product?.dataValues?.productDetailCode}</td>
                <td><img src={product?.dataValues?.idImage} alt={product.productName} /></td>
                <td>{product?.productName}</td>
                <td>{formatter.format(product?.dataValues?.price)}</td>
                <td>{product?.dataValues?.quantity}</td>
                <td>{product?.dataValues?.idColor}</td>
                <td>{product?.sizeName}</td>
                <td>
                    <button onClick={(e) => handleClickStatus(e, product?.dataValues?.id)} className={buttonClass}>
                        {product?.dataValues?.status === 1 ? "Hoạt động" : "Không hoạt động"}
                    </button>
                </td>
                <td>
                    <button onClick={(e) => handleEdit(product?.dataValues?.id, e)}>
                        <img src={AppImages.editIcon} alt="Edit" style={{ width: "20px" }} />
                    </button>
                    <button onClick={(e) => handleDelete(product, e)}>
                        <img src={AppImages.deleteIcon} alt="Delete" style={{ width: "20px" }} />
                    </button>
                </td>
            </tr>
        )
    }
    useEffect(() => {
        if (!searchData.trim()) {
            setFilteredData(data);
        } else {
            const filtered = data.filter((item) =>
                item.productName?.toLowerCase().includes(searchData.toLowerCase())
            );
            setFilteredData(filtered);
        }
    }, [searchData, data]);

    useEffect(() => {
        getProducts()
        setReloadData(false)
    }, [reloadData])
    return (
        <div>
            {navigateCreate ? (
                <div>
                    <CreateProduct />
                </div>
            ) : (
                <div className='product-container'>

                    <div className='header-table-container'>

                        <table className="header-table">
                            <thead>
                                <tr>
                                    <th colSpan="10">
                                        <div className="purple-line"></div>
                                        <span>Danh sách sản phẩm</span>
                                        <div className="search-box">
                                            <input type="text"
                                                placeholder='Tìm kiếm'
                                                name='search'
                                                value={searchData}
                                                onChange={handleInputSearch} />
                                            <button type="product-button" onClick={() => { setNavigateCreate(true) }}>+ Thêm sản phẩm</button>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                    <div className="product-table-container">
                        <ModalDetails isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} id={idProduct} />
                        <table className="product-table">
                            <thead>
                                <tr>
                                    <th>Mã sản phẩm</th>
                                    <th>Ảnh</th>
                                    <th>Tên sản phẩm</th>
                                    <th>Giá</th>
                                    <th>Số lượng</th>
                                    <th>Màu</th>
                                    <th>Size</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData && searchData && filteredData.length > 0 ? (
                                    filteredData.map((product) => (
                                        <TableRow product={product} handleEdit={handleEdit} handleDelete={handleDelete} key={product.id} handleClick={handleClickItem} handleClickStatus={handleStatus} />
                                    ))
                                ) : data && data.length > 0 ? (
                                    data.map((product) => (
                                        <TableRow product={product} handleEdit={handleEdit} handleDelete={handleDelete} key={product.id} handleClick={handleClickItem} handleClickStatus={handleStatus} />
                                    ))
                                ) : null}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Product;