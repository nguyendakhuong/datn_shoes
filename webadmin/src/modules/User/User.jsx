
import { useEffect, useState } from 'react';
import './User.scss';
import AppImages from '../../assets';
import ToastApp from '../../lib/notification/Toast';
const User = () => {
    const [data, setData] = useState([])
    const [reloadData, setReloadData] = useState(false)

    const getAccounts = async () => {
        try {
            const res = await fetch(`http://localhost:3001/admin/getClients/user`, {
                headers: {
                    Authorization: `Bearer`,
                },
            });
            console.log(res)
            const data = await res.json();
            console.log(data)
            if (data.status === 200) {
                setData(data.data)
            } else {
                ToastApp.error('Error: ' + data.message)
            }

        } catch (e) {
            console.log("Lỗi lấy danh sách tài khoảng admin")
        }
    }

    const handleStatus = async (e, id) => {
        e.stopPropagation();
        try {
            const response = await fetch(`http://localhost:3001/admin/updateStatusUser/${id}`,
                {
                    method: 'GET',
                });
            const data = await response.json();
            if (data.status === 200) {
                ToastApp.success("Cập nhật trạng thái thành công")
                setReloadData(true)
            } else {
                ToastApp.error('Error: ' + data.message);
            }
        } catch (e) {
            console.log("Lỗi", e)
        }
    }

    useEffect(() => {
        getAccounts()
        setReloadData(false)
    }, [reloadData])
    console.log(data)
    return (
        <div className="container">
            {
                <div className="product-container">
                    <table className="header-table">
                        <thead>
                            <tr>
                                <th colSpan="10">
                                    <div className="purple-line"></div>
                                    <div className="createAccount">
                                        <span>Danh sách tài khoản quản lý</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                    </table>
                    <div className="product-table-container">
                        <table className="product-table">
                            <thead>
                                <tr>
                                    <th>Mã khách hàng</th>
                                    <th>Tên đăng nhập</th>
                                    <th>Tên người dùng</th>
                                    <th>Email</th>
                                    <th>Giới tính</th>
                                    <th>Ngày sinh</th>
                                    <th>Số điện thoại</th>
                                    <th>Trạng thái</th>
                                    { }
                                </tr>
                            </thead>
                            {
                                data && <tbody >
                                    {data.map(account => (
                                        <tr key={account.id}>
                                            <td>{account.customerCode}</td>
                                            <td>{account.username}</td>
                                            <td>{account.name}</td>
                                            <td>{account.email}</td>
                                            <td>{account.sex}</td>
                                            <td>{account.dob}</td>
                                            <td>{account.phoneNumber}</td>
                                            <td><button onClick={(e) => handleStatus(e, account.id)} className={account?.status === 1 ? 'active-product' : 'inactive-product'}>
                                                {account?.status === 1 ? "Hoạt động" : "Không hoạt động"}
                                            </button></td>
                                        </tr>
                                    ))}
                                </tbody>

                            }
                        </table>
                    </div>
                </div>
            }
        </div>
    );
};

export default User;
