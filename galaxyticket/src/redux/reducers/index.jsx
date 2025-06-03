import { combineReducers } from "redux";
import { MovieReducer } from "../../components/ListMovie/module/reducer";
import { ShowTimeReducer } from "../../components/ShowTimes/module/reducer";
import { AdminReducer } from "../../containers/admin/module/reducer";
import authReducer from "../../components/Auth/modules/reducer";
import roomTicketReducer from "../../components/DetailTicketRoom/modules/reducer";
import bookGhe from "../../components/Seat/modules/reducer";
import PriceReducer from "../../components/HistoryManage/reducer";

const rootReducers = combineReducers({
      MovieReducer,
      ShowTimeReducer,
      AdminReducer,
      authReducer,
      roomTicketReducer,
      bookGhe,
      PriceReducer,
});
export { rootReducers };


