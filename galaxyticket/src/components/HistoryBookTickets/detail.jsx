import React from 'react'

export default function DetaiilInfo(props) {
  let { list, key, stt } = props;
  return (
    <div>
      <tr key={key} className="row">
        <td className="col">{stt + 1}</td>
        <td className="col-2">{list.idTicket}</td>
        <td className="col-2">{list.infoUser}</td>
        <td className="col-2">{list.tenPhim}</td>
        <td className="col-2">{list.tenCumRap}</td>
        <td className="col-2">{list.dateBookTickets}</td>
        <td className="col">{list.pricee}</td>
      </tr>
      <hr />
    </div>
  )
}
