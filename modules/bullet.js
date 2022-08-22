import { calcDistance, deg2Rad } from "./math.js";

export class Bullet {
	constructor(x = 0, y = 0, angle = 45, local = false) {
		this.x = x;
		this.y = y;
		this.startX = this.x;
		this.startY = this.y;
		this.angle = angle;
		this.active = true;
		this._isLocal = local;
		this.deactivating = 0;
	}

	get distance() {
		return this._dist !== undefined
			? this._dist
			: calcDistance(this.x, this.y, this.startX, this.startY);
	}

	set distance(v) {
		this._dist = v;
	}

	move(d) {
		if (!this.active) return;

		this.x += d * Math.cos(this.angle * deg2Rad);
		this.y += d * Math.sin(this.angle * deg2Rad);

		this.update();
	}

	create({ Sprite, Container, Circle, system }, collisions) {
		if (!this._isLocal || collisions) {
			this._collider = new Circle(
				{
					x: this.x - Math.cos(this.angle * deg2Rad) * 0.15,
					y: this.y - Math.sin(this.angle * deg2Rad) * 0.15
				},
				0.3
			);
			this._collider.__type = "bullet";
			this._collider.__bid = this.id;

			system.insert(this._collider);
		}
		if (this._isLocal) {
			this._container = new Container();
			this._tracer = Sprite.from(
				new URL("../src/img/bullet_tracer.png?as=webp&width=200", import.meta.url).href
			);

			this._tracer.width = 5;
			this._tracer.height = 0.15;
			this._tracer.anchor.set(1, 0.5);
			this._tracer.tint = 0x000000;

			this._container.rotation = this.angle * deg2Rad;
			this._container.addChild(this._tracer);

			return this._container;
		}
	}

	update() {
		if (this._isLocal) {
			this._container.position.set(
				this.x + Math.cos(this.angle * deg2Rad) * 0.15,
				this.y + Math.sin(this.angle * deg2Rad) * 0.15
			);
			this._container.alpha = 0.8 * (1 - this.deactivating / 170);
			this._container.rotation = this.angle * deg2Rad;
			this._tracer.width = Math.min(9, this.distance * (1 - this.deactivating / 170) * 0.75);
		}
		if (!!this._collider) {
			this._collider.setPosition(
				this.x - Math.cos(this.angle * deg2Rad) * 0.15,
				this.y - Math.sin(this.angle * deg2Rad) * 0.15
			);
		}
	}
}
