import Axios from "axios";
import { ROOM_TICKET_REQUEST, ROOM_TICKET_SUCCESS, ROOM_TICKET_FAILED } from "./constant";

const actFetchDetailRoomTicket = (id) => {
  return dispatch => {
    dispatch(actDetailRoomTicketReQuest());
    Axios({
      url: `https://movie0706.cybersoft.edu.vn/api/QuanLyDatVe/LayDanhSachPhongVe?MaLichChieu=${id}`,
      method: "GET"
    })
      .then(result => {
        result.data.danhSachGhe.forEach((item) => {
          item.check = false
        })
        dispatch(actDetailRoomTicketSuccess(result.data));
      })
      .catch(err => {
        dispatch(actDetailRoomTicketFailed(err))
      })
  }
}
const actDetailRoomTicketReQuest = () => {
  return {
    type: ROOM_TICKET_REQUEST,
  }
}
const actDetailRoomTicketSuccess = (data) => {
  return {
    type: ROOM_TICKET_SUCCESS,
    data,
  }
}
const actDetailRoomTicketFailed = (err) => {
  return {
    type: ROOM_TICKET_FAILED,
    err,
  }
}
export { actFetchDetailRoomTicket };
