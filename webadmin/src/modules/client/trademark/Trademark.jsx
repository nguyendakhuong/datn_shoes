import { useNavigate, useParams } from 'react-router-dom';
import './Trademark.scss'
import { useEffect, useState } from 'react';
import CardItem from '../card/CardItem';
import InputAdmin from '../../components/input/Input-admin';

const TrademarkUser = () => {
    const { trademark } = useParams();
    const [dataTrademark, setDataTrademark] = useState([])
    const [search, setSearch] = useState("");
    const [priceFilter, setPriceFilter] = useState(null);
    const [priceFilterTemp, setPriceFilterTemp] = useState("");
    const navigate = useNavigate()
    const getProductByTrademark = async () => {
        try {
            const response = await fetch(`http://localhost:3001/product/getProductByTrademark`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer `,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ trademark })
            });
            const data = await response.json();
            console.log(data)
            if (data.status === 200) {
                setDataTrademark(data.data)
            }
        } catch (e) {
            console.log("Lỗi lấy thông tin sản phẩm theo trademark: ", e);
        }
    }
    const handleClickItem = (v) => {
        navigate(`/productDetail/${v.trademark}/${v.id}`);
    }
    useEffect(() => {
        getProductByTrademark()
    }, [trademark])
    const filteredProducts = dataTrademark.filter((product) => {
        const price = Number(product.price);
        const priceFilterValue = priceFilter ? Number(priceFilter) : null;

        const isMatchName = product.name.toLowerCase().includes(search.toLowerCase());
        const isMatchPrice = priceFilterValue !== null ? price <= priceFilterValue : true;

        return isMatchName && isMatchPrice;
    });
    console.log(filteredProducts)
    return (
        <div>
            <div className='filter-container'>
                <InputAdmin
                    placeholder={"Tìm kiếm sản phẩm"}
                    type={"text"}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <InputAdmin
                    type="number"
                    placeholder="Giá tối đa"
                    value={priceFilterTemp}
                    onChange={(e) => setPriceFilterTemp(e.target.value)}
                />
                <div className='btn-filter'>
                    <button onClick={() => setPriceFilter(priceFilterTemp)}>Lọc theo giá</button>
                </div>
            </div>

            <div className="product-category">
                <h2>Hãng {trademark}</h2>
                <div className="item-render">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((v, i) => (
                            <div key={i}>
                                <CardItem data={v} onClickItem={handleClickItem} />
                            </div>
                        ))
                    ) : (
                        <div className="product-category">
                            <div className="item-render">
                                {dataTrademark.length > 0 ? dataTrademark.map((v, i) => (
                                    <div key={i}>
                                        <CardItem data={v} onClickItem={handleClickItem} />
                                    </div>
                                )) : <div className="text-title">
                                    <span>Chưa có sản phẩm hoạt động</span>
                                </div>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
export default TrademarkUser