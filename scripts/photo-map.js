// Which source folder feeds which gallery group.
//
// Groups, not chapters: a chapter may hold several (Make has pottery/drawing/florals,
// Explore has one per trip). The chapter structure lives in app/data/chapters.js.
//
// Folders map 1:1 now that the photos are sorted on disk — adding a new group is one
// line here plus an entry in chapters.js. Anything not listed is ignored by the build.

export const SOURCES = {
  moments: [{ dir: "moments" }],

  pottery: [{ dir: "pottery" }],
  drawing: [{ dir: "drawing" }],
  florals: [{ dir: "florals" }],

  forSale: [{ dir: "forSale" }], // folder name is case-sensitive on Linux — keep the capital S
  houseplants: [{ dir: "houseplants" }],
  food: [{ dir: "cooking-baking-fooding" }],
  tennis: [{ dir: "tennis-and-sports" }],

  almond: [{ dir: "tripAlmondBlum" }],
  sakura: [{ dir: "tripSakkuraBlum" }],
  poppy: [{ dir: "tripPoppyBlum" }],
  deadsea: [{ dir: "tripDeadSea" }],
  jerusalem: [{ dir: "tripJerusalemHanukkah" }],

  museum: [{ dir: "museum" }],
};

// Photos that open a group. Everything else keeps filename (≈ chronological) order.
export const LEAD = {
  moments: "moments/IMG_1716.jpeg", // Jaffa at dusk
  pottery: "pottery/IMG_4015.jpeg", // hands closing a lid on the wheel
  drawing: "drawing/IMG_1492.jpeg", // pastel still life
  florals: "florals/4T3B0989.JPG", // the coral peony
  houseplants: "houseplants/IMG_3819.jpeg", // hoya in bloom
  food: "cooking-baking-fooding/IMG_1488.jpeg", // babka
  tennis: "tennis-and-sports/IMG_1519.jpeg", // empty court, big sky
  almond: "tripAlmondBlum/IMG_1941.jpeg",
  sakura: "tripSakkuraBlum/IMG_2008.jpeg",
  poppy: "tripPoppyBlum/IMG_2853.jpeg", // the poppy field
  deadsea: "tripDeadSea/IMG_3636.jpeg", // salt crust
  jerusalem: "tripJerusalemHanukkah/IMG_1081.jpeg",
  museum: "museum/IMG_3504.jpeg",
};
