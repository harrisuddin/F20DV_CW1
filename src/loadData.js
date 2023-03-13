import * as d3 from "d3";
// how to import file via url https://github.com/vitejs/vite/discussions/8271#discussioncomment-5192948
import owidCovidCSVData from "./data/owid-covid-data.csv?url";

/**
 * Load the OWID data as CSV.
 */
async function loadOwidData() {
  return d3.csv(owidCovidCSVData);
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

loadOwidData()
  .then((data) => {
    OWID_DATA = data;
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
