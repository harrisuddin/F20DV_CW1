import * as d3 from "d3";
// how to import file via url https://github.com/vitejs/vite/discussions/8271#discussioncomment-5192948
import owidCovidCSVData from "./data/owid-covid-data-14-march.csv?url";
import countryCentroidData from "./data/country-coord-adapted.csv?url";

/**
 * Load the OWID data as CSV.
 */
async function loadOwidData() {
  return d3.csv(owidCovidCSVData);
}

/**
 * Load the GeoJSON data.
 */
async function loadGeoJsonData() {
  return d3.json(
    "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
  );
}

/**
 * Load the country centroid points as CSV
 */
async function loadGeoCentroidData() {
  return d3.csv(countryCentroidData);
}

/**
 * Hide the `#loading-icon` element in the HTML.
 */
function hideLoadingIcon() {
  document.getElementById("loading-icon").classList.remove("flex");
  document.getElementById("loading-icon").classList.add("hidden");
}

/**
 * Show the `#default-content` and `#footer` element in the HTML.
 */
function showContent() {
  document.getElementById("default-content").classList.remove("hidden");
  document.getElementById("footer").classList.remove("hidden");
}

/**
 * Hide the `#error-message` element in the HTML.
 */
function showErrorMessage() {
  document.getElementById("error-message").classList.add("flex");
  document.getElementById("error-message").classList.remove("hidden");
}

export let owidDataLoadedDispatch = d3.dispatch("owidDataLoaded");

Promise.all([loadOwidData(), loadGeoJsonData(), loadGeoCentroidData()])
  .then((data) => {
    OWID_DATA = data[0];
    GEO_JSON_DATA = data[1];
    GEO_CENTROID_DATA = data[2];
    // calls the event specified in main.js
    owidDataLoadedDispatch.call("owidDataLoaded");
    showContent();
  })
  .catch((error) => {
    console.error(error);
    showErrorMessage();
  })
  .finally(() => {
    hideLoadingIcon();
  });

/**
 * Stores the OWID data. Should only be accessed after the data has been loaded in.
 * @type {Awaited<ReturnType<typeof loadOwidData>>}
 */
export let OWID_DATA;

/**
 * Stores the geo json data. Should only be accessed after the data has been loaded in.
 * @type {Awaited<ReturnType<typeof loadGeoJsonData>>}
 */
export let GEO_JSON_DATA;

/**
 * Stores the geo centroid data.
 * @type {Awaited<ReturnType<typeof loadGeoCentroidData>>}
 */
export let GEO_CENTROID_DATA;
