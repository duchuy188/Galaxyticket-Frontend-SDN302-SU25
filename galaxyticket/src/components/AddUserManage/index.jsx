import React, { useEffect, useState } from "react";
import { Form, Input, Button, Select } from 'antd';
import { NavLink } from "react-router-dom";
import { connect } from "react-redux";
import 'moment/locale/zh-cn';
import Swal from "sweetalert2";
import Axios from "axios";
const { Option } = Select;

const AddUser = (props) => {
  const layout = {
    labelCol: {
      span: 6,
    },
    wrapperCol: {
      span: 14,
    },
  };

  const prefixSelector = (
    <Form.Item name="prefix" noStyle>
      <Select style={{ width: 70 }} defaultValue="+86">
        <Option value="86">+86</Option>
        <Option value="87">+87</Option>
      </Select>
    </Form.Item>
  );
  const [username, setUsername] = useState(null);
  const [form] = Form.useForm();


  const onFinish = (user) => {
    // console.log(username.length);
    user.maNhom = "GP05";
    let nguoiDung = { ...user }
    if (!username) {
      let token = "";
      if (localStorage.getItem("userAdmin")) {
        token = JSON.parse(localStorage.getItem("userAdmin")).accessToken;
      }

      Axios({
        url: "https://movie0706.cybersoft.edu.vn/api/QuanLyNguoiDung/ThemNguoiDung",
        method: "POST",
        data: nguoiDung,
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
        .then(result => {
          Swal.fire(
            'Thêm người dùng thành công!',
            '',
            'success'
          )
        })
        .catch(error => {
          Swal.fire({
            icon: 'error',
            title: `${error.response.data}`,
          })
        })


    } else {
      let token = "";
      if (localStorage.getItem("userAdmin")) {
        token = JSON.parse(localStorage.getItem("userAdmin")).accessToken;
      }
      console.log(nguoiDung);
      debugger
      Axios({
        url: "https://movie0706.cybersoft.edu.vn/api/QuanLyNguoiDung/CapNhatThongTinNguoiDung",
        method: "PUT",
        data: nguoiDung,
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
        .then(result => {
          Swal.fire(
            'Cập nhật người dùng thành công!',
            '',
            'success'
          )
        })
        .catch(error => {
          Swal.fire({
            icon: 'error',
            title: `${error.response.data}`,
          })
        })

    }
    form.setFieldsValue({
      taiKhoan: "",
      matKhau: "",
      email: "",
      soDt: "",
      maLoaiNguoiDung: "",
      hoTen: "",
    })
  };

  useEffect(() => {
    let { infoUser } = props;
    console.log(infoUser);
    if (infoUser) {
      form.setFieldsValue({
        taiKhoan: infoUser.taiKhoan,
        matKhau: infoUser.matKhau,
        email: infoUser.email,
        soDt: infoUser.soDt,
        maNhom: infoUser.maNhom,
        maLoaiNguoiDung: infoUser.maLoaiNguoiDung,
        hoTen: infoUser.hoTen,
      });
      setTimeout(() => {
        let usern = document.getElementById("taiKhoanUser").value;
        setUsername(usern);
        if (usern) {
          document.getElementById("taiKhoanUser").disabled = true;
        } else {
          document.getElementById("taiKhoanUser").disabled = false;
        }
      }, 100)
    }
  }, []);
  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  return (

    <Form {...layout} form={form} initialValues={{ remember: true }} onFinish={onFinish} onFinishFailed={onFinishFailed} style={{ border: "1px solid gray", width: "50%", margin: "50px auto", boxShadow: "2px 2px 10px 2px lightgray" }} >
      <h1 style={{ textAlign: "center", margin: "30px 0px" }} >{props.infoEdit ? "Sửa thông tin" : "Thêm thông tin"}</h1>
      <Form.Item name="maNhom" label="Mã nhóm" >
        <Input placeholder="Mã nhóm" disabled />
      </Form.Item>
      <Form.Item name="taiKhoan" label="Tài Khoản" rules={[{ required: true, message: 'không được bỏ trống tài khoản!' }]}>
        <Input placeholder="Nhập tài khoản" id="taiKhoanUser" />
      </Form.Item>
      <Form.Item name="matKhau" label="Mật khẩu" dependencies={['password']} rules={[{ required: true, message: 'không được bỏ trống mật khẩu!' }]}>
        <Input.Password placeholder="Nhập mật khẩu" />
      </Form.Item>
      <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email không đúng định dạng' }, { required: true, message: 'Không được bỏ trống email' },]} >
        <Input placeholder="Thêm email" />
      </Form.Item>

      <Form.Item name="soDt" label="SDT" rules={[{ required: true, message: 'không được bỏ trống số điện thoại!' }]} >
        <Input placeholder="Nhập SDT" style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="maLoaiNguoiDung" label="Mã loại người dùng" rules={[{ required: true, message: 'không được bỏ trống loại người dùng!' }]} >
        <Select placeholder="Chọn loại người dùng ">
          <Option value="KhachHang">Khách hàng</Option>
          <Option value="QuanTri">Quản trị</Option>
        </Select>
      </Form.Item>
      <Form.Item name="hoTen" label="Họ tên" rules={[{ required: true, message: 'không được bỏ trống họ tên!' }]} >
        <Input placeholder="Nhập họ tên" />
      </Form.Item>


      <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 6 }}>
        <Button type="primary" htmlType="submit"  >Submit </Button>
      </Form.Item>
      <NavLink activeClassName="active" className="nav-link" to="/admin"><Button type="primary" danger style={{ marginLeft: "45%", marginBottom: "30px" }}>Trở về trang trước</Button></NavLink>
    </Form>
  );
};

const mapStateToProps = state => {
  return {
    infoUser: state.AdminReducer.editInfoUser,
  }
}
export default connect(mapStateToProps, null)(AddUser);
