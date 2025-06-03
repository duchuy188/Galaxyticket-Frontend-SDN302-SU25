import {
  FETCH_LISTFILM_MANAGE,
  FETCH_ADDFILM_MANAGE,
  FETCH_DELETEFILM_MANAGE,
  FETCH_DETAILFILM_MANAGE_SUCCESS,
  FETCH_DETAILFILM_MANAGE_REQUEST,
  FETCH_DETAILFILM_MANAGE_FAILED,
  FETCH_EDITFILM_MANAGE_SUCCESS,
  FETCH_HETHONGRAP_CREATE_SHOWTIME_MANAGE,
  FETCH_LIST_LICHCHIEU_CREATE_SHOWTIME_MANAGE,
} from "./constant";
import Swal from "sweetalert2";
// import { useHistory } from "react-router-dom";

let initialState = {
  listFilmManage: [],
  keyDetail: {},

  detailFilmManage: {},
  loadingDetailFilm: false,
  errorDetailFilm: null,

  editInfoFilm: null,

  listHeThongRap: null,
  listLichChieu: null,

  listUser: null,
  editInfoUser: null,
};

export const AdminReducer = (state = initialState, action) => {
  // let history = useHistory();
  switch (action.type) {
    case FETCH_LISTFILM_MANAGE:
      state.listFilmManage = action.data;
      return { ...state };
    case FETCH_ADDFILM_MANAGE:
      // state.listFilmManage = [...state.listFilmManage, action.data];
      Swal.fire("Thêm phim thành công!", "", "success");
      return { ...state };
    // caap nhat edit ve null
    case "FETCH_INFO_EDIT_NULL":
      state.editInfoFilm = null;
      return { ...state };

    case FETCH_DELETEFILM_MANAGE:
      Swal.fire("Xóa phim thành công!", "", "success");
      setTimeout(function () {
        window.location.reload();
      }, 1500);

      return { ...state };

    //load thoong tin phim cap nhat

    case "FETCH_INFO_EDIT_FILMMANAGE":
      let infoEdit = state.listFilmManage.find((item) => {
        return item.maPhim === action.maPhim;
      });
      state.editInfoFilm = infoEdit;
      return { ...state };

    // cập nhật phim
    case FETCH_EDITFILM_MANAGE_SUCCESS:
      // console.log(action.data);
      // state.editFilmManage = action.data;
      Swal.fire("Cập nhật phim thành công!", "", "success");
      return { ...state };

    //chi tiết phim
    case FETCH_DETAILFILM_MANAGE_SUCCESS:
      state.detailFilmManage = action.data;
      state.loadingDetailFilm = false;
      state.errorDetailFilm = null;
      return { ...state };
    case FETCH_DETAILFILM_MANAGE_FAILED:
      state.detailFilmManage = [];
      state.loadingDetailFilm = false;
      state.errorDetailFilm = action.error;
      return { ...state };
    case FETCH_DETAILFILM_MANAGE_REQUEST:
      state.detailFilmManage = [];
      state.loadingDetailFilm = true;
      state.errorDetailFilm = null;
      return { ...state };

    // lấy danh sách hệ thống rạp
    case FETCH_HETHONGRAP_CREATE_SHOWTIME_MANAGE:
      state.listHeThongRap = action.data;
      return { ...state };

    // lấy danh sách lịch chiếu theo mã phim
    case FETCH_LIST_LICHCHIEU_CREATE_SHOWTIME_MANAGE:
      state.listLichChieu = action.data;
      return { ...state };

    case "FETCH_EDIT_USER_MANAGE":
      let infoEditUser = state.listUser.find((item) => {
        return item.taiKhoan === action.taiKhoan;
      });
      state.editInfoUser = infoEditUser;
      return { ...state };
    case "FETCH_EDIT_NULL_USER_MANAGE":
      state.editInfoUser = null;
      return { ...state };
    case "FETCH_LIST_USER_MANAGE":
      state.listUser = action.data;
      return { ...state };
    default:
      return { ...state };
  }
};
