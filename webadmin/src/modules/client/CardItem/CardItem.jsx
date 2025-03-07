import './CardItem.scss'

const CardItem = ({ data, onClickItem, onAddToCart }) => {
    return (
        <div className="card-item" onClick={() => onClickItem(data)}>
            <img src={data.idImage} alt={data.name} className="card-image" />
            <div className="card-details">
                <h3 className="card-name">{data.name}</h3>
                <p className="card-price">{data.price.toLocaleString()} VND</p>
                <p className="card-trademark">Thương hiệu: {data.trademark}</p>
                <div className="card-colors">
                    {data.color.map((clr, index) => (
                        <div
                            key={index}
                            className="card-color"
                            style={{ backgroundColor: clr }}
                        ></div>
                    ))}
                </div>
                <button className="add-to-cart" onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(data);
                }}>
                    Thêm vào giỏ hàng
                </button>
            </div>
        </div>
    );
}
export default CardItem