import Axios from "axios";

import {
  FETCH_LISTLOGO_SHOWTIME_SUCCESS, FETCH_LISTCINEMA_SHOWTIME_SUCCESS, FETCH_MAHETHONGRAP_LOGOSHOWTIME,
  FETCH_MACUMRAP_SHOWTIME, FETCH_LISTFILM_SHOWTIME, FETCH_MALICHCHIEU_FILM_SHOWTIME, FETCH_INFO_DETAILFILM_FAILED, FETCH_INFO_DETAILFILM_SUCCESS, FETCH_INFO_DETAILFILM_REQUEST
} from "./constants";

export const actFetchListLogoShowTime = () => {
  return (dispatch) => {
    Axios({
      url: "https://movie0706.cybersoft.edu.vn/api/QuanLyRap/LayThongTinHeThongRap",
      method: "GET",
    })
      .then(result => {
        dispatch(fetchListLogoShowTimeSuccess(result.data));
      })
      .catch(error => {
        console.log(error);
      })
  }
}

export const actFetchListCinemaShowTime = (maheThong) => {
  return (dispatch) => {
    Axios({
      url: `https://movie0706.cybersoft.edu.vn/api/QuanLyRap/LayThongTinCumRapTheoHeThong?maHeThongRap=${maheThong}`,
      method: "GET",
    })
      .then(result => {
        dispatch(fetchListCinemaShowTimeSuccess(result.data));
      })
      .catch(error => {
        console.log(error);
      })
  }
}

export const actFetchListFilmShowTime = (maHT) => {
  return (dispatch) => {
    Axios({
      url: `https://movie0706.cybersoft.edu.vn/api/QuanLyRap/LayThongTinLichChieuHeThongRap?maHeThongRap=${maHT}&maNhom=GP05`,
      method: "GET",
    })
      .then(result => {
        dispatch(fetchListFilmShowTimeSuccess(result.data));
      })
      .catch(error => {
        console.log(error);
      })
  }
}

export const actFetchInfoDetailMovie = (maPhim) => {
  return (dispatch) => {
    dispatch(fetchInfoDetailFilmRequest())
    Axios({
      url: `https://movie0706.cybersoft.edu.vn/api/QuanLyPhim/LayThongTinPhim?MaPhim=${maPhim}`,
      method: "GET",
    })
      .then(result => {
        // debugger
        function compare(a, b) {
          if (a.maRap < b.maRap) {
            return -1;
          }
          if (a.maRap > b.maRap) {
            return 1;
          }
          return 0;
        }
        result.data.lichChieu.sort(compare)
        let key = {
          tenPhim: result.data.tenPhim,
          ngayKhoiChieu: result.data.ngayKhoiChieu,
          moTa: result.data.moTa,
          trailer: result.data.trailer,
          hinhAnh: result.data.hinhAnh,
          danhGia: result.data.danhGia,
          biDanh: result.data.biDanh,
          lichChieu: [result.data.lichChieu[0]],
        };
        key.lichChieu.map(item => item.arrTime = [{ maLichChieu: item.maLichChieu, ngayChieuGioChieu: item.ngayChieuGioChieu }])
        result.data.lichChieu.forEach((item, index) => {
          if (item.maRap === key.lichChieu[key.lichChieu.length - 1].maRap && Date.parse(item.ngayChieuGioChieu) !== Date.parse(key.lichChieu[key.lichChieu.length - 1].ngayChieuGioChieu)) {
            if (key.lichChieu[key.lichChieu.length - 1].arrTime.length === 0) {

              key.lichChieu[key.lichChieu.length - 1].arrTime = [{ maLichChieu: key.lichChieu[key.lichChieu.length - 1].maLichChieu, ngayChieuGioChieu: key.lichChieu[key.lichChieu.length - 1].ngayChieuGioChieu }, { mlichChieu: item.maLichChieu, ngayChieuGioChieu: item.ngayChieuGioChieu }]
            } else {
              key.lichChieu[key.lichChieu.length - 1].arrTime = [...key.lichChieu[key.lichChieu.length - 1].arrTime, { maLichChieu: item.maLichChieu, ngayChieuGioChieu: item.ngayChieuGioChieu }]
            }
          } else {
            if (item.maRap !== key.lichChieu[key.lichChieu.length - 1].maRap) {
              let indexxx = key.lichChieu.findIndex(i => i.maRap === item.maRap);

              if (indexxx === -1) {
                key.lichChieu.push({
                  ...item, arrTime: [{ maLichChieu: item.maLichChieu, ngayChieuGioChieu: item.ngayChieuGioChieu }]
                });

              } else {
                let indexxx1 = key.lichChieu.findIndex(i => i.maRap === item.maRap);
                if (item.maRap === key.lichChieu[indexxx1].maRap && Date.parse(item.ngayChieuGioChieu) !== Date.parse(key.lichChieu[indexxx1].ngayChieuGioChieu)) {
                  if (key.lichChieu[indexxx1].arrTime.length === 0) {
                    key.lichChieu[indexxx1].arrTime = [{ maLichChieu: item.maLichChieu, ngayChieuGioChieu: item.ngayChieuGioChieu }, { maLichChieu: key.lichChieu[indexxx1].maLichChieu, ngayChieuGioChieu: key.lichChieu[indexxx1].ngayChieuGioChieu }]

                  } else {
                    key.lichChieu[indexxx1].arrTime = [...key.lichChieu[indexxx1].arrTime, { maLichChieu: item.maLichChieu, ngayChieuGioChieu: item.ngayChieuGioChieu }]
                  }
                }
              }
            }

          }
        })
        // console.log(result.data);
        // console.log(key);
        dispatch(fetchInfoDetailFilmSuccess(key))
      })
      .catch(error => {
        dispatch(fetchInfoDetailFilmFailed(error))
      })
  }
}

const fetchInfoDetailFilmSuccess = (data) => {
  return {
    type: FETCH_INFO_DETAILFILM_SUCCESS,
    data,
  }
}
const fetchInfoDetailFilmFailed = (error) => {
  return {
    type: FETCH_INFO_DETAILFILM_FAILED,
    error,
  }
}
const fetchInfoDetailFilmRequest = () => {
  return {
    type: FETCH_INFO_DETAILFILM_REQUEST,
  }
}

export const actFetchMaHeThongShowTime = (maHT) => {
  return {
    type: FETCH_MAHETHONGRAP_LOGOSHOWTIME,
    maHT,
  }
}

export const actFetchMaCumRapShowTime = (maCR) => {
  return {
    type: FETCH_MACUMRAP_SHOWTIME,
    maCR,
  }
}

export const actFetchMaLichChieuFilmShowTime = (maLC) => {
  return {
    type: FETCH_MALICHCHIEU_FILM_SHOWTIME,
    maLC,
  }
}
const fetchListLogoShowTimeSuccess = (data) => {
  return {
    type: FETCH_LISTLOGO_SHOWTIME_SUCCESS,
    data,
  }
}

const fetchListCinemaShowTimeSuccess = (data) => {
  return {
    type: FETCH_LISTCINEMA_SHOWTIME_SUCCESS,
    data,
  }
}
const fetchListFilmShowTimeSuccess = (data) => {
  return {
    type: FETCH_LISTFILM_SHOWTIME,
    data,
  }
}