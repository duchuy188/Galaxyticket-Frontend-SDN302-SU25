import React from 'react'
import { NavLink } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';


function Movie(props) {
  const { LichChieu } = props;
  return (
    <div>
      <div className={LichChieu === "before" ? "movie__item" : "movie__itemSapChieu"}>
        <div className="movie__img">
          <LazyLoadImage src={props.Movie.hinhAnh} alt="film-1" className="img-fluid" />
          <div className="icon__play">
            <a className="video" href={props.Movie.trailer} data-lity>
              <i className="fa fa-play" />
            </a>
          </div>
          <div className="danhGia" style={{ visibility: props.LichChieu === "before" ? "visible" : "hidden" }}>{props.Movie.danhGia}
            <i className="fa fa-star icon__start" />
          </div>
          <div className="ngayChieu" style={{ display: props.LichChieu === "before" ? "none" : "block" }}>{new Date(props.Movie.ngayKhoiChieu).getDate()}/{new Date(props.Movie.ngayKhoiChieu).getMonth() + 1}</div>
          <div className="overlay" />
        </div>
        <div className="movie__info">
          <p className="tenPhim">{props.Movie.tenPhim}</p>
          <span className="thoiLuong">120 phút</span>
          <NavLink to={`/detailMovie/${props.Movie.maPhim}`}><div className="movie__btnMuaVe button__muaVe" >Mua Vé <i className="fa fa-arrow-circle-down icon__down" /> </div></NavLink>
        </div>
      </div>
    </div>
  )

}


export default Movie;
