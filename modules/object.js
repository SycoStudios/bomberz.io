import { idFromCategory } from "./meta/objCategories.js";
import { objects, objFromId } from "./meta/objects.js";

export default class Object {
	constructor(x = 0, y = 0, id = 0, type, local = false) {
		this.x = x;
		this.y = y;
		this.id = id;
		this.type = type;
		this.category = idFromCategory("object");
		this.seenList = [];
		this.destructible = !!objects[type].health;
		this.dontScale = !!objects[type].dontScale;
		this.health = objects[type].health || 100;
		this.layer = objects[type].layer || "objects";
		this._isLocal = local;
		this._scale = 1;
	}

	get originalHealth() {
		return objects[this.type].health || 100;
	}

	get scale() {
		return this._scale;
	}

	set scale(value) {
		this._scale = value;

		if (this._isLocal && this._container) {
			this._container.scale.set(value, value);
		}

		if (!!this._collider && !!this._collisionCache) {
			this._collisionCache.system.remove(this._collider);
			this.createCollider(this._collisionCache, value);
			this.change();
		}
	}

	move(x, y, reset = true) {
		if (this.destroyed) return;

		this.x = reset ? x : this.x + x;
		this.y = reset ? y : this.y + y;

		this.update();
	}

	create({ Sprite, Container, Box, Circle, Polygon, system }, collisions = false) {
		if (!this._isLocal || collisions) {
			this._collisionCache = { Box, Circle, Polygon, system };
			this.createCollider({ system, Box, Circle, Polygon });
		}
		if (this._isLocal) {
			let object = objects[this.type];

			if (!object.worldImage) return;

			this._container = new Container();
			this._body = Sprite.from(new URL(object.worldImage, import.meta.url).href);

			this._body.width = object.width;
			this._body.height = object.height;
			this._body.anchor.set(0.5, 0.5);

			this._container.addChild(this._body);

			this.move(this.x, this.y);

			return this._container;
		}
	}

	destroy(system) {
		if (this._isLocal) {
			this._container.destroy();
		}
		if (!!this._collider) {
			system.remove(this._collider);
		}

		if (this.onDestroy) {
			this.onDestroy(this.x, this.y, this.type);
		}

		this.change();
		this.destroyed = true;
	}

	damage(amnt, system) {
		if (this.destroyed || !this.destructible) return;

		this.health -= amnt;
		if (this.health <= 0) {
			this.health = 0;
			this.destroy(system);
		}

		if (this.destructible && !this.dontScale) {
			this.scale = this.health / this.originalHealth / 2 + 0.5;
		}
	}

	change() {
		this.seenList = [];
	}

	createCollider({ system, Box, Circle, Polygon }, scale = 1) {
		let object = objects[this.type];

		if (!object.collider) return;

		if (object.collider.type == "box") {
			this._collider = new Box(
				{
					x: this.x - (object.collider.width * scale) / 2,
					y: this.y - (object.collider.height * scale) / 2
				},
				object.collider.width * scale,
				object.collider.height * scale
			);
		} else if (object.collider.type == "circle") {
			this._collider = new Circle(
				{
					x: this.x,
					y: this.y
				},
				object.collider.radius * scale
			);
		} else if (object.collider.type == "poly") {
			this._collider = new Polygon({ x: this.x, y: this.y }, object.collider.points);
		}

		this._collider.__type = "object";
		this._collider.__oid = this.id;

		system.insert(this._collider);
	}

	update() {
		if (this._isLocal) {
			this._container.position.set(this.x, this.y);
		}
		if (!!this._collider) {
			let object = objects[this.type];

			if (object.collider.width) {
				this._collider.setPosition(
					this.x - object.collider.width / 2,
					this.y - object.collider.height / 2
				);
			} else {
				this._collider.setPosition(this.x, this.y);
			}
			this.change();
		}
	}
}
