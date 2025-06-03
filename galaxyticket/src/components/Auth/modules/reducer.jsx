import { AUTH_REQUEST, AUTH_SUCCESS, AUTH_FAILED } from "./constant";
let initialState = {
  loading: false,
  user: {},
  err: null,
}

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case AUTH_REQUEST:
      state.loading = true;
      state.user = {};
      state.err = null;
      return { ...state };
    case AUTH_SUCCESS:
      // console.log(action.data);
      // debugger
      state.loading = false;
      state.user = action.data;
      state.err = null;
      return { ...state };
    case AUTH_FAILED:
      state.loading = false;
      state.user = {};
      state.err = action.err;
      return { ...state };
    default:
      return { ...state };
  }

}
export default authReducer;