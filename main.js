import "./styles/style.css";
import "./styles/utility-classes.css";
import "./styles/card.css";

// ON START - LOAD DATA
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

let data = [1, 3, 5];

/**
 * Load the data from the various sources.
 */
async function loadData() {
  await delay(1000);
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

loadData()
  .then(() => {
    hideLoadingIcon();
    showContent();
  })
  .catch(() => {
    showErrorMessage();
  });
