import Axios from "axios";
import { FETCH_LISTMOVIE_DANGCHIEU_SUCCESS, FETCH_LISTMOVIE_SAPCHIEU_SUCCESS } from "./constants";

export const actFetchListMovieDangChieu = () => {
  return (dispatch) => {
    Axios({
      url: "https://movie0706.cybersoft.edu.vn/api/QuanLyPhim/LayDanhSachPhim?maNhom=GP05",
      menthod: "GET",
    })
      .then(result => {
        dispatch(fetchListMovieDangChieuSuccess(result.data));
      })
      .catch(error => {
        console.log(error);
      });
  }
}

export const actFetchListMovieSapChieu = () => {
  return (dispatch) => {
    Axios({
      url: "https://movie0706.cybersoft.edu.vn/api/QuanLyPhim/LayDanhSachPhim?maNhom=GP10",
      menthod: "GET",
    })
      .then(result => {
        dispatch(fetchListMovieSapChieuSuccess(result.data));
      })
      .catch(error => {
        console.log(error);
      });
  }
}


const fetchListMovieDangChieuSuccess = (data) => {
  return {
    type: FETCH_LISTMOVIE_DANGCHIEU_SUCCESS,
    data,
  }
}

const fetchListMovieSapChieuSuccess = (data) => {
  return {
    type: FETCH_LISTMOVIE_SAPCHIEU_SUCCESS,
    data,
  }
}



