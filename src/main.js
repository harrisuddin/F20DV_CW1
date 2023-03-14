import * as d3 from "d3";
import { owidDataLoadedDispatch, OWID_DATA } from "./loadData";
import { DualAxisLineChart } from "./components/DualAxisLineChart/DualAxisLineChart";
import calcSVGDimensions from "./calcSVGDimensions";

/**
 * @type {DualAxisLineChart | null}
 */
let g7LineChart = null;

/**
 * @type {DualAxisLineChart | null}
 */
let worldDualLineChart = null;

function onOwidDataLoaded() {
  console.log(OWID_DATA);

  try {
    g7LineChart = new DualAxisLineChart(OWID_DATA, {});
    g7LineChart.draw();

    worldDualLineChart = new DualAxisLineChart(OWID_DATA, {
      marginRight: 50,
      elementToInsertInto: "#world-dual-line-chart-container",
      id: "world-dual-line-chart",
      selectedISOCodes: ["OWID_WRL"],
      yMap1: (d) => Number.parseFloat(d.new_deaths_smoothed_per_million),
      showSecondYAxis: true,
      // yTickFormat2: (d) => d,
      yLabel1: "Daily Deaths Smoothed / 1M People",
    });
    worldDualLineChart.draw();

    resizeCharts();
  } catch (error) {
    debugger; // TODO: Remove when finished
    console.error(error);
  }
}

owidDataLoadedDispatch.on("owidDataLoaded", onOwidDataLoaded);

d3.select("#btn-g7-line-chart-ttl-death-per-mil").on("click", () => {
  g7LineChart.setParams({
    yMap1: (d) => Number.parseFloat(d.total_deaths_per_million),
    yLabel1: "Total Deaths / 1M People",
  });
  g7LineChart.draw();
});

d3.select("#btn-g7-line-chart-ttl-cases-per-mil").on("click", () => {
  g7LineChart.setParams({
    yMap1: (d) => Number.parseFloat(d.total_cases_per_million),
    yLabel1: "Total Cases / 1M People",
  });
  g7LineChart.draw();
});

d3.select("#btn-g7-line-chart-ttl-vacs-per-100").on("click", () => {
  g7LineChart.setParams({
    yMap1: (d) => Number.parseFloat(d.total_vaccinations_per_hundred),
    yLabel1: "Total Vac. Doses / 100 People",
  });
  g7LineChart.draw();
});

//

d3.select(window).on("resize", resizeCharts);

function resizeCharts() {
  let [width, height] = calcSVGDimensions();

  // TODO: make cleaner
  if (g7LineChart) {
    g7LineChart.setParams({
      width,
      height,
    });
    g7LineChart.draw();
  }

  if (worldDualLineChart) {
    worldDualLineChart.setParams({
      width,
      height,
    });
    worldDualLineChart.draw();
  }
}
