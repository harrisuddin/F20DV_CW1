import "./styles/index.css";
import "./styles/card.css";
import "./styles/d3.css";

import * as d3 from "d3";

import { owidDataLoadedDispatch, OWID_DATA } from "./loadData";
import { DualAxisLineChart } from "./components/DualAxisLineChart/DualAxisLineChart";
import calcSVGDimensions from "./calcSVGDimensions";

/**
 * @type {DualAxisLineChart | null}
 */
let dualLineChart = null;

function onOwidDataLoaded() {
  console.log(OWID_DATA);

  try {
    dualLineChart = new DualAxisLineChart(OWID_DATA, {
      elementToInsertInto: "#line-chart-container",
    });
    dualLineChart.draw();
    resizeCharts();
  } catch (error) {
    debugger; // TODO: Remove when finished
    console.error(error);
  }
}

owidDataLoadedDispatch.on("owidDataLoaded", onOwidDataLoaded);

d3.select("#click").on("click", () => {
  let { showSecondYAxis } = dualLineChart.params;
  dualLineChart.setParams({
    showSecondYAxis: !showSecondYAxis,
    selectedISOCodes: ["USA", "KOR"],
  });
  dualLineChart.draw();
});

d3.select(window).on("resize", resizeCharts);

function resizeCharts() {
  let [width, height] = calcSVGDimensions();

  if (dualLineChart) {
    dualLineChart.setParams({
      width,
      height,
    });
    dualLineChart.draw();
  }
}
