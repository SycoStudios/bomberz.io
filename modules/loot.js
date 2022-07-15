import { absCeil, calcDistance, deg2Rad } from "./math.js";
import { idFromCategory } from "./meta/objCategories.js";
import { items, itemFromId } from "./meta/itemTypes.js";

export default class Loot {
	constructor(x = 0, y = 0, id = 0, item, local = false) {
		this.x = x;
		this.y = y;
		this.id = id;
		this.item = item;
		this.category = idFromCategory("loot");
		this.seenList = [];
		this._isLocal = local;
		this.qty = 0;
	}

	move(x, y, reset = true) {
		if (this.dead) return;

		this.x = reset ? x : this.x + x;
		this.y = reset ? y : this.y + y;

		this.update();
	}

	create({ Sprite, Container, Circle, system }) {
		if (this._isLocal) {
			this._container = new Container();
			this._background = Sprite.from(
				new URL("../src/img/loot_background.png?as=webp&width=200", import.meta.url).href
			);
			this._item = Sprite.from(
				new URL(items[itemFromId(this.item)].lootImage, import.meta.url).href
			);
			this.item = itemFromId(this.item);

			this._background.width = 1.6;
			this._background.height = 1.6;
			this._background.anchor.set(0.5, 0.5);
			this._background.alpha = 0.7;

			this._item.width = 1.6;
			this._item.height = 1.6;
			this._item.anchor.set(0.5, 0.5);

			this._container.addChild(this._background, this._item);

			this.move(this.x, this.y);

			return this._container;
		} else {
			this._collider = new Circle(
				{
					x: this.x,
					y: this.y
				},
				0.8
			);
			this._collider.__type = "loot";
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

		this.change();
		this.destroyed = true;
	}

	change() {
		this.seenList = [];
	}

	update() {
		if (this._isLocal) {
			this._container.position.set(this.x, this.y);
		} else {
			this._collider.setPosition(this.x, this.y);
			this.change();
		}
	}
}
