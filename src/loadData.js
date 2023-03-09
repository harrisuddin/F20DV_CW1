import * as d3 from "d3";
import owidCovidData from "./data/owid-covid-data.json?url"; // how to import file via url https://github.com/vitejs/vite/discussions/8271#discussioncomment-5192948

/**
 * Load the OWID Covid Data as JSON.
 *
 * @returns {Promise<{
 * [iso_code: string]: {
 * continent?: string;
 * location?: string;
 * population?: number;
 * population_density?: number;
 * median_age?: number;
 * aged_65_older?: number;
 * aged_70_older?: number;
 * gdp_per_capita?: number;
 * extreme_poverty?: number;
 * cardiovasc_death_rate?: number;
 * diabetes_prevalence?: number;
 * female_smokers?: number;
 * male_smokers?: number;
 * handwashing_facilities?: number;
 * hospital_beds_per_thousand?: number;
 * life_expectancy?: number;
 * human_development_index?: number;
 * data: {
 *  date: string;
 *  total_cases?: number;
 *  new_cases?: number;
 *  new_cases_smoothed?: number;
 *  total_cases_per_million?: number;
 *  new_cases_per_million?: number;
 *  new_cases_smoothed_per_million?: number;
 *  total_deaths?: number;
 *  new_deaths?: number;
 *  new_deaths_smoothed?: number;
 *  total_deaths_per_million?: number;
 *  new_deaths_per_million?: number;
 *  new_deaths_smoothed_per_million?: number;
 *  excess_mortality?: number;
 *  excess_mortality_cumulative?: number;
 *  excess_mortality_cumulative_absolute?: number;
 *  excess_mortality_cumulative_per_million: number;
 *  icu_patients?: number;
 *  icu_patients_per_million?: number;
 *  hosp_patients?: number;
 *  hosp_patients_per_million?: number;
 *  weekly_icu_admissions?: number;
 *  weekly_icu_admissions_per_million?: number;
 *  weekly_hosp_admissions?: number;
 *  weekly_hosp_admissions_per_million?: number;
 *  stringency_index?: number;
 *  reproduction_rate?: number;
 *  total_tests?: number;
 *  new_tests?: number;
 *  total_tests_per_thousand?: number;
 *  new_tests_per_thousand?: number;
 *  new_tests_smoothed?: number;
 *  new_tests_smoothed_per_thousand?: number;
 *  positive_rate?: number;
 *  tests_per_case?: number;
 *  tests_units?: string;
 *  total_vaccinations?: number;
 *  people_vaccinated?: number;
 *  people_fully_vaccinated?: number;
 *  total_boosters?: number;
 *  new_vaccinations?: number;
 *  new_vaccinations_smoothed?: number;
 *  total_vaccinations_per_hundred?: number;
 *  people_vaccinated_per_hundred?: number;
 *  people_fully_vaccinated_per_hundred?: number;
 *  total_boosters_per_hundred?: number;
 *  new_vaccinations_smoothed_per_million?: number;
 *  new_people_vaccinated_smoothed?: number;
 *  new_people_vaccinated_smoothed_per_hundred?: number;
 * }[]
 * }
 * }>}
 */
async function loadOwidData() {
  let data = await d3.json(owidCovidData);
  return data;
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
  .catch(() => {
    showErrorMessage();
  })
  .finally(() => {
    hideLoadingIcon();
  });

/**
 * Stores the OWID_DATA. Should only be accessed after the data has been loaded in.
 * @type {Awaited<ReturnType<typeof loadOwidData>>}
 */
export let OWID_DATA;
