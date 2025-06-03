import React, { useEffect, useState } from 'react';
import DetaiilInfoManage from './detail';
import { Link } from "react-router-dom";
import { connect } from 'react-redux';

function HistoryManage(props) {
  var price = 0;
  // const [gia, setGia] = useState(0);
  let renderTable = () => {
    if (localStorage.getItem("historyBookTicket")) {
      let infoTemp = JSON.parse(localStorage.getItem("historyBookTicket"));
      return infoTemp.map((item, index) => {
        price += item.pricee;
        ganGia();
        return <DetaiilInfoManage key={index} list={item} stt={index} />
      })
    }
  }
  // useEffect(() => {
  //   setGia(price);
  // })
  const ganGia = () => {
    // console.log(price);
    props.priceBookSeat(price);
    // debugger
  }
  // useEffect(() => {
  //   console.log(gia);
  //   debugger
  //   props.priceBookSeat(gia);
  // }, [gia])
  return (
    <div>
      <div className="d-flex justify-content-between">
        <h1 className="text-center mb-5 mx-auto">Chi tiết đặt vé của Khách Hàng</h1>
        <Link to="/chart" className="chart" style={{ textDecoration: "none", color: "black" }}>Báo cáo dạng sơ đồ</Link>

      </div>
      <div className=" container">
        <table className="w-100 mx-auto  ">
          <thead>
            <tr className="row py-3 mb-3" style={{ background: "rgb(122 110 103 / 61%)", color: "black" }}>
              <th className="col" >STT</th>
              <th className="col-2" >Mã Vé Đặt</th>
              <th className="col-2" >Tài Khoản</th>
              <th className="col-2" >Tên Phim</th>
              <th className="col-2" >Tên Cụm Rạp</th>
              <th className="col-2" >Ngày Đặt</th>
              <th className="col" >Tổng Tiền</th>
            </tr>
          </thead>
          <tbody>
            {renderTable()}
          </tbody>
        </table>

      </div>
    </div >
  )
}
const mapDispatchToProps = dispatch => {
  return {
    priceBookSeat: (price) => {
      dispatch({
        type: "PRICEBOOKTICKETS",
        data: price,
      })
    },

  }
}
export default connect(null, mapDispatchToProps)(HistoryManage);
