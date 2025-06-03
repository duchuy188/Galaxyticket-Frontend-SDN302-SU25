import React from "react";
import { makeStyles } from "@mui/styles"; // chú ý phải cài thêm @mui/styles
import Rating from "@mui/material/Rating";
import Box from "@mui/material/Box";
import { connect } from "react-redux";

// Labels giữ nguyên
const labels = {
  0.5: "1.0",
  1: "2.0",
  1.5: "3.0",
  2: "4.0",
  2.5: "5.0",
  3: "6.0",
  3.5: "7.0",
  4: "8.0",
  4.5: "9.0",
  5: "10",
};

const useStyles = makeStyles({
  root: {
    width: 450,
    alignItems: "center",
    fontSize: "30px",
    fontWeight: "bold",
    color: "#7ed321",
    textAlign: "center",
  },
});

function HoverRating(props) {
  const [value, setValue] = React.useState(2);
  const [hover, setHover] = React.useState(-1);
  props.handleClickRating(value * 2);
  const classes = useStyles();
  return (
    <div className={classes.root}>
      {value !== null && (
        <Box ml={2}>{labels[hover !== -1 ? hover : value]}</Box>
      )}
      <Rating
        name="hover-feedback"
        value={value}
        precision={0.5}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        onChangeActive={(event, newHover) => {
          setHover(newHover);
        }}
      />
    </div>
  );
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleClickRating: (value) => {
      dispatch({
        type: "FETCH_RANTING_FILM",
        value,
      });
    },
  };
};
export default connect(null, mapDispatchToProps)(HoverRating);
