import { Table, Tag, Button, Switch } from "antd";
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { connect } from "react-redux";
import Axios from "axios";
import { actFetchListUserManage } from "../../containers/admin/module/action";
import Swal from "sweetalert2";

function ManageUser(props) {
  const [dsUser, setDSUser] = useState(null);
  useEffect(() => {
    props.fetchListUser();
  }, []);

  const handleChangeSwitch = (checked) => {
    if (checked) {
      let user = props.listUser.filter((item) => {
        return item.maLoaiNguoiDung === "KhachHang";
      });
      setDSUser(user);
    } else {
      let admin = props.listUser.filter((item) => {
        return item.maLoaiNguoiDung === "QuanTri";
      });
      setDSUser(admin);
    }
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "index",
    },
    {
      title: "Tài khoản",
      dataIndex: "taiKhoan",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "SĐT",
      dataIndex: "soDt",
    },
    {
      title: "Họ tên",
      dataIndex: "hoTen",
    },
    {
      title: "Mã loại người dùng",
      dataIndex: "maLoaiNguoiDung",
    },
    {
      title: "",
      dataIndex: "taiKhoan",
      render: (item) => (
        <>
          <div>
            <NavLink
              activeClassName="active"
              className="nav-link"
              to={`/detailUser/${item}`}
            >
              <Tag color="blue" key={item}>
                Xem Chi tiết
              </Tag>
            </NavLink>
            <Tag
              className="ml-3"
              color="red"
              key={item}
              onClick={() => {
                handleDeleteFilm(item);
              }}
            >
              Xóa
            </Tag>
            <NavLink
              activeClassName="active"
              className="nav-link"
              to="/addUser"
            >
              <Tag
                color="orange"
                key={item}
                onClick={() => {
                  props.handleEditFilm(item);
                }}
              >
                Sửa
              </Tag>
            </NavLink>
          </div>
        </>
      ),
    },
  ];

  const handleClickAddUser = () => {
    if (props.editInfoUser) {
      props.handleAddEditNull();
    }
  };
  const handleDeleteFilm = (taiKhoan) => {
    let token = "";
    if (localStorage.getItem("userAdmin")) {
      token = JSON.parse(localStorage.getItem("userAdmin")).accessToken;
    }
    Axios({
      url: `https://movie0706.cybersoft.edu.vn/api/QuanLyNguoiDung/XoaNguoiDung?TaiKhoan=${taiKhoan}`,
      method: "DELETE",
      data: taiKhoan,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((result) => {
        Swal.fire("Xóa tài khoản thành công!", "", "success");
        setTimeout(function () {
          window.location.reload();
        }, 1500);
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: `${error.response.data}`,
        });
      });
  };

  return (
    <div>
      <div className="row">
        <div className="col-md-6">
          <NavLink activeClassName="active" className="nav-link" to="/addUser">
            <Button type="primary" danger onClick={handleClickAddUser}>
              Thêm User
            </Button>
          </NavLink>
        </div>
        <div className="col-md-6 text-right">
          <Switch
            checkedChildren="User"
            unCheckedChildren="Admin"
            defaultChecked
            onChange={handleChangeSwitch}
          />
        </div>
      </div>
      <Table columns={columns} dataSource={dsUser ? dsUser : props.listUser} />
    </div>
  );
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleEditFilm: (taiKhoan) => {
      dispatch({
        type: "FETCH_EDIT_USER_MANAGE",
        taiKhoan,
      });
    },
    handleAddEditNull: () => {
      dispatch({
        type: "FETCH_EDIT_NULL_USER_MANAGE",
      });
    },
    fetchListUser: () => {
      dispatch(actFetchListUserManage());
    },
  };
};
const mapStateToProps = (state) => {
  return {
    editInfoUser: state.AdminReducer.editInfoUser,
    listUser: state.AdminReducer.listUser,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageUser);
