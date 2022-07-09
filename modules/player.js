import { calcDistance, deg2Rad, lerp } from "./math.js";
import { animations } from "./meta/animations.js";
import { weapons } from "./meta/weapons.js";

export class Player {
	constructor(local = false) {
		this.x = 0;
		this.y = 0;
		this.angle = 0;
		this.health = 100;
		this.dead = false;
		this.weapons = [
			{ type: "r870", ammo: 1 },
			{ type: "m1911", ammo: 1 },
			{ type: "fists", ammo: "" },
			{ type: "", ammo: "" }
		];
		this.curWeap = 0;
		this.changed = false;
		this.seenList = [];
		this._isLocal = local;
	}

	move(x, y, reset = true) {
		if (this.dead && !this._isLocal) return;

		this.x = reset ? x : this.x + x;
		this.y = reset ? y : this.y + y;

		this.update();
	}

	rotate(angle) {
		if (this.dead && !this._isLocal) return;

		if (angle !== this.angle) this.inputChanged = true;

		this.angle = angle;

		if (this._isLocal) {
			this._container.rotation = this.angle * deg2Rad;
		}
	}

	damage(amnt, system) {
		this.health -= amnt;

		if (this.health <= 0) {
			this.dead = true;
			this.health = 0;

			system.remove(this._collider);

			this.change();
		}
	}

	canSee(x, y, r = 0) {
		return calcDistance(x, y, this.x, this.y) <= 14 + r;
	}

	update() {
		if (this._isLocal) {
			this._container.position.set(this.x, this.y);
		} else {
			this._collider.setPosition(this.x, this.y);
		}

		this.change();
	}

	create({ Sprite, Container, Text, TextStyle, Circle, system }) {
		// Client or server?
		if (this._isLocal) {
			// Client create code goes here
			this._container = new Container();
			// possibly make another container and put this._container and this._username in it, use it for movement, but use this._container for rotation

			this._playerBody = Sprite.from(
				new URL("../src/img/player_body.png?as=webp&width=200", import.meta.url).href
			);
			this._leftHand = Sprite.from(
				new URL("../src/img/player_body.png?as=webp&width=100", import.meta.url).href
			);
			this._rightHand = Sprite.from(
				new URL("../src/img/player_body.png?as=webp&width=100", import.meta.url).href
			);
			this._weapsContainer = new Container();
			this._weapon = Sprite.from(weapons.mp5.bodyImage);
			this._playerRip = Sprite.from(
				new URL("../src/img/rip.png?as=webp&width=200", import.meta.url).href
			);

			this._playerRip.width = 1.8;
			this._playerRip.height = 1.8;
			this._playerRip.anchor.set(0.5, 0.5);
			this._playerRip.visible = false;

			this._playerBody.width = 2;
			this._playerBody.height = 2;
			this._playerBody.anchor.set(0.5, 0.5);
			this._playerBody.tint = 0xfce6b6;

			this._leftHand.width = 0.7;
			this._leftHand.height = 0.7;
			this._leftHand.anchor.set(0.5, 0.5);
			this._leftHand.position.set(animations.fists.left.x, animations.fists.left.y);
			this._leftHand.tint = 0xe3d0a3;

			this._rightHand.width = 0.7;
			this._rightHand.height = 0.7;
			this._rightHand.anchor.set(0.5, 0.5);
			this._rightHand.position.set(animations.fists.right.x, animations.fists.right.y);
			this._rightHand.tint = 0xe3d0a3;

			this._weapon.visible = false;
			this._weapon.width = 0;
			this._weapon.height = 0;

			this._weapsContainer.addChild(this._weapon, this._leftHand, this._rightHand);
			this._container.addChild(this._playerBody, this._weapsContainer, this._playerRip);

			this.move(this.x, this.y);

			return this._container;
		} else {
			// Server create code
			this._collider = new Circle({ x: this.x, y: this.y }, 1);
			this._collider.__type = "player";
			this._collider.__pid = this.id;

			system.insert(this._collider);
		}
	}

	setWeap(weap, Sprite) {
		const weapStats = weapons[weap];

		switch (weapStats.type) {
			case "melee": {
				this._weapon.visible = false;
				break;
			}
			case "gun": {
				if (this._weapon.type != weap) {
					this._weapon.visible = false;
					this._weapsContainer.removeChild(this._weapon);
					this._weapon.destroy();
					this._weapon = new Sprite.from(weapons[weap].bodyImage);
					this._weapon.type = weap;
					this._weapsContainer.addChild(this._weapon);
					this._weapon.width = weapStats.width;
					this._weapon.height = weapStats.height;
					this._weapon.anchor.set(0, 0.5);
				}

				this._weapon.position.set(
					this._rightHand.position.x +
						(animations[weap].gun.x - animations[weap].right.x),
					this._rightHand.position.y + (animations[weap].gun.y - animations[weap].right.y)
				);

				this._weapon.visible = true;
				break;
			}
		}
	}

	animate(anim) {
		let now = Date.now();

		if (this.animating) {
			let data = animations[this.animation];
			let t = (now - this.startedAnim) / (data.length || 150);
			let done =
				data.left.x == this._leftHand.position.x &&
				data.left.y == this._leftHand.position.y &&
				data.right.x == this._rightHand.position.x &&
				data.right.y == this._rightHand.position.y;

			this._leftHand.position.set(
				lerp(this._leftHand.position.x, data.left.x, t),
				lerp(this._leftHand.position.y, data.left.y, t)
			);
			this._rightHand.position.set(
				lerp(this._rightHand.position.x, data.right.x, t),
				lerp(this._rightHand.position.y, data.right.y, t)
			);

			if (t >= 1 || done) {
				this.animating = false;
				this.lastAnim = this.animation;

				if (this.animation !== this.idleAnim) {
					this.lastPunch = now;
				}
			}

			return;
		}

		this.animating = true;
		this.animation = anim == this.lastAnim || now - this.lastPunch < 150 ? this.idleAnim : anim;
		this.startedAnim = now;
	}

	change() {
		this.seenList = [];
	}

	get speed() {
		return 0.16;
	}
}
