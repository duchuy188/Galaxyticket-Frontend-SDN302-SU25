import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { actFetchLogin } from "./modules/action";
import { connect } from "react-redux";
function AuthHome(props) {
  const [coor, setCoor] = useState({
    x: 0, y: 0,
  });
  const [login, setLogin] = useState({
    username: "", password: "",
  })
  const handleFocusPassword = (event) => {
    document.getElementById("formm").classList.add("up");
  }
  const handleBlurPassWord = (event) => {
    document.getElementById("formm").classList.remove("up");
  }
  const handleOnMouseMove = (event) => {
    var dw = window.screen.width / 15;
    var dh = window.screen.height / 15;
    setCoor({
      x: event.pageX / dw,
      y: event.pageY / dh,
    })
    for (var i = 0; i < 2; i++) {
      document.getElementsByClassName("eye-ball")[i].style.width = `${coor.x}px`;
      document.getElementsByClassName("eye-ball")[i].style.height = `${coor.y}px`;
    }
  }
  const handleLogin = (event) => {
    event.preventDefault();
    // let local = JSON.parse(localStorage.getItem("userHome"));
    // console.log(local);
    if (localStorage.getItem("userHome") === null) {
      // debugger
      document.getElementById("formm").classList.add("wrong-entry");
      // setTimeout(function () {
      //   document.getElementById("formm").classList.remove('wrong-entry');
      // }, 3000);
    }

    const user = {
      taiKhoan: login.username,
      matKhau: login.password,
    }
    props.fetchLogin(user, props.history);
  }
  let handleOnChange = (event) => {
    const { name, value } = event.target;
    setLogin({
      ...login,
      [name]: value,
    }
    )
  }
  useEffect(() => {
  }, [coor.x]);


  return (
    <div onMouseMove={handleOnMouseMove} className="text-center fox-movie" >
      <div className="fox">
        <div className="ear" />
        <div className="face">
          <div className="eye-shade" />
          <div className="eye-white">
            <div className="eye-ball" />
          </div>
          <div className="eye-shade rgt" />
          <div className="eye-white rgt">
            <div className="eye-ball" />
          </div>
          <div className="nose" />
          <div className="mouth" />
        </div>
        <div className="body"> </div>
        <div className="foot">
          <div className="finger" />
        </div>
        <div className="foot rgt">
          <div className="finger" />
        </div>
      </div>
      <form id="formm" onSubmit={handleLogin}>
        <div className="hand" />
        <div className="hand rgt" />
        <h1>Movie Login</h1>
        <div className="form-group">
          <input className="form-control" onChange={handleOnChange} name="username" value={login.username} />
          <label className="form-label">Username  </label>
        </div>
        <div className="form-group">
          <input id="password" type="password" className="form-control" name="password" value={login.password} onFocus={handleFocusPassword} onBlur={handleBlurPassWord} onChange={handleOnChange} />
          <label className="form-label">Password</label>
          <p className="alert">Không đúng rồi :(</p>
          <button className="btn" type="submit">Login </button> <br />
          <p style={{ color: "white", marginTop: "100px" }}>
            Bạn chưa có tài khoản?<Link to="/sign-up" className="backHome"><i style={{ color: "#ec7532", textDecoration: "none" }}>Đăng kí ngay</i></Link>
          </p>
          <button className="back" >
            <Link to="/" className="backHome">Quay về trang chủ</Link>
          </button>
        </div>
      </form>


    </div>

  )

}

const mapStateToProps = state => {
  return {
    loading: state.authReducer.loading,
    errUser: state.authReducer.err
  }
}
const mapDispatchToProps = dispatch => {
  return {
    fetchLogin: (user, history) => {
      dispatch(actFetchLogin(user, history))
    }
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(AuthHome);


