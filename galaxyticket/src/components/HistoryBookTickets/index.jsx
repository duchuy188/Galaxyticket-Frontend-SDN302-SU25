import React from 'react';
import DetaiilInfo from './detail';
export default function HistoryBookTickets() {
  let renderTable = () => {
    if (localStorage.getItem("historyBookTicket")) {
      let infoTemp = JSON.parse(localStorage.getItem("historyBookTicket"));
      let infoUser = JSON.parse(localStorage.getItem("userHome"));
      let infoBookTicketsAll = infoTemp.filter((item) => {
        return infoUser.taiKhoan === item.infoUsernameUser;
      })
      return infoBookTicketsAll.map((item, index) => {
        return <DetaiilInfo key={index} list={item} stt={index} />
      })
    }
  }
  return (
    <div>
      <h1 className="text-center mb-5">Lịch sử đặt vé</h1>
      <div className=" container">

        <table className="w-100 mx-auto  ">
          <thead>
            <tr className="row py-3 mb-3" style={{ background: "rgb(122 110 103 / 61%)", color: "black" }}>
              <th className="col" >STT</th>
              <th className="col-2" >Mã Vé Đặt</th>
              <th className="col-2" >Tài Khoản</th>
              <th className="col-2" >Tên Phim</th>
              <th className="col-2" >Tên Cụm Rạp</th>
              <th className="col-2" >Ngày Đặt</th>
              <th className="col" >Tổng Tiền</th>
            </tr>
          </thead>
          <tbody>
            {renderTable()}
          </tbody>
        </table>

      </div>




    </div >
  )
}
