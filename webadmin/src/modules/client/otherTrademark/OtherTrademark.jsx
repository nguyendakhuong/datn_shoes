import { useEffect, useState } from 'react';
import InputAdmin from '../../components/input/Input-admin';
import './OtherTrademark.scss';
import { useNavigate } from 'react-router-dom';
import CardItem from '../card/CardItem';

const OtherTrademark = () => {
    const [data, setData] = useState([]);
    const [search, setSearch] = useState("");
    const [priceFilter, setPriceFilter] = useState(null);
    const [priceFilterTemp, setPriceFilterTemp] = useState("");
    const [trademarks, setTrademarks] = useState([]);
    const [selectedTrademark, setSelectedTrademark] = useState("");
    const navigate = useNavigate();

    const getProduct = async () => {
        try {
            const response = await fetch(`http://localhost:3001/product/getAllProduct`, {
                headers: {
                    Authorization: `Bearer `,
                },
            });
            const data = await response.json();
            if (data.status === 200) {
                setData(data.data);
                const uniqueTrademarks = [...new Set(data.data.map(item => item.trademark))];
                setTrademarks(uniqueTrademarks);
            }
        } catch (e) {
            console.log("Lỗi lấy sản phẩm người dùng: ", e);
        }
    };

    const handleClickItem = (v) => {
        navigate(`/productDetail/${v.trademark}/${v.id}`);
    }

    useEffect(() => {
        getProduct();
    }, []);

    const filteredData = data.filter(product => {
        const price = Number(product.price);
        const priceFilterValue = priceFilter ? Number(priceFilter) : null;
        return (
            (!search || product.name.toLowerCase().includes(search.toLowerCase())) &&
            (!priceFilter || price <= priceFilterValue) &&
            (!selectedTrademark || product.trademark === selectedTrademark)
        );
    });

    return (
        <div className='other-container'>
            <div className='filter-container'>
                <InputAdmin
                    placeholder="Tìm kiếm sản phẩm"
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <InputAdmin
                    type="number"
                    placeholder="Giá tối đa"
                    value={priceFilterTemp}
                    onChange={(e) => setPriceFilterTemp(e.target.value)}
                />
                <div className='btn-filter'><button onClick={() => setPriceFilter(priceFilterTemp)}>Lọc theo giá</button></div>

                <div className='select-filter'>
                    <select value={selectedTrademark} onChange={(e) => setSelectedTrademark(e.target.value)}>
                        <option value="">Tất cả thương hiệu</option>
                        {trademarks.map((trademark, index) => (
                            <option key={index} value={trademark}>{trademark}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="text-home">
                <label>Tất cả sản phẩm</label>
            </div>
            <div className="item-render">
                {filteredData.length > 0 ? filteredData.map((v, i) => (
                    <CardItem key={i} data={v} onClickItem={handleClickItem} />
                )) : <div className="text-title">
                    <span>Chưa có sản phẩm hoạt động</span>
                </div>}
            </div>
        </div>
    );
};

export default OtherTrademark;
