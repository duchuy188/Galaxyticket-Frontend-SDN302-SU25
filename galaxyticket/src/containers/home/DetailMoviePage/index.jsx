import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import $ from "jquery";
import {
  actFetchInfoDetailMovie,
  actFetchListLogoShowTime,
} from "../../../components/ShowTimes/module/action";
import Loading from "../../../components/Loading/loading";
import HoverRating from "../../../components/Rating/rating";
import LogoShowTimes from "../../../components/Logo_ShowTimes";
import DetailFilmShowTime from "../../../components/DetailFilmShowTime";
import { Link } from "react-router-dom";
import DateOfYear from "../../../components/DayOfYear";
import Comment from "../../../components/Comment";
import { LazyLoadImage } from "react-lazy-load-image-component";
// import moment from 'moment';

function DetailMovie(props) {
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (props.match && props.match.params) {
      const id = props.match.params.id;
      props.InfoDetailFilm(id);
      props.fetchListLogo();
    }
  }, []);
  useEffect(() => {
    var $ppc = $(".progress-pie-chart"),
      percent = parseInt($ppc.data("percent") * 10),
      deg = (360 * percent) / 100;
    if (percent > 50) {
      $ppc.addClass("gt-50");
    }
    $(".ppc-progress-fill").css("transform", "rotate(" + deg + "deg)");
    $(".ppc-percents span").html(percent / 10);
  });
  const renderListLogo = () => {
    if (props.listLogo && props.listLogo.length > 0) {
      return props.listLogo.map((item, index) => {
        return (
          <LogoShowTimes key={item.maHeThongRap} Logo={item} Index={index} />
        );
      });
    }
  };
  // console.log(props.infoDetailMovie);
  const renderFilmDetail = () => {
    if (
      props.infoDetailMovie.lichChieu &&
      props.infoDetailMovie.lichChieu.length > 0
    ) {
      return props.infoDetailMovie.lichChieu.map((item, index) => {
        if (props.maHeThongRap === item.thongTinRap.maHeThongRap) {
          return <DetailFilmShowTime key={item.maLichChieu} Film={item} />;
        }
      });
    }
  };

  let dayTime = [];
  const findDate = () => {
    var date = new Date();
    let t = date.getDay() + 1;
    let n = date.getDay() + 1;
    var longDate = 0;
    let d = date.getDate() - 1;
    // console.log(date.getDate());
    if (
      date.getMonth() + 1 === 4 ||
      date.getMonth() + 1 === 6 ||
      date.getMonth() + 1 === 9 ||
      date.getMonth() + 1 === 11
    ) {
      longDate = 30;
    } else {
      if (date.getMonth() + 1 === 2) {
        if (date.getFullYear() % 400 === 0) {
          longDate = 29;
        } else {
          longDate = 28;
        }
      } else {
        longDate = 31;
      }
    }
    for (var i = 0; i <= 9; i++) {
      if (t + i > 7 && t + i < 15) {
        n = t + i - 7;
      } else if (t + i >= 15) {
        n = t + i - 14;
      } else {
        n = t + i;
      }
      d++;
      if (d > longDate) {
        d = d - longDate;
      }

      dayTime.push({ thu: n, ngay: d });
    }
  };
  findDate();
  // console.log(dayTime);
  const renderDate = () => {
    if (dayTime && dayTime.length > 0) {
      return dayTime.map((item, index) => {
        return (
          <DateOfYear
            key={item.ngay}
            Item={item}
            active={false}
            index={index}
          />
        );
      });
    }
  };

  const handleChangeComment = (event) => {
    setComment(event.target.value);
  };

  const handleSubmitRating = () => {
    props.Comment(comment);
  };

  const renderComment = () => {
    if (props.listComment && props.listComment.length > 0) {
      return props.listComment.map((item, index) => {
        return <Comment key={index} cmt={item} />;
      });
    }
  };

  if (props.loading) {
    return <Loading />;
  }
  return (
    <div>
      <section className="detailMovie">
        <div className="detailMovie__banner"></div>
        <div className="overlay__banner"></div>
        <div className="container detailMovie__info">
          <div className="row">
            <div className="col-6 col-md-3 detail__img">
              <LazyLoadImage
                src={props.infoDetailMovie.hinhAnh}
                alt="CucNoHoaCucCung"
                className="img-fluid w-100"
              />
              <div className="icon__play">
                <a
                  className="video"
                  href={props.infoDetailMovie.trailer}
                  data-lity
                >
                  <i className="fa fa-play"></i>
                </a>
              </div>
            </div>
            <div className="col-md-5 infoText my-auto">
              <p className="date">
                {new Date(
                  props.infoDetailMovie.ngayKhoiChieu
                ).toLocaleDateString()}
              </p>
              <p>
                <span>P</span>
                {props.infoDetailMovie.tenPhim}
              </p>
              <span>120 phút - 0 IMDb - 2D/Digital</span>
              <br />
              <button className="button__muaVe">Mua Vé</button>
            </div>
            <div className="col-md-4">
              <div
                className="progress-pie-chart"
                data-percent={props.infoDetailMovie.danhGia}
              >
                <div className="ppc-progress">
                  <div className="ppc-progress-fill" />
                </div>
                <div className="ppc-percents">
                  <div className="pcc-percents-wrapper">
                    <span />
                  </div>
                </div>
                <div className="icon__star">
                  <i className="fa fa-star" />
                  <i className="fa fa-star" />
                  <i className="fa fa-star" />
                  <i className="fa fa-star" />
                  <i className="fa fa-star" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="detailMovie_ShowTimes">
        <div className="container">
          <ul
            className="nav nav-tabs justify-content-center"
            id="myTab"
            role="tablist"
          >
            <li className="nav-item" role="presentation">
              <a
                className="nav-link active"
                id="showtime-tab"
                data-toggle="tab"
                href="#showtime"
                role="tab"
                aria-controls="home"
                aria-selected="true"
              >
                Lịch Chiếu
              </a>
            </li>
            <li className="nav-item" role="presentation">
              <a
                className="nav-link"
                id="infomation-tab"
                data-toggle="tab"
                href="#infomation"
                role="tab"
                aria-controls="infomation"
                aria-selected="false"
              >
                Thông Tin
              </a>
            </li>
            <li className="nav-item" role="presentation">
              <a
                className="nav-link"
                id="vote-tab"
                data-toggle="tab"
                href="#vote"
                role="tab"
                aria-controls="vote"
                aria-selected="false"
              >
                Đánh Giá
              </a>
            </li>
          </ul>
          <div
            className="tab-content detailShowtime__content"
            id="myTabContent"
          >
            <div
              className="tab-pane fade show active  mt-5"
              id="showtime"
              role="tabpanel"
              aria-labelledby="showtime-tab"
            >
              <section className="lichChieu container-md ">
                <div
                  className="row lichChieu__content mb-5"
                  style={{ backgroundColor: "white" }}
                >
                  <div className=" col-lg-1 lichChieu__LogoRap px-0">
                    <div
                      className="nav nav-pills"
                      id="v-pills-tab"
                      role="tablist"
                    >
                      {renderListLogo()}
                    </div>
                  </div>
                  <div className="col-lg-11 p-0">
                    <div className="toDay">{renderDate()}</div>
                    <div
                      className="tab-content lichChieu__Phim"
                      id="v-pills-tabContent"
                    >
                      {renderFilmDetail()}
                    </div>
                  </div>
                </div>
              </section>
            </div>
            <div
              className="tab-pane fade mt-5 content__Infomation"
              id="infomation"
              role="tabpanel"
              aria-labelledby="infomation-tab"
            >
              <div className="row">
                <div className="col-md-6 text-center">
                  <p>
                    Tên Phim :{" "}
                    <span className="ml-5">
                      {props.infoDetailMovie.tenPhim}
                    </span>
                  </p>
                  <p>
                    Bí Danh :{" "}
                    <span className="ml-5">{props.infoDetailMovie.biDanh}</span>
                  </p>
                  <p>
                    Ngày Khời Chiếu :{" "}
                    <span className="ml-5">
                      {new Date(
                        props.infoDetailMovie.ngayKhoiChieu
                      ).toLocaleDateString()}
                    </span>
                  </p>
                  <p>
                    Thời Lượng : <span className="ml-5">120 phút</span>
                  </p>
                  <p>
                    Định Dạng : <span className="ml-5">2D/Digital</span>
                  </p>
                </div>
                <div className="col-md-6">
                  <p className="description">{props.infoDetailMovie.moTa}</p>
                </div>
              </div>
            </div>
            <div
              className="tab-pane fade  mt-5 content__Vote"
              id="vote"
              role="tabpanel"
              aria-labelledby="vote-tab"
            >
              <div
                className="myVote"
                data-toggle="modal"
                data-target="#VoteModal"
              >
                <div className="row">
                  <div className="col-1">
                    <i className="fa fa-user avatar" />
                  </div>
                  <div className="col-8">
                    <p className="text-secondary">Bạn nghĩ gì về phim này?</p>
                  </div>
                  <div className="col-3 d-none d-md-block">
                    <p>
                      <i className="fa fa-star" />
                      <i className="fa fa-star" />
                      <i className="fa fa-star" />
                      <i className="fa fa-star" />
                      <i className="fa fa-star" />
                    </p>
                  </div>
                </div>
              </div>
              {renderComment()}
              <div
                className="modal fade"
                id="VoteModal"
                tabIndex={-1}
                aria-labelledby="VoteModalLabel"
                aria-hidden="true"
              >
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header" style={{ padding: "0px" }}>
                      <h5
                        className="modal-title text-dark text-center"
                        id="VoteModalLabel"
                      >
                        <HoverRating />
                      </h5>
                      <button
                        type="button"
                        className="close"
                        data-dismiss="modal"
                        aria-label="Close"
                      >
                        <span aria-hidden="true">×</span>
                      </button>
                    </div>
                    <div className=" modal-body m-1 h-100">
                      {/* <input type="text" placeholder="Nói cho mọi người biết bạn nghĩ gì về phim này..." class="w-100"> */}
                      <textarea
                        placeholder="Nói cho mọi người biết bạn nghĩ gì về phim này..."
                        className="w-100  text-dark"
                        value={comment}
                        onChange={handleChangeComment}
                        style={{ height: "100px" }}
                      />
                    </div>
                    <div className=" modal-footer">
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={handleSubmitRating}
                        data-dismiss="modal"
                      >
                        Đăng
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="info__bottom  mx-auto">
          <div className="container">
            <div className="row">
              <div className="col-md-8">
                <h4>TIX – SẢN PHẨM CỦA CÔNG TY CỔ PHẦN ZION</h4>
                <p>
                  Địa chỉ: Z06 Đường số 13, Phường Tân Thuận Đông, Quận 7, Tp.
                  Hồ Chí Minh, Việt Nam.
                </p>
                <p>Giấy chứng nhận đăng ký kinh doanh số: 0101659783,</p>
                <p>
                  đăng ký thay đổi lần thứ 30, ngày 22 tháng 01 năm 2020 do Sở
                  kế hoạch và đầu tư Thành phố Hồ Chí Minh cấp.
                </p>
                <p>Số Điện Thoại (Hotline): 1900 545 436</p>
                <p>
                  Email: <a href="#">support@tix.vn</a>
                </p>
              </div>
              <div className="col-md-4 text-center mt-5">
                <Link
                  href="http://online.gov.vn/Home/WebDetails/62782"
                  target="_blank"
                >
                  <LazyLoadImage
                    src="../images/bocong thuong.png"
                    alt="bocongthuong"
                    className="img-fluid"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
const mapDispatchToProps = (dispatch) => {
  return {
    InfoDetailFilm: (id) => {
      dispatch(actFetchInfoDetailMovie(id));
    },
    fetchListLogo: () => {
      dispatch(actFetchListLogoShowTime());
    },
    Comment: (cmt) => {
      dispatch({
        type: "FECT_COMMENT_FILM",
        cmt,
      });
    },
  };
};
const mapStateToProps = (state) => {
  return {
    infoDetailMovie: state.ShowTimeReducer.infoDetailMovie,
    loading: state.ShowTimeReducer.loading,
    listLogo: state.ShowTimeReducer.listLogo,
    maHeThongRap: state.ShowTimeReducer.maHeThongRap,
    listComment: state.ShowTimeReducer.listComment,
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(DetailMovie);
