export const categories = ["loot", "object"];

export const idFromCategory = (cat) => {
	let index = categories.indexOf(cat);

	return index >= 0 ? index : undefined;
};

export const categoryFromId = (id) => {
	return categories[id];
};
