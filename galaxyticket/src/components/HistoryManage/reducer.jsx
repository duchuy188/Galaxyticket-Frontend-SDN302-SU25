let initState = {
  price: 0
}

const PriceReducer = (state = initState, action) => {
  switch (action.type) {
    case "PRICEBOOKTICKETS":
      state.price = action.data;
      return { ...state };

    default:
      return { ...state };
  }

}
export default PriceReducer;