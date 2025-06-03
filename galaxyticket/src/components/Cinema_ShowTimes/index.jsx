import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import GroupCinemaShowTime from "../GroupCinema_ShowTime";
import { actFetchListCinemaShowTime } from "../ShowTimes/module/action";

function CinemaShowTime({ maHeThongRap, fetchListCinema, listCinema }) {
  const [maHTRap, setMaHTRap] = useState("BHDStar");
  useEffect(() => {
    // console.log("eff");
    fetchListCinema(maHeThongRap);
  }, [maHTRap]);

  useEffect(() => {
    setMaHTRap(maHeThongRap);
  });
  const renderGroupCinema = () => {
    if (listCinema && listCinema.length > 0) {
      // console.log(props.listCinema);
      return listCinema.map((item, index) => {
        return (
          <GroupCinemaShowTime key={item.maCumRap} Group={item} Index={index} />
        );
      });
    }
  };
  return (
    <div>
      {/* {console.log("render")} */}
      <div
        className={
          maHeThongRap === "BHDStar"
            ? "tab-pane fade show active"
            : "tab-pane fade show"
        }
        id={`v-pills-${maHeThongRap}`}
        role="tabpanel"
        aria-labelledby={`v-pills-${maHeThongRap}-tab`}
      >
        {/* {console.log(props.Cinema)} */}
        {renderGroupCinema()}
      </div>
    </div>
  );
}

const mapDispatchToProps = (dispatch) => {
  // console.log("dis");
  return {
    fetchListCinema: (maHeThong) => {
      dispatch(actFetchListCinemaShowTime(maHeThong));
    },
  };
};

const mapStateToProps = (state) => {
  // console.log("state");
  return {
    listCinema: state.ShowTimeReducer.listCinema,
    maHeThongRap: state.ShowTimeReducer.maHeThongRap,
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(CinemaShowTime);
