
let initState = {
  bookGhe: {},
  arrSeatVip: [],
  price: 0,
  check: false,
}
const bookGheReducer = (state = initState, action) => {
  switch (action.type) {
    case "BOOKGHE":
      state.bookGhe = action.data;
      return { ...state };
    case "BOOKGHEVIP":
      state.arrSeatVip = action.data.danhSachVe;
      return { ...state };
    case "PRICESEAT":
      state.price = action.data;
      return { ...state };
    // case "SET_NULL_SEAT":
    //   state.bookGhe = {};
    //   state.price = 0;
    //   return { ...state };
    default:
      return { ...state };
  }
}
export default bookGheReducer;