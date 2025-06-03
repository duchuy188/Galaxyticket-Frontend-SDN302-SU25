import { BOOK_TICKET_REQUEST, BOOK_TICKET_SUCCESS, BOOK_TICKET_FAILED } from "./constant";
let initState = {
  loading: false,
  gheDat: {},
  err: null,
}
const BookTicketsReducer = (state = initState, action) => {
  switch (action.type) {
    case BOOK_TICKET_SUCCESS:
      state.gheDat = action.data;
      state.loading = false;
      state.err = null;
      return { ...state };
    case BOOK_TICKET_FAILED:
      state.gheDat = {};
      state.loading = false;
      state.err = action.err;
      return { ...state };
    case BOOK_TICKET_REQUEST:
      state.gheDat = {};
      state.loading = true;
      state.err = null;
      return { ...state };
    default:
      return { ...state };
  }

}
export default BookTicketsReducer;