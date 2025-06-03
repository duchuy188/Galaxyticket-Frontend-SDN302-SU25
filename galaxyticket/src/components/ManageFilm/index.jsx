import { Table, Tag, Button, Image } from "antd";
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { connect } from "react-redux";
import {
  actFetchDeleteFilmManage,
  actFetchDetailFilmManage,
  actFetchListFilmManage,
} from "../../containers/admin/module/action";

function ManageFilm(props) {
  const [dsFilm, setDSFilm] = useState([]);
  const [keyWord, setKeyWord] = useState(null);
  const [temp, setTemp] = useState(-1);

  useEffect(() => {
    props.fetchListFilm();
    // setDSFilm(props.listFilm);
  }, []);
  useEffect(() => {
    if (props.listFilm.length > 0) {
      if (temp > 0) {
        setDSFilm(dsFilm);
      } else setDSFilm(props.listFilm);
    }
  });
  useEffect(() => {
    if (keyWord) {
      if (keyWord.length > 0) {
        let dsPhim = props.listFilm.filter((item) => {
          return item.tenPhim.toLowerCase().indexOf(keyWord.toLowerCase()) >= 0;
        });

        setDSFilm(dsPhim);
        setTemp(temp + 1);
      }
    }
    // console.log(keyWord);
  }, [keyWord]);
  const columns = [
    {
      title: "STT",
      dataIndex: "index",
    },
    {
      title: "Mã phim",
      dataIndex: "maPhim",
    },
    {
      title: "Tên phim",
      dataIndex: "tenPhim",
    },
    {
      title: "Bí danh",
      dataIndex: "biDanh",
    },
    {
      title: "Trailer",
      dataIndex: "trailer",
    },
    {
      title: "Hình ảnh",
      dataIndex: "hinhAnh",
      render: (item) => {
        return <Image key={item} width={60} src={item} />;
      },
    },
    {
      title: "Mô tả",
      dataIndex: "moTa",
    },
    {
      title: "Ngày khởi chiếu",
      dataIndex: "ngayKhoiChieu",
    },
    {
      title: "Đánh giá",
      dataIndex: "danhGia",
    },
    {
      title: "",
      dataIndex: "maPhim",
      render: (item) => (
        <>
          <div>
            <NavLink
              activeClassName="active"
              className="nav-link"
              to="/detailFilm"
            >
              <Tag
                color="blue"
                key={item}
                onClick={() => {
                  props.handleDetailFilm(item);
                }}
              >
                Xem Chi tiết
              </Tag>
            </NavLink>
            <NavLink
              activeClassName="active"
              className="nav-link"
              to={`createShowtime/${item}`}
            >
              <Tag color="green" key={item}>
                Tạo lịch chiếu
              </Tag>
            </NavLink>
            <Tag
              className="ml-3"
              color="red"
              key={item}
              onClick={() => {
                props.handleDeleteFilm(item);
              }}
            >
              Xóa
            </Tag>
            <NavLink
              activeClassName="active"
              className="nav-link"
              to="/addFilm"
            >
              <Tag
                color="orange"
                key={item}
                onClick={() => {
                  props.handleEditFilm(item);
                }}
              >
                Sửa
              </Tag>
            </NavLink>
          </div>
        </>
      ),
    },
  ];

  const handleClickAddFilm = () => {
    let { editInfoFilm } = props;
    if (editInfoFilm) {
      props.handleAddNull();
    }
  };
  const handleChangeSearch = (event) => {
    // console.log(keyWord);
    // console.log(event.target.value);
    setKeyWord(event.target.value);
  };

  return (
    <div>
      <div className="row">
        <div className="col-md-6">
          <NavLink activeClassName="active" className="nav-link" to="/addFilm">
            <Button type="primary" danger onClick={handleClickAddFilm}>
              Thêm phim
            </Button>
          </NavLink>
        </div>
        <div className="col-md-6">
          <div className="input-group">
            <input
              className="form-control"
              type="text"
              placeholder="Search for name film ..."
              aria-label="Search"
              aria-describedby="basic-addon2"
              onChange={handleChangeSearch}
            />
            <div className="input-group-append">
              <button className="btn btn-primary" type="button">
                <i className="fas fa-search" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <Table columns={columns} dataSource={dsFilm} />
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    listFilm: state.AdminReducer.listFilmManage,
    editInfoFilm: state.AdminReducer.editInfoFilm,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchListFilm: () => {
      dispatch(actFetchListFilmManage());
    },
    handleDeleteFilm: (maPhim) => {
      dispatch(actFetchDeleteFilmManage(maPhim));
    },
    handleDetailFilm: (maPhim) => {
      dispatch(actFetchDetailFilmManage(maPhim));
    },
    handleEditFilm: (maPhim) => {
      dispatch({
        type: "FETCH_INFO_EDIT_FILMMANAGE",
        maPhim,
      });
    },
    handleAddNull: () => {
      dispatch({
        type: "FETCH_INFO_EDIT_NULL",
      });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageFilm);
