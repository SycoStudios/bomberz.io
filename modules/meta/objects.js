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
		contentRarity: 1
	},
	tree_01: {
		worldImage: new URL("../../src/img/tree_01.png?as=webp&width=400", import.meta.url).href,
		width: 8,
		height: 7.76,
		collider: {
			type: "circle",
			radius: 0.8
		},
		layer: "roofs"
	},
	crate_03: {
		worldImage: new URL("../../src/img/crate_02.png?as=webp&width=400", import.meta.url).href,
		width: 2.73,
		height: 1.58,
		collider: {
			type: "box",
			width: 2.73,
			height: 1.58
		},
		contentRarity: 1
	}
};

const objNames = Object.keys(objects);

export const idFromObj = (obj) => {
	let index = objNames.indexOf(obj);

	return index >= 0 ? index : undefined;
};

export const objFromId = (id) => {
	return objNames[id];
};
