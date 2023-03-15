import * as d3 from "d3";
import { owidDataLoadedDispatch, OWID_DATA, GEO_JSON_DATA } from "./loadData";
import DualAxisLineChart from "./components/DualAxisLineChart/DualAxisLineChart";
import calcSVGDimensions from "./calcSVGDimensions";
import BubbleMap from "./components/DualAxisLineChart/BubbleMap/BubbleMap";

/**
 * @type {DualAxisLineChart | null}
 */
let g7LineChart = null;

/**
 * @type {DualAxisLineChart | null}
 */
let worldDualLineChart = null;

/**
 * @type {BubbleMap | null}
 */
let bubbleMapChart = null;

function onOwidDataLoaded() {
  console.log(OWID_DATA);
  console.log(GEO_JSON_DATA);

  try {
    g7LineChart = new DualAxisLineChart(OWID_DATA, {
      elementToInsertInto: "#g7-line-chart-container",
      id: "g7-line-chart",

      onLegendMouseover: onDualAxisLineChartLegendMouseover,
      onLegendMouseout: onDualAxisLineChartLegendMouseout,
    });
    // g7LineChart.draw();

    worldDualLineChart = new DualAxisLineChart(OWID_DATA, {
      marginRight: 50,
      elementToInsertInto: "#world-dual-line-chart-container",
      id: "world-dual-line-chart",
      selectedISOCodes: ["OWID_WRL"],
      yMap1: (d) => Number.parseFloat(d.new_deaths_smoothed_per_million),
      showSecondYAxis: true,
      // yTickFormat2: (d) => d,
      yLabel1: "Daily Deaths Smoothed / 1M People",

      onLegendMouseover: onDualAxisLineChartLegendMouseover,
      onLegendMouseout: onDualAxisLineChartLegendMouseout,
    });

    bubbleMapChart = new BubbleMap(OWID_DATA, {
      elementToInsertInto: "#bubble-map-container",
      id: "bubble-map-chart",
    });

    resizeCharts();
  } catch (error) {
    debugger; // TODO: Remove when finished
    console.error(error);
  }
}

/**
 * This function is used for requirement A5.
 * @param {any} _
 * @param {[any, d3.DSVRowString<string>[]]} d
 */
function onDualAxisLineChartLegendMouseover(_, d) {
  /**
   * Callback for when one of the legend circle/text is hovered.
   * Will reduce opacity of all legend and lines except the associated one being hovered.
   * @param {d3.Selection<SVGSVGElement, any, HTMLElement, any>} svgElement
   */
  const highlightSelectedISOCode = (svgElement) => {
    // reduce opacity of all lines and legend related elements
    svgElement.selectAll(`.iso_code`).classed("opacity-20", true);

    // bring back opacity for hovered legend and its lines
    svgElement.selectAll(`.iso_code-${d[0]}`).classed("opacity-20", false);
  };

  highlightSelectedISOCode(g7LineChart.svg);
  highlightSelectedISOCode(worldDualLineChart.svg);
}

/**
 * This function is used for requirement A5.
 * @param {any} _
 * @param {[any, d3.DSVRowString<string>[]]} d
 */
function onDualAxisLineChartLegendMouseout(_, d) {
  /**
   * Callback for when one of the legend circle/text is stopped hovering.
   * Will make the opacity of everything back to normal.
   */
  const noHighlight = (svgElement) => {
    svgElement.selectAll(".iso_code").classed("opacity-20", false);
  };

  noHighlight(g7LineChart.svg);
  noHighlight(worldDualLineChart.svg);
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

d3.select("#btn-g7-line-chart-stringency-index").on("click", () => {
  g7LineChart.setParams({
    yMap1: (d) => Number.parseFloat(d.stringency_index),
    yLabel1: "Stringency Index",
  });
  g7LineChart.draw();
});

d3.select("#click").on("click", () => {
  bubbleMapChart.setParams({
    chartDate: "2022-01-01",
  });
  bubbleMapChart.draw();
});

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

  if (bubbleMapChart) {
    bubbleMapChart.setParams({
      width,
      height,
    });
    bubbleMapChart.draw();
  }
}
