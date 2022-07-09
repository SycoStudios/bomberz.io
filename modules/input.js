import { rad2Deg } from "./math";

export class Input {
	constructor() {
		this.buttons = {};
		this.keys = {};
		this.keysOld = {};
		this.buttonsOld = {};
		this.mouseX = 0;
		this.mouseY = 0;

		this._ui = document.querySelector("#ui");
		this._cbs = [];
	}

	getButtonDown(button) {
		return !!this.buttons[button];
	}

	getKeyDown(key) {
		return !!this.keys[key];
	}

	on(e, cb) {
		if (e == "change") this._cbs.push(cb);
	}

	onInput(e) {
		switch (e.type) {
			case "keydown": {
				this.keys[e.key] = true;
				break;
			}
			case "keyup": {
				this.keys[e.key] = false;
				break;
			}
			case "mousedown": {
				if (this._ui.contains(e.target)) break;

				this.buttons[e.button] = true;
				break;
			}
			case "mouseup": {
				this.buttons[e.button] = false;
				break;
			}
			case "mousemove": {
				this.mouseX = e.pageX;
				this.mouseY = e.pageY;
				break;
			}
			case "wheel": {
				this.weapChange = e.deltaY / Math.abs(e.deltaY);
				break;
			}
			case "contextmenu": {
				e.preventDefault();
				break;
			}
		}

		this._cbs.forEach((cb) => cb(this));
	}

	get bound() {
		return this.onInput.bind(this);
	}

	get mouseAngle() {
		return (
			Math.atan2(this.mouseY - window.innerHeight / 2, this.mouseX - window.innerWidth / 2) *
			rad2Deg
		);
	}
}
