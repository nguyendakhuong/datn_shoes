import { useContext, useEffect, useState } from "react";
import ModalAddDiscount from "../components/modal/modalAddDiscount/ModalAddDiscount";
import "./DiscountCode.scss";
import UserContext from "../../context/use.context";
import { KEY_CONTEXT_USER } from "../../context/use.reducer";
import ToastApp from "../../lib/notification/Toast";
import moment from "moment";
import AppImages from "../../assets";
import ModalEditDiscount from "../components/modal/modalEditDiscount/ModalEditDiscount";
const DiscountCode = () => {
  const [userCtx, dispatch] = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);
  const [data, setData] = useState([]);
  const [reload, setReloadData] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const getDiscountCode = async () => {
    try {
      dispatch({ type: KEY_CONTEXT_USER.SET_LOADING, payload: true });
      const response = await fetch(
        `http://localhost:3001/discount/getDiscounts`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer`,
          },
        }
      );
      const data = await response.json();
      if (data.status === 200) {
        setData(data.data);
      } else {
        ToastApp.error("Error: " + data.message);
      }
    } catch (e) {
      console.log("Error: " + e);
    } finally {
      dispatch({ type: KEY_CONTEXT_USER.SET_LOADING, payload: false });
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsModalOpenEdit(false);
  };

  const handleDeleteItem = (e, value) => {
    e.stopPropagation();
    dispatch({
      type: KEY_CONTEXT_USER.SHOW_MODAL,
      payload: {
        typeModal: "DELETE_ITEM",
        dataModal: value.id,
        contentModel:
          "Bạn có chắc chắn muốn xóa mã khuyến mãi " + value.name + " không?",
        onClickConfirmModel: async () => {
          try {
            const response = await fetch(
              `http://localhost:3001/discount/deleteDiscount/${value?.id}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer`,
                },
              }
            );
            const data = await response.json();
            if (data.status === 200) {
              ToastApp.success("Xóa thành công");
              setReloadData(true);
            } else {
              ToastApp.error("Error: " + data.message);
            }
          } catch (e) {
            console.log("Lỗi xóa sản phẩm: ", e);
          }
        },
      },
    });
  };
  const handelClickItem = (e, value) => {
    e.stopPropagation();
    setSelectedDiscount(value);
    setIsModalOpenEdit(true);
  };
  useEffect(() => {
    getDiscountCode();
    setReloadData(false);
  }, [isModalOpen, reload, isModalOpenEdit]);

  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });
  const discountsWithStatus = data.map((discount) => ({
    ...discount,
    isActive: moment().isBetween(
      moment(discount.startDate).startOf("day"),
      moment(discount.endDate).endOf("day"),
      null,
      "[]"
    ),
  }));
  return (
    <div className="discount-container">
      <table className="header-table">
        <thead>
          <tr>
            <th colSpan="10" className="flex header-discount">
              <span>Quản lí phiếu giảm giá</span>
              <button className="discount-button" onClick={handleOpenModal}>
                + Thêm phiếu giảm giá
              </button>
            </th>
          </tr>
        </thead>
      </table>
      <div className="discount-table-container">
        <table className="discount-table">
          <thead>
            <tr>
              <th>Mã giảm giá</th>
              <th>Tên giảm giá</th>
              <th>Mức giảm giá</th>
              <th>Hình thức giảm giá</th>
              <th>Mô tả</th>
              <th>Hạn mức tối đa</th>
              <th>Số tiền tối thiểu</th>
              <th>Số lượng</th>
              <th>Ngày bắt đầu</th>
              <th>Ngày kết thúc</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          {data
            ? data.map((value) => {
                const isActive = moment().isBetween(
                  moment(value.startDate).startOf("day"),
                  moment(value.endDate).endOf("day"),
                  null,
                  "[]"
                );

                return (
                  <tr key={value.id} onClick={(e) => handelClickItem(e, value)}>
                    <td>{value.promotionCode}</td>
                    <td>{value.name}</td>
                    <td>
                      {value.promotionLevel > 100
                        ? formatter.format(value.promotionLevel)
                        : `${value.promotionLevel}%`}
                    </td>
                    <td>
                      {value.promotionType === 1
                        ? "Giảm tiền trực tiếp"
                        : "Giảm theo %"}
                    </td>
                    <td>{value.describe}</td>
                    <td>{formatter.format(value.maximumPromotion)}</td>
                    <td>{formatter.format(value.conditionsOfApplication)}</td>
                    <td>{value.quantity}</td>
                    <td>
                      {value.startDate
                        ? moment(value.startDate).format("DD/MM/YYYY")
                        : "null"}
                    </td>
                    <td>
                      {value.endDate
                        ? moment(value.endDate).format("DD/MM/YYYY")
                        : "null"}
                    </td>

                    {/* ✅ Trạng thái hoạt động */}
                    <td className={isActive ? "active" : "inactive"}>
                      <span
                        className={isActive ? "active-text" : "inactive-text"}
                      >
                        {isActive ? "Hoạt động" : "Không hoạt động"}
                      </span>
                    </td>

                    <td>
                      <div onClick={(e) => handleDeleteItem(e, value)}>
                        <img
                          src={AppImages.deleteIcon}
                          alt="Delete"
                          style={{ width: "20px" }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            : null}
        </table>
      </div>
      <ModalAddDiscount isOpen={isModalOpen} onClose={handleCloseModal} />
      <ModalEditDiscount
        data={selectedDiscount}
        isOpen={isModalOpenEdit}
        onClose={handleCloseModal}
      />
    </div>
  );
};
export default DiscountCode;
