import { useContext, useState } from "react";
import "./ModalReviewProduct.scss";
import UserContext from "../../../../context/use.context";
import { KEY_CONTEXT_USER } from "../../../../context/use.reducer";
import ButtonWed from "../../button/Button-admin";
import AppImages from "../../../../assets";

const ModalReviewProduct = () => {
  const [userCTX, dispatch] = useContext(UserContext);
  const [selectedStar, setSelectedStar] = useState(3);
  const [reviewText, setReviewText] = useState("");

  const cloneModal = () => {
    dispatch({
      type: KEY_CONTEXT_USER.HIDE_MODAL,
    });
  };

  const handleStarClick = (index) => {
    setSelectedStar(index + 1); // 1-based index
  };

  const getReviewIcon = () => {
    if (selectedStar <= 2) return AppImages.riview1;
    if (selectedStar === 3) return AppImages.riview3;
    if (selectedStar === 4) return AppImages.riview4;
    if (selectedStar === 5) return AppImages.riview5;
    return null;
  };

  return (
    <div className="modal-overlay-reviewModal" onClick={cloneModal}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h1>{userCTX.titleModel ?? "Đánh giá sản phẩm"}</h1>
        {selectedStar > 0 && (
          <div className="review-icon">
            <img src={getReviewIcon()} alt="review" />
          </div>
        )}
        <div className="star-rating">
          {[...Array(5)].map((_, index) => (
            <img
              key={index}
              src={index < selectedStar ? AppImages.sart2 : AppImages.sart1}
              alt={`star-${index + 1}`}
              onClick={() => handleStarClick(index)}
              className="star-icon"
            />
          ))}
        </div>

        <div className="review-input">
          <textarea
            placeholder="Nhập nội dung đánh giá..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />
        </div>

        <div className="buttonRivew">
            <div className="item_button">
                <ButtonWed buttonAuth={false} title={"Huỷ"} onClick={cloneModal} />
            </div>
            <div className="item_button">
                <ButtonWed
              buttonAuth={false}
              title={"Ok"}
              onClick={() => {
                userCTX.onClickConfirmModel({
                  star: selectedStar,
                  text: reviewText,
                });
              }}
            />
            </div>
        </div>
      </div>
    </div>
  );
};

export default ModalReviewProduct;
