import * as d3 from "d3";

// all css to manipulate this class here
// done this to separate concerns
// this js class just gives dom elements classes that are used in the css file
import "./DualAxisLineChart.css";

export class DualAxisLineChart {
  defaultParams = {
    /**
     * Top margin, in pixels.
     */
    marginTop: 20,

    /**
     * Right margin, in pixels.
     */
    marginRight: 45,

    /**
     * Bottom margin, in pixels.
     */
    marginBottom: 20,

    /**
     * Left margin, in pixels.
     */
    marginLeft: 45,

    /**
     * Outer width, in pixels.
     */
    width: 768,

    /**
     * Outer height, in pixels.
     */
    height: 432,

    /**
     * The HTML element to insert the chart into.
     */
    elementToInsertInto: "",

    /**
     * The id to give the SVG element.
     */
    id: "most-success-dual-line-chart",

    /**
     * The class to give the created SVG element
     */
    svgElementClass: "dual-axis-line-chart",

    /**
     * The x-axis scale type
     */
    xScaleType: d3.scaleUtc,

    /**
     * The first y-axis scale type
     */
    yScaleType1: d3.scaleLinear,

    /**
     * The second y-axis scale type
     */
    yScaleType2: d3.scaleLinear,

    /**
     * A function that maps data to x values.
     */
    xMap: (d) => new Date(d.date),

    /**
     * A function that maps data to y values for the first y axis.
     */
    yMap1: (d) => d.total_deaths,

    /**
     * True when showing the second y-axis, false otherwise.
     */
    showSecondYAxis: true,

    /**
     * A function that maps data to y values for the second y axis.
     */
    yMap2: (d) => d.people_fully_vaccinated,

    /**
     * A function that formats y axis tick labels for the first y axis.
     */
    yTickFormat1: (d) => d / 1000000 + "M",

    /**
     * A function that formats y axis tick labels for the second y axis.
     */
    yTickFormat2: (d) => d / 1000000 + "M",

    /**
     * The label for the first y-axis
     */
    yLabel1: "Total Deaths (Millions)",

    /**
     * The label for the second y-axis
     */
    yLabel2: "People Fully Vaccinated (Millions)",
  };

