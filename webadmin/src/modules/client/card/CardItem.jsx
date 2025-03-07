import './CardItem.scss'

const CardItem = ({ data, onClickItem }) => {
    const formatter = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    });
    return (
        <div className="card-item" onClick={() => onClickItem(data)}>
            <img src={data.idImage} alt={data.name} className="card-image" />
            <div className="card-details">
                <h3 className="card-name">{data.name}</h3>
                <p className="card-price">Giá: {formatter.format(data.price)}</p>
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
            </div>
        </div>
    );
}
export default CardItem