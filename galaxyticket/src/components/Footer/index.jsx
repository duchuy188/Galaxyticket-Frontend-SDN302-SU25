import React from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";

export default function FooterHomePage() {
  const slick = {
    arrows: false,
    autoplay: true,
    infinite: true,
    autoplaySpeed: 2000,
    next: false,
  };
  return (
    <div className="pt-5">
      <footer className="footer">
        <div className="footer__introduce " id="ungDung">
          <div className="container">
            <div className="row">
              <div className="intro__info col-lg-6 text-center text-lg-left">
                <h2>Ứng dụng tiện lợi dành cho người yêu điện ảnh</h2>
                <p>
                  Không chỉ đặt vé, bạn có thể bình luận phim, chấm điểm rạp và
                  đổi quà hấp dẫn
                </p>
                <button className="bt mb-2">App miễn phí - Tải về ngay!</button>
                <br />
                <span>
                  {" "}
                  Fox có 2 phiên bản{" "}
                  <Link to="#" href="#">
                    iOS
                  </Link>{" "}
                  và{" "}
                  <Link to="#" href="#">
                    Android
                  </Link>
                </span>
              </div>

              <div className="intro__img col-lg-6 mt-5 mt-lg-0">
                <LazyLoadImage
                  src="./images/mobile.png"
                  alt="img_mobie"
                  className="img__mobile"
                />

                <div className="img__app">
                  <Slider {...slick}>
                    <LazyLoadImage
                      src="./images/slide1.jpg"
                      alt="img_slide1"
                      className="img-fluid"
                    />
                    <LazyLoadImage
                      src="./images/slide2.jpg"
                      alt="img_slide2"
                      className="img-fluid"
                    />
                    <LazyLoadImage
                      src="./images/slide3.jpg"
                      alt="img_slide3"
                      className="img-fluid"
                    />
                    <LazyLoadImage
                      src="./images/slide4.jpg"
                      alt="img_slide4"
                      className="img-fluid"
                    />
                    <LazyLoadImage
                      src="./images/slide5.jpg"
                      alt="img_slide5"
                      className="img-fluid"
                    />
                    <LazyLoadImage
                      src="./images/slide6.jpg"
                      alt="img_slide6"
                      className="img-fluid"
                    />
                  </Slider>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer__info">
          <div className="container">
            <div className="row info__top">
              <div className="col-md-4">
                <h4>FOX MOVIE</h4>
                <p>
                  {" "}
                  <Link to="#" href="#">
                    FAQ
                  </Link>{" "}
                  <span>
                    <Link to="#" href="#">
                      Thỏa thuận sử dụng
                    </Link>
                  </span>{" "}
                </p>
                <p>
                  <Link to="#" href="#">
                    Brand Guidelines
                  </Link>{" "}
                  <span>
                    {" "}
                    <Link to="#" href="#">
                      Chính sách bảo mật
                    </Link>{" "}
                  </span>
                </p>
              </div>
              <div className="col-md-4">
                <h4>ĐỐI TÁC</h4>
                <div className="row pb-2">
                  <div className="col">
                    <Link
                      to="#"
                      href="https://www.cgv.vn"
                      title="cgv"
                      target="_blank"
                    >
                      <LazyLoadImage
                        src="./images/cgv.png"
                        alt="cgv"
                        className="img-fluid"
                      />
                    </Link>
                  </div>
                  <div className="col ">
                    <Link
                      to="#"
                      href="https://www.bhdstar.vn"
                      title="bdh"
                      target="_blank"
                    >
                      {" "}
                      <LazyLoadImage
                        src="./images/bhd.png"
                        alt="bhd"
                        className="img-fluid"
                      />
                    </Link>
                  </div>
                  <div className="col ">
                    <Link
                      to="#"
                      href="https://www.galaxycine.vn"
                      title="galaxy"
                      target="_blank"
                    >
                      {" "}
                      <LazyLoadImage
                        src="./images/galaxycine.png"
                        alt="galaxy"
                        className="img-fluid"
                      />
                    </Link>
                  </div>
                  <div className="col">
                    <Link
                      to="#"
                      href="http://cinestar.com.vn"
                      title="cinestar"
                      target="_blank"
                    >
                      <LazyLoadImage
                        src="./images/cinestar.png"
                        alt="cinestar"
                        className="img-fluid w-100"
                      />
                    </Link>
                  </div>
                  <div className="col ">
                    <Link
                      to="#"
                      href="https://www.megagscinemas.vn"
                      title="megags"
                      target="_blank"
                    >
                      <LazyLoadImage
                        src="./images/megags.png"
                        alt="megags"
                        className="img-fluid"
                      />
                    </Link>
                  </div>
                </div>
                <div className="row pb-2">
                  <div className="col">
                    <Link
                      to="#"
                      href="https://www.betacineplex.vn/home.htm"
                      title="beta"
                      target="_blank"
                    >
                      <LazyLoadImage
                        src="./images/bt.jpg"
                        alt="bt"
                        className="img-fluid"
                      />
                    </Link>
                  </div>
                  <Link
                    to="#"
                    href="https://www.betacineplex.vn/home.htm"
                    title="beta"
                    target="_blank"
                  ></Link>
                  <div className="col">
                    <Link
                      to="#"
                      href="http://ddcinema.vn"
                      title="ddc"
                      target="_blank"
                    >
                      <LazyLoadImage
                        src="./images/dongdacinema.png"
                        alt="ddc"
                        className="img-fluid"
                      />
                    </Link>
                  </div>
                  <div className="col">
                    <Link
                      to="#"
                      href="https://touchcinema.com"
                      title="touch"
                      target="_blank"
                    >
                      <LazyLoadImage
                        src="./images/TOUCH.png"
                        alt="touch"
                        className="img-fluid"
                      />
                    </Link>
                  </div>
                  <div className="col">
                    <Link
                      to="#"
                      href="https://cinemaxvn.com"
                      title="cinemax"
                      target="_blank"
                    >
                      <LazyLoadImage
                        src="./images/cnx.jpg"
                        alt="cinemax"
                        className="img-fluid"
                      />
                    </Link>
                  </div>
                  <div className="col">
                    <Link
                      to="#"
                      href="https://starlight.vn"
                      title="starlight"
                      target="_blank"
                    >
                      {" "}
                      <LazyLoadImage
                        src="./images/STARLIGHT.png"
                        alt="starlight"
                        className="img-fluid"
                      />
                    </Link>
                  </div>
                </div>
                <div className="row pb-2">
                  <div className="col">
                    <Link
                      to="#"
                      href="https://www.dcine.vn"
                      title="dcine"
                      target="_blank"
                    >
                      <LazyLoadImage
                        src="./images/dcine.png"
                        alt="dcine"
                        className="img-fluid"
                      />
                    </Link>
                  </div>
                  <div className="col">
                    <Link
                      to="#"
                      href="http://lottecinemavn.com/LCHS/index.aspx"
                      title="lotte"
                      target="_blank"
                    >
                      <LazyLoadImage
                        src="./images/lotte.png"
                        alt="lotte"
                        className="img-fluid"
                      />
                    </Link>
                  </div>
                  <div className="col">
                    <Link
                      to="#"
                      href="https://www.payoo.vn"
                      title="payoo"
                      target="_blank"
                    >
                      <LazyLoadImage
                        src="./images/payoo.jpg"
                        alt="payoo"
                        className="img-fluid"
                      />
                    </Link>
                  </div>
                  <div className="col">
                    <Link
                      to="#"
                      href="https://zalopay.vn"
                      title="zalo"
                      target="_blank"
                    >
                      {" "}
                      <LazyLoadImage
                        src="./images/zalopay_icon.png"
                        alt="zalo"
                        className="img-fluid"
                      />
                    </Link>
                  </div>
                  <div className="col">
                    <Link
                      to="#"
                      href="https://www.agribank.com.vn"
                      title="agribank"
                      target="_blank"
                    >
                      <LazyLoadImage
                        src="./images/AGRIBANK.png"
                        alt="Agribank"
                        className="img-fluid"
                      />
                    </Link>
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    <Link
                      to="#"
                      href="https://portal.vietcombank.com.vn/Pages/Home.aspx"
                      title="vietcombank"
                      target="_blank"
                    >
                      <LazyLoadImage
                        src="./images/VCB.png"
                        alt="Vietcombank"
                        className="img-fluid"
                      />
                    </Link>
                  </div>
                  <div className="col">
                    <Link
                      to="#"
                      href="https://www.vietinbank.vn/web/home/vn/index.html"
                      title="viettinbank"
                      target="_blank"
                    >
                      <LazyLoadImage
                        src="./images/VIETTINBANK.png"
                        alt="Viettinbank"
                        className="img-fluid"
                      />
                    </Link>
                  </div>
                  <div className="col">
                    <Link
                      to="#"
                      href="https://www.indovinabank.com.vn"
                      title="IVB"
                      target="_blank"
                    >
                      <LazyLoadImage
                        src="./images/IVB.png"
                        alt="IVB"
                        className="img-fluid"
                      />
                    </Link>
                  </div>
                  <div className="col">
                    <Link
                      to="#"
                      href="https://webv3.123go.vn"
                      title="123go"
                      target="_blank"
                    >
                      <LazyLoadImage
                        src="./images/123go.png"
                        alt="123go"
                        className="img-fluid"
                      />
                    </Link>
                  </div>
                  <div className="col">
                    <Link
                      to="#"
                      href="https://laban.vn"
                      title="laban"
                      target="_blank"
                    >
                      <LazyLoadImage
                        src="./images/laban.png"
                        alt="laban"
                        className="img-fluid"
                      />
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <h4 className="pt-3 pt-md-0">SOCIAL</h4>
                <Link to="#" href="#" title="facebook">
                  <i className="fab fa-facebook pl-0" />
                </Link>
                <Link to="#" href="#" title="instagram">
                  <i className="fab fa-instagram" />
                </Link>
                <Link to="#" href="#" title="twitter">
                  <i className="fab fa-twitter" />
                </Link>
                <Link to="#" href="#" title="pinterest">
                  <i className="fab fa-pinterest" />
                </Link>
              </div>
            </div>
            <div className="row info__bottom">
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
                  Email:{" "}
                  <Link to="#" href="#">
                    support@tix.vn
                  </Link>
                </p>
              </div>
              <div className="col-md-4 text-center mt-5">
                <Link
                  to="#"
                  href="http://online.gov.vn/Home/WebDetails/62782"
                  target="_blank"
                >
                  <LazyLoadImage
                    src="./images/bocong thuong.png"
                    alt="bocongthuong"
                    className="img-fluid"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
