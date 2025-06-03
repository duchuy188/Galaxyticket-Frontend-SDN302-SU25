import React, { useEffect } from "react";
import { Form, Input, Button, DatePicker, Upload, message } from "antd";
import { NavLink } from "react-router-dom";
import { connect } from "react-redux";
import moment from "moment";
import "moment/locale/zh-cn";
import {
  actFetchAddFilmManage,
  actFetchEditFilmManage,
} from "../../containers/admin/module/action";
import { UploadOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";

const AddFilm = ({ infoEdit, handleEditFilm, handleAddFilm }) => {
  const layout = {
    labelCol: {
      span: 6,
    },
    wrapperCol: {
      span: 14,
    },
  };
  const upp = {
    name: "file",
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    headers: {
      authorization: "authorization-text",
    },
    onChange(info) {
      if (info.file.status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === "done") {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  const [form] = Form.useForm();
  const onFinish = (phim) => {
    let form_data = new FormData();
    if (phim.maPhim) {
      if (phim.hinhAnh.file) {
        phim.hinhAnh = phim.hinhAnh.file.originFileObj;
      } else {
        Swal.fire("Vui lòng chọn hình ảnh phim!", "", "warning");
        return;
      }

      phim.maNhom = "GP05";

      for (var key in phim) {
        form_data.append(key, phim[key]);
      }
      handleEditFilm(form_data);
    } else {
      // phim.maPhim = Math.random().toString().slice(2, 7);
      phim.ngayKhoiChieu = moment(phim.ngayKhoiChieu).format("DD/MM/yyyy");
      phim.maNhom = "GP05";
      // phim.danhGia = 0;
      phim.hinhAnh = phim.hinhAnh.file.originFileObj;
      console.log(phim.hinhAnh);
      // let obj = phim.hinhAnh.originFileObj;
      // console.log(phim.hinhAnh.fileList);
      for (let key in phim) {
        form_data.append(key, phim[key]);
      }
      // form_data = { ...phim };
      console.log(form_data);
      handleAddFilm(form_data);
    }
    form.setFieldsValue({
      maPhim: "",
      tenPhim: "",
      biDanh: "",
      trailer: "",
      hinhAnh: "",
      moTa: "",
    });
  };

  useEffect(() => {
    if (infoEdit) {
      let daay = moment(infoEdit.ngayKhoiChieu).format("yyyy-MM-DD");
      form.setFieldsValue({
        maPhim: infoEdit.maPhim,
        tenPhim: infoEdit.tenPhim,
        biDanh: infoEdit.biDanh,
        trailer: infoEdit.trailer,
        hinhAnh: infoEdit.hinhAnh,
        moTa: infoEdit.moTa,
        ngayKhoiChieu: moment(daay),
      });
    }
  }, []);
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Form
      {...layout}
      form={form}
      initialValues={{ remember: true }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      style={{
        border: "1px solid gray",
        width: "50%",
        margin: "50px auto",
        boxShadow: "2px 2px 10px 2px lightgray",
      }}
    >
      <h1 style={{ textAlign: "center", margin: "30px 0px" }}>
        {infoEdit ? "Sửa thông tin" : "Thêm thông tin"}
      </h1>
      <Form.Item name="maPhim" label="Mã phim">
        <Input placeholder="Mã Phim" disabled />
      </Form.Item>
      <Form.Item
        name="tenPhim"
        label="Tên Phim"
        rules={[{ required: true, message: "không được bỏ trống tên phim!" }]}
      >
        <Input placeholder="Nhập tên phim" />
      </Form.Item>
      <Form.Item
        name="biDanh"
        label="Bí danh"
        rules={[{ required: true, message: "không được bỏ trống bí danh!" }]}
      >
        <Input placeholder="Nhập bí danh" />
      </Form.Item>
      <Form.Item
        name="trailer"
        label="Trailer"
        rules={[{ required: true, message: "không được bỏ trống trailer!" }]}
      >
        <Input placeholder="Thêm trailer" />
      </Form.Item>
      <Form.Item
        label="Hình ảnh"
        name="hinhAnh"
        rules={[{ required: true, message: "không được bỏ trống hình phim!" }]}
      >
        <Upload {...upp} type="file" accept=".png, .jpg">
          <Button icon={<UploadOutlined />}>choose file</Button>
        </Upload>
      </Form.Item>
      <Form.Item
        name="moTa"
        label="Mô tả"
        rules={[
          { required: true, message: "không được bỏ trống mô tả bô phim!" },
        ]}
      >
        <Input placeholder="Nhập thông tin mô tả" />
      </Form.Item>

      <Form.Item
        name="ngayKhoiChieu"
        label="Ngày khởi chiếu"
        rules={[
          { required: true, message: "không được bỏ trống ngày khởi chiếu!" },
        ]}
      >
        <DatePicker placeholder="Thêm ngày khởi chiếu" className="w-100" />
      </Form.Item>
      <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 6 }}>
        <Button type="primary" htmlType="submit">
          Submit{" "}
        </Button>
      </Form.Item>
      <NavLink activeClassName="active" className="nav-link" to="/admin">
        <Button
          type="primary"
          danger
          style={{ marginLeft: "45%", marginBottom: "30px" }}
        >
          Trở về trang trước
        </Button>
      </NavLink>
    </Form>
  );
};
const mapDispatchToProps = (dispatch) => {
  return {
    handleAddFilm: (film) => {
      dispatch(actFetchAddFilmManage(film));
    },
    handleEditFilm: (phim) => {
      dispatch(actFetchEditFilmManage(phim));
    },
  };
};
const mapStateToProps = (state) => {
  return {
    infoEdit: state.AdminReducer.editInfoFilm,
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(AddFilm);
