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
  console.log(OWID_DATA["USA"].data);
  try {
    let owidUSAData = OWID_DATA["USA"].data;
    dualLineChart = new DualAxisLineChart(owidUSAData, {
      elementToInsertInto: "#line-chart-container",
    });
    dualLineChart.draw();
    resizeChartsOnWindowResize();
  } catch (error) {
    debugger;
    console.error(error);
  }
}

owidDataLoadedDispatch.on("owidDataLoaded", onOwidDataLoaded);

d3.select("#click").on("click", () => {
  // let owidUKData = OWID_DATA["GBR"].data;
  // dualLineChart.data = owidUKData;
  let { showSecondYAxis } = dualLineChart.params;
  dualLineChart.setParams({
    showSecondYAxis: !showSecondYAxis,
  });
  dualLineChart.draw();
});

d3.select(window).on("resize", resizeChartsOnWindowResize);

function resizeChartsOnWindowResize() {
  let [width, height] = calcSVGDimensions();

  if (dualLineChart) {
    dualLineChart.setParams({
      width,
      height,
    });
    dualLineChart.draw();
  }
}
