import { forEach } from "./optimized";

export default class Settings {
	constructor(settingsKey, { sfxVol, musicVol, lang }) {
		this.elements = {
			sfxVol,
			musicVol,
			lang
		};
		this.settingsKey = settingsKey;
		this.listeners = [];
		this.token = "";

		this.elements.sfxVol.addEventListener("mouseup", () => {
			forEach(this.listeners, (onInput) => {
				onInput("sfxVol", this.getSlider("sfxVol"));
				this.save();
			});
		});
		this.elements.musicVol.addEventListener("mouseup", () => {
			forEach(this.listeners, (onInput) => {
				onInput("musicVol", this.getSlider("musicVol"));
				this.save();
			});
		});
		this.elements.lang.addEventListener("change", () => {
			forEach(this.listeners, (onInput) => {
				onInput("lang", this.getInput("lang"));
				this.save();
			});
		});
	}

	addListener(cb) {
		this.listeners.push(cb);

		cb("sfxVol", this.getSlider("sfxVol"));
		cb("musicVol", this.getSlider("musicVol"));
		cb("lang", this.getInput("lang"));
	}

	setToken(token) {
		this.token = token;
		this.save();
	}

	getSlider(el, scale = 100) {
		return this.getInput(el) / scale;
	}

	getInput(el) {
		let element = this.elements[el];

		return element.value;
	}

	load() {
		let storage = localStorage.getItem(this.settingsKey);

		if (storage) {
			storage = JSON.parse(Buffer.from(storage, "base64").toString());

			this.elements.sfxVol.value = storage.sfxVol * 100;
			this.elements.musicVol.value = storage.musicVol * 100;
			this.elements.lang.value = storage.lang;
			this.token = storage.token;
		}
	}

	save() {
		localStorage.setItem(
			this.settingsKey,
			Buffer.from(
				JSON.stringify({
					sfxVol: this.getSlider("sfxVol"),
					musicVol: this.getSlider("musicVol"),
					lang: this.getInput("lang"),
					token: this.token
				})
			).toString("base64")
		);
	}
}
