import React, { useEffect, useState, memo } from 'react';
import { connect } from "react-redux";
// kb biến toàn cục
var allowedState = [];
var gheDangChon = [];
function SeatVip(props) {
  const [seat, setSeat] = useState([]);
  const [chonGhe, setChon] = useState({});
  const handleChooseSeat = (temp) => {
    if (!temp.daDat) {
      let index = seat.indexOf(temp);
      if (temp.check === false) {
        temp.check = true;
        gheDangChon.push(temp);
        if (index !== -1) {
          document.getElementsByClassName("btnGheVip")[index].style.background = "yellow";
        }
      }
      else {
        temp.check = false;
        let vt = gheDangChon.indexOf(temp);
        gheDangChon.splice(vt, 1);
        if (index !== -1) {
          document.getElementsByClassName("btnGheVip")[index].style.background = "#e03f0d";
        }
      }
      let mangGhe = [];
      gheDangChon.forEach(item => {
        mangGhe.push({ maGhe: item.maGhe, giaVe: item.giaVe });
      })
      let taiKhoan = "";
      if (localStorage.getItem("userHome")) {
        taiKhoan = JSON.parse(localStorage.getItem("userHome")).taiKhoan;
      }
      setChon({
        maLichChieu: props.maLichChieu,
        danhSachVe: mangGhe,
        taiKhoanNguoiDung: taiKhoan,
      })
    }

  }
  useEffect(() => {
    // if (props.item.daDat == false) {
    if (allowedState.length < 10) {
      allowedState.push(props.item);
    }
    // }
  });
  useEffect(() => {
    setSeat(allowedState);
  })
  useEffect(() => {
    props.fetchBookTicketsVip(chonGhe);
  }, [chonGhe]);

  return (
    <div style={{ display: "inline" }}>
      <div className="ghe" style={{ display: "inline" }}>
        <button className="btnGheVip" style={{ background: props.item.daDat === true ? "rgba(128, 128, 128, 0.575)" : "#e03f0d" }} onClick={() => { handleChooseSeat(props.item) }}>VIP {props.index + 1}</button>
      </div>
      {/* <p className="my-0" style={{ display: props.index === 9 || props.index === 19 ? "block" : "none" }}></p> */}
    </div>
  )
}
const mapDispatchToProps = dispatch => {
  return {
    fetchBookTicketsVip: (ghe) => {
      dispatch({
        type: "BOOKGHEVIP",
        data: ghe,
      })
    }
  }
}
export default connect(null, mapDispatchToProps)(memo(SeatVip));
