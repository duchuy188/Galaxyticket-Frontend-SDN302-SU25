import React from 'react';
import TimeFilmShowTime from '../TimeFilm_ShowTimes';
import { LazyLoadImage } from 'react-lazy-load-image-component';

export default function FilmShowTime(props) {
  // console.log(props.Film);
  const renderTimeFilm = () => {
    if (props.Film.lstLichChieuTheoPhim && props.Film.lstLichChieuTheoPhim.length > 0) {
      return props.Film.lstLichChieuTheoPhim.map((item, index) => {
        if (index <= 5) {
          return <TimeFilmShowTime key={item.maLichChieu} Time={item} />
        }
      })
    }

  }
  return (
    <div>
      <div className="lichChieu__item">
        <div className="row phim__item">
          <div className="col-2 phim__img ">
            <LazyLoadImage src={props.Film.hinhAnh} alt="" className="img-fluid" />
          </div>
          <div className="col-10 phim__thoiLuong">
            <p><span className="doTuoi">P</span>{props.Film.tenPhim}</p>
            <span>120 phút -FOX 9.4 -IMDb 8.7</span>
          </div>
        </div>
        <h4>2D Digital</h4>
        <div className="row">
          {renderTimeFilm()}
        </div>

      </div>
    </div>
  )
}
