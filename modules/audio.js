import { Howl, Howler } from "howler";
import { calcDistance, clamp } from "./math";

export const Audio = class {
	constructor() {
		this.sounds = {
			assault_rifle_shoot: new Howl({
				src: new URL("../src/audio/ak47_shoot.mp3", import.meta.url).href
			}),
			burst_rifle_shoot: new Howl({
				src: new URL("../src/audio/ak47_shoot.mp3", import.meta.url).href
			}),
			pistol_shoot: new Howl({
				src: new URL("../src/audio/m1911_shoot.mp3", import.meta.url).href
			}),
			smg_shoot: new Howl({
				src: new URL("../src/audio/mp5_shoot.mp3", import.meta.url).href
			}),
			marksman_rifle_shoot: new Howl({
				src: new URL("../src/audio/m14_shoot.mp3", import.meta.url).href
			}),
			pump_shotgun_shoot: new Howl({
				src: new URL("../src/audio/r870_shoot.mp3", import.meta.url).href
			}),
			title_looped: new Howl({
				src: new URL("../src/audio/title_theme_looped.mp3", import.meta.url).href,
				volume: 0.5,
				loop: true
			})
		};
		this.x = 0;
		this.y = 0;
	}

	playSound(name, listener, end = () => {}) {
		let sound = this.sounds[name];
		let instance = sound.play();

		//sound.pos(-(this.x - listener.x), this.y - listener.y, 0, instance);
		sound.stereo(clamp(((this.x - listener.x) / 28) * -1, -1, 1), instance);
		sound.volume(
			(1 - clamp(calcDistance(this.x, this.y, listener.x, listener.y) / 28, 0, 1)) *
				this.volume,
			instance
		);

		sound.once(
			"end",
			(() => {
				end(this);
			}).bind(this),
			instance
		);

		return instance;
	}

	playMenuTheme() {
		this.sounds.title_looped.play();
	}

	stopMenuTheme() {
		this.sounds.title_looped.stop();
	}

	setPos(x, y) {
		this.x = x;
		this.y = y;
	}
};
