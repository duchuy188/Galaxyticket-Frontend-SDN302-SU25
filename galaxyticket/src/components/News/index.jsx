import React, { Component } from "react";
import { Link } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";

export default class News extends Component {
  handleViewMore = () => {
    document.getElementById("r__hidden").style.display = "flex";
    window.scrollBy({ top: 50, left: 0, behavior: "smooth" });
  };
  handleViewMore1 = () => {
    document.getElementById("r__hidden1").style.display = "flex";
    window.scrollBy({ top: 50, left: 0, behavior: "smooth" });
  };
  handleViewMore2 = () => {
    document.getElementById("r__hidden2").style.display = "flex";
    window.scrollBy({ top: 50, left: 0, behavior: "smooth" });
  };
  render() {
    return (
      <div id="tinTuc">
        <section className="readmore">
          <div className="container readmore__content">
            <ul
              className="nav nav-pills mb-3 justify-content-center pt-5"
              id="pills-tab"
              role="tablist"
            >
              <li className="nav-item" role="presentation">
                <a
                  className="nav-link button active"
                  id="pills-home-tab"
                  data-toggle="pill"
                  href="#pills-home"
                  role="tab"
                  aria-controls="pills-home"
                  aria-selected="true"
                >
                  Điện Ảnh 24h
                </a>
              </li>
              <li className="nav-item" role="presentation">
                <a
                  className="nav-link button"
                  id="pills-review-tab"
                  data-toggle="pill"
                  href="#pills-review"
                  role="tab"
                  aria-controls="pills-review"
                  aria-selected="false"
                >
                  Review
                </a>
              </li>
              <li className="nav-item" role="presentation">
                <a
                  className="nav-link button"
                  id="pills-promotions-tab"
                  data-toggle="pill"
                  href="#pills-promotions"
                  role="tab"
                  aria-controls="pills-promotions"
                  aria-selected="false"
                >
                  Khuyến Mãi
                </a>
              </li>
            </ul>
            <div className="tab-content" id="pills-tabContent">
              <div
                className="tab-pane fade show active"
                id="pills-home"
                role="tabpanel"
                aria-labelledby="pills-home-tab"
              >
                <div className="container">
                  <div className="row">
                    <div className="col-md-6 readmore__img">
                      <LazyLoadImage
                        src="./images/new2.jpg"
                        alt="anh_new1"
                        className="img-fluid "
                      />
                      <Link
                        to="#"
                        to="#"
                        href="#"
                        className="text-decoration-none"
                      >
                        [ANTEBELLUM] - 4 lý do không thể bỏ lỡ siêu phẩm kinh dị
                        Antebellum: Bẫy Thực Tại Kinh Hoàng
                      </Link>
                      <p>
                        Không đi theo lối mòn máu me, hù dọa mà đầu tư khai thác
                        những mảng tối của xã hội trên nền một câu chuyện kinh
                        dị, có sự tham gia của nhà sản xuất đã làm nên thành
                        công của loạt tác phẩm ấn tượng “Get Out”, “Us” hay ...{" "}
                      </p>
                      <p className="icon pl-1">
                        <i className="far fa-thumbs-up" /> &nbsp; 2 &nbsp;
                        <LazyLoadImage
                          src="./images/iconComment.png"
                          alt="icon_Comment"
                        />{" "}
                        1
                      </p>
                    </div>
                    <div className="col-md-6 readmore__img">
                      <LazyLoadImage
                        src="./images/news1.png"
                        alt="anh_new2"
                        className="img-fluid "
                      />
                      <Link to="#" href="#" className="text-decoration-none">
                        Ác Quỷ Đối Đầu soán ngôi Peninsula, trở thành phim đứng
                        đầu doanh thu tại Hàn Quốc mùa dịch
                      </Link>
                      <p>
                        Vượt mặt Peninsula, Ác Quỷ Đối Đầu trở thành phim ăn
                        khách nhất mùa hè 2020 tại Hàn Quốc. Chỉ sau 12 ngày, Ác
                        Quỷ Đối Đầu chạm điểm hoà vốn với 3.5 triệu lượt xem. Ác
                        Quỷ Đối Đầu giữ vững vị trí top 1 doanh thu 2 tuần liên
                        tiếp{" "}
                      </p>
                      <p className="icon pl-1">
                        <i className="far fa-thumbs-up" /> &nbsp; 10 &nbsp;
                        <LazyLoadImage
                          src="./images/iconComment.png"
                          alt="icon_Comment"
                        />{" "}
                        1
                      </p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4 readmore__img readmore__bot">
                      <LazyLoadImage
                        src="./images/new3.png"
                        alt="anh_new3"
                        className="img-fluid"
                      />
                      <p>
                        <Link to="#" href="#" className="text-decoration-none">
                          Dàn mỹ nhân trong thế giới điện ảnh của quái kiệt
                          Christopher Nolan
                        </Link>
                      </p>
                      <p>
                        Làng phim đương đại những năm qua chứng kiến sự lên ngôi
                        của cái tên Christopher Nolan, được biết tới như một
                        trong những đạo diễn thiên tài với khả...{" "}
                      </p>
                      <p className="icon pl-1">
                        <i className="far fa-thumbs-up" /> &nbsp; 0 &nbsp;
                        <LazyLoadImage
                          src="./images/iconComment.png"
                          alt="icon_Comment"
                        />{" "}
                        0
                      </p>
                    </div>
                    <div className="col-md-4 readmore__img readmore__bot">
                      <LazyLoadImage
                        src="./images/new4.png"
                        alt="anh_new4"
                        className="img-fluid"
                      />
                      <p>
                        <Link to="#" href="#" className="text-decoration-none">
                          Truy Cùng Giết Tận - Cuộc tái ngộ của hai 'ông hoàng
                          phòng vé' xứ Hàn
                        </Link>
                      </p>
                      <p>
                        Sau 7 năm kể từ New World – bộ phim đạt thành tích hơn
                        4.68 triệu vé, hai tên tuổi lão làng trong làng điện ảnh
                        Hàn Quốc mới tiếp tục tái hợp trong Truy Cùng Giết Tận –
                        một bộ phim hành động siêu “nặng đô”...
                      </p>
                      <p className="icon pl-1">
                        <i className="far fa-thumbs-up" /> &nbsp; 1 &nbsp;
                        <LazyLoadImage
                          src="./images/iconComment.png"
                          alt="icon_Comment"
                        />{" "}
                        1
                      </p>
                    </div>
                    <div className="col-md-4 readmore__special">
                      <div className="row mb-3 mb-md-0 mb-lg-2">
                        <LazyLoadImage
                          src="./images/new5.png"
                          alt=""
                          className="img-fluid"
                        />
                        <Link
                          to="#"
                          href="#"
                          className="pt-md-2 text-decoration-none"
                        >
                          6 đạo diễn tỉ đô làm nên thành công của những bom tấn
                          đình đám
                        </Link>
                      </div>
                      <div className="row mb-3 mb-md-0 mb-lg-2">
                        <LazyLoadImage src="./images/new6.png" alt="anh_new6" />
                        <Link
                          to="#"
                          href="#"
                          className="pt-md-2 text-decoration-none"
                        >
                          Gái Già Lắm Chiêu V - Những cuộc đời vương giả
                        </Link>
                      </div>
                      <div className="row mb-3 mb-md-0 mb-lg-2">
                        <LazyLoadImage src="./images/new7.png" alt="anh_new6" />
                        <Link
                          to="#"
                          href="#"
                          className="pt-md-2 text-decoration-none"
                        >
                          Kaity Nguyễn trở thành mỹ nhân mới của vũ trụ Gái Già
                          Lắm Chiêu
                        </Link>
                      </div>
                      <div className="row mb-3 mb-md-0 mb-lg-2">
                        <LazyLoadImage src="./images/new8.png" alt="anh_new6" />
                        <Link
                          to="#"
                          href="#"
                          className="pt-md-2 text-decoration-none"
                        >
                          5 lý do bạn không thể bỏ qua bộ phim Cậu Bé Người Gỗ
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="row " id="r__hidden">
                    <div className="col-md-6 readmore__img">
                      <LazyLoadImage
                        src="./images/new9.png"
                        alt="anh_new1"
                        className="img-fluid "
                      />
                      <Link to="#" href="#" className="text-decoration-none">
                        TENET công bố ngày khởi chiếu chính thức tại Việt Nam
                      </Link>
                      <p>
                        Đêm qua theo giờ Việt Nam, hãng phim Warner Bros. đưa ra
                        thông báo chính thức về ngày khởi chiếu cho bom tấn
                        TENET tại các thị trường bên ngoài Bắc Mỹ, trong đó có
                        Việt Nam.{" "}
                      </p>
                      <p className="icon pl-1">
                        <i className="far fa-thumbs-up" /> &nbsp; 8 &nbsp;
                        <LazyLoadImage
                          src="./images/iconComment.png"
                          alt="icon_Comment"
                        />{" "}
                        2
                      </p>
                    </div>
                    <div className="col-md-6 readmore__img">
                      <LazyLoadImage
                        src="./images/new10.jpg"
                        alt="anh_new2"
                        className="img-fluid "
                      />
                      <Link to="#" href="#" className="text-decoration-none">
                        Khi phụ nữ không còn ở thế trốn chạy của nạn nhân
                      </Link>
                      <p>
                        Là bộ phim tâm lý li kỳ với chủ đề tội phạm, Bằng Chứng
                        Vô Hình mang đến một góc nhìn mới về hình ảnh những
                        người phụ nữ thời hiện đại. Điều đó được thể hiện qua
                        câu chuyện về hai người phụ nữ cùng hợp sức để vạch mặt
                        tên tội phạm có sở thích bệnh hoạn với phụ nữ.{" "}
                      </p>
                      <p className="icon pl-1">
                        <i className="far fa-thumbs-up" /> &nbsp; 15 &nbsp;
                        <LazyLoadImage
                          src="./images/iconComment.png"
                          alt="icon_Comment"
                        />{" "}
                        1
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <button
                    className="btn readmore__button"
                    onClick={this.handleViewMore}
                  >
                    Xem thêm
                  </button>
                </div>
              </div>
              <div
                className="tab-pane fade"
                id="pills-review"
                role="tabpanel"
                aria-labelledby="pills-review-tab"
              >
                <div className="container">
                  <div className="row">
                    <div className="col-md-6 readmore__img">
                      <LazyLoadImage
                        src="./images/review1.png"
                        alt="anh_new1"
                        className="img-fluid "
                      />
                      <Link to="#" href="#" className="text-decoration-none">
                        Review: Tàn Tích Quỷ Ám (Relic) - Ba thế hệ và mối liên
                        kết
                      </Link>
                      <p>
                        Điểm nhấn của phim kinh dị năm 2020 chính là Tàn Tích
                        Quỷ Ám{" "}
                      </p>
                      <p className="icon pl-1">
                        <i className="far fa-thumbs-up" /> &nbsp; 32 &nbsp;
                        <LazyLoadImage
                          src="./images/iconComment.png"
                          alt="icon_Comment"
                        />{" "}
                        6
                      </p>
                    </div>
                    <div className="col-md-6 readmore__img">
                      <LazyLoadImage
                        src="./images/review2.png"
                        alt="anh_new2"
                        className="img-fluid "
                      />
                      <Link to="#" href="#" className="text-decoration-none">
                        Review: Dinh Thự Oan Khuất (Ghost Of War)
                      </Link>
                      <p>
                        Tuy là một bộ phim có chất lượng tốt, nhưng có vẻ Dinh
                        Thự Oan Khuất vẫn chưa đủ để đem khán giả trở lại phòng
                        vé!{" "}
                      </p>
                      <p className="icon pl-1">
                        <i className="far fa-thumbs-up" /> &nbsp; 19 &nbsp;
                        <LazyLoadImage
                          src="./images/iconComment.png"
                          alt="icon_Comment"
                        />{" "}
                        5
                      </p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4 readmore__img readmore__bot">
                      <LazyLoadImage
                        src="./images/review3.png"
                        alt="anh_new3"
                        className="img-fluid"
                      />
                      <p>
                        <Link to="#" href="#" className="text-decoration-none">
                          ‘BlacKkKlansman’ - cốc nước lạnh để người Mỹ thức tỉnh
                        </Link>
                      </p>
                      <p>
                        Tác phẩm nhận đề cử Phim truyện xuất sắc tại Oscar 2019
                        của đạo diễn Spike Lee là một lát cắt nữa về nạn phân
                        biệt chủng tộc - nỗi đau gây nhức nhối nước Mỹ cho tới
                        tận hôm nay.{" "}
                      </p>
                      <p className="icon pl-1">
                        <i className="far fa-thumbs-up" /> &nbsp; 12 &nbsp;
                        <LazyLoadImage
                          src="./images/iconComment.png"
                          alt="icon_Comment"
                        />{" "}
                        2
                      </p>
                    </div>
                    <div className="col-md-4 readmore__img readmore__bot">
                      <LazyLoadImage
                        src="./images/review4.png"
                        alt="anh_new4"
                        className="img-fluid"
                      />
                      <p>
                        <Link to="#" href="#" className="text-decoration-none">
                          American Sniper - Chính nghĩa hay phi nghĩa?
                        </Link>
                      </p>
                      <p>
                        American Sniper khắc họa một tay súng bắn tỉa “huyền
                        thoại” của Hải quân Mỹ với 4 lần tham chiến ở Trung
                        Đông. Câu chuyện phim chậm rãi đưa người xem qua từng
                        thời khắc khác nhau của Kyle, từ thửa nhỏ, thiếu niên,
                        rồi gia nhập quân đội, rồi tham chiến. Từng khoảnh khắc
                        bắt đầu nhẹ nhàng...
                      </p>
                      <p className="icon pl-1">
                        <i className="far fa-thumbs-up" /> &nbsp; 22 &nbsp;
                        <LazyLoadImage
                          src="./images/iconComment.png"
                          alt="icon_Comment"
                        />{" "}
                        1
                      </p>
                    </div>
                    <div className="col-md-4 readmore__special">
                      <div className="row mb-3 mb-md-0 mb-lg-2">
                        <LazyLoadImage
                          src="./images/review5.png"
                          alt=""
                          className="img-fluid"
                        />
                        <Link
                          to="#"
                          href="#"
                          className="pt-md-2 text-decoration-none"
                        >
                          Review: Spider-Man: Into The Spider-Vesre{" "}
                        </Link>
                      </div>
                      <div className="row mb-3 mb-md-0 mb-lg-2">
                        <LazyLoadImage
                          src="./images/review6.jpg"
                          alt=" anh_new6"
                        />
                        <Link
                          to="#"
                          href="#"
                          className="pt-md-2 text-decoration-none"
                        >
                          COVID-19 là bản chính thức của MEV-1 phim contagion
                          (2011)
                        </Link>
                      </div>
                      <div className="row mb-3 mb-md-0 mb-lg-2">
                        <LazyLoadImage
                          src="./images/review7.jpg"
                          alt="anh_new6"
                        />
                        <Link
                          to="#"
                          href="#"
                          className="pt-md-2 text-decoration-none"
                        >
                          [Review] Siêu Vệ Sĩ Sợ Vợ - Giải cứu Tổng thống chưa
                          bao giờ lầy lội và hài hước đến thế
                        </Link>
                      </div>
                      <div className="row mb-3 mb-md-0 mb-lg-2">
                        <LazyLoadImage
                          src="./images/review8.jpg"
                          alt="anh_new6"
                        />
                        <Link
                          to="#"
                          href="#"
                          className="pt-md-2 text-decoration-none"
                        >
                          [Review] Bloodshot - Mở màn ấn tượng cho Vũ trụ Siêu
                          anh hùng Valiant
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="row " id="r__hidden1">
                    <div className="col-md-6 readmore__img">
                      <LazyLoadImage
                        src="./images/review9.jpg"
                        alt="anh_new1"
                        className="img-fluid "
                      />
                      <Link to="#" href="#" className="text-decoration-none">
                        [Review] Nắng 3: Lời Hứa Của Cha - Câu chuyện tình thân
                        cảm động của Khả Như và Kiều Minh Tuấn
                      </Link>
                      <p>
                        Như hai phần phim trước, Nắng 3 tiếp tục mang đến câu
                        chuyện tình cha, mẹ - con đầy nước mắt của bộ ba nhân
                        vật chính.{" "}
                      </p>
                      <p className="icon pl-1">
                        <i className="far fa-thumbs-up" /> &nbsp; 25 &nbsp;
                        <LazyLoadImage
                          src="./images/iconComment.png"
                          alt="icon_Comment"
                        />{" "}
                        1
                      </p>
                    </div>
                    <div className="col-md-6 readmore__img">
                      <LazyLoadImage
                        src="./images/review10.jpg"
                        alt="anh_new2"
                        className="img-fluid "
                      />
                      <Link to="#" href="#" className="text-decoration-none">
                        [Review] Onward - Khi phép thuật mạnh mẽ nhất chính là
                        tình thân{" "}
                      </Link>
                      <p>
                        Tác phẩm mới nhất của Pixar tiếp tục là câu chuyện hài
                        hước và cảm xúc về tình cảm gia đình.{" "}
                      </p>
                      <p className="icon pl-1">
                        <i className="far fa-thumbs-up" /> &nbsp; 17 &nbsp;
                        <LazyLoadImage
                          src="./images/iconComment.png"
                          alt="icon_Comment"
                        />{" "}
                        4
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <button
                    className="btn readmore__button"
                    onClick={this.handleViewMore1}
                  >
                    Xem thêm
                  </button>
                </div>
              </div>
              <div
                className="tab-pane fade"
                id="pills-promotions"
                role="tabpanel"
                aria-labelledby="pills-promotions-tab"
              >
                <div className="container">
                  <div className="row">
                    <div className="col-md-6 readmore__img">
                      <LazyLoadImage
                        src="./images/sales1.png"
                        alt="anh_new1"
                        className="img-fluid "
                      />
                      <Link to="#" href="#" className="text-decoration-none">
                        ĐỒNG GIÁ 1K/VÉ KHI MUA VÉ QUA TIX
                      </Link>
                      <p>
                        ĐỒNG GIÁ 1K/VÉ KHI MUA VÉ QUA TIX Hành trình tìm Ròm và
                        Phúc chỉ với 1k cả tuần + nhận thêm 02 voucher khi đặt
                        vé qua TIX.{" "}
                      </p>
                      <p className="icon pl-1">
                        <i className="far fa-thumbs-up" /> &nbsp; 10 &nbsp;
                        <LazyLoadImage
                          src="./images/iconComment.png"
                          alt="icon_Comment"
                        />{" "}
                        3
                      </p>
                    </div>
                    <div className="col-md-6 readmore__img">
                      <LazyLoadImage
                        src="./images/sales2.jpg"
                        alt="anh_new2"
                        className="img-fluid "
                      />
                      <Link to="#" href="#" className="text-decoration-none">
                        BHD STAR VÉ CHỈ 59.000Đ CẢ TUẦN!
                      </Link>
                      <p>
                        Tận hưởng Ưu Đãi lên đến 3 VÉ BHD Star mỗi tuần chỉ với
                        giá 59k/vé khi mua vé trên TIX và thanh toán bằng
                        ZaloPay hoặc Mục Vé Phim trên ZaloPay.{" "}
                      </p>
                      <p className="icon pl-1">
                        <i className="far fa-thumbs-up" /> &nbsp; 2 &nbsp;
                        <LazyLoadImage
                          src="./images/iconComment.png"
                          alt="icon_Comment"
                        />{" "}
                        1
                      </p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4 readmore__img readmore__bot">
                      <LazyLoadImage
                        src="./images/sales3.png"
                        alt="anh_new3"
                        className="img-fluid"
                      />
                      <p>
                        <Link to="#" href="#" className="text-decoration-none">
                          Beta Cineplex trở lại với hàng loạt ưu đãi lớn
                        </Link>
                      </p>
                      <p>
                        Từ thứ 7 tuần này (9/5), toàn bộ các rạp Beta Cinemas
                        trên toàn quốc sẽ mở cửa trở lại. Mừng ngày trở lại,
                        hàng loạt khuyến mại KHỦNG đổ bộ cùng lúc dàng cho các
                        tín đồ của TIX đây.{" "}
                      </p>
                      <p className="icon pl-1">
                        <i className="far fa-thumbs-up" /> &nbsp; 1 &nbsp;
                        <LazyLoadImage
                          src="./images/iconComment.png"
                          alt="icon_Comment"
                        />{" "}
                        0
                      </p>
                    </div>
                    <div className="col-md-4 readmore__img readmore__bot">
                      <LazyLoadImage
                        src="./images/sales4.jpg"
                        alt="anh_new4"
                        className="img-fluid"
                      />
                      <p>
                        <Link to="#" href="#" className="text-decoration-none">
                          [123Phim] Thứ 6 Không Đen Tối - Ưu đãi huỷ diệt 11k/vé
                          Anh Trai Yêu Quái
                        </Link>
                      </p>
                      <p>
                        Từ giờ đến 05.12.2019, chỉ cần lần đầu mua vé trên
                        123Phim, chọn thanh toán bằng ZaloPay hoặc mục Vé Phim
                        trên ZaloPay, bạn có thể đặt ngay vé phim Anh Trai Yêu
                        Quái với giá chỉ 11k/vé.
                      </p>
                      <p className="icon pl-1">
                        <i className="far fa-thumbs-up" /> &nbsp; 0 &nbsp;
                        <LazyLoadImage
                          src="./images/iconComment.png"
                          alt="icon_Comment"
                        />{" "}
                        0
                      </p>
                    </div>
                    <div className="col-md-4 readmore__special">
                      <div className="row mb-3 mb-md-0 mb-lg-2">
                        <LazyLoadImage
                          src="./images/sales5.jpg"
                          alt=""
                          className="img-fluid"
                        />
                        <Link
                          to="#"
                          href="#"
                          className="pt-md-2 text-decoration-none"
                        >
                          [123Phim] NHẬP MÃ 'PSM30K' - Giảm ngay 30k khi đặt vé
                          Pháp Sư Mù: Ai Chết Giơ Tay
                        </Link>
                      </div>
                      <div className="row mb-3 mb-md-0 mb-lg-2">
                        <LazyLoadImage
                          src="./images/sales6.jpg"
                          alt="anh_new6"
                        />
                        <Link
                          to="#"
                          href="#"
                          className="pt-md-2 text-decoration-none"
                        >
                          [Mega GS] Một đoá hoa thay ngàn lời yêu
                        </Link>
                      </div>
                      <div className="row mb-3 mb-md-0 mb-lg-2">
                        <LazyLoadImage
                          src="./images/sales7.jpg"
                          alt="anh_new6"
                        />
                        <Link
                          to="#"
                          href="#"
                          className="pt-md-2 text-decoration-none"
                        >
                          [123Phim] NHẬP MÃ 'BKT' - Giảm ngay 20k khi đặt vé Bắc
                          Kim Thang
                        </Link>
                      </div>
                      <div className="row mb-3 mb-md-0 mb-lg-2">
                        <LazyLoadImage
                          src="./images/sales8.jpg"
                          alt="anh_new6"
                        />
                        <Link
                          to="#"
                          href="#"
                          className="pt-md-2 text-decoration-none"
                        >
                          Sinh Nhật Mega GS
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="row" id="r__hidden2">
                    <div className="col-md-6 readmore__img">
                      <LazyLoadImage
                        src="./images/sales9.jpg"
                        alt="anh_new1"
                        className="img-fluid "
                      />
                      <Link to="#" href="#" className="text-decoration-none">
                        [123Phim] TixShop trở lại, quà ‘xịn’ hơn xưa
                      </Link>
                      <p>
                        Nhiều Tix làm gì, để tiêu vào TixShop chứ còn chờ chi.
                      </p>
                      <p className="icon pl-1">
                        <i className="far fa-thumbs-up" /> &nbsp; 26 &nbsp;
                        <LazyLoadImage
                          src="./images/iconComment.png"
                          alt="icon_Comment"
                        />{" "}
                        8
                      </p>
                    </div>
                    <div className="col-md-6 readmore__img">
                      <LazyLoadImage
                        src="./images/sales10.jpg"
                        alt="anh_new2"
                        className="img-fluid "
                      />
                      <Link to="#" href="#" className="text-decoration-none">
                        [Galaxy Tràng Thi] Xem Phim Hay, Say Quà Tặng
                      </Link>
                      <p>
                        Nhân dịp khai trương Galaxy Tràng Thi, Galaxy Cinema
                        dành tặng các Stars Hà Nội loạt phần quà siêu hấp dẫn.{" "}
                      </p>
                      <p className="icon pl-1">
                        <i className="far fa-thumbs-up" /> &nbsp; 1 &nbsp;
                        <LazyLoadImage
                          src="./images/iconComment.png"
                          alt="icon_Comment"
                        />{" "}
                        0
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <button
                    className="btn readmore__button"
                    onClick={this.handleViewMore2}
                  >
                    Xem thêm
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}
