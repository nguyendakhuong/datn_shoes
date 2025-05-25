import { useContext, useEffect, useState } from "react";
import InputAdmin from "../../input/Input-admin";
import "./ModalPayment.scss";
import ButtonWed from "../../button/Button-admin";
import APP_LOCAL from "../../../../lib/localStorage";
import ToastApp from "../../../../lib/notification/Toast";
import Select from "react-select";
import UserContext from "../../../../context/use.context";
import { KEY_CONTEXT_USER } from "../../../../context/use.reducer";
import { useNavigate } from "react-router-dom";

const ModalPayment = ({ data, total, isOpen, onClose }) => {
  const [userCtx, dispatch] = useContext(UserContext);
  const [discount, setDiscount] = useState("");
  const [discountAPI, setDiscountAPI] = useState();
  const [totalAfterDiscount, setTotalAfterDiscount] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [type, setType] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [dataAddress, setDataAddress] = useState([]);
  const [dataUser, setDataUser] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [dataOrder, setDataOrder] = useState(null);
  const [selectDiscount, setSelectDiscount] = useState([]);
  const navigate = useNavigate();
  console.log(discount);
  const handleDiscount = async (selected) => {
    if (!selected) {
      setDiscountAPI(null);
      setDiscount("");
      return;
    }
    const token = APP_LOCAL.getTokenStorage();
    try {
      const response = await fetch(
        "http://localhost:3001/discount/useDiscount",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ discount: selected, total }),
        }
      );
      const result = await response.json();
      if (result.status === 401) {
        console.log(result.data);
        dispatch({
          type: KEY_CONTEXT_USER.SHOW_MODAL,
          payload: {
            typeModal: "NOTIFICATION_MODAL",
            titleModel: "Sử dụng mã thất bại",
            contentModel: `Mã áp dụng các đơn hàng có giá trị trên ${formatter.format(
              result.data?.conditionsOfApplication
            )}`,
            onClickConfirmModel: async () => {
              dispatch({ type: KEY_CONTEXT_USER.HIDE_MODAL, payload: true });
            },
          },
        });
        return;
      }
      if (result.status === 200) {
        ToastApp.success("Sử dụng phiếu giảm giá thành công");
        setDiscountAPI(result.discount);
        setTotalAfterDiscount(result.data);
        setDiscountAmount(result.totalPromotion);
        setDiscount(selected);
      } else {
        ToastApp.warning(result.message);
      }
    } catch (e) {
      console.log("Lỗi sử dụng mã giảm giá: ", e);
    }
  };
  const handleChangeRadio = (e) => {
    setType(parseInt(e.target.value));
  };
  const handlePayment = async () => {
    if (!dataUser.name || !dataUser.phoneNumber) {
      return ToastApp.warning("Vui lòng thêm thông tin cá nhân");
    }
    if (!selectedAddress) {
      return ToastApp.warning("Vui lòng chọn địa chỉ");
    }
    const token = APP_LOCAL.getTokenStorage();
    dispatch({
      type: KEY_CONTEXT_USER.SHOW_MODAL,
      payload: {
        typeModal: "NOTIFICATION_MODAL",
        contentModel: "Xác nhận thanh toán hóa đơn !!!",
        onClickConfirmModel: async () => {
          try {
            if (type === 1) {
              const body = {
                userName: dataUser.name,
                phoneNumber: dataUser.phoneNumber,
                address: selectedAddress,
                totalDefault: total,
                totalPromotion: discountAmount || 0,
                totalPayment:
                  totalAfterDiscount > 0
                    ? totalAfterDiscount + 30000
                    : total + 30000,
                discount: discountAPI?.name || "",
                product: data,
              };
              const response = await fetch(
                `http://localhost:3001/order/createOrder`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify(body),
                }
              );
              const result = await response.json();
              if (result.status === 200) {
                ToastApp.success(result.message);
                const id = data.map((v) => v.productDetailCode);
                const newCart = userCtx.cart.filter((c) => !id.includes(c.id));
                dispatch({
                  type: KEY_CONTEXT_USER.SET_CART,
                  payload: newCart,
                });
                onClose();
                setOrderSuccess(true);
              } else {
                ToastApp.warning(result.message);
              }
            }
            if (type === 2) {
              const body = {
                address: selectedAddress,
                totalDefault: total,
                totalPromotion: discountAmount || 0,
                totalPayment:
                  totalAfterDiscount > 0 ? totalAfterDiscount : total,
                discount: discountAPI?.name || "",
                product: data,
              };
              const response = await fetch(
                `http://localhost:3001/payment/createOrderPayment`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify(body),
                }
              );
              const result = await response.json();
              if (result.status === 200) {
                ToastApp.success(result.message);
                const id = data.map((v) => v.productDetailCode);
                const newCart = userCtx.cart.filter((c) => !id.includes(c.id));
                dispatch({
                  type: KEY_CONTEXT_USER.SET_CART,
                  payload: newCart,
                });
                onClose();
                // setOrderSuccess(true);
                setDataOrder(result.data);
              } else {
                ToastApp.warning(result.message);
              }
            }
          } catch (e) {
            console.log("Lỗi tạo đơn hàng: ", e);
          }
        },
      },
    });
  };
  const getAddress = async () => {
    const token = APP_LOCAL.getTokenStorage();
    try {
      const response = await fetch(`http://localhost:3001/address`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.status === 200) {
        setDataAddress(data.data);
      }
    } catch (e) {
      console.log("Lỗi lấy thông tin người dùng: ", e);
    }
  };
  const getUser = async () => {
    const token = APP_LOCAL.getTokenStorage();
    try {
      const response = await fetch(`http://localhost:3001/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.status === 200) {
        setDataUser(data.data);
      }
    } catch (e) {
      console.log("Lỗi lấy thông tin người dùng: ", e);
    }
  };
  const createVnpPayment = async (orderCode, totalPayment, bankCode = "") => {
    try {
      dispatch({ type: KEY_CONTEXT_USER.SET_LOADING, payload: true });
      const response = await fetch(
        `http://localhost:3001/payment/createPayment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: orderCode,
            amount: totalPayment,
            bankCode: bankCode,
          }),
        }
      );
      const result = await response.json();
      if (result.status === 200) {
        window.location.href = result.data;
      } else {
        console.log("Lỗi VNP: ", result.message);
      }
    } catch (error) {
      console.log("Lỗi khi thanh toán:", error);
    } finally {
      dispatch({ type: KEY_CONTEXT_USER.SET_LOADING, payload: false });
    }
  };
  const getDiscountByUser = async () => {
    const token = APP_LOCAL.getTokenStorage();
    try {
      const response = await fetch(
        `http://localhost:3001/discount/getDiscountByUser`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.status === 200) {
        setSelectDiscount(data.data);
      } else {
        console.log("Lỗi lấy mã giảm giá: ", data.message);
      }
    } catch (e) {
      console.log("Lỗi lấy mã giảm giá: ", e);
    }
  };

  useEffect(() => {
    getAddress();
    getUser();
    getDiscountByUser();
  }, []);
  useEffect(() => {
    if (orderSuccess) {
      navigate("/home");
    }
  }, [orderSuccess]);

  useEffect(() => {
    if (dataOrder) {
      createVnpPayment(dataOrder.orderCode, dataOrder.totalPayment);
    }
  }, [dataOrder]);

  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });
  const options = dataAddress.map((item) => ({
    value: item.id,
    label: `${item.address} - ${item.commune} - ${item.district} - ${item.province}`,
  }));
  const sortedDiscounts = selectDiscount
    .map((item) => {
      let value = 0;
      if (item.promotionLevel > 100) {
        value = item.promotionLevel;
      } else {
        const discount = (total * item.promotionLevel) / 100;
        value = item.maximumPromotion
          ? Math.min(discount, item.maximumPromotion)
          : discount;
      }
      return { ...item, estimatedDiscount: value };
    })
    .sort((a, b) => b.estimatedDiscount - a.estimatedDiscount);
  return (
    <>
      {isOpen && (
        <div className="modal-pay" onClick={onClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="item-order-payment">
              <h3>Chi tiết hóa đơn</h3>
              {data.map((v, i) => (
                <div key={i}>
                  <div className="item">
                    <div className="item-image">
                      <img src={v.image} alt={v.name} />
                    </div>
                    <div>
                      <h4>{v.name}</h4>
                      <p>Màu : {v.colorName}</p>
                      <p>Giá : {formatter.format(v.price)}</p>
                      <p>Số lượng : {v.quantity}</p>
                    </div>
                  </div>
                  <hr />
                </div>
              ))}
            </div>

            <div>
              <div className="form-discount">
                <span htmlFor="discount">Giảm giá</span>
                <select
                  id="discount"
                  name="discount"
                  value={discount}
                  onChange={(e) => {
                    const selected = e.target.value;
                    setDiscount(selected);
                    handleDiscount(selected);
                  }}
                  className="input-select"
                >
                  <option value="">Không sử dụng</option>
                  {sortedDiscounts.map((item, index) => (
                    <option key={index} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                {discountAPI ? (
                  <div className="flex">
                    <span>Tên phiếu giảm giá : {discountAPI.name}</span>
                    <span>Mô tả: {discountAPI.describe}</span>
                    <span>
                      Số tiền tối thiểu :{" "}
                      {discountAPI.conditionsOfApplication
                        ? `${formatter.format(
                            discountAPI.conditionsOfApplication
                          )}`
                        : "0đ"}
                    </span>
                    <span>
                      Hạn mức tối đa:{" "}
                      {discountAPI.maximumPromotion
                        ? `${formatter.format(discountAPI.maximumPromotion)}`
                        : "0đ"}
                    </span>

                    <span>
                      Mức giảm giá:{" "}
                      {discountAPI.promotionLevel > 100
                        ? `${formatter.format(discountAPI.promotionLevel)}`
                        : discountAPI.promotionLevel + "%"}
                    </span>
                  </div>
                ) : null}
                <div className="flex">
                  <span>Số tiền ban đầu: {formatter.format(total)}</span>
                  <span>
                    Số tiền sau giảm giá:
                    {totalAfterDiscount && discountAPI
                      ? formatter.format(totalAfterDiscount)
                      : formatter.format(total)}
                  </span>
                  <span>Phí vận chuyển : {formatter.format(30000)}</span>
                </div>
              </div>
              <div className="type-input">
                <label>
                  <span>Hình thức thanh toán:</span>
                  <input
                    type="radio"
                    name="type"
                    value={1}
                    checked={type === 1}
                    onChange={handleChangeRadio}
                  />
                  <span></span> COD
                </label>
                <label>
                  <input
                    type="radio"
                    name="type"
                    value={2}
                    checked={type === 2}
                    onChange={handleChangeRadio}
                  />
                  <span></span> VNP
                </label>
              </div>
              <div className="select-address">
                <h4>Chọn địa chỉ:</h4>
                <Select
                  options={options}
                  value={options.find(
                    (option) => option.value === selectedAddress
                  )}
                  onChange={(selected) => setSelectedAddress(selected.label)}
                  placeholder="Chọn địa chỉ..."
                />
              </div>
              <div className="info-user">
                <span>Tên người tạo đơn hàng: {dataUser.name}</span>
                <span>Số điện thoại: {dataUser.phoneNumber}</span>
                <span>Email: {dataUser.email}</span>
              </div>
              <div className="flex-total">
                <span>Số tiền bạn cần thanh toán: </span>
                <p>
                  {totalAfterDiscount && discountAPI
                    ? formatter.format(totalAfterDiscount + 30000)
                    : formatter.format(total + 30000)}
                </p>
              </div>
              <div className="btn-payment">
                <ButtonWed
                  title={"Thanh toán hóa đơn"}
                  onClick={handlePayment}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default ModalPayment;
