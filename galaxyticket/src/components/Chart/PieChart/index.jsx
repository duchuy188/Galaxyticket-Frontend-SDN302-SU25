import React, { Component } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';

class Chart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chartData: props.chartData
    }
  }
  static defaultProps = {
    displayTitle: true,
    displayLegend: true,
    // legendPosition: 'right',
    location: 'City'
  }

  render() {
    console.log(this.state);
    return (
      <div className="chart">
        <div className="col-6 mx-auto">
          <Bar
            data={this.state.chartData}
            options={{
              title: {
                display: this.props.displayTitle,
                text: 'Biểu đồ cột ',
                fontSize: 30
              },
              legend: {
                display: this.props.displayLegend,
                position: this.props.legendPosition
              }
            }}
          />
        </div>

        <div className="col-6 mx-auto">
          <Pie
            data={this.state.chartData}
            options={{
              title: {
                display: this.props.displayTitle,
                text: 'Biểu Đồ Tròn ',
                fontSize: 30
              },
              legend: {
                display: this.props.displayLegend,
                position: this.props.legendPosition
              }
            }}
          />
        </div>

      </div>
    )
  }
}
export default Chart;
