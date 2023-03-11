import "./styles/index.css";
import "./styles/card.css";
import "./styles/d3.css";

import * as d3 from "d3";

import { owidDataLoadedDispatch, OWID_DATA } from "./loadData";
import { DualAxisLineChart } from "./components/DualAxisLineChart/DualAxisLineChart";
import calcDefaultSVGDimensions from "./calcSVGDimensions";

/**
 * @type {DualAxisLineChart | null}
 */
let dualLineChart = null;

function onOwidDataLoaded(testParam) {
  console.log(testParam);
  console.log(OWID_DATA);
  console.log(OWID_DATA["USA"].data);
  try {
    let owidUSAData = OWID_DATA["USA"].data;
    dualLineChart = new DualAxisLineChart(owidUSAData, {
      elementToInsertInto: "#line-chart-container",
    });
    dualLineChart.draw();
  } catch (error) {
    debugger;
    console.error(error);
  }
}

owidDataLoadedDispatch.on("owidDataLoaded", onOwidDataLoaded);

d3.select("#click").on("click", () => {
  let owidUKData = OWID_DATA["GBR"].data;
  dualLineChart.data = owidUKData;
  dualLineChart.setParams({ width: 1000, height: 562.5 });
  dualLineChart.update();
});

d3.select(window).on("resize", () => {
  let [width, height] = calcDefaultSVGDimensions();

  if (dualLineChart) {
    dualLineChart.setParams({
      width,
      height,
    });
    dualLineChart.update();
  }
});
