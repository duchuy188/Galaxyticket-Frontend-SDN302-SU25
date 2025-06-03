import Axios from "axios";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
// import { actFetchSignUp } from "./modules/action";
function SignUp(props) {
  // const history = useHistory();
  const navigate = useNavigate();
  const [signUp, setSignUp] = useState({
    taiKhoan: "",
    matKhau: "",
    email: "",
    soDt: "",
    hoTen: "",
    maNhom: "GP05",
    maLoaiNguoiDung: "KhachHang",
  });
  const [signUpError, setSignUpError] = useState({
    taiKhoan: "",
    matKhau: "",
    email: "",
    soDt: "",
    hoTen: "",
  });
  const [kt, setKt] = useState({
    check: "",
  });
  const actFetchSignUp = (info) => {
    return Axios({
      url: "https://movie0706.cybersoft.edu.vn/api/QuanLyNguoiDung/DangKy",
      method: "POST",
      data: info,
    })
      .then((result) => {
        Swal.fire("Đăng kí thành công!", "", "success");
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: `${error.response.data}`,
        });
      });
  };

  let handleChange = (event) => {
    let { name, value } = event.target;
    if (name == "check") {
      setKt({
        [name]: value,
      });
    } else {
      setSignUp({
        ...signUp,
        [name]: value,
      });
    }
  };
  let handleBlur = (event) => {
    const { name, value } = event.target;
    const errormessage = validate(name, value);
    setSignUpError(() => {
      return {
        ...signUpError,
        [name]: errormessage,
      };
    });
    // setSignUpError({
    //   ...signUpError,
    //   [name]: errormessage
    // })
  };
  let validate = (name, value) => {
    let errormessage = "";
    if (name === "taiKhoan")
      errormessage = !value ? "Tài khoản không để bỏ trống" : "";
    if (name === "matKhau")
      errormessage = !value ? "Mật khẩu không được để trống" : "";
    if (name === "email") {
      if (!value) {
        errormessage = "Email không để bỏ trống";
      } else {
        const isValid =
          /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(
            value
          );
        errormessage = !isValid ? "Email không hợp lệ" : "";
      }
    }
    if (name === "hoTen") {
      if (!isNaN(value)) errormessage = "Họ tên không được chứa kí tự số";
      else errormessage = !value ? "Họ tên không để bỏ trống" : "";
    }
    if (name === "soDt") {
      errormessage = !value ? "Số điện thoại không để bỏ trống" : "";
    }
    return errormessage;
  };

  let obj = {};
  let handleSubmit = (event) => {
    event.preventDefault();
    let k = true;
    for (let i in signUp) {
      let errormessage = validate(i, signUp[i]);
      if (errormessage) {
        k = false;
      }
      obj = { ...obj, [i]: errormessage };
      if (k) {
        // history.push("/");
        navigate("/");
      }
    }
    setSignUpError(obj);
    if (!k) {
      return;
    } else if (signUp.matKhau !== kt.check) {
      Swal.fire({
        icon: "error",
        title: "Mật khẩu xác nhận không chính xác",
      });
    } else {
      {
        actFetchSignUp(signUp);
      }
    }
  };
  return (
    <div>
      <section className="formDangKi">
        {console.log(signUpError)}
        <form className="formSignUp">
          <h3 className="text-center formSignUp__title mb-5">
            Đăng Kí Tài Khoản
          </h3>
          <div className="forceColor" />
          <div className="topbar">
            <div className="spanColor" />
            <input
              name="taiKhoan"
              value={signUp.taiKhoan}
              type="text"
              className="input"
              placeholder="Tài Khoản"
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {signUpError.taiKhoan && (
              <div className="alert alert-danger">
                <span>{signUpError.taiKhoan}</span>
              </div>
            )}

            <input
              name="matKhau"
              value={signUp.matKhau}
              type="password"
              className="input"
              placeholder="Mật khẩu"
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {signUpError.matKhau && (
              <div className="alert alert-danger">
                <span>{signUpError.matKhau}</span>
              </div>
            )}

            <input
              name="check"
              type="password"
              className="input"
              placeholder="Nhập lại mật khẩu"
              onChange={handleChange}
              onBlur={handleBlur}
            />

            <input
              name="email"
              value={signUp.email}
              type="email"
              className="input"
              placeholder="Email"
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {signUpError.email && (
              <div className="alert alert-danger">
                <span>{signUpError.email}</span>
              </div>
            )}

            <input
              name="soDt"
              value={signUp.soDt}
              type="tel"
              className="input"
              placeholder="Số điện thoại"
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {signUpError.soDt && (
              <div className="alert alert-danger">
                <span>{signUpError.soDt}</span>
              </div>
            )}

            <input
              name="hoTen"
              value={signUp.hoTen}
              type="text"
              className="input"
              placeholder="Họ tên"
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {signUpError.hoTen && (
              <div className="alert alert-danger">
                <span>{signUpError.hoTen}</span>
              </div>
            )}
          </div>
          <div className="row">
            <button
              type="submit"
              className="btn btn-danger submit col-8"
              onClick={handleSubmit}
            >
              Tạo
            </button>
            <Link to="/" className="col-4 backHome text-center ">
              Quay Lại
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
export default SignUp;
