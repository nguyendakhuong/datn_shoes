import AppImages from "../../../../assets";
import "./FooterUser.scss";

const FooterUser = () => {
  return (
    <footer className="footer-user">
      <div className="footer-content">
        <div className="footer-logo">
          <img src={AppImages.logo1} alt="FPT Polytechnic Logo" />
          <p>Trường Cao đẳng FPT Polytechnic</p>
        </div>
        <div className="footer-contact">
          <p>
            <strong>Liên hệ:</strong>
          </p>
          <p>
            SĐT: <a href="tel:0359629379">0359629379</a>
          </p>
          <p>
            Email:{" "}
            <a href="mailto:duonghaphuong2004@gmail.com">
              duonghaphuong2004@gmail.com
            </a>
          </p>
          <p>Địa chỉ: Mỹ Đình 2, Nam Từ Liêm, Hà Nội</p>
        </div>
      </div>
    </footer>
  );
};
export default FooterUser;
