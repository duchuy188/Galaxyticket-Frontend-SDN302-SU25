import React, { useState, useEffect, memo } from "react";
import { actFetchDetailRoomTicket } from "./modules/action";
import { connect } from "react-redux";
import SeatNormal from "../Seat/SeatNormal";
import SeatVip from "../Seat/SeatVip";
import { actFetchBookSeat } from "./modules/actionBookSeat";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { Drawer } from "@mui/material";
import Loading from "../Loading/loading";
import { LazyLoadImage } from "react-lazy-load-image-component";
import Axios from "axios";
import emailjs from "emailjs-com";
import PayPal from "../PayPal";
// import ShowLogoDetailTicketRoom from "../ShowLogoDeTailTicketRoom";

var arrTemp = [];
function DetailTicketRoom(props) {
  const [timeM, setTimeM] = useState(5);
  const [timeS, setTimeS] = useState(0);
  const [price, setPrice] = useState(0);
  const [combo, setCombo] = useState({ cb1: 0, cb2: 0, cb3: 0 });
  const [priceChooSeat, setPriceChooseSeat] = useState(0);
  const [temp, setTemp] = useState(0);
  const [info, setInfo] = useState("");

  const [url, setUrl] = useState("");
  // Material
  const [open, setOpen] = useState(false);
  const handleDrawer = () => {
    setOpen(true);
  };
  // End Material

  // Start Send Email
  function sendEmail() {
    // emailjs.sendForm('gmail', 'template_0c38g8b', e.target, 'user_e2CQ4HQxr1VfsOKu6uvOF')
    var templateParams = {
      name: "James",
      notes: "Check this out!",
    };
    // emailjs.send("khacvu0505@gmail.com", "template_0c38g8b")
    emailjs
      .send(
        "nkkhacvu32@gmail.com",
        "template_0c38g8b",
        templateParams,
        "user_e2CQ4HQxr1VfsOKu6uvOF"
      )
      .then(
        function (response) {
          console.log("SUCCESS!", response.status, response.text);
        },
        function (error) {
          console.log("FAILED...", error);
        }
      );
  }
  // End Send Email

  const ShowLogoFilm = (id) => {
    Axios({
      url: "https://movie0706.cybersoft.edu.vn/api/QuanLyRap/LayThongTinHeThongRap",
      method: "GET",
    })
      .then((result) => {
        console.log(result.data);
        let arr = result.data.find((item) => {
          return item.maHeThongRap === id;
        });
        let urlImg = arr.logo;

        setUrl(urlImg);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  let navigate = useNavigate();
  useEffect(() => {
    props.fetchDetailRoomTicket(props.maLichChieu);
    if (localStorage.getItem("userHome")) {
      let info = JSON.parse(localStorage.getItem("userHome"));
      setInfo(info);
    }
    {
      ShowLogoFilm(props.logoRap);
    }
  }, []);

  var giaTien;
  useEffect(() => {
    if (combo.cb1 == 0 && combo.cb2 == 0 && combo.cb3 == 0) {
      giaTien = props.price;
    } else {
      giaTien =
        combo.cb1 * 40000 + combo.cb2 * 55000 + combo.cb3 * 70000 + props.price;
    }
    setPrice(giaTien);
  }, [combo]);
  useEffect(() => {
    if (combo.cb1 == 0 && combo.cb2 == 0 && combo.cb3 == 0) {
      giaTien = props.price;
    } else {
      giaTien =
        combo.cb1 * 40000 + combo.cb2 * 55000 + combo.cb3 * 70000 + props.price;
    }
    setPrice(giaTien);
  }, [priceChooSeat]);
  useEffect(() => {
    setPriceChooseSeat(props.price);
  });
  let handleChangeNumberCombo = (event) => {
    let { name, value } = event.target;
    setCombo({
      ...combo,
      [name]: value,
    });
  };
  let reloadPage = () => {
    window.location.href = "http://localhost:3000";
  };
  // Function Alert Animation
  let alertAnimation = () => {
    Swal.fire({
      icon: "error",
      title: "Bạn chưa chọn ghế mà!",
    });
  };
  let ListSeatNormal = () => {
    if (props.seat.danhSachGhe && props.seat.danhSachGhe.length > 0) {
      return props.seat.danhSachGhe.map((item, index) => {
        if (item.loaiGhe === "Thuong" && index < 30) {
          return (
            <SeatNormal
              item={item}
              index={index}
              maLichChieu={props.maLichChieu}
            />
          );
        }
      });
    }
  };
  let ListSeatVip = () => {
    if (props.seat.danhSachGhe && props.seat.danhSachGhe.length > 0) {
      let arr = props.seat.danhSachGhe.filter((item) => {
        return item.loaiGhe === "Vip";
      });
      return arr.map((item, index) => {
        if (index < 10) {
          return (
            <SeatVip
              item={item}
              index={index}
              maLichChieu={props.maLichChieu}
            />
          );
        }
      });
    }
  };
  const saveInfo = () => {
    let objTemp = props.seat.thongTinPhim;
    let pricee = price;
    let infoTemp = JSON.parse(localStorage.getItem("userHome"));
    let infoUser = infoTemp.hoTen;
    let infoUsernameUser = info.taiKhoan;
    let idTicket = Math.random().toString(36).substr(2, 5);
    let dateBookTickets = new Date().toLocaleDateString();
    let infoTickets = Object.assign(
      {},
      objTemp,
      { pricee },
      { infoUser },
      { infoUsernameUser },
      { dateBookTickets, idTicket }
    );
    var count = 0;
    if (localStorage.getItem("historyBookTicket")) {
      count = JSON.parse(localStorage.getItem("historyBookTicket")).length;
    }
    if (count > 0) {
      arrTemp = JSON.parse(localStorage.getItem("historyBookTicket"));
      arrTemp.push(infoTickets);
    } else {
      arrTemp.push(infoTickets);
    }
    localStorage.setItem("historyBookTicket", JSON.stringify(arrTemp));
  };
  let handleDatVe = (event) => {
    if (
      document.getElementById("email").value !== "" &&
      document.getElementById("phoneNumber").value !== ""
    ) {
      if (localStorage.getItem("userHome")) {
        event.preventDefault();
        if (props.bookGhe.danhSachVe.length > 0) {
          props.BookSeat(props.bookGhe);
          {
            saveInfo();
          }
          {
            sendEmail();
          }
        } else {
          {
            alertAnimation();
          }
        }
      } else {
        navigate("/auth-home");
      }
    } else {
      Swal.fire({
        icon: "error",
        title: "Bạn phải nhập thông tin để nhận vé",
      });
    }
  };
  useEffect(() => {
    handleTime();
  }, [temp]);
  const handleTime = () => {
    let tempTime = timeS;
    let time = setInterval(() => {
      tempTime = tempTime - 1;
      if (tempTime === -1) {
        setTimeM((a) => a - 1);
        tempTime = 59;
      }
      setTimeS(tempTime);
      if (document.getElementById("timePhut")) {
        var timeM1 = document.getElementById("timePhut").innerText;
      }
      if (Number(timeM1) === 0 && tempTime === 0) {
        clearInterval(time);
      }
      if (Number(timeM1) === 0 && tempTime === 0) {
        Swal.fire({
          title: "Bạn có muốn tiếp tục ?",
          text: "Đã hết thời gian chọn ghế.hiu hiu!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Có",
        }).then((result) => {
          if (result.isConfirmed) {
            setTimeM(5);
            setTemp(temp + 1);
          } else {
            navigate("/");
          }
        });
      }
    }, 1000);
  };
  if (props.loading) {
    return <Loading />;
  }
  return (
    <div>
      <section className="chooseSeat mr-0 row">
        <div className="seat col-md-9  ">
          <div className="seat__title row justify-content-start  align-items-center ">
            <div className="row justify-content-between w-100">
              <div className="row marginTitle mx-0">
                <p className="mr-md-3 choose ml-5 title ">
                  {" "}
                  01 CHỌN GHẾ &amp; THANH TOÁN
                </p>
                &nbsp;
                <p className="result ml-2 title"> 02 KẾT QUẢ ĐẶT VÉ</p>
              </div>
              <p className="mr-5 text-center title  ">
                Xin chào{" "}
                <span style={{ color: "#FF0000" }}>
                  {info.hoTen},{" "}
                  <p
                    className="btn btn-outline-none text-left p-0 mb-1 backHome"
                    onClick={() => reloadPage()}
                  >
                    Thoát
                  </p>
                </span>{" "}
              </p>
            </div>
          </div>
          <div className="chooseSeat__info chooseSeat__bg mt-2">
            <div className="ml-5 infoRap">
              <div className="row  align-items-center justify-content-between ">
                <div className="row">
                  <LazyLoadImage src={url} className="img-fluid logoRap" />
                  <div className="mt-4 ml-2 thongTinRap">
                    <p className="mb-0 ">
                      {props.seat.thongTinPhim
                        ? props.seat.thongTinPhim.tenCumRap
                        : ""}
                    </p>
                    <span>
                      {props.seat.thongTinPhim
                        ? props.seat.thongTinPhim.ngayChieu
                        : ""}
                    </span>{" "}
                    -
                    <span>
                      {props.seat.thongTinPhim
                        ? props.seat.thongTinPhim.gioChieu
                        : ""}
                    </span>{" "}
                    -
                    <span>
                      {props.seat.thongTinPhim
                        ? props.seat.thongTinPhim.tenRap
                        : ""}
                    </span>
                  </div>
                </div>
                <div className="chooseSeat__time mr-4">
                  <p className="mb-2 mr-1 title">Thời gian giữ ghế</p>
                  <div className=" chooseSeat__datghe row justify-content-center">
                    <span id="timePhut"> 0{timeM}</span>
                    <span>&nbsp;:&nbsp;</span>
                    <span>{timeS}</span>
                  </div>
                </div>
              </div>
              <div className="chooseSeat__screen mt-2  mr-4  text-center">
                <LazyLoadImage
                  src="../images/screen.jpg"
                  alt="anh_manhinh"
                  className="img-fluid ml-3 ml-lg-0"
                />
              </div>
            </div>
            <div className="bookGhe container text-center mx-auto">
              <div>
                {ListSeatNormal()}
                <br />
                {ListSeatVip()}
              </div>
            </div>
          </div>
          <div className="chooseSeat__Note chooseSeat__bg  text-center ">
            <div className="container row justify-content-around">
              <div className="col-6 col-lg-3">
                Ghế trống <br />
                <span className="status_gheTrong mb-4" />
              </div>
              <div className="col-6 col-lg-3">
                Đang chọn <br />
                <span className="status_gheDangChon mb-4" />
              </div>
              <div className="col-6 col-lg-3 ">
                Ghế đã có người chọn <br />
                <span className="status_gheDaChon" />
              </div>
              <div className="col-6 col-lg-3">
                Ghế không thể chọn <br />
                <span className="status_gheKhongDuocChon" />
              </div>
            </div>
          </div>
        </div>
        <div className="chooseSeat__pay container mx-auto col-8 col-md-3  ">
          <div className="container">
            <div className="price text-center" id="price">
              {price} đ
            </div>
            <hr style={{ marginRight: "10%" }} />
            <div className="infoFilm">
              <p className="nameFilm">
                {props.seat.thongTinPhim ? props.seat.thongTinPhim.tenPhim : ""}
              </p>
              <p className="nameRap">
                {props.seat.thongTinPhim
                  ? props.seat.thongTinPhim.tenCumRap
                  : ""}{" "}
              </p>
              <span>
                {props.seat.thongTinPhim
                  ? props.seat.thongTinPhim.ngayChieu
                  : ""}
              </span>{" "}
              -
              <span>
                {props.seat.thongTinPhim
                  ? props.seat.thongTinPhim.gioChieu
                  : ""}
              </span>{" "}
              -
              <span>
                {props.seat.thongTinPhim ? props.seat.thongTinPhim.tenRap : ""}
              </span>
            </div>
            <hr style={{ marginRight: "10%" }} />
            <div className="infoCustomer mx-0">
              <form>
                <input
                  type="email"
                  placeholder="Your Email... "
                  required
                  id="email"
                  name="emaill"
                />
                <hr style={{ marginRight: "10%" }} />
                <input
                  type="tel"
                  placeholder="Your Phone Number .. "
                  style={{ border: "none" }}
                  required
                  id="phoneNumber"
                />
                <hr style={{ marginRight: "10%" }} />
                <input
                  type="text"
                  placeholder="Discount Code ..."
                  style={{ border: "none" }}
                />
                <hr style={{ marginRight: "10%" }} />
                <button
                  className="btn btn-success w-100 btnDatVe"
                  type="submit"
                  onClick={handleDatVe}
                >
                  Đặt Vé
                </button>
              </form>
            </div>
            <div className="pay">
              <div className="chooseCombo">
                <button
                  className="btn btn-danger shadow-none"
                  onClick={handleDrawer}
                >
                  Chọn Combo
                </button>
                <Drawer anchor="top" open={open} onClose={() => setOpen(false)}>
                  <div
                    style={{ height: "100%", width: "80%" }}
                    className="ml-5"
                  >
                    <div className="row justify-content-around">
                      {/* Combo1:40.0000 VND */}
                      <div className="imgComboPopcornWater my-auto py-4">
                        <LazyLoadImage
                          src="../images/water.jpg"
                          style={{ marginTop: "-8px" }}
                          alt="comboWater"
                        />
                        <LazyLoadImage
                          src="../images/popcorn.jpg"
                          alt="comboPopcorn"
                        />
                        <span className="mt-3">
                          <input
                            type="number"
                            max="10"
                            min="0"
                            id="combo1"
                            value={combo.cb1}
                            onChange={handleChangeNumberCombo}
                            name="cb1"
                          />
                        </span>
                        <p style={{ fontStyle: "italic" }}>40.000 VND</p>
                      </div>
                      {/* Combo2:55.000 VND */}
                      <div className="imgComboPopcornWater my-auto py-4">
                        <LazyLoadImage
                          src="../images/water.jpg"
                          style={{ marginTop: "-8px" }}
                          alt="comboWater"
                        />
                        <LazyLoadImage
                          src="../images/water.jpg"
                          style={{ marginTop: "-8px" }}
                          alt="comboWater"
                        />
                        <LazyLoadImage
                          src="../images/popcorn.jpg"
                          alt="comboPopcorn"
                        />
                        <span className="mt-3">
                          <input
                            type="number"
                            max="10"
                            min="0"
                            id="combo2"
                            value={combo.cb2}
                            onChange={handleChangeNumberCombo}
                            name="cb2"
                          />
                        </span>
                        <p style={{ fontStyle: "italic" }}>55.000 VND</p>
                      </div>
                      {/* Combo3:70.000 VND */}
                      <div className="imgComboPopcornWater my-auto py-4">
                        <LazyLoadImage
                          src="../images/water.jpg"
                          style={{ marginTop: "-8px" }}
                          alt="comboWater"
                        />
                        <LazyLoadImage
                          src="../images/water.jpg"
                          style={{ marginTop: "-8px" }}
                          alt="comboWater"
                        />
                        <LazyLoadImage
                          src="../images/popcorn.jpg"
                          alt="comboPopcorn"
                        />
                        <LazyLoadImage
                          src="../images/popcorn.jpg"
                          alt="comboPopcorn"
                        />
                        <span className="mt-3">
                          <input
                            type="number"
                            max="10"
                            min="0"
                            id="combo3"
                            value={combo.cb3}
                            onChange={handleChangeNumberCombo}
                            name="cb3"
                          />
                        </span>
                        <p style={{ fontStyle: "italic" }}>70.000 VND</p>
                      </div>
                    </div>
                  </div>
                </Drawer>
              </div>

              <p className="mt-4 mb-0">Chọn thanh toán</p>
              <div>
                {/* <input type="radio" id="online" name="pay" defaultValue="Thanh toán bằng Momo" defaultChecked />
                <label htmlFor="online">Với Momo</label>
                <LazyLoadImage src="../images/momo.jpg" /><br />
                <input type="radio" id="tienmat" name="pay" defaultValue="Thanh toán bằng tiền mặt" />
                <label htmlFor="tien mat">Tiền mặt</label>
                <LazyLoadImage src="../images/money.jpg" className="ml-3" />
                <br /> */}
                <PayPal dola={price} />
              </div>
            </div>
            <div className="end text-center pr-3">
              <p>
                Vé đã mua không thể đổi hoặc hoàn tiền Mã vé sẽ được gửi qua tin
                nhắn ZMS (tin nhắn Zalo) và Email đã nhập.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
const mapStateToProps = (state) => {
  return {
    loading: state.roomTicketReducer.loading,
    err: state.roomTicketReducer.err,
    seat: state.roomTicketReducer.seat,
    bookGhe: state.bookGhe.bookGhe,
    price: state.bookGhe.price,
    maLichChieu: state.ShowTimeReducer.maLichChieu,
    logoRap: state.ShowTimeReducer.maHeThongRap,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    fetchDetailRoomTicket: (id) => {
      dispatch(actFetchDetailRoomTicket(id));
    },
    BookSeat: (info) => {
      dispatch(actFetchBookSeat(info));
    },
    infoBookTickets: (info) => {
      dispatch({
        type: "INFO_BOOK_TICKETS",
        data: info,
      });
    },
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(memo(DetailTicketRoom));
