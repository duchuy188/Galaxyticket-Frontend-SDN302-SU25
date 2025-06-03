import React from "react";
import { connect } from "react-redux";
import { actFetchMaLichChieuFilmShowTime } from "../ShowTimes/module/action";
// import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

function TimeFilmShowTime(props) {
  // console.log(props.Time);

  // let history = useHistory();
  const navigate = useNavigate();
  const handleClickFilmShowTime = (maLichChieu) => {
    props.handleClickMaLichChieu(maLichChieu);
    // history.push({ pathname: "/detail-ticketroom" });
    navigate("/detail-ticketroom");
  };
  return (
    <div className="ml-4 my-2">
      <div
        className="thoiGianChieu px-3"
        onClick={() => handleClickFilmShowTime(props.Time.maLichChieu)}
      >
        <p>
          <span>
            {new Date(props.Time.ngayChieuGioChieu).getHours()}:
            {new Date(props.Time.ngayChieuGioChieu).getMinutes()}
          </span>
          ~{new Date(props.Time.ngayChieuGioChieu).getHours() + 2}:
          {new Date(props.Time.ngayChieuGioChieu).getMinutes()}
        </p>
      </div>
    </div>
  );
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleClickMaLichChieu: (maLC) => {
      dispatch(actFetchMaLichChieuFilmShowTime(maLC));
    },
  };
};
export default connect(null, mapDispatchToProps)(TimeFilmShowTime);
