import { forEach } from "./optimized";

export default class Settings {
	constructor({ sfxVol, musicVol, lang }) {
		this.elements = {
			sfxVol,
			musicVol,
			lang
		};
		this.listeners = [];

		this.elements.sfxVol.addEventListener("mouseup", () => {
			forEach(this.listeners, (onInput) => {
				onInput("sfxVol", this.getSlider("sfxVol"));
			});
		});
		this.elements.musicVol.addEventListener("mouseup", () => {
			forEach(this.listeners, (onInput) => {
				onInput("musicVol", this.getSlider("musicVol"));
			});
		});
		this.elements.lang.addEventListener("change", () => {
			forEach(this.listeners, (onInput) => {
				onInput("lang", this.getInput("lang"));
			});
		});
	}

	addListener(cb) {
		this.listeners.push(cb);

		cb("sfxVol", this.getSlider("sfxVol"));
		cb("musicVol", this.getSlider("musicVol"));
		cb("lang", this.getInput("lang"));
	}

	getSlider(el, scale = 100) {
		return this.getInput(el) / scale;
	}

	getInput(el) {
		let element = this.elements[el];

		return element.value;
	}
}
