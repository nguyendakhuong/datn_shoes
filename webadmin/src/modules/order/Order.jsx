import { useEffect, useState } from "react";
import "./Oder.scss";
import OrderDetail from "../components/modal/modalOrder/OrderDetail";
import InputAdmin from "../components/input/Input-admin";
import ToastApp from "../../lib/notification/Toast";
const Order = () => {
  const [reloadData, setReloadData] = useState(false);
  const [data, setData] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchDataOder, setSearchDataOrder] = useState("");
  const [dataSearch, setDataSearch] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPage, setItemPage] = useState(10);
  const lastIndex = currentPage * itemPage;
  const firstIndex = lastIndex - itemPage;
  const records = data ? data.slice(firstIndex, lastIndex) : null;
  const nPage = data ? Math.ceil(data.length / itemPage) : null;
  const numbers = [...Array(nPage + 1).keys()].slice(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");

  const getAllOrder = async () => {
    try {
      const response = await fetch(`http://localhost:3001/order/getAllOrders`, {
        headers: {
          Authorization: `Bearer `,
        },
      });
      const data = await response.json();
      if (data.status === 200) {
        console.log(data);
        const sortedData = data.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setData(sortedData);
      }
    } catch (e) {
      console.log("Lỗi lấy sản phẩm người dùng: ", e);
    }
  };
  const handleSelect = (e) => {
    setItemPage(e.target.value);
    setCurrentPage(1);
  };
  const statusLabels = {
    0: "Chưa thanh toán",
    1: "Chờ xác nhận",
    2: "Đơn đã được xác nhận và chờ vận chuyển",
    3: "Đơn hàng đang được vận chuyển",
    4: "Đơn đã thanh toán",
    5: "Đã nhận hàng",
    6: "Đơn bị hủy hàng", // hủy hàng (phía admin)
    7: "Khách hủy hàng", // boom hàng
    8: "Đơn hàng bị lỗi do không hoàn tất thanh toán",
    9: "Đợi nhập hàng",
  };
  const handleInputSearch = (e) => {
    const { name, value } = e.target;
    if (name === "search") {
      setSearchDataOrder(value.trim());
    }
  };
  const viewOrderDetail = async (order) => {
    setSelectedOrder(order);
  };
  const handleOnclose = () => {
    setSelectedOrder(null);
    getAllOrder();
  };

  const OrderTableRow = ({ order, viewOrderDetail, statusLabels }) => {
    const updatedAtDate = new Date(order.updatedAt);
    const formattedUpdatedAt = `${
      updatedAtDate.getUTCDate() < 10
        ? "0" + updatedAtDate.getUTCDate()
        : updatedAtDate.getUTCDate()
    }-${
      updatedAtDate.getUTCMonth() + 1 < 10
        ? "0" + (updatedAtDate.getUTCMonth() + 1)
        : updatedAtDate.getUTCMonth() + 1
    }-${updatedAtDate.getUTCFullYear()}`;
    const handlePrint = (order) => {
      const printContent = printOrder(order);
      const printFrame = document.createElement("iframe");
      printFrame.style.position = "absolute";
      printFrame.style.width = "0";
      printFrame.style.height = "0";
      printFrame.style.border = "none";
      document.body.appendChild(printFrame);
      const doc = printFrame.contentWindow.document;
      doc.open();
      doc.write(printContent);
      doc.close();
      printFrame.contentWindow.focus();
      printFrame.contentWindow.print();
      document.body.removeChild(printFrame);
    };

    const printOrder = (order) => {
      const formattedUpdatedAt = new Date(order.updatedAt).toLocaleDateString(
        "vi-VN"
      );
      return `
    <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 40px;
            background-color: #f9f9f9;
            color: #333;
          }
          .order-container {
            background: #fff;
            border: 1px solid #ccc;
            padding: 30px;
            max-width: 900px;
            margin: auto;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            border-radius: 8px;
            position: relative;
          }
          .order-header {
            text-align: center;
            margin-bottom: 30px;
          }
          .order-header h1 {
            margin: 0;
            font-size: 28px;
            color: #444;
          }
          .order-details {
            margin-bottom: 30px;
            font-size: 16px;
          }
          .order-details p {
            margin: 6px 0;
          }
          .order-products h2 {
            font-size: 20px;
            margin-bottom: 10px;
            color: #333;
          }
          .product-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
          }
          .product-table th, .product-table td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
            font-size: 15px;
          }
          .product-table th {
            background-color: #f0f0f0;
          }
          .total-payment {
            font-size: 20px;
            font-weight: bold;
            color: #d32f2f;
            text-align: right;
            margin-top: 20px;
            border-top: 2px solid #ccc;
            padding-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="order-container">
          <div class="order-header">
            <h1>HÓA ĐƠN</h1>
          </div>
          <div class="order-details">
            <p><strong>Tên cửa hàng:</strong> Shoe Store</p>
            <p><strong>Mã đơn hàng:</strong> ${order.orderCode}</p>
            <p><strong>Tên khách hàng:</strong> ${order.userName}</p>
            <p><strong>Số điện thoại:</strong> ${order.phoneNumber}</p>
            <p><strong>Địa chỉ giao hàng:</strong> ${order.address}</p>
            <p><strong>Hình thức thanh toán:</strong> ${order.paymentMethod}</p>
            <p><strong>Ngày giao:</strong> ${formattedUpdatedAt}</p>
            <p><strong>Số tiền ban đầu:</strong> ${formatter.format(
              order.totalDefault
            )}</p>
            <p >
                  <strong>Số tiền đã giảm:</strong>
                  ${formatter.format(order.totalPromotion)}
                </p>
                <p >
                  <strong>Số tiền sau giảm:</strong>
                  ${formatter.format(order.totalPayment - order.shippingFee)}
                </p>
                ${order.shippingFee > 0 ?
                `<p><strong>Phí vận chuyển:</strong> ${formatter.format(order.shippingFee)}</p>` : ""} 
          
          </div>
          <div class="order-products">
            <h2>Danh sách sản phẩm</h2>
            <table class="product-table">
              <thead>
                <tr>
                  <th>Tên sản phẩm</th>
                  <th>Màu</th>
                  <th>Size</th>
                  <th>Số lượng</th>
                  <th>Giá tiền</th>
                </tr>
              </thead>
              <tbody>
                ${
                  order.orderDetails && order.orderDetails.length
                    ? order.orderDetails
                        .map(
                          (product) => `
                    <tr>
                      <td>${product.nameProduct}</td>
                      <td>${product.color}</td>
                      <td>${product.size}</td>
                      <td>${product.quantity}</td>
                      <td>${formatter.format(product.price)}</td>
                    </tr>`
                        )
                        .join("")
                    : `<tr><td colspan="5">Không có sản phẩm nào.</td></tr>`
                }
              </tbody>
            </table>
          </div>
          <div class="total-payment">
            Số tiền cần thanh toán: ${formatter.format(order.totalPayment)}
          </div>
        </div>
      </body>
    </html>
  `;
    };

    return (
      <tr key={order.id} onClick={() => viewOrderDetail(order)}>
        <td>{order.orderCode}</td>
        <td>{order.userName}</td>
        <td>{order.phoneNumber}</td>
        <td>{formatter.format(order.totalDefault)}</td>
        <td>{formatter.format(order.totalPromotion)}</td>
        <td>{formatter.format(order.shippingFee)}</td>
        <td>{formatter.format(order.totalPayment)}</td>
        <td>{order.paymentMethod}</td>
        <td>{formattedUpdatedAt}</td>
        <td>{order.address}</td>
        <td>{statusLabels[order.status]}</td>
        <td>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrint(order);
            }}
            disabled={order.status !== "4" && order.status !== "5"}
            style={{
              cursor:
                order.status !== "4" && order.status !== "5"
                  ? "not-allowed"
                  : "pointer",
              opacity: order.status !== "4" && order.status !== "5" ? 0.5 : 1,
            }}
          >
            Xuất hóa đơn
          </button>
        </td>
      </tr>
    );
  };

  const options = [{ value: 10, label: "10" }];
  const prePage = () => {
    if (currentPage !== 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  const changePage = (id) => {
    setCurrentPage(id);
  };
  const nextPage = () => {
    if (currentPage !== nPage) {
      setCurrentPage(currentPage + 1);
    }
  };
  useEffect(() => {
    getAllOrder();
    setReloadData(false);
  }, [reloadData]);

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/order/searchOrderByPhoneNumber`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phoneNumber: searchDataOder }),
        }
      );
      const searchData = await response.json();
      if (searchData.status === 200) {
        setDataSearch(searchData.data);
      } else {
        ToastApp.error("Error: " + searchData.message);
      }
    } catch (e) {
      console.log("Error search:" + e);
    }
  };

  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });
  const filteredOrders = records.filter((order) => {
    const onlineMethods = ["Thanh toán khi nhận hàng", "Thanh toán online"];
    const offlineMethods = ["Thanh toán offline tại quầy"];
    const matchesPaymentMethod =
      !selectedPaymentMethod ||
      (selectedPaymentMethod === "online" &&
        onlineMethods.includes(order.paymentMethod)) ||
      (selectedPaymentMethod === "offline" &&
        offlineMethods.includes(order.paymentMethod));
    const matchesPhone =
      !searchDataOder ||
      (order.phoneNumber &&
        order.phoneNumber.toString().includes(searchDataOder.toString()));
    return matchesPaymentMethod && matchesPhone;
  });
  return (
    <div>
      {selectedOrder ? (
        <OrderDetail order={selectedOrder} onClose={handleOnclose} />
      ) : (
        <div>
          <div className="header-order">
            <span>Quản lí hoá đơn</span>
            <div className="search-box-oder">
              <div className="filter-payment-method">
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="online">Hoá đơn online</option>
                  <option value="offline">Hoá đơn thanh toán tại quầy</option>
                </select>
              </div>
              <div className="input-search-order">
                <InputAdmin
                  type="text"
                  placeholder={"Số điện thoại ..."}
                  name="search"
                  value={searchDataOder}
                  onChange={handleInputSearch}
                />
              </div>
              <div className="btn-search-order">
                <button onClick={handleSearch}>TÌm kiếm</button>
              </div>
            </div>
          </div>
          <div className="order-table-container">
            <table className="discount-table">
              <thead>
                <tr>
                  <th>Mã đơn hàng</th>
                  <th>Tên người đặt</th>
                  <th>Số điện thoại</th>
                  <th>Giá ban đầu </th>
                  <th>Giá khuyến mại </th>
                  <th>Phí vận chuyển</th>
                  <th>Giá thanh toán </th>
                  <th>Hình thức thanh toán </th>
                  <th>Thời gian</th>
                  <th>Địa chỉ</th>
                  <th>Trạng thái</th>
                  <th>Hóa đơn</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order, index) => (
                    <OrderTableRow
                      key={index}
                      order={order}
                      viewOrderDetail={viewOrderDetail}
                      statusLabels={statusLabels}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan="11">Không tìm thấy kết quả phù hợp</td>
                  </tr>
                )}
              </tbody>
            </table>
            <nav className={`${searchDataOder ? "inactivePagination" : null}`}>
              {numbers && numbers.length >= 10 ? (
                <ul className="pagination">
                  <li className="page-item">
                    <a href="#" className="pageLink" onClick={prePage}>
                      Prev
                    </a>
                  </li>
                  {numbers.length > 7 && currentPage >= 6 && (
                    <li className="page-item">
                      <a
                        href="#"
                        className={`pageLink`}
                        onClick={() => changePage(1)}
                      >
                        1
                      </a>
                    </li>
                  )}
                  {currentPage > 5 && <li className="page-item">...</li>}

                  {numbers
                    .slice(
                      currentPage > 5 ? currentPage - 3 : 0,
                      currentPage + 3
                    )
                    .map((n, i) => (
                      <li className="page-item" key={i}>
                        <a
                          href="#"
                          className={`pageLink ${
                            currentPage === n ? "active" : ""
                          }`}
                          onClick={() => changePage(n)}
                        >
                          {n}
                        </a>
                      </li>
                    ))}
                  {currentPage < numbers.length - 3 && (
                    <li className="page-item">...</li>
                  )}

                  {numbers.length > 7 && currentPage < numbers.length - 3 && (
                    <li className="page-item">
                      <a
                        href="#"
                        className={`pageLink`}
                        onClick={() => changePage(numbers.length)}
                      >
                        {numbers.length}
                      </a>
                    </li>
                  )}
                  <li className="page-item">
                    <a href="#" className="pageLink" onClick={nextPage}>
                      Next
                    </a>
                  </li>
                  <div className="selectPagination">
                    <select onChange={handleSelect}>
                      {options.map((option, index) => (
                        <option key={index} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </ul>
              ) : (
                <ul className="pagination">
                  <li className="page-item">
                    <a href="#" className="pageLink" onClick={prePage}>
                      Prev
                    </a>
                  </li>
                  {numbers.map((n, i) => (
                    <li className="page-item" key={i}>
                      <a
                        href="#"
                        className={`pageLink ${
                          currentPage === n ? "active" : ""
                        }`}
                        onClick={() => changePage(n)}
                      >
                        {n}
                      </a>
                    </li>
                  ))}
                  <li className="page-item">
                    <a href="#" className="pageLink" onClick={nextPage}>
                      Next
                    </a>
                  </li>
                  <div className="selectPagination">
                    <select onChange={handleSelect} value={itemPage}>
                      {options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </ul>
              )}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;
