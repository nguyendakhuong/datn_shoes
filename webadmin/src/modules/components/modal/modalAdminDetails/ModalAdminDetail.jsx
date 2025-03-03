import { useEffect, useRef, useState } from "react";
import "./ModalAdminDetail.scss"
import ToastApp from "../../../../lib/notification/Toast";
import APP_LOCAL from "../../../../lib/localStorage";

const ModalAdminDetail = ({ id, onClose, isOpen }) => {

    const [data, setData] = useState(null);
    const dialogRef = useRef();
    const token = APP_LOCAL.getTokenStorage();
    const getAdmin = async () => {
        try {
            const response = await fetch(`http://localhost:3001/admin/getAdminId/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.status === 200) {
                setData(data.data);
            } else {
                onClose();
                ToastApp.warning(data.message);
            }
        } catch (e) {
            console.log(e)
        }
    };
    const handleClickOutside = (event) => {
        if (dialogRef.current && !dialogRef.current.contains(event.target)) {
            onClose();
        }
    };
    useEffect(() => {
        if (isOpen) {
            getAdmin();
        }
    }, [isOpen]);
    return (
        isOpen && (
            <div className="dialog-overlay-admin" onClick={handleClickOutside}>
                <div className="dialog" ref={dialogRef}>
                    <h2>Thông tin chi tiết tài khoản Admin</h2>
                    {data && data.id === id ? (
                        <div>
                            <div className="dialog-content">
                                <div className="info-container">
                                    <p><strong>Mã tài khoản:</strong> {data.employeeCode}</p>
                                    <p><strong>Tên đăng nhập:</strong> {data.username}</p>
                                    <p><strong>Tên người dùng:</strong> {data.name}</p>
                                    <p><strong>Email:</strong> {data.email}</p>
                                    <p><strong>SĐT:</strong> {data.phoneNumber}</p>
                                    <p><strong>Chức vụ:</strong> {data.position}</p>
                                    <p><strong>Giới tính:</strong> {data.sex}</p>
                                    <p><strong>Ngày sinh:</strong> {data.dob}</p>
                                    <p><strong>Người tạo:</strong> {data.creator}</p>
                                    <p><strong>Người cập nhật:</strong> {data.updater}</p>
                                    <p><strong>Ngày tạo:</strong>{new Date(data.createdAt).toLocaleString("vi-VN")}</p>
                                    <p><strong>Ngày cập nhật:</strong> {new Date(data.updatedAt).toLocaleString("vi-VN")}</p>
                                    <p><strong>Trạng thái: </strong> {data.status === 1 ? "Đang hoạt động" : "Không hoạt động"}</p>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        )
    )
}
export default ModalAdminDetail