import { weapons } from "./weapons.js";

export const items = { ...weapons };

const itemTypes = Object.keys(items);

export const idFromItem = (weap) => {
	let index = itemTypes.indexOf(weap);

	return index >= 0 ? index : undefined;
};

export const itemFromId = (id) => {
	return itemTypes[id];
};
