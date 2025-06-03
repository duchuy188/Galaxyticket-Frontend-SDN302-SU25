import { Form, Input, Button, DatePicker, Select, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { NavLink } from "react-router-dom";
import { connect } from 'react-redux';
import { actFetchHeThongRapCreateShowTimeManage, actFetchListLichChieuCreateShowTimeManage } from '../../containers/admin/module/action';
import Axios from 'axios';
import moment from 'moment';
import Swal from 'sweetalert2';
const { Option } = Select;

function CreateShowTimeManage(props) {
  useEffect(() => {
    props.handleHeThongRapCreateShowTime();
    const id = props.match.params.id;
    props.listShowTimeWithFilm(id);
    // console.log(id);
  }, []);

  const [listCumRap, setListCumRap] = useState(null);
  const [listRap, setListRap] = useState(null);

  const [cumRapShowTime, setCumRapShowTime] = useState(null);
  const [listCumRapST, setListCumRapST] = useState(null);
  const [form] = Form.useForm();
  const layout = {
    labelCol: {
      span: 6,
    },
    wrapperCol: {
      span: 14,
    },
  };
  const range = (start, end) => {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  }

  const disabledDateTime = () => {
    return {
      disabledHours: () => range(0, 24).splice(4, 20),
      disabledMinutes: () => range(30, 60),
      disabledSeconds: () => [55, 56],
    };
  }

  const disabledDate = (current) => {
    // Can not select days before today and today
    return current && current < moment().endOf('day');
  }
  const columns = [
    {
      title: "Mã lịch chiếu",
      dataIndex: "maLichChieu",
    },
    {
      title: "Ngày chiếu giờ chiếu",
      dataIndex: "ngayChieuGioChieu",
    },
    {
      title: "Giá vé",
      dataIndex: "giaVe",
    },
    {
      title: "Thời lượng",
      dataIndex: "thoiLuong",
    },
  ];
  const onFinish = (phim) => {
    const id = parseInt(props.match.params.id);
    // phim.ngayChieuGioChieu = moment(phim.ngayChieuGioChieu).format("DD/MM/yyyy");
    let lichChieu = {
      maPhim: id,
      ngayChieuGioChieu: "",
      maRap: phim.maRap,
      giaVe: phim.giaVe,
    }
    console.log(phim.maRap);
    console.log(lichChieu);
    let token = "";
    if (localStorage.getItem("userAdmin")) {
      token = JSON.parse(localStorage.getItem("userAdmin")).accessToken;
    }
    Axios({
      url: "https://movie0706.cybersoft.edu.vn/api/QuanLyDatVe/TaoLichChieu",
      method: "POST",
      data: lichChieu,
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
      .then(result => {
        Swal.fire(
          'Tạo lịch chiếu thành công!',
          '',
          'success'
        )
        setTimeout(function () { window.location.reload(); }, 1500);
      })
      .catch(error => {
        Swal.fire({
          icon: 'error',
          title: `${error.response.data}`,
        })
      })


  };


  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  const renderHeThongRap = () => {
    if (props.heThongRap) {
      return props.heThongRap.map((item) => {
        return <Option key={item.maHeThongRap} value={item.maHeThongRap}>{item.tenHeThongRap}</Option>
      })
    }
  }
  const handleHeThongRap = (value) => {
    Axios({
      url: `https://movie0706.cybersoft.edu.vn/api/QuanLyRap/LayThongTinCumRapTheoHeThong?maHeThongRap=${value}`,
      method: "GET",
    })
      .then(result => {
        setListCumRap(result.data);
      })
      .catch(error => {
        console.log(error.response.data);
      })

  }
  const renderCumRap = () => {
    if (listCumRap) {
      return listCumRap.map((item) => {
        return <Option key={item.maCumRap} value={item.maCumRap}>{item.tenCumRap}</Option>
      });
    }

  }
  const handleCumRap = (value) => {
    if (listCumRap) {
      let dsRap = listCumRap.find((item) => {
        return item.maCumRap === value;
      })
      setListRap(dsRap);
    }
  }

  const renderRap = () => {
    if (listRap) {
      return listRap.danhSachRap.map((item) => {
        return <Option key={item.maRap} value={item.maRap}>{item.tenRap}</Option>
      })
    }
  }

  const renderHeThongRapShowTime = () => {
    if (props.listLichChieu) {
      return props.listLichChieu.map((item) => {
        return <Option key={item.maHeThongRap} value={item.maHeThongRap}>{item.tenHeThongRap}</Option>
      })
    }

  }
  const handleHeThongRapShowTime = (value) => {
    if (props.listLichChieu) {
      let cumRapChieu = props.listLichChieu.find((item) => {
        return value === item.maHeThongRap
      });
      setCumRapShowTime(cumRapChieu);
    }
  }

  const renderCumRapShowTime = () => {
    if (cumRapShowTime) {
      return cumRapShowTime.cumRapChieu.map((item) => {
        return <Option key={item.maCumRap} value={item.maCumRap}>{item.tenCumRap}</Option>
      })
    }
  }
  const handleCumRapShowTime = (value) => {

    if (cumRapShowTime) {
      let dsCumRapST = cumRapShowTime.cumRapChieu.find((item) => {
        return item.maCumRap === value;
      });
      setListCumRapST(dsCumRapST.lichChieuPhim);
    }
  }


  console.log(listCumRapST);
  // console.log(cumRapShowTime);
  // console.log(listRap);
  return (

    <Form {...layout} form={form} initialValues={{ remember: true }} onFinish={onFinish} onFinishFailed={onFinishFailed} className="container" style={{ border: "1px solid gray", margin: "50px auto", boxShadow: "2px 2px 10px 2px lightgray" }} >
      <h1 style={{ textAlign: "center", margin: "30px 0px" }} >Lịch chiếu</h1>
      <div className="row">
        <div className="col-6">
          <Form.Item name="maHeThongRap" label="Hệ thống rạp" rules={[{ required: true, message: 'không được bỏ trống hệ thống rạp!' }]}>
            <Select placeholder="Chọn hệ thống rạp" onChange={handleHeThongRap}>
              {renderHeThongRap()}
            </Select>
          </Form.Item>
          <Form.Item name="maCumRap" label="Cụm Rạp" rules={[{ required: true, message: 'không được bỏ trống cụm thống rạp!' }]}>
            <Select placeholder="Chọn cụm rạp" onChange={handleCumRap}>
              {renderCumRap()}
            </Select>
          </Form.Item>
          <Form.Item name="maRap" label="Rạp" rules={[{ required: true, message: 'không được bỏ trống  rạp!' }]}>
            <Select placeholder="Chọn rạp">
              {renderRap()}
            </Select>
          </Form.Item>

        </div>
        <div className="col-6">
          <Form.Item name="ngayChieuGioChieu" label="Ngày Chiếu" rules={[{ required: true, message: 'không được bỏ trống ngày chiếu!' }]}>
            <DatePicker format="YYYY-MM-DD HH:mm:ss" disabledDate={disabledDate} disabledTime={disabledDateTime} showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
            />
          </Form.Item>

          <Form.Item name="thoiLuong" label="Thời Lượng" rules={[{ required: true, message: 'không được bỏ trống thời lượng!' }]}>
            <Select placeholder="Chọn thời lượng">
              <Option value={120}>120 phút</Option>
            </Select>
          </Form.Item>
          <Form.Item name="maNhom" label="Mã Nhóm" >
            <Input placeholder="Mã nhóm" defaultValue="GP05" disabled />
          </Form.Item>
          <Form.Item name="giaVe" label="Giá Vé" rules={[{ required: true, message: 'không được bỏ trống giá vé!' }]}>
            <Select placeholder="Chọn Giá vé">
              <Option value={75000}>75000</Option>
              <Option value={90000}>90000</Option>
              <Option value={120000}>120000</Option>
            </Select>
          </Form.Item>
          <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 6 }}>
            <div className="row">
              <Button type="primary" htmlType="submit"  >Tạo lịch chiếu</Button>
              <NavLink activeClassName="active" className="nav-link p-0 ml-2" to="/admin"><Button type="primary" danger >Trở về trang trước</Button></NavLink>
            </div>

          </Form.Item>

        </div>
      </div>
      <div className="row">
        <h4 className="pb-4 w-100 text-center text-success">Chọn thông tin để hiển thị lịch chiếu của phim</h4>
        <div className="col-6 mb-5">
          <span>Hệ thống rạp: </span>
          <Select placeholder="Chọn hệ thống rạp" className="w-50" onChange={handleHeThongRapShowTime}>
            {renderHeThongRapShowTime()}
          </Select>
        </div>
        <div className="col-6 mb-5">
          <span>Cụm rạp: </span>
          <Select placeholder="Chọn cụm rạp" className="w-50" onChange={handleCumRapShowTime}>
            {renderCumRapShowTime()}
          </Select>
        </div>
        <Table columns={columns} dataSource={listCumRapST} className={"w-100"} />
      </div>
    </Form>
  )
}
const mapDispatchToProps = (dispatch) => {
  return {
    handleHeThongRapCreateShowTime: () => {
      dispatch(actFetchHeThongRapCreateShowTimeManage());
    },
    listShowTimeWithFilm: (maPhim) => {
      dispatch(actFetchListLichChieuCreateShowTimeManage(maPhim));
    }
  }
}
const mapStateToProps = (state) => {
  return {
    heThongRap: state.AdminReducer.listHeThongRap,
    maPhim: state.AdminReducer.maPhimCreateshowTime,
    listLichChieu: state.AdminReducer.listLichChieu,
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(CreateShowTimeManage);
