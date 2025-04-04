import "./Main.scss";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "./Main.scss";
import AppImages from "../assets";
import { useEffect, useState } from "react";
import CardItem from "./client/card/CardItem";
import { useNavigate } from "react-router-dom";


const Main = () => {
    const navigate = useNavigate()
    const [data, setData] = useState([])
    const images = [
        AppImages.banner1,
        AppImages.banner2,
        AppImages.banner3,
    ];
    const getProduct = async () => {
        try {
            const response = await fetch(`http://localhost:3001/product/getTenProductUser`, {
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
    const handleClickItem = (v) => {
        navigate(`/productDetail/${v.trademark}/${v.id}`);
    }
    useEffect(() => {
        getProduct();
    }, [])
    return (
        <div className="main-container">
            <Swiper
                spaceBetween={50}
                slidesPerView={1}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                navigation={true}
                modules={[Autoplay, Pagination, Navigation]}
                className="mySwiper"
            >
                {images.map((src, index) => (
                    <SwiperSlide key={index}>
                        <img src={src} alt={`Slide ${index + 1}`} className="slide-image" />
                    </SwiperSlide>
                ))}
            </Swiper>
            <div className="text-home">
                <label>Sản phẩm mới</label>
            </div>
            <div className="item-render">
                {data.length > 0 ? data.map((v, i) => (
                    <div key={i}>
                        <CardItem data={v} onClickItem={handleClickItem} />
                    </div>
                )) : <div className="text-title">
                    <span>Chưa có sản phẩm hoạt động</span>
                </div>}
            </div>
        </div>
    );
};

export default Main;
