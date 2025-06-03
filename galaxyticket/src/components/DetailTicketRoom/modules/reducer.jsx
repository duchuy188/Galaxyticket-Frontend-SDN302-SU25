import { ROOM_TICKET_REQUEST, ROOM_TICKET_SUCCESS, ROOM_TICKET_FAILED } from "./constant";
let initState = {
  loading: false,
  seat: {},
  err: null,
  infoBookTickets: [],
}
const roomTicketReducer = (state = initState, action) => {
  switch (action.type) {
    case ROOM_TICKET_SUCCESS:
      state.seat = action.data;
      state.loading = false;
      state.err = null;
      return { ...state };
    case ROOM_TICKET_FAILED:
      state.seat = {};
      state.loading = false;
      state.err = action.err;
      return { ...state };
    case ROOM_TICKET_REQUEST:
      state.seat = {};
      state.loading = true;
      state.err = null;
      return { ...state };
    case "INFO_BOOK_TICKETS":
      state.infoBookTickets.push(action.data);
      return { ...state };



    default:
      return { ...state };
  }

}
export default roomTicketReducer;