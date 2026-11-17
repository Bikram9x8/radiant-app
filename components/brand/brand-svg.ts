// Radiant Educations brand marks (Phase 2 design logo: teal + coral circles, peach overlap,
// "RADIANT" in Big Shoulders Display over "EDUCATIONS" in Figtree).
//
// All letters are real font outlines (brand-paths.ts), so the logo looks the same everywhere
// and needs no web font. The same builders make the inline logo (RadiantLogo, RadiantLoader)
// and the files in public/brand and the app icons, so they can't drift apart.
// The SVG strings are built only from the constants below (no user input), so they are safe
// to inject with dangerouslySetInnerHTML. Every id is prefixed with the `id` argument,
// which must be unique per page and contain only [A-Za-z0-9_-].
import {
  MARK_R,
  MARK_E,
  WORD_RADIANT,
  WORD_RADIANT_ALONE,
  WORD_EDUCATIONS,
  LOCKUP_WIDTH,
} from "./brand-paths";

export const BRAND = {
  teal: "#0f766e",
  coral: "#f97350",
  peach: "#fed7aa", // where the circles overlap
  ink: "#0f2e33", // RADIANT on light
  eduText: "#c2410c", // EDUCATIONS on light
  eduTextDark: "#fdba74", // EDUCATIONS on dark
  white: "#ffffff",
  paper: "#fcfaf6",
} as const;

// The overlap ("lens") of the two circles: cx 14 / 29, r 12.5
const LENS = "M21.5 6.1a12.5 12.5 0 0 1 0 19.8a12.5 12.5 0 0 1 0-19.8z";

export const MARK_VIEWBOX = "0 0 44 32";

/** The R/E mark. letters: false = circles only (for the 16px favicon, where letters can't be read). */
// The builders join arrays instead of using + between template strings: Next's production
// minifier folded "...fill="#0f766e"/>" + "<circle..." wrongly and dropped the `"/>`,
// which broke the mark in the build (fine in dev). join() is left alone by the minifier.
export function mark({ letters = true } = {}) {
  return [
    `<circle cx="14" cy="16" r="12.5" fill="${BRAND.teal}"/>`,
    `<circle cx="29" cy="16" r="12.5" fill="${BRAND.coral}"/>`,
    `<path d="${LENS}" fill="${BRAND.peach}"/>`,
    letters ? `<path d="${MARK_R}" fill="${BRAND.white}"/>` : "",
    letters ? `<path d="${MARK_E}" fill="${BRAND.white}"/>` : "",
  ].join("");
}

/** Mark + RADIANT (+ EDUCATIONS). dark: white RADIANT, light-orange EDUCATIONS. */
export function lockup({ dark = false, edu = true } = {}) {
  const word = dark ? BRAND.white : BRAND.ink;
  const sub = dark ? BRAND.eduTextDark : BRAND.eduText;
  const inner = [
    mark(),
    `<path d="${edu ? WORD_RADIANT : WORD_RADIANT_ALONE}" fill="${word}"/>`,
    edu ? `<path d="${WORD_EDUCATIONS}" fill="${sub}"/>` : "",
  ].join("");
  return { viewBox: `0 0 ${LOCKUP_WIDTH} 32`, inner };
}

// Loader: square box around the mark
export const LOADER_VIEWBOX = "-4 -10 52 52";

/**
 * Loader: the two circles gently drift apart and back together (the overlap breathes).
 * animated: false = the still mark (used for reduced motion).
 */
export function loader({ id = "rl", animated = true } = {}) {
  const drift = (dx: number) =>
    animated
      ? `<animateTransform attributeName="transform" type="translate" values="0 0;${dx} 0;0 0" dur="1.8s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>`
      : "";
  const L = drift(-2.5); // teal moves left
  const R = drift(2.5); // coral moves right
  return [
    `<defs><clipPath id="${id}-lens"><circle cx="29" cy="16" r="12.5">${R}</circle></clipPath></defs>`,
    `<g><circle cx="14" cy="16" r="12.5" fill="${BRAND.teal}"/>${L}</g>`,
    `<g><circle cx="29" cy="16" r="12.5" fill="${BRAND.coral}"/>${R}</g>`,
    // the overlap: the teal circle (moving with teal) cut to the coral circle (moving with coral)
    `<g clip-path="url(#${id}-lens)"><g><circle cx="14" cy="16" r="12.5" fill="${BRAND.peach}"/>${L}</g></g>`,
    `<g><path d="${MARK_R}" fill="${BRAND.white}"/>${L}</g>`,
    `<g><path d="${MARK_E}" fill="${BRAND.white}"/>${R}</g>`,
  ].join("");
}

/** A standalone SVG file (public/brand, app/icon.svg). */
export function svgDoc(viewBox: string, inner: string, title = "Radiant Educations") {
  const [, , w, h] = viewBox.split(" ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${w}" height="${h}" role="img" aria-label="${title}"><title>${title}</title>${inner}</svg>\n`;
}
