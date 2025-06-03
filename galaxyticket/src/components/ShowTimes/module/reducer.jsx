import {
  FETCH_LISTLOGO_SHOWTIME_SUCCESS, FETCH_LISTCINEMA_SHOWTIME_SUCCESS, FETCH_MAHETHONGRAP_LOGOSHOWTIME, FETCH_MACUMRAP_SHOWTIME, FETCH_LISTFILM_SHOWTIME,
  FETCH_MALICHCHIEU_FILM_SHOWTIME, FETCH_INFO_DETAILFILM_SUCCESS, FETCH_INFO_DETAILFILM_REQUEST, FETCH_INFO_DETAILFILM_FAILED
} from "./constants";
import DataComment from "../../../containers/home/DetailMoviePage/dataComment.json";
let initialState = {
  listLogo: [],
  listCinema: [],
  listFilm: [],
  maHeThongRap: "BHDStar",
  maCumRap: "",
  maLichChieu: "",

  infoDetailMovie: {},
  loading: false,
  error: null,

  rating: 0,
  listComment: DataComment,
}
export const ShowTimeReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_LISTLOGO_SHOWTIME_SUCCESS:
      state.listLogo = action.data;
      return { ...state };
    case FETCH_LISTCINEMA_SHOWTIME_SUCCESS:
      // console.log(action.data[0].maCumRap);
      state.listCinema = action.data;
      state.maCumRap = action.data[0].maCumRap;
      return { ...state };
    case FETCH_MAHETHONGRAP_LOGOSHOWTIME:
      // console.log(action.maHT);
      state.maHeThongRap = action.maHT;
      return { ...state };
    case FETCH_MACUMRAP_SHOWTIME:
      state.maCumRap = action.maCR;
      return { ...state };
    case FETCH_LISTFILM_SHOWTIME:
      state.listFilm = action.data;
      return { ...state };
    case FETCH_MALICHCHIEU_FILM_SHOWTIME:
      state.maLichChieu = action.maLC;
      return { ...state }

    case FETCH_INFO_DETAILFILM_SUCCESS:
      // console.log(action.data);
      state.infoDetailMovie = action.data;
      state.loading = false;
      state.error = null;
      return { ...state };
    case FETCH_INFO_DETAILFILM_REQUEST:
      state.infoDetailMovie = {};
      state.loading = true;
      state.error = null;
      return { ...state };
    case FETCH_INFO_DETAILFILM_FAILED:
      state.infoDetailMovie = {};
      state.loading = false;
      state.error = action.error;
      return { ...state };

    case "FETCH_RANTING_FILM":
      state.rating = action.value;
      return { ...state };
    case "FECT_COMMENT_FILM":
      if (localStorage.getItem("userHome")) {
        let info = JSON.parse(localStorage.getItem("userHome"));
        state.listComment = [{ user: info.hoTen, comment: action.cmt, rating: state.rating }, ...state.listComment];
      }
      return { ...state };
    default:
      return { ...state };
  }
}