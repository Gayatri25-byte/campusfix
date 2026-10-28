import '@testing-library/jest-dom/vitest'
// jsdom has no IntersectionObserver / matchMedia; the app falls back gracefully but tests make it explicit.
if (!window.matchMedia)
  window.matchMedia = (q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })
window.scrollTo = () => {}
