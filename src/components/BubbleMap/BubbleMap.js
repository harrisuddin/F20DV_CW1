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

    // /**
    //  * The height of the legend section.
    //  */
    // legendHeight: 35,

    // /**
    //  * The left margin to give the legend.
    //  */
    // legendMarginLeft: 0,

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
     * A single date which is used to show the data on the map just for that day.
     */
    chartDate: "2020-01-10",
  };

  /**
   * @param {d3.DSVRowArray<string>} data
   * @param {typeof this.defaultParams} params
   */
  constructor(data, params) {
    this.data = data;
    this.params = { ...this.defaultParams, ...params };
    this.filterGeoJsonFeatures();
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

  filterGeoJsonFeatures() {
    this.params.geoJsonData.features = this.params.geoJsonData.features.filter(
      (d) => d.id != "ATA"
    );
  }

  filterData() {
    const { chartDate } = this.params;
    this.filteredDataByDate = this.data.filter((row) => row.date === chartDate);
  }

  groupAndFilterData() {
    const { chartDate, groupData } = this.params;
    this.filteredGroupedData = d3.group(this.filteredDataByDate, groupData);
  }

  filterGeoCentroidData() {
    this.params.geoCentroidData.filter((geoCentroidRow) =>
      this.data.find((dataRow) => dataRow.iso_code === geoCentroidRow.iso_code)
    );
  }

  draw() {
    // this.filterGeoCentroidData();

    this.filterData();

    this.groupAndFilterData();

    let {
      width,
      height,
      marginLeft,
      marginRight,
      marginTop,
      marginBottom,
      geoJsonData,
      geoCentroidData,
    } = this.params;

    this.initialiseSVGElements();

    this.setSVGAttributes();

    this.projection = d3
      .geoMercator()
      //   .scale(120) // This is like the zoom
      .center([0, 20]) // GPS of location to zoom on
      //   .translate([width / 2, height / 2]);
      .fitSize([width, height], geoJsonData);

    this.geoPath = d3.geoPath(this.projection);

    // draw map
    this.svg
      .select(".map-group")
      .selectAll("path")
      .data(geoJsonData.features)
      .join("path")
      .attr("fill", "green")
      .attr("d", this.geoPath)
      .style("stroke", "black")
      .style("opacity", 0.3);

    // draw circles
    // this.svg
    //   .selectAll("circle")
    //   .data(geoCentroidData)
    //   .join("circle")
    //   .call((circle) => circle.append("title").text((d) => d.iso_code))
    //   .attr("r", 6)
    //   .attr("fill", "blue")
    //   .style("opacity", 0.4)
    //   .attr("transform", (d) => {
    //     let latLong = this.projection([d.long, d.lat]);
    //     return `translate(${latLong})`;
    //   });

    // Add a scale for bubble size
    const valueExtent = d3.extent(this.filteredDataByDate, (d) =>
      Number.parseFloat(d.total_cases)
    );
    console.log(valueExtent);

    const scaleCircleSize = d3
      .scaleSqrt()
      .domain(valueExtent) // What's in the data
      .range([1, 25]); // Size in pixel

    const getLongLat = (d) => {
      let centroid = geoCentroidData.find(
        (centroidRow) => centroidRow.iso_code === d[0]
      );
      if (!centroid) return [-1000, -1000];
      let longLat = this.projection([centroid.long, centroid.lat]);
      return longLat;
    };

    this.svg
      .selectAll("circle")
      .data(this.filteredGroupedData)
      .join("circle")
      .attr("cx", (d) => getLongLat(d) && getLongLat(d)[0])
      .attr("cy", (d) => getLongLat(d) && getLongLat(d)[1])
      .transition()
      .duration(1000)
      .attr("r", (d) => scaleCircleSize(Number.parseFloat(d[1][0].total_cases)))
      .attr("fill", "blue")
      .style("opacity", 0.4);
    //   .attr("transform", (d) => {
    //     // console.log(d);
    //     let centroid = geoCentroidData.find(
    //       (centroidRow) => centroidRow.iso_code === d[0]
    //     );
    //     // console.log(centroid);
    //     if (!centroid) return;
    //     let latLong = this.projection([centroid.long, centroid.lat]);
    //     return `translate(${latLong})`;
    //   });
  }
}
