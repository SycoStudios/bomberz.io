// Types of objects and information about them
export const objects = {
	crate_01: {
		worldImage: new URL("../../src/img/crate_01.png?as=webp&width=400", import.meta.url).href,
		width: 2.7,
		height: 2.7,
		collider: {
			type: "box",
			width: 2.7,
			height: 2.7
		},
		health: 50,
		contentRarity: 0
	},
	crate_02: {
		worldImage: new URL("../../src/img/crate_02.png?as=webp&width=400", import.meta.url).href,
		width: 2.73,
		height: 1.58,
		collider: {
			type: "box",
			width: 2.73,
			height: 1.58
		},
		health: 50,
		contentRarity: 1
	},
	tree_01: {
		worldImage: new URL("../../src/img/tree_01.png?as=webp&width=1024", import.meta.url).href,
		width: 8,
		height: 7.76,
		collider: {
			type: "circle",
			radius: 0.4
		},
		health: 200,
		layer: "roofs"
	},
	tree_02: {
		worldImage: new URL("../../src/img/tree_01.png?as=webp&width=1024", import.meta.url).href,
		width: 4,
		height: 3.88,
		collider: {
			type: "circle",
			radius: 0.2
		},
		health: 200,
		layer: "roofs"
	}
};
// this is just meta data, information. Actual logic for objects can be done in Object.js
const objNames = Object.keys(objects);

export const idFromObj = (obj) => {
	let index = objNames.indexOf(obj);

	return index >= 0 ? index : undefined;
};

export const objFromId = (id) => {
	return objNames[id];
};
