const { Namer } = require("@parcel/plugin");

module.exports = new Namer({
	name({ bundle }) {
		if (!bundle.needsStableName) {
			if (bundle.type === "webp") {
				return `img/${bundle.hashReference}.webp`;
			}
			if (bundle.type === "mp3") {
				return `audio/${bundle.hashReference}.mp3`;
			}
			if (bundle.type === "js") {
				return `js/${bundle.hashReference}.js`;
			}
			if (bundle.type === "css") {
				return `css/${bundle.hashReference}.css`;
			}
		}

		return null;
	}
});
