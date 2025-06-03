import Axios from "axios";
import { BOOK_TICKET_REQUEST, BOOK_TICKET_SUCCESS, BOOK_TICKET_FAILED } from "./constant";

const actFetchBookTickets = (info) => {
  let token = "";
  if (localStorage.getItem("userHome")) {
    token = JSON.parse(localStorage.getItem("userHome")).accessToken;
  }
  return dispatch => {
    dispatch(actBookTicketsReQuest());
    Axios({
      url: "https://movie0706.cybersoft.edu.vn/api/QuanLyDatVe/DatVe",
      method: "POST",
      data: info,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(result => {
        dispatch(actBOOKTicketsSuccess(result.data));
      })
      .catch(err => {
        dispatch(actBookTicketsFailed(err))
      })
  }
}
const actBookTicketsReQuest = () => {
  return {
    type: BOOK_TICKET_REQUEST,
  }
}
const actBOOKTicketsSuccess = (data) => {
  return {
    type: BOOK_TICKET_SUCCESS,
    data,
  }
}
const actBookTicketsFailed = (err) => {
  return {
    type: BOOK_TICKET_FAILED,
    err,
  }
}
export { actFetchBookTickets };
