import { useNavigate } from "react-router-dom";
import "./Main.scss";
import video from '../assets/image/video.mp4'

const Main = () => {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate('/Login');
    };

    return (
        <div className="main-container">
            <video className="video-background" autoPlay muted loop>
                <source src={video} type="video/mp4" />

            </video>

            <div className="content">
                <button className="button-mainlogin" onClick={handleLogin}>
                    Đăng nhập
                </button>
            </div>
        </div>
    );
};

export default Main;
