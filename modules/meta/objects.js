// Types of objects and information about them

// this is just meta data, information. Actual logic for objects can be done in Object.js

//Spawning of the Objects are done in server.js
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
		health: 110,
		contentRarity: 0
	},
	crate_02: {
		worldImage: new URL("../../src/img/crate_02.png?as=webp&width=400", import.meta.url).href,
		width: 2.73,
		height: 1.58,
		collider: {
			type: "box",
			width: 2.64,
			height: 1.5
		},
		health: 110,
		contentRarity: 1
	},
	tree_01: {
		worldImage: new URL("../../src/img/tree_01.png?as=webp&width=1024", import.meta.url).href,
		width: 8,
		height: 7.76,
		collider: {
			type: "circle",
			radius: 0.8
		},
		health: 200,
		layer: "roofs",
		rotate: true
	},
	bomb: {
		worldImage: new URL("../../src/img/c4_normal.png?as=webp&width=300", import.meta.url).href,
		width: 2.05,
		height: 1.61,
		collider: {
			type: "box",
			width: 2.05,
			height: 1.21
		}
	},
	building_01: {
		compound: true,
		children: [
			{
				x: 0,
				y: 0,
				type: "crate_01"
			}
		]
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
