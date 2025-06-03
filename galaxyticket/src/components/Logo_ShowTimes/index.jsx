import React from 'react'
import { connect } from 'react-redux';
import { actFetchMaHeThongShowTime } from "../ShowTimes/module/action";
import { LazyLoadImage } from 'react-lazy-load-image-component';

function LogoShowTimes(props) {




  // console.log(b);
  return (
    <div>
      <a className={props.Index === 0 ? "nav-link show active" : "nav-link show"} onClick={() => { props.handleClickLogo(props.Logo.maHeThongRap) }} id={`v-pills-${props.Logo.maHeThongRap}-tab`} data-toggle="pill" href={`#v-pills-${props.Logo.maHeThongRap}`} role="tab" aria-controls={`v-pills-${props.Logo.maHeThongRap}`} aria-selected="true" >
        <div className="border-bottom logoRap__item">
          <LazyLoadImage src={props.Logo.logo} alt="rapbhd" className="img-fluid" />
        </div>
      </a>
    </div>
  )
}
const mapDispatchToProps = (dispatch) => {
  return {
    handleClickLogo: (maHT) => {
      dispatch(actFetchMaHeThongShowTime(maHT));
    }
  }
}


export default connect(null, mapDispatchToProps)(LogoShowTimes);
