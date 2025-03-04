import "./Main.scss";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "./Main.scss";
import AppImages from "../assets";

const Main = () => {
    const images = [
        AppImages.banner1,
        AppImages.banner2,
        AppImages.banner3,
    ];
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
        </div>
    );
};

export default Main;
