import * as d3 from "d3";

/**
 * A single or dual y-axis line chart
 * {typeof import("../loadData").OWID_DATA} data
 * @param {*} data
 * @param {{
 * defined: (value: any, index: number, iterable: Iterable<any>) => boolean,
 * definedY2: (value: any, index: number, iterable: Iterable<any>) => boolean
 * }} params
 */
export function singleOrDualAxisLineChart(
  data,
  {
    x = ([x]) => x, // given d in data, returns the (temporal) x-value
    y = ([, y]) => y, // given d in data, returns the (quantitative) first y-value
    y2, // given d in data, returns the (quantitative) second y-value

    defined,
    definedY2,

    curve = d3.curveLinear, // method of interpolation between points

    marginTop = 20, // top margin, in pixels
    marginRight = 40, // right margin, in pixels
    marginBottom = 20, // bottom margin, in pixels
    marginLeft = 40, // left margin, in pixels
    width = 768, // outer width, in pixels
    height = 432, // outer height, in pixels

    xType = d3.scaleUtc, // the x-scale type
    xDomain, // [xmin, xmax]
    xRange = [marginLeft, width - marginRight], // [left, right]

    yType = d3.scaleLinear, // the y-scale type
    yDomain, // [ymin, ymax]
    yRange = [height - marginBottom, marginTop], // [bottom, top]
    yFormat, // a format specifier string for the y-axis
    yLabel, // a label for the y-axis

    y2Type = d3.scaleLinear,
    y2Domain, // [y2min, y2max]
    y2Range = [height - marginBottom, marginTop], // [bottom, top]
    y2Format, // a format specifier string for the second y-axis
    y2Label, // a label for the second y-axis

    color = "currentColor", // stroke color of line
    strokeLinecap = "round", // stroke line cap of the line
    strokeLinejoin = "round", // stroke line join of the line
    strokeWidth = 1.5, // stroke width of line, in pixels
    strokeOpacity = 1, // stroke opacity of line

    color2 = "currentColor", // stroke color of line
    strokeLinecap2 = "round", // stroke line cap of the line
    strokeLinejoin2 = "round", // stroke line join of the line
    strokeWidth2 = 1.5, // stroke width of line, in pixels
    strokeOpacity2 = 1, // stroke opacity of line
  } = {}
) {
  const X = d3.map(data, x);
  const Y = d3.map(data, y);
  const I = d3.range(X.length);
  const Y2 = y2 ? d3.map(data, y2) : null;

  if (defined === undefined) defined = (d, i) => !isNaN(X[i]) && !isNaN(Y[i]);
  if (definedY2 === undefined)
    definedY2 = (d, i) => !isNaN(X[i]) && !isNaN(Y[i]);
  const D = d3.map(data, defined);
  const D2 = d3.map(data, definedY2);

  // Compute default domains.
  if (xDomain === undefined) xDomain = d3.extent(X);
  if (yDomain === undefined) yDomain = [0, d3.max(Y)];
  if (y2Domain === undefined && Y2 !== null) y2Domain = [0, d3.max(Y2)];

  // Construct scales and axes.
  const xScale = xType(xDomain, xRange);
  const yScale = yType(yDomain, yRange);
  const y2Scale = y2Domain ? y2Type(y2Domain, y2Range) : null;

  const xAxis = d3
    .axisBottom(xScale)
    .ticks(width / 80)
    .tickSizeOuter(0);

  const yAxis = d3
    .axisLeft(yScale)
    .ticks(height / 40)
    .tickFormat(yFormat);

  const y2Axis = y2Scale
    ? d3
        .axisRight(y2Scale)
        .ticks(height / 40)
        .tickFormat(y2Format)
    : null;

  // Construct a line generator.
  const line = d3
    .line()
    .defined((i) => D[i])
    .curve(curve)
    .x((i) => xScale(X[i]))
    .y((i) => yScale(Y[i]));

  const line2 = y2Scale
    ? d3
        .line()
        .defined((i) => D2[i])
        .curve(curve)
        .x((i) => xScale(X[i]))
        .y((i) => y2Scale(Y2[i]))
    : null;

  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; margin: auto");

  svg
    .append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(xAxis);

  svg
    .append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(yAxis)
    .call((g) => g.select(".domain").remove())
    .call((g) =>
      g
        .selectAll(".tick line")
        .clone()
        .attr("x2", width - marginLeft - marginRight)
        .attr("stroke-opacity", 0.1)
    )
    .call((g) =>
      g
        .append("text")
        .attr("x", -marginLeft)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .attr("class", "text-xs")
        .text(yLabel)
    );

  if (y2Axis) {
    svg
      .append("g")
      .attr("transform", `translate(${width - marginRight},0)`)
      .attr("color", color2)
      .call(y2Axis)
      .call((g) => g.select(".domain").remove())
      //.call((g) => g.selectAll(".tick").attr("style", `color: ${color2}`))
      .call((g) =>
        g
          .selectAll(".tick line")
          .clone()
          .attr("x2", -width + marginLeft + marginRight)
          .attr("stroke-opacity", 0.1)
      )
      .call((g) =>
        g
          .append("text")
          .attr("x", marginRight)
          .attr("y", 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "end")
          .attr("class", "text-xs")
          .text(y2Label)
      );
  }

  svg
    .data(data)
    .join("path")
    .attr("fill", "none")
    .attr("stroke", color)
    .attr("stroke-width", strokeWidth)
    .attr("stroke-linecap", strokeLinecap)
    .attr("stroke-linejoin", strokeLinejoin)
    .attr("stroke-opacity", strokeOpacity)
    .attr("d", line(I));

  if (line2) {
    svg
      .data(data)
      .join("path")
      .attr("fill", "none")
      .attr("stroke", color2)
      .attr("stroke-width", strokeWidth2)
      .attr("stroke-linecap", strokeLinecap2)
      .attr("stroke-linejoin", strokeLinejoin2)
      .attr("stroke-opacity", strokeOpacity2)
      .attr("stroke-dasharray", "10,5")
      .attr("d", line2(I));
  }

  return svg.node();
}
