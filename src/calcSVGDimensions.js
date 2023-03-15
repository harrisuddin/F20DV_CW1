let DEFAULT_SVG_WIDTH = 990;

/**
 * Return array with svg width and height depending on window width.
 * @returns {Array<Number>}
 */
export default function calcSVGDimensions() {
  // get width of window
  let windowWidth = window.innerWidth || document.documentElement.clientWidth;

  /**
   * Calculate the height for 16 by 9 aspect ratio when given width
   * @param {number} w
   * @returns {number}
   */
  const calcHeight16By9 = (w) => (w / 16) * 9;

  DEFAULT_SVG_WIDTH = 990;

  if (windowWidth <= 768) {
    DEFAULT_SVG_WIDTH = 750;
  }

  if (windowWidth <= 640) {
    DEFAULT_SVG_WIDTH = 620;
  }

  if (windowWidth <= 425) {
    DEFAULT_SVG_WIDTH = 400;
  }

  if (windowWidth <= 320) {
    DEFAULT_SVG_WIDTH = 300;
  }

  return [DEFAULT_SVG_WIDTH, calcHeight16By9(DEFAULT_SVG_WIDTH)];
}
