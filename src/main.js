import "./styles/index.css";
import "./styles/card.css";
import "./styles/d3.css";

import * as d3 from "d3";

import { owidDataLoadedDispatch, OWID_DATA } from "./loadData";
import { singleOrDualAxisLineChart } from "./components/singleOrDualAxisLineChart";

function onOwidDataLoaded(testParam) {
  console.log(testParam);
  console.log(OWID_DATA);
  console.log(OWID_DATA["USA"].data);
  let owidUSAData = OWID_DATA["USA"].data;
  // console.log(owidUSAData.find((value, i) => !value.date));
  try {
    let lineChart = singleOrDualAxisLineChart(owidUSAData, {
      x: (d) => new Date(d.date),
      y: (d) => d.total_deaths,
      y2: (d) => d.people_fully_vaccinated,
      defined: (_, i, iter) => !isNaN(iter[i].total_deaths),
      definedY2: (_, i, iter) => !isNaN(iter[i].people_fully_vaccinated),
      yFormat: (d) => d / 1000000 + "M",
      y2Format: (d) => d / 1000000 + "M",
      yLabel: "Total Deaths (Millions)",
      y2Label: "People Fully Vaccinated (Millions)",
      color2: "#9a3412",
    });
    console.log(lineChart);
    d3.select("#line-chart-container").node().appendChild(lineChart);
  } catch (error) {
    debugger;
    console.error(error);
  }
}

owidDataLoadedDispatch.on("owidDataLoaded", onOwidDataLoaded);
