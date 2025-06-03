import React, { useEffect, useState, memo } from 'react';
import { connect } from "react-redux";
// kb biến toàn cục
var allowedState = [];
var gheDangChon = [];
function SeatNormal(props) {
  const [seat, setSeat] = useState([]);
  const [chonGhe, setChon] = useState({});
  const [arrGheVip, setGheVip] = useState([]);
  const handleChooseSeat = (temp) => {
    // tìm vị trí phần tử
    if (!temp.daDat) {
      let index = seat.indexOf(temp);
      if (temp.check === false) {
        temp.check = true;
        gheDangChon.push(temp);
        if (index !== -1) {
          document.getElementsByClassName("btnGhe")[index].style.background = "yellow";
        }
      }
      else {
        temp.check = false;
        let vt = gheDangChon.indexOf(temp);
        gheDangChon.splice(vt, 1);
        if (index !== -1) {
          document.getElementsByClassName("btnGhe")[index].style.background = "#e03f0d";
        }
      }
      { change() }
    }
  }
  useEffect(() => {
    if (allowedState.length < 30) {
      allowedState.push(props.item);
    }
  });
  useEffect(() => {
    setSeat(allowedState);
    setGheVip(props.arrSeatVip);
  })
  useEffect(() => {
    change();
  }, [arrGheVip])
  const change = () => {
    let mangGhe = [];
    let taiKhoan = "";
    if (localStorage.getItem("userHome")) {
      taiKhoan = JSON.parse(localStorage.getItem("userHome")).taiKhoan;
    }
    if (props.arrSeatVip) {
      gheDangChon.concat(props.arrSeatVip).forEach(item => {
        mangGhe.push({ maGhe: item.maGhe, giaVe: item.giaVe });
      })
    } else {
      gheDangChon.forEach(item => {
        mangGhe.push({ maGhe: item.maGhe, giaVe: item.giaVe });
      })
    }
    setChon({
      maLichChieu: props.maLichChieu,
      danhSachVe: mangGhe,
      taiKhoanNguoiDung: taiKhoan,
    })
    let price = 0;
    mangGhe.forEach(item => {
      price += item.giaVe;
    })
    props.fetchPrice(price)
  }
  useEffect(() => {
    props.fetchBookTicketsNormal(chonGhe);
  }, [chonGhe])
  return (
    <div id="hang" style={{ display: "inline" }}>
      <div className="ghe" style={{ display: "inline" }}>
        <button className="btnGhe" style={{ background: props.item.daDat === true ? "rgba(128, 128, 128, 0.575)" : "#e03f0d" }} onClick={() => { handleChooseSeat(props.item) }}>{props.item.tenGhe}</button>
      </div>
      <p className="my-0" style={{ display: props.index === 9 || props.index === 19 ? "block" : "none" }}></p>
    </div>
  )
}
const mapDispatchToProps = dispatch => {
  return {
    fetchBookTicketsNormal: (ghe) => {
      dispatch({
        type: "BOOKGHE",
        data: ghe,
      })
    },
    fetchPrice: (price) => {
      dispatch({
        type: "PRICESEAT",
        data: price,
      })
    }
  }
}
const mapStateToProps = state => {
  return {
    arrSeatVip: state.bookGhe.arrSeatVip,
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(memo(SeatNormal));
