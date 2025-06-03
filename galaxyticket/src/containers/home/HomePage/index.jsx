import React from "react";
// import CarouselHomePage from "../../../components/Carousel";
import Loading from "../../../components/Loading/loading";

const loading = () => {
  return (
    <div>
      {" "}
      <Loading />
    </div>
  );
};
const CarouselHP = React.lazy(() => import("../../../components/Carousel"));
const ListMoviee = React.lazy(() => import("../../../components/ListMovie"));
const ST = React.lazy(() => import("../../../components/ShowTimes"));
const New = React.lazy(() => import("../../../components/News"));
const Footerr = React.lazy(() => import("../../../components/Footer"));

export default function HomePage() {
  const handleBackToTop = () => {
    window.scroll({ top: 0, left: 0, behavior: "smooth" });
  };
  return (
    <div className="home">
      {/* <CarouselHomePage /> */}
      <React.Suspense fallback={loading()}>
        <CarouselHP />
        <ListMoviee />
        <ST />
        <New />
        <Footerr />
      </React.Suspense>

      <span onClick={handleBackToTop} id="backtotop" className="backtotop">
        <i className="fa fa-angle-up"></i>
      </span>
    </div>
  );
}
