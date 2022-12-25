// Types of objects and information about them

// this is just meta data, information. Actual logic for objects can be done in Object.js

//Spawning of the Objects are done in server.js
export const objects = {
  crate_01: {
    worldImage: new URL(
      "../../src/img/crate_01.png?as=webp&width=400",
      import.meta.url
    ).href,
    width: 2.7,
    height: 2.7,
    collider: {
      type: "box",
      width: 2.7,
      height: 2.7,
    },
    health: 150,
    contentRarity: 0,
  },
  crate_02: {
    worldImage: new URL(
      "../../src/img/crate_02.png?as=webp&width=400",
      import.meta.url
    ).href,
    width: 2.73,
    height: 1.58,
    collider: {
      type: "box",
      width: 2.64,
      height: 1.5,
    },
    health: 150,
    contentRarity: 1,
  },
  tree_01: {
    worldImage: new URL(
      "../../src/img/tree_01.png?as=webp&width=1024",
      import.meta.url
    ).href,
    width: 8,
    height: 7.76,
    collider: {
      type: "circle",
      radius: 0.8,
    },
    health: 150,
    layer: "roofs",
    rotate: true,
  },
  bomb: {
    worldImage: new URL(
      "../../src/img/c4_normal.png?as=webp&width=300",
      import.meta.url
    ).href,
    width: 2.05,
    height: 1.61,
    collider: {
      type: "box",
      width: 2.05,
      height: 1.21,
    },
  },
  building_roof_01: {
    worldImage: new URL(
      "../../src/img/building_roof_01.png?as=webp&width=300",
      import.meta.url
    ).href,
    width: 28,
    height: 16.52,
  },
  building_layout_01: {
    worldImage: new URL(
      "../../src/img/building_layout_01.png?as=webp&width=3000",
      import.meta.url
    ).href,
    width: 26.5,
    height: 15.02,
  },
  building_floor_01: {
    worldImage: new URL(
      "../../src/img/building_floor_01.png?as=webp&width=3000",
      import.meta.url
    ).href,
    width: 25.85,
    height: 18.27,
    layer: "floors",
  },
  building_walls_a_01: {
    collider: {
      type: "poly",
      points: [
        { x: -11.25, y: -6.76 },
        { x: -12.5, y: -6.76 },
        { x: -12.5, y: 6.75 },
        { x: -3.1, y: 6.75 },
        { x: -3.1, y: 0.41 },
        { x: -2.35, y: 0.41 },
        { x: -2.35, y: 6.75 },
        { x: 0.77, y: 6.75 },
        { x: 0.77, y: 7.5 },
        { x: -13.25, y: 7.5 },
        { x: -13.25, y: -7.51 },
        { x: -11.25, y: -7.51 },
      ],
    },
  },
  building_walls_b_01: {
    collider: {
      type: "poly",
      points: [
        { x: -7.75, y: -7.51 },
        { x: -7.75, y: -6.76 },
        { x: 4.74, y: -6.76 },
        { x: 4.74, y: 2.39 },
        { x: 5.49, y: 2.39 },
        { x: 5.49, y: -2.78 },
        { x: 9, y: -2.78 },
        { x: 9, y: -3.53 },
        { x: 5.49, y: -3.53 },
        { x: 5.49, y: -6.76 },
        { x: 12.5, y: -6.76 },
        { x: 12.5, y: 6.75 },
        { x: 5.49, y: 6.75 },
        { x: 5.49, y: 5.89 },
        { x: 4.74, y: 5.89 },
        { x: 4.74, y: 6.75 },
        { x: 4.27, y: 6.75 },
        { x: 4.27, y: 7.5 },
        { x: 13.25, y: 7.5 },
        { x: 13.25, y: -7.51 },
      ],
    },
  },
  toilet_01: {
    worldImage: new URL(
      "../../src/img/toilet_01.png?as=webp&width=300",
      import.meta.url
    ).href,
    width: 2.51,
    height: 1.64,
    health: 110,
    collider: {
      type: "poly",
      points: [
        { x: -1.25, y: -0.69 },
        { x: -1.09, y: -0.82 },
        { x: -0.58, y: -0.82 },
        { x: -0.42, y: -0.67 },
        { x: -0.15, y: -0.6 },
        { x: 0.17, y: -0.72 },
        { x: 0.57, y: -0.67 },
        { x: 0.98, y: -0.46 },
        { x: 1.18, y: -0.24 },
        { x: 1.25, y: 0 },
        { x: 1.18, y: 0.24 },
        { x: 0.98, y: 0.46 },
        { x: 0.57, y: 0.67 },
        { x: 0.17, y: 0.72 },
        { x: -0.15, y: 0.6 },
        { x: -0.42, y: 0.67 },
        { x: -0.58, y: 0.82 },
        { x: -1.09, y: 0.82 },
        { x: -1.25, y: 0.69 },
      ],
    },
  },
  bed_01: {
    worldImage: new URL(
      "../../src/img/bed_01.png?as=webp&width=300",
      import.meta.url
    ).href,
    width: 3.08,
    height: 4.63,
    health: 100,
    collider: {
      type: "box",
      width: 3.08,
      height: 4.63,
    },
  },
  oven_01: {
    worldImage: new URL(
      "../../src/img/oven_01.png?as=webp&width=300",
      import.meta.url
    ).href,
    width: 2.19,
    height: 2.03,
    health: 200,
    collider: {
      type: "poly",
      points: [
        { x: -0.96, y: -1.01 },
        { x: 0.96, y: -1.01 },
        { x: 0.96, y: 1.01 },
        { x: -0.96, y: 1.01 },
      ],
    },
    reflective: true,
  },
  fridge_01: {
    worldImage: new URL(
      "../../src/img/fridge_01.png?as=webp&width=300",
      import.meta.url
    ).href,
    width: 2.36,
    height: 2.8,
    health: 200,
    collider: {
      type: "poly",
      points: [
        { x: -0.82, y: -1.4 },
        { x: 1.18, y: -1.4 },
        { x: 1.18, y: 1.4 },
        { x: -0.82, y: 1.4 },
        { x: -0.98, y: 0.71 },
        { x: -1.03, y: 0 },
        { x: -0.98, y: -0.71 },
      ],
    },
  },
  table_01: {
    worldImage: new URL(
      "../../src/img/table_01.png?as=webp&width=475",
      import.meta.url
    ).href,
    width: 4.75,
    height: 3.07,
    layer: "roofs",
    health: 100,
  },
  building_01: {
    compound: true,
    children: [
      {
        x: 0,
        y: 0,
        type: "building_layout_01",
      },
      {
        x: 0,
        y: 0,
        type: "building_floor_01",
      },
      { x: 0, y: 0, type: "building_walls_a_01" },
      { x: 0, y: 0, type: "building_walls_b_01" },
      { x: -9.15, y: 3.75, type: "table_01" },
      { x: -4.41, y: 5.15, type: "fridge_01" },
      { x: -4.39, y: 2.22, type: "oven_01" },
      { x: -0.82, y: 2.23, type: "crate_01" },
      { x: -0.82, y: 5.18, type: "crate_01" },
      { x: 7.23, y: -0.24, type: "bed_01" },
      { x: 6.92, y: -5.18, type: "toilet_01" },
    ],
  },
};
const objNames = Object.keys(objects);

export const idFromObj = (obj) => {
	let index = objNames.indexOf(obj);

	return index >= 0 ? index : undefined;
};

export const objFromId = (id) => {
	return objNames[id];
};