  /**
   *
   * @param {*} data
   * @param {typeof this.defaultParams} params
   */
  constructor(data, params) {
    this.data = data;
    this.params = { ...this.defaultParams, ...params };
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
    const { elementToInsertInto, svgElementClass, id, showSecondYAxis } =
      this.params;

    // if the svg doesn't exist then insert into dom
    if (d3.select(`#${id}`).empty()) {
      this.svg = d3
        .select(elementToInsertInto)
        .append("svg")
        .attr("id", id)
        .attr("class", svgElementClass);
    }

    // append x-axis if not there
    if (this.svg.select(".x-axis").empty()) {
      this.svg.append("g").attr("class", "x-axis");
    }

    // append first y-axis and its label if not there
    if (this.svg.select(".y-axis1").empty()) {
      this.svg
        .append("g")
        .attr("class", "y-axis1")
        .append("text")
        .attr("class", "y-axis1-label");
    }

    // append second y-axis and its label if not there
    // also check to show second axis
    if (this.svg.select(".y-axis2").empty() && showSecondYAxis) {
      this.svg
        .append("g")
        .attr("class", "y-axis2")
        .append("text")
        .attr("class", "y-axis2-label");
    }

    // append line1 if not there
    if (this.svg.select(".line1").empty()) {
      this.svg.append("path").attr("class", "line line1");
    }

    // append line2 if not there and check to show second axis
    if (this.svg.select(".line2").empty() && showSecondYAxis) {
      this.svg.append("path").attr("class", "line line2");
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
   * Set `this.xScale` using values from `this.data` and `this.params`.
   */
  setXScale() {
    const { marginRight, marginLeft, width, xScaleType, xMap } = this.params;
    const data = this.data;

    this.xScale = xScaleType()
      .range([marginLeft, width - marginRight])
      .domain(d3.extent(data, xMap));
  }

  /**
   * Set `this.yScale1` using values from `this.data` and `this.params`.
   */
  setYScale1() {
    const { marginTop, marginBottom, height, yScaleType1, yMap1 } = this.params;
    const data = this.data;

    this.yScale1 = yScaleType1()
      .range([height - marginBottom, marginTop])
      .domain([0, d3.max(data, yMap1)]);
  }

  /**
   * Set `this.yScale2` using values from `this.data` and `this.params`.
   */
  setYScale2() {
    const { marginTop, marginBottom, height, yScaleType2, yMap2 } = this.params;
    const data = this.data;

    this.yScale2 = yScaleType2()
      .range([height - marginBottom, marginTop])
      .domain([0, d3.max(data, yMap2)]);
  }

  /**
   * Set `this.xAxis` using `this.xScale`.
   */
  setXAxis() {
    const { width } = this.params;

    this.xAxis = d3
      .axisBottom(this.xScale)
      .ticks(width / 80)
      .tickSizeOuter(0);
  }

  /**
   * Set `this.yAxis1` using `this.yScale1` and any related params.
   */
  setYAxis1() {
    const { height } = this.params;

    this.yAxis1 = d3
      .axisLeft(this.yScale1)
      .ticks(height / 40)
      .tickFormat(this.params.yTickFormat1);
  }

  /**
   * Set `this.yAxis2` using `this.yScale2` and any related params.
   */
  setYAxis2() {
    const { height } = this.params;

    this.yAxis2 = d3
      .axisRight(this.yScale2)
      .ticks(height / 40)
      .tickFormat(this.params.yTickFormat2);
  }

  /**
   * Set `this.line2` using related params and scale fields.
   */
  setLine1() {
    const { xMap, yMap1 } = this.params;

    this.line1 = d3
      .line()
      .defined((d) => !isNaN(yMap1(d)))
      .x((d) => this.xScale(xMap(d)))
      .y((d) => this.yScale1(yMap1(d)));
  }

  /**
   * Set `this.line2` using related params and scale fields.
   */
  setLine2() {
    const { xMap, yMap2 } = this.params;

    this.line2 = d3
      .line()
      .defined((d) => !isNaN(yMap2(d)))
      .x((d) => this.xScale(xMap(d)))
      .y((d) => this.yScale2(yMap2(d)));
  }

  /**
   * Set the x-axis shown in the svg element.
   */
  setSVGXAxis() {
    const { height, marginBottom } = this.params;

    this.svg
      .select(".x-axis")
      .transition()
      .duration(1000)
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(this.xAxis);
  }

  /**
   * Set the first y-axis shown in the svg element.
   */
  setSVGYAxis1() {
    const { marginLeft, yLabel1 } = this.params;

    this.svg
      .select(".y-axis1-label")
      .transition()
      .duration(1000)
      .attr("x", -marginLeft)
      .attr("y", 10)
      .text(yLabel1);

    this.svg
      .select(".y-axis1")
      .transition()
      .duration(1000)
      .attr("transform", `translate(${marginLeft},0)`)
      .call(this.yAxis1);
  }

  /**
   * Set the second y-axis shown in the svg element.
   */
  setSVGYAxis2() {
    const { width, marginRight, yLabel2 } = this.params;

    this.svg
      .select(".y-axis2-label")
      .transition()
      .duration(1000)
      .attr("x", marginRight)
      .attr("y", 10)
      .text(yLabel2);

    this.svg
      .select(".y-axis2")
      .transition()
      .duration(1000)
      .attr("transform", `translate(${width - marginRight},0)`)
      .call(this.yAxis2);
  }

  /**
   * If the second y-axis exists then remove it
   */
  removeSVGAxis2() {
    if (!this.svg.select(".y-axis2").empty()) {
      this.svg
        .select(".y-axis2")
        .transition()
        .duration(1000)
        .attr("opacity", 0)
        .remove();
    }
  }

  /**
   * Set the svg path of the first line
   */
  setSVGPath1() {
    this.svg
      .select(".line1")
      .datum(this.data)
      .transition()
      .duration(1000)
      .attr("d", this.line1);
  }

  /**
   * Set the svg path of the second line
   */
  setSVGPath2() {
    this.svg
      .select(".line2")
      .datum(this.data)
      .transition()
      .duration(1000)
      .attr("d", this.line2);
  }

  /**
   * If the second y-axis exists then remove it
   */
  removeSVGPath2() {
    if (!this.svg.select(".line2").empty()) {
      this.svg
        .select(".line2")
        .transition()
        .duration(1000)
        .attr("opacity", 0)
        .remove();
    }
  }

  /**
   * Used to draw the SVG and can be called to update the visualisation.
   */
  draw() {
    const { showSecondYAxis } = this.params;

    // initialise any/all svg elements if needed
    this.initialiseSVGElements();

    // set the svgs attributes
    this.setSVGAttributes();

    // if shouldn't show second y-axis then remove the axis and path if exists
    if (!showSecondYAxis) {
      this.removeSVGAxis2();
      this.removeSVGPath2();
    }

    // create scales for all axes
    this.setXScale();
    this.setYScale1();
    if (showSecondYAxis) this.setYScale2();

    // create all axes
    this.setXAxis();
    this.setYAxis1();
    if (showSecondYAxis) this.setYAxis2();

    // create line generators for 2 y axes
    this.setLine1();
    if (showSecondYAxis) this.setLine2();

    // set the x-axis attributes
    this.setSVGXAxis();

    // set the first y axis attributes
    this.setSVGYAxis1();

    // set the second y axis attributes
    if (showSecondYAxis) {
      this.setSVGYAxis2();
    }

    // add lines to svg
    // set the first path attributes
    this.setSVGPath1();

    // set the second path attributes
    if (showSecondYAxis) {
      this.setSVGPath2();
    }
  }
}
