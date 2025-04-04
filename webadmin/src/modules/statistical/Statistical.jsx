import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { FaEye, FaShoppingCart, FaComment, FaMoneyBillAlt, FaUser, FaProductHunt } from "react-icons/fa";
import './Statistical.scss'
import InputAdmin from "../components/input/Input-admin";
import ToastApp from "../../lib/notification/Toast";
const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];


const Statistical = () => {
    const [data, setData] = useState(null)
    const [orderData, setOrderData] = useState([])
    const [productData, setProductData] = useState([])
    const [productDataTime, setProductDataTime] = useState([])
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const formatter = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    });

    const stats = [
        { icon: <FaUser size={24} />, value: data?.totalUsers, label: "Tổng khách hàng" },
        { icon: <FaShoppingCart size={24} />, value: data?.totalProductsSold, label: "Sản phẩm đã bán" },
        { icon: <FaProductHunt size={24} />, value: data?.activeProducts, label: "Sản phẩm hoạt động" },
        { icon: <FaMoneyBillAlt size={24} />, value: formatter.format(data?.monthlyRevenue), label: "Doanh thu theo tháng" },
        { icon: <FaMoneyBillAlt size={24} />, value: formatter.format(data?.totalRevenue), label: "Tổng doanh thu" }
    ];
    const getStatistical = async () => {
        try {
            const res = await fetch(`http://localhost:3001/statistical/getInfoStatistical`, {
                headers: {
                    Authorization: `Bearer `,
                },
            });
            const data = await res.json();
            if (data.status === 200) {
                setData(data.data)
            } else {
                console.log("Lỗi lấy dữ liệu thống kê: ", data.message)
                ToastApp.warning("Lỗi lấy dữ liệu")
            }
        } catch (error) {
            console.log("Lỗi lấy dữ liệu thống kê: ", error)
        }
    }
    const ordersByPaymentMethod = async () => {
        try {
            const res = await fetch(`http://localhost:3001/statistical/ordersByPaymentMethod`, {
                headers: {
                    Authorization: `Bearer `,
                },
            });
            const data = await res.json();
            if (data.status === 200) {
                setOrderData(data.data.ordersByPaymentMethod)
            } else {
                console.log("Lỗi lấy dữ liệu: ", data.message)
                ToastApp.warning("Lỗi lấy dữ liệu")
            }
        } catch (error) {
            console.log("Lỗi lấy dữ liệu thống kê: ", error)
        }
    }
    const productSales = async () => {
        try {
            const res = await fetch(`http://localhost:3001/statistical/productSales`, {
                headers: {
                    Authorization: `Bearer `,
                },
            });
            const data = await res.json();
            if (data.status === 200) {
                setProductData(data.data)
            } else {
                console.log("Lỗi lấy dữ liệu: ", data.message)
                ToastApp.warning("Lỗi lấy dữ liệu")
            }
        } catch (error) {
            console.log("Lỗi lấy dữ liệu thống kê: ", error)
        }
    }
    const productSalesByDate = async () => {
        try {
            const res = await fetch(`http://localhost:3001/statistical/productSalesByDate`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer `,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ startDate, endDate })
            });
            const data = await res.json();
            if (data.status === 200) {
                setProductDataTime(data.data)
            } else {
                console.log("Lỗi lấy dữ liệu: ", data.message)
                ToastApp.warning("Lỗi lấy dữ liệu")
            }
        } catch (error) {
            console.log("Lỗi lấy dữ liệu thống kê: ", error)
        }
    }
    useEffect(() => {
        getStatistical()
        ordersByPaymentMethod()
        productSales()
    }, [])
    useEffect(() => {
        if (startDate && endDate) productSalesByDate()
    }, [startDate, endDate])
    return (
        <div className="statistical-container">
            <h2>Thống kê</h2>
            <div className="dashboard-stats">
                {stats.map((item, index) => (
                    <div key={index} className="stat-card">
                        <div className="icon">{item.icon}</div>
                        <div className="info">
                            <p className="value">{item.value}</p>
                            <p className="label">{item.label}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="charts">
                <div className="chart">
                    <h3>Hình thức đơn hàng</h3>
                    {orderData && orderData.length > 0 ? (<PieChart width={300} height={300}>
                        <Pie data={orderData} cx={150} cy={150} outerRadius={100} fill="#8884d8" dataKey="value" label>
                            {orderData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>) : null}
                </div>
                <div className="chart">
                    <h3>Sản phẩm bán chạy</h3>
                    <div className="input-statistical">
                        <InputAdmin
                            placeholder="Thời gian bắt đầu"
                            type="date"
                            label="Thời gian bắt đầu"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <InputAdmin
                            placeholder="Thời gian kết thúc "
                            type="date"
                            label="Thời gian kết thúc"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />

                    </div>
                    <BarChart width={900} height={300} data={productDataTime.length > 0 ? productDataTime : productData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        {/* <YAxis /> */}
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="sales" fill="#82ca9d" />
                    </BarChart>
                </div>
            </div>
        </div>
    );
};

export default Statistical;
