import React, { useEffect, useState } from "react";
import { Button } from "antd";
import { NavLink, useParams } from "react-router-dom";
import { connect } from "react-redux";
// import Loading from "../../components/Loading/loading";

function DetailUserManage(props) {
  const { id } = useParams(); // Lấy id từ URL
  const [userDetail, setUserDetail] = useState(null);
  useEffect(() => {
    if (props.listUser) {
      let user = props.listUser.find((item) => item.taiKhoan === id);
      setUserDetail(user);
    }
  }, [props.listUser, id]);
  return (
    <div
      className="w-50 mx-auto  pl-5 mt-5"
      style={{
        border: "1px solid gray",
        boxShadow: "2px 2px 10px 2px lightgray",
      }}
    >
      <h2 className="display-4 my-4 text-center">Thông tin chi tiết</h2>
      <div>
        Tài Khoản:{" "}
        <span className="font-weight-bold">
          {userDetail ? userDetail.taiKhoan : ""}
        </span>
      </div>
      <div>
        Email:{" "}
        <span className="font-weight-bold">
          {userDetail ? userDetail.email : ""}
        </span>
      </div>
      <div>
        Số điện thoại:{" "}
        <span className="font-weight-bold">
          {userDetail ? userDetail.soDt : ""}
        </span>
      </div>
      <div>
        Loại người dùng:{" "}
        <span className="font-weight-bold">
          {userDetail ? userDetail.maLoaiNguoiDung : ""}
        </span>
      </div>
      <div>
        Họ tên:{" "}
        <span className="font-weight-bold">
          {userDetail ? userDetail.hoTen : ""}
        </span>
      </div>
      <NavLink activeClassName="active" className="nav-link" to="/admin">
        <Button type="primary" danger className="my-5">
          Trở về trang trước
        </Button>
      </NavLink>
    </div>
  );
}
const mapStateToProps = (state) => {
  return {
    listUser: state.AdminReducer.listUser,
  };
};
export default connect(mapStateToProps, null)(DetailUserManage);
