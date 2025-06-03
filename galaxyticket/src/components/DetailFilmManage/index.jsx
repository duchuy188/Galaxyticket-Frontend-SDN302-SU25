import React from "react";
import { Button, Image } from "antd";
import { NavLink } from "react-router-dom";
import { connect } from "react-redux";
import Loading from "../../components/Loading/loading";

function DetailFilmManage(props) {
  let { detailFilm } = props;
  if (props.loadingDetailFilm) {
    return <Loading />;
  } else {
    return (
      <div
        className="w-50 mx-auto  pl-5 mt-5"
        style={{
          border: "1px solid gray",
          boxShadow: "2px 2px 10px 2px lightgray",
        }}
      >
        <h2 className="display-4 my-4 text-center">Thông tin chi tiết</h2>
        <p>
          Mã phim: <span className="font-weight-bold">{detailFilm.maPhim}</span>
        </p>
        <p>
          Tên Phim:{" "}
          <span className="font-weight-bold">{detailFilm.tenPhim}</span>
        </p>
        <p>
          Bí danh: <span className="font-weight-bold">{detailFilm.biDanh}</span>
        </p>
        <p>
          Trailer:{" "}
          <span className="font-weight-bold">{detailFilm.trailer}</span>
        </p>
        <p>
          Hình Ảnh:{" "}
          <Image key={detailFilm.hinhAnh} width={60} src={detailFilm.hinhAnh} />
        </p>
        <p>
          Mô tả: <span className="font-weight-bold">{detailFilm.moTa}</span>
        </p>
        <p>
          Mã nhóm: <span className="font-weight-bold">{detailFilm.maNhom}</span>
        </p>
        <p>
          Ngày khởi chiếu:{" "}
          <span className="font-weight-bold">{detailFilm.ngayKhoiChieu}</span>
        </p>
        <p>
          Đánh giá:{" "}
          <span className="font-weight-bold">{detailFilm.danhGia}</span>
        </p>
        <NavLink activeClassName="active" className="nav-link" to="/admin">
          <Button type="primary" danger className="my-5">
            Trở về trang trước
          </Button>
        </NavLink>
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    detailFilm: state.AdminReducer.detailFilmManage,
    loadingDetailFilm: state.AdminReducer.loadingDetailFilm,
  };
};
export default connect(mapStateToProps, null)(DetailFilmManage);
