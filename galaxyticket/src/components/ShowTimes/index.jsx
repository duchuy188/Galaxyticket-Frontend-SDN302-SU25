import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import LogoShowTimes from "../Logo_ShowTimes";
import CinemaShowTime from "../Cinema_ShowTimes";
import { actFetchListFilmShowTime, actFetchListLogoShowTime } from "./module/action";
import FilmShowTime from '../Film_ShowTimes';

function ShowTimes(props) {

  const [maHTRap, setMaHTRap] = useState("BHDStar")
  useEffect(() => {
    props.fetchListFilm(props.maHeThongRap);
  }, [maHTRap]);

  useEffect(() => {
    setMaHTRap(props.maHeThongRap);
  })

  useEffect(() => {
    props.fetchListLogo();
  }, [])
  // console.log(props.maHeThongRap);

  // console.log(props.listLogo);
  const renderListLogo = () => {
    if (props.listLogo && props.listLogo.length > 0) {
      return props.listLogo.map((item, index) => {
        return <LogoShowTimes key={item.maHeThongRap} Logo={item} Index={index} />
      })
    }

  }

  const renderListFilm = () => {
    if (props.listFilm && props.listFilm.length > 0 && props.maCumRap !== "") {
      return props.listFilm.map((item) => {
        return item.lstCumRap.map((item) => {
          if (item.maCumRap === props.maCumRap) {
            return item.danhSachPhim.map((item) => {
              return <FilmShowTime key={item.maPhim} Film={item} />
            });
          };
        })
      });
    }

  }

  // console.log(props.maHeThongRap);
  return (
    <div id="cumRap">
      <section className="lichChieu container">
        <div className="row lichChieu__content mb-5">
          <div className="col-lg-1 lichChieu__LogoRap px-0">
            <div className="nav nav-pills" id="v-pills-tab" role="tablist">
              {renderListLogo()}
            </div>
          </div>
          <div className="col-lg-4 lichChieu__Rap">
            <div className="tab-content" id="v-pills-tabContent">
              <CinemaShowTime />
            </div>
          </div>
          <div className="col-lg-7 lichChieu__Phim">
            {renderListFilm()}
          </div>
        </div>
      </section>

    </div>
  )
}
const mapDispatchToProps = dispatch => {
  return {
    fetchListLogo: () => {
      dispatch(actFetchListLogoShowTime());
    },
    fetchListFilm: (maHTRap) => {
      dispatch(actFetchListFilmShowTime(maHTRap))
    }
  }
}
const mapStateToProps = state => {
  return {
    listLogo: state.ShowTimeReducer.listLogo,
    maHeThongRap: state.ShowTimeReducer.maHeThongRap,
    listFilm: state.ShowTimeReducer.listFilm,
    maCumRap: state.ShowTimeReducer.maCumRap,
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(ShowTimes);