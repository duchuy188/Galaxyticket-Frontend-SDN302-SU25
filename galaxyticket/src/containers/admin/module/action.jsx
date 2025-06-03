import Axios from "axios";
import {
  FETCH_LISTFILM_MANAGE, FETCH_ADDFILM_MANAGE, FETCH_DELETEFILM_MANAGE, FETCH_DETAILFILM_MANAGE_SUCCESS, FETCH_DETAILFILM_MANAGE_FAILED, FETCH_DETAILFILM_MANAGE_REQUEST,
  FETCH_EDITFILM_MANAGE_SUCCESS, FETCH_HETHONGRAP_CREATE_SHOWTIME_MANAGE, FETCH_LIST_LICHCHIEU_CREATE_SHOWTIME_MANAGE
} from "./constant";
import Swal from 'sweetalert2';


export const actFetchListFilmManage = () => {
  return (dispatch) => {
    Axios({
      url: "https://movie0706.cybersoft.edu.vn/api/QuanLyPhim/LayDanhSachPhim?maNhom=GP05",
      method: "GET",
    })
      .then(result => {
        result.data.forEach((item, index) => {
          item.index = index + 1;
        })
        dispatch(fetchListFilmManage(result.data))
      })
      .catch(error => {
        console.log(error.response.data);
      })
  }
}

export const actFetchAddFilmManage = (film) => {

  return (dispatch) => (
    Axios({
      url: "https://movie0706.cybersoft.edu.vn/api/QuanLyPhim/ThemPhimUploadHinh",
      method: "POST",
      data: film,
    })
      .then(result => {
        dispatch(fetchAddFilmManage(result.data));
      })
      .catch(error => {
        Swal.fire({
          icon: 'error',
          title: `${error.response.data}`,
        })
      })
  )
}

export const actFetchDeleteFilmManage = (maPhim) => {
  let token = "";
  if (localStorage.getItem("userAdmin")) {
    token = JSON.parse(localStorage.getItem("userAdmin")).accessToken;
  }
  return (dispatch) => (
    Axios({
      url: `https://movie0706.cybersoft.edu.vn/api/QuanLyPhim/XoaPhim?MaPhim=${maPhim}`,
      method: "DELETE",
      data: maPhim,
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
      .then(result => {
        dispatch(fetchDeleteFilmMange(result.data));
      })
      .catch(error => {
        Swal.fire({
          icon: 'error',
          title: `${error.response.data}`,
        })
      })
  )
}

// cập nhật phim
export const actFetchEditFilmManage = (phim) => {
  let token = "";
  if (localStorage.getItem("userAdmin")) {
    token = JSON.parse(localStorage.getItem("userAdmin")).accessToken;
  }
  return (dispatch) => {
    Axios({
      url: "https://movie0706.cybersoft.edu.vn/api/QuanLyPhim/CapNhatPhimUpload",
      method: "POST",
      data: phim,
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
      .then(result => {
        dispatch(fetchEditFilmManageSuccess(result.data));
      })
      .catch(error => {
        Swal.fire({
          icon: 'error',
          title: `${error.response.data}`,
        })
      })
  }
}

// list user
export const actFetchListUserManage = () => {
  return (dispatch) => {
    Axios({
      url: "https://movie0706.cybersoft.edu.vn/api/QuanLyNguoiDung/LayDanhSachNguoiDung?MaNhom=GP05",
      menthod: "GET",
    })
      .then(result => {
        result.data.forEach((item, index) => {
          item.index = index + 1;
        })
        dispatch(fetchListUserManage(result.data))
      })
      .catch(error => {
        console.log(error);
      })
  }
}

const fetchListUserManage = (data) => {
  return {
    type: "FETCH_LIST_USER_MANAGE",
    data,
  }
}
const fetchEditFilmManageSuccess = (phim) => {
  return {
    type: FETCH_EDITFILM_MANAGE_SUCCESS,
    data: phim,
  }
}


// Chi tiết Phim
export const actFetchDetailFilmManage = (maPhim) => {
  return (dispatch) => {
    dispatch(fetchDetailFilmManageRequest());
    Axios({
      url: `https://movie0706.cybersoft.edu.vn/api/QuanLyPhim/LayThongTinPhim?MaPhim=${maPhim}`,
      method: "GET"
    })
      .then(result => {
        dispatch(fetchDetailFilmManageSuccess(result.data));
      })
      .catch(error => {
        dispatch(fetchDetailFilmManageFailed(error));
      })
  }
}

//  lấy thông tin hệ thống rạp
export const actFetchHeThongRapCreateShowTimeManage = () => {
  return (dispatch) => {
    Axios({
      url: "https://movie0706.cybersoft.edu.vn/api/QuanLyRap/LayThongTinHeThongRap",
      method: "GET",
    })
      .then(result => {
        dispatch(fetchHeThongRapCreateShowTimeManage(result.data))
      })
      .catch(error => {
        console.log(error);
      })
  }
}

//lấy danh sách lịch chiếu theo mã phim
export const actFetchListLichChieuCreateShowTimeManage = (maPhim) => {
  return (dispatch) => {
    Axios({
      url: `https://movie0706.cybersoft.edu.vn/api/QuanLyRap/LayThongTinLichChieuPhim?MaPhim=${maPhim}`,
      method: "GET",
    })
      .then(result => {
        dispatch(fetchListLichChieuCreateShowTimeManage(result.data.heThongRapChieu))
        // debugger
      })
      .catch(error => {
        // debugger
        console.log(error);
      })
  }
}

const fetchListLichChieuCreateShowTimeManage = (data) => {
  return {
    type: FETCH_LIST_LICHCHIEU_CREATE_SHOWTIME_MANAGE,
    data,
  }
}

const fetchHeThongRapCreateShowTimeManage = (data) => {
  return {
    type: FETCH_HETHONGRAP_CREATE_SHOWTIME_MANAGE,
    data,
  }
}

const fetchDetailFilmManageSuccess = (maPhim) => {
  return {
    type: FETCH_DETAILFILM_MANAGE_SUCCESS,
    data: maPhim,
  }
}
const fetchDetailFilmManageFailed = (error) => {
  return {
    type: FETCH_DETAILFILM_MANAGE_FAILED,
    error,
  }
}
const fetchDetailFilmManageRequest = () => {
  return {
    type: FETCH_DETAILFILM_MANAGE_REQUEST,

  }
}


const fetchDeleteFilmMange = (data) => {
  return {
    type: FETCH_DELETEFILM_MANAGE,
    data,
  }
}
const fetchListFilmManage = (data) => {
  return {
    type: FETCH_LISTFILM_MANAGE,
    data,
  }
}

const fetchAddFilmManage = (data) => {
  return {
    type: FETCH_ADDFILM_MANAGE,
    data,
  }
}