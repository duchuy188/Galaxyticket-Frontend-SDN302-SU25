import React, { useState } from "react";

export default function Comment(props) {
  const [like, setLike] = useState(false);
  const handleLike = () => {
    setLike(!like);
  };
  return (
    <div className="myVote">
      <div className="row">
        <div className="col-9">
          <p>
            <img src="../images/userCatLovely.png" alt="imageFilm" />
            <span className="pl-1 user">{props.cmt.user}</span>
          </p>
          <p className="py-2 pl-5">{props.cmt.comment}</p>
        </div>
        <div className="col-3">
          <p className="text-center score">{props.cmt.rating}</p>
          <div className="row justify-content-center star">
            <i className="fa fa-star" />
            <i className="fa fa-star d-none d-md-block" />
            <i className="fa fa-star d-none d-md-block" />
            <i className="fa fa-star d-none d-md-block" />
            <i className="fa fa-star d-none d-md-block" />
          </div>
        </div>
      </div>
      <div className="pl-3 border-top py-2" onClick={handleLike}>
        <i
          className="far fa-thumbs-up like"
          style={{ color: like ? "red" : "#495057" }}
        />
        <span>{like ? "  1 Thích" : "  0 Thích"}</span>
      </div>
    </div>
  );
}
