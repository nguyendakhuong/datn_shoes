const sidebarNav = [
  {
    link: "/admin",
    section: "admin",
    text: "Quản lí người dùng",
    roles: ["admin","Nhân viên"],
  },
  {
    link: "/admin/accountAdmin",
    section: "accountAdmin",
    text: "Quản lí nhân viên",
    roles: ["admin"],
  },
  {
    link: "/admin/product",
    section: "product",
    text: "Quản lí sản phẩm",
    roles: ["admin"],
  },
  {
    link: "/admin/order",
    section: "order",
    text: "Quản lí hoá đơn",
    roles: ["admin","Nhân viên"],
  },
  {
    link: "/admin/statistical",
    section: "statistical",
    text: "Thống kê",
    roles: ["admin"],
  },
  {
    link: "/admin/discount",
    section: "discount",
    text: "Quản lí phiếu giảm giá",
    roles: ["admin"],
  },
  {
    link: "/admin/cartAdmin",
    section: "cartAdmin",
    text: "Quầy hàng",
    roles: ["admin","Nhân viên"],
  },
];

const CONFIG_ADMIN = {
  sidebarNav,
};
export default CONFIG_ADMIN;
