import { FETCH_LISTMOVIE_DANGCHIEU_SUCCESS, FETCH_LISTMOVIE_SAPCHIEU_SUCCESS } from "./constants";
let initialState = {
  listMovie: [],
  listMovieSapChieu: [],

}

export const MovieReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_LISTMOVIE_DANGCHIEU_SUCCESS:
      state.listMovie = action.data;
      return { ...state };
    case FETCH_LISTMOVIE_SAPCHIEU_SUCCESS:
      state.listMovieSapChieu = action.data;
      return { ...state };
    default:
      return { ...state };
  }
}