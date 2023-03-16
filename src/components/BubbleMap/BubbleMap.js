import * as d3 from "d3";
import { GEO_CENTROID_DATA, GEO_JSON_DATA } from "../../loadData";
import "./BubbleMap.css";

export default class BubbleMap {
  defaultParams = {
    /**
     * Top margin, in pixels.
     */
    marginTop: 5,

    /**
     * Right margin, in pixels.
     */
    marginRight: 5,

    /**
     * Bottom margin, in pixels.
     */
    marginBottom: 5,

    /**
     * Left margin, in pixels.
     */
    marginLeft: 5,

    /**
     * Outer width, in pixels.
     */
    width: 768,

    /**
     * Outer height, in pixels.
     */
    height: 432,

    /**
     * The y position to translate the legend to.
     */
    legendY: 40,

    /**
     * The x position to translate the legend to.
     */
    legendX: 20,

    /**
     * The id to give the SVG element.
     */
    id: "",

    /**
     * The class to give the created SVG element.
     */
    svgElementClass: "bubble-map-chart",

    /**
     * A function to group the csv data
     */
    groupData: (d) => d.iso_code,

    /**
     * The geo json data.
     */
    geoJsonData: GEO_JSON_DATA,

    /**
     * The geo centroid data.
     */
    geoCentroidData: GEO_CENTROID_DATA,

    /**
     * Function to filter the geo json with
     * Currently just filtering out antarctica.
     */
    filterGeoJson: (d) => d.id != "ATA",

    /**
     * A single date which is used to show the data on the map just for that day.
     * In format YYYY-MM-DD.
     */
    chartEndDate: "2023-03-07",

    /**
     * Type of geo projection.
     */
    projectionType: d3.geoMercator,

    /**
     * The center of the projection.
     */
    projectionCenter: [0, 20],

    /**
     * A function for what is being plotted as circles on the map.
     */
    circleMap: (d) => Number.parseFloat(d.total_cases),

    /**
     * The scale for the circle size.
     */
    circleScale: d3.scaleSqrt,

    /**
     * The min/max for the radius of each circle.
     */
    circleRadiusRange: [5, 15],

    /**
     * The format for the legend labels
     */
    circleLegendFormat: (d) =>
      Intl.NumberFormat("en", { notation: "compact" }).format(d),

    /**
     * The label for the chart
     */
    chartLabel: "Total Cases",
  };

  /**
   * @param {d3.DSVRowArray<string>} data
   * @param {typeof this.defaultParams} params
   */
  constructor(data, params) {
    this.data = data;
    this.params = { ...this.defaultParams, ...params };

    // calling here because they don't need to be called for every draw.
    this.filterGeoJsonFeatures();
    this.filterDataByGeoCentroids();
  }

  /**
   * Update any params, will keep previously set params.
   * @param {typeof this.defaultParams} params
   */
  setParams(params) {
    this.params = { ...this.params, ...params };
  }

  /**
   * Append the svg and necessary elements within it to the DOM.
   * If any of the elements already are in the DOM then leave them there. ie will not append multiple of the same elements.
   */
  initialiseSVGElements() {
    const { elementToInsertInto, svgElementClass, id } = this.params;

    // if the svg doesn't exist then insert into dom
    if (d3.select(`#${id}`).empty()) {
      this.svg = d3
        .select(elementToInsertInto)
        .append("svg")
        .attr("id", id)
        .attr("class", svgElementClass);
    }

    if (this.svg.select(".map-group").empty()) {
      this.svg.append("g").classed("map-group", true);
    }

    if (this.svg.select(".legend").empty()) {
      this.svg.append("g").classed("legend", true);
    }
  }

  /**
   * Set the attributes of the SVG element.
   */
  setSVGAttributes() {
    const { width, height, svgElementClass } = this.params;

    this.svg
      .transition()
      .duration(1000)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("class", svgElementClass);
  }

  /**
   * Filter the GeoJSON data using `this.params.filterGeoJson`.
   */
  filterGeoJsonFeatures() {
    let { geoJsonData, filterGeoJson } = this.params;

    geoJsonData.features = geoJsonData.features.filter(filterGeoJson);
  }

  /**
   * Set `this.filteredDataByGeoCentroids` by filtering `this.data` using `this.params.groupData`
   */
  filterDataByGeoCentroids() {
    const { geoCentroidData, groupData } = this.params;

    const filteredData = this.data.filter((dataRow) => {
      let geoElement = geoCentroidData.find(
        (geoCentroidRow) => groupData(geoCentroidRow) === groupData(dataRow)
      );
      return !!geoElement;
    });
    this.filteredDataByGeoCentroids = filteredData;
  }

  /**
   * Set `this.filteredDataByChartEndDate` to filter `this.filteredDataByGeoCentroids` again by `this.params.chartEndDate`
   */
  filterDataByChartEndDate() {
    const { chartEndDate } = this.params;
    this.filteredDataByChartEndDate = this.filteredDataByGeoCentroids.filter(
      (row) => row.date === chartEndDate
    );
  }

  /**
   * Group the `this.filteredDataByChartEndDate` data with `this.params.groupData`.
   */
  groupAndFilterData() {
    const { groupData } = this.params;
    this.filteredGroupedData = d3.group(
      this.filteredDataByChartEndDate,
      groupData
    );
  }

  /**
   * Setup the data needed for draw.
   */
  setupData() {
    this.filterDataByChartEndDate();
    this.groupAndFilterData();
  }

