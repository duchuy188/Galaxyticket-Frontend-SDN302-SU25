import DetailMovie from "../containers/home/DetailMoviePage";
import HomePage from "../containers/home/HomePage";
import HistoryBookTickets from "../components/HistoryBookTickets";
import DetailTicketRoom from "../components/DetailTicketRoom";
import Admin from "../containers/admin";
import AddFilm from "../components/AddFilmManage";
import DetailFilmManage from "../components/DetailFilmManage";
import CreateShowTimeManage from "../components/CreateShowTimeManage";
import AddUser from "../components/AddUserManage";
import DetailUserManage from "../components/DetailUserManage";

import ShowChart from "../components/Chart/showChart";

import PayPal from "../components/PayPal";
const routesHome = [
  {
    exact: true,
    path: "/",
    component: HomePage
  },

  {
    exact: false,
    path: "/detailMovie/:id",
    component: DetailMovie,
  },
  {
    exact: false,
    path: "/detail-ticketRoom",
    component: DetailTicketRoom,
  },
  {
    exact: false,
    path: "/history",
    component: HistoryBookTickets,
  },
  {
    exact: false,
    path: "/paypal",
    component: PayPal,
  },


]

const routesAdmin = [
  {
    exact: true,
    path: "/admin",
    component: Admin
  },
  {
    exact: false,
    path: "/addFilm",
    component: AddFilm,
  },
  {
    exact: false,
    path: "/detailFilm",
    component: DetailFilmManage,
  },
  {
    exact: false,
    path: "/createShowtime/:id",
    component: CreateShowTimeManage,
  },

  {
    exact: false,
    path: "/addUser",
    component: AddUser,
  },
  {
    exact: false,
    path: "/detailUser/:id",
    component: DetailUserManage,
  },

  {
    exact: false,
    path: "/chart",
    component: ShowChart,
  },
]
export { routesHome, routesAdmin }