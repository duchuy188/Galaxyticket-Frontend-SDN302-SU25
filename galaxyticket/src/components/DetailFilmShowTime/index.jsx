import React from "react";
import TimeFilm_ShowTimes from "../TimeFilm_ShowTimes";
import { LazyLoadImage } from "react-lazy-load-image-component";

export default function DetailFilmShowTime(props) {
  const renderTimeFilmDetail = () => {
    return props.Film.arrTime.map((item, index) => {
      if (index <= 5) {
        return <TimeFilm_ShowTimes key={item.maLichChieu} Time={item} />;
      }
    });
  };
  return (
    <div>
      <div className="lichChieu__item">
        <div className="row phim__item">
          <div className="col-2 phim__img ">
            <LazyLoadImage
              src="../images/rap-bhd.jpg"
              alt=""
              className="img-fluid"
            />
          </div>
          <div className="col-10 phim__thoiLuong">
            <p className="text-dark">
              <span className="doTuoi">P</span>
              {props.Film.thongTinRap.tenCumRap}
            </p>
            <span>371 Nguyen Kiem Go Vap</span>
          </div>
        </div>
        <h4>2D Digital</h4>
        <div className="row">{renderTimeFilmDetail()}</div>
      </div>
    </div>
  );
}