  /**
   * Set `this.projection` using various params.
   */
  setProjection() {
    const {
      width,
      height,
      marginLeft,
      marginRight,
      marginTop,
      marginBottom,
      projectionType,
      projectionCenter,
      geoJsonData,
    } = this.params;

    this.projection = projectionType()
      .center(projectionCenter) // location to zoom on
      .fitSize(
        [marginLeft + width + marginRight, marginBottom + height + marginTop],
        geoJsonData
      );
  }

  /**
   * Set `this.geoPath`
   */
  setGeoPath() {
    this.geoPath = d3.geoPath(this.projection);
  }

  /**
   * Set the `.map-group` paths
   */
  setMapGroupPaths() {
    const { geoJsonData } = this.params;

    this.svg
      .select(".map-group")
      .selectAll("path")
      .data(geoJsonData.features)
      .join("path")
      .classed("map-group-path", true)
      .attr("d", this.geoPath);
  }

  /**
   * Set `this.circleScale`.
   */
  setCircleScale() {
    const { circleMap, circleScale, circleRadiusRange } = this.params;

    this.circleScale = circleScale()
      .domain(d3.extent(this.filteredDataByChartEndDate, circleMap))
      .range(circleRadiusRange);
  }

  /**
   * Get the projected long and lat coords for a particular iso_code.
   */
  getProjectedLongLatForISO(iso_code) {
    const { geoCentroidData } = this.params;

    // find the iso_code in the centroid data
    let centroid = geoCentroidData.find(
      (centroidRow) => centroidRow.iso_code === iso_code
    );

    // return null if not exists
    if (!centroid) return null;

    // otherwise return the projected long and lat
    return this.projection([centroid.long, centroid.lat]);
  }

  /**
   * Set/draw the circles
   */
  setCircles() {
    this.svg
      .selectAll(".bubble-map-circle")
      .data(this.filteredGroupedData)
      .join("circle")
      .attr("class", (d) => `bubble-map-circle iso_code iso_code-${d[0]}`)
      .attr("transform", (d, i, nodes) => {
        // get the long lat
        let longLat = this.getProjectedLongLatForISO(d[0]);

        // if exists then translate circle
        if (longLat) return `translate(${longLat})`;

        // remove this circle if no lat long for it
        nodes[i].remove();
      })
      .transition()
      .duration(1000)
      .attr(
        "r",
        (d) => this.circleScale(Number.parseFloat(d[1][0].total_cases)) || 0
      );
  }

  /**
   * Set/draw the legend
   */
  setLegend() {
    const { legendX, legendY, circleRadiusRange, circleLegendFormat } =
      this.params;

    // set legend attributes
    const legend = this.svg
      .select(".legend")
      .attr("transform", `translate(${legendX}, ${legendY})`);

    // setup variables needed to draw legend
    let circleScaleDomain = this.circleScale.domain();

    // fixes bug where domain would contain nans if the date selected didn't have the needed data.
    if (circleScaleDomain) {
      let containsNan = circleScaleDomain.some((val) => isNaN(val));
      if (containsNan) circleScaleDomain = [];
    }
    const circleY = circleRadiusRange[1];
    const labelX = 40; // the x position of the label

    // draw circles for each element in circle scale domain
    legend
      .selectAll(".legend-circle")
      .data(circleScaleDomain)
      .join("circle")
      .attr("class", (d, i) => `legend-circle legend-circle-${i}`)
      .transition()
      .duration(1000)
      .attr("cx", 0)
      .attr("cy", (d) => circleY - this.circleScale(d))
      .attr("r", (d) => this.circleScale(d));

    // draw dashed lines to point to the circles
    legend
      .selectAll(".legend-line")
      .data(circleScaleDomain)
      .join("line")
      .attr("class", (d, i) => `legend-line legend-line-${i}`)
      .transition()
      .duration(1000)
      .attr("x1", 0)
      .attr("y1", (d) => circleY - this.circleScale(d))
      .attr("x2", labelX)
      .attr("y2", (d) => circleY - this.circleScale(d));

    // draw legend labels
    legend
      .selectAll(".legend-text")
      .data(circleScaleDomain)
      .join("text")
      .attr("class", (d, i) => `legend-text legend-text-${i}`)
      .transition()
      .duration(1000)
      .attr("x", labelX)
      .attr("y", (d) => circleY - this.circleScale(d))
      .text((d) => circleLegendFormat(d));
  }

  setChartLabel() {
    const { chartLabel, chartEndDate, circleLegendFormat, circleMap } =
      this.params;

    // draw chart label
    this.svg
      .selectAll(".chart-label")
      .data([
        [
          chartLabel,
          d3.sum(this.filteredDataByChartEndDate, circleMap),
          chartEndDate,
        ],
      ])
      .join("text")
      .attr("class", "chart-label")
      .attr("x", 0)
      .attr("y", 0)
      .text((d) => d[0] + ": " + circleLegendFormat(d[1]) + " / " + d[2]);
  }

  draw() {
    // setup data needed to draw
    this.setupData();

    // initialise svg elements
    this.initialiseSVGElements();

    // set svg attributes
    this.setSVGAttributes();

    // set the projection and geo path
    this.setProjection();
    this.setGeoPath();

    // draw map
    this.setMapGroupPaths();

    // set the circle scale
    this.setCircleScale();

    // set/draw chart label
    this.setChartLabel();

    // set/draw circles
    this.setCircles();

    // set/draw the legend
    this.setLegend();
  }
}
