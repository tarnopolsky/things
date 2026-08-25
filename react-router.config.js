export default {
  // This site has one route, no loaders, no actions and no forms — every chapter
  // and photo reference is baked into the bundle at build time. There is nothing
  // for a runtime server to decide, so we prerender to static HTML instead and
  // deploy build/client/ straight to a CDN.
  ssr: false,
  prerender: true,
  // GitHub Pages serves this from a subpath. Keep in sync with `base` in vite.config.js.
  basename: "/things/",
};
