import React, { Component } from "react";
// import logo from './logo.svg';

import Chart from "./PieChart";
import { connect } from "react-redux";

class ShowChart extends Component {
  constructor() {
    super();
    this.state = {
      chartData: {},
    };
  }

  componentWillMount() {
    // this.getchartData(); // this should be this.getChartData();
    this.getChartData();
  }

  getChartData() {
    // Ajax calls here
    this.setState({
      chartData: {
        labels: [
          "Tháng 8",
          "Tháng 9",
          "Tháng 10",
          "Tháng 11",
          // 'Cambridge', 'New Bedford'
        ],
        datasets: [
          {
            label: "Population",
            data: [
              6175940,
              1810450,
              10000000,
              // 10651900,
              this.props.price,
              // 105162,
              // 95072
            ],
            backgroundColor: [
              "rgba(255, 99, 132, 0.6)",
              "rgba(54, 162, 235, 0.6)",
              "rgba(255, 206, 86, 0.6)",
              "rgba(75, 192, 192, 0.6)",
              "rgba(153, 102, 255, 0.6)",
              // 'rgba(255, 159, 64, 0.6)',
              // 'rgba(255, 99, 132, 0.6)'
            ],
          },
        ],
      },
    });
  }

  render() {
    return (
      <div className="App">
        {/* <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div> */}
        <Chart chartData={this.state.chartData} legendPosition="bottom" />
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    price: state.PriceReducer.price,
  };
};
export default connect(mapStateToProps, null)(ShowChart);
