export const skins = {
	bomb_skin_01: {
		width: 2,
		height: 2.83,
		center: 182.8 / 283,
		handColor: 0x453939,
		image: new URL("../../src/img/skins/bomb_skin_01.png?as=webp&width=300", import.meta.url)
			.href
	},
	bomb_skin_02: {
		width: 2,
		height: 2.83,
		center: 182.8 / 283,
		handColor: 0x453939,
		image: new URL("../../src/img/skins/bomb_skin_02.png?as=webp&width=300", import.meta.url)
			.href
	}
};
const skinNames = Object.keys(skins);

export const idFromSkin = (obj) => {
	let index = skinNames.indexOf(obj);

	return index >= 0 ? index : undefined;
};

export const skinFromId = (id) => {
	return skinNames[id];
};
