import { idFromCategory } from "./meta/objCategories.js";
import { objects, objFromId } from "./meta/objects.js";
import { getRandomInt } from "./math.js"

export default class Object {
	constructor(x = 0, y = 0, id = 0, type, local = false) {
		this.x = x;
		this.y = y;
		this.id = id;
		this.type = type;
		this.category = idFromCategory("object");
		this.seenList = [];
		this.health = objects[type].health || 100;
		this.layer = objects[type].layer || "objects";
		this._isLocal = local;
	}

	move(x, y, reset = true) {
		if (this.destroyed) return;

		this.x = reset ? x : this.x + x;
		this.y = reset ? y : this.y + y;

		this.update();
	}

	create({ Sprite, Container, Box, Circle, system }) {
		if (this._isLocal) {
			let object = objects[this.type];

			this._container = new Container();
			this._body = Sprite.from(new URL(object.worldImage, import.meta.url).href);

			this._body.width = object.width;
			this._body.height = object.height;
			this._body.anchor.set(0.5, 0.5);

			this._container.addChild(this._body);

			this.move(getRandomInt(15), getRandomInt(15));

			return this._container;
		} else {
			let object = objects[this.type];

			if (object.collider.type == "box") {
				this._collider = new Box(
					{
						x: this.x - object.collider.width / 2,
						y: this.y - object.collider.height / 2
					},
					object.collider.width,
					object.collider.height
				);
			} else if (object.collider.type == "circle") {
				this._collider = new Circle(
					{
						x: this.x,
						y: this.y
					},
					object.collider.radius
				);
			}
			this._collider.__type = "object";
			this._collider.__oid = this.id;

			system.insert(this._collider);
		}
	}

	destroy(system) {
		if (this._isLocal) {
			this._container.destroy();
		} else {
			system.remove(this._collider);
		}

		if (this.onDestroy) {
			this.onDestroy(this.x, this.y, this.type);
		}

		this.change();
		this.destroyed = true;
	}

	damage(amnt, system) {
		if (this.destroyed) return;

		this.health -= amnt;
		if (this.health <= 0) {
			this.health = 0;
			this.destroy(system);
		}
	}

	change() {
		this.seenList = [];
	}

	update() {
		if (this._isLocal) {
			this._container.position.set(this.x, this.y);
		} else {
			let object = objects[this.type];

			this._collider.setPosition(
				this.x - object.collider.width / 2,
				this.y - object.collider.height / 2
			);
			this.change();
		}
	}
}
