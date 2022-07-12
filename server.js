import geckos, { iceServers } from "@geckos.io/server";
import crypto from "crypto";
import { Player } from "./modules/player.js";
import { Bullet } from "./modules/bullet.js";
import { forEach, map, filter } from "./modules/optimized.js";
import { gameState, welcomeState, inputState, localState } from "./models/index.js";
import { actions } from "./modules/meta/actions.js";
import { weapons, idFromWeap } from "./modules/meta/weapons.js";
import { Circle, Box, System } from "detect-collisions";
import { calcDistance, clamp, deg2Rad } from "./modules/math.js";
import { animations } from "./modules/meta/animations.js";
import { idFromItem, items } from "./modules/meta/itemTypes.js";
import { messageIds } from "./modules/meta/messageIds.js";
import { BitArray } from "@codezilluh/bitarray.js";
import LootClass from "./modules/loot.js";
import ObjectClass from "./modules/object.js";
import { idFromObj, objects, objFromId } from "./modules/meta/objects.js";
import { categoryFromId } from "./modules/meta/objCategories.js";
import bullets from "./models/bullets.js";
import { gameModes } from "./modules/meta/gameModes.js";

const mapPlayers = (players) =>
	map(players, (p) => {
		return {
			x: p.x,
			y: p.y,
			dead: p.dead,
			angle: p.angle,
			action:
				p.shooting || p.shouldSendShoot
					? p.curWeap == 2
						? actions.punch
						: actions.shoot
					: actions.none,
			curWeap: idFromWeap(p.weapons[p.curWeap].type),
			id: p.id
		};
	});
const mapObjects = (objects) =>
	map(objects, (o) => {
		return {
			x: o.x,
			y: o.y,
			category: o.category,
			destroyed: o.destroyed,
			data: idFromItem(o.item) || idFromObj(o.type),
			id: o.id
		};
	});
const mapBullets = (bullets) =>
	map(bullets, (b) => {
		return {
			x: b.x,
			y: b.y,
			startX: b.startX,
			startY: b.startY,
			deactivating: Math.min(Math.max(0, Date.now() - b.deactivated), 170),
			angle: b.angle
		};
	});
const cycle = (num) => {
	return num > 3 ? cycle(num - 4) : num < 0 ? cycle(num + 4) : num;
};
const changeWeap = (id, dir, weapons) => {
	let hasWeap = Object.keys(weapons).filter((v, i) => weapons[i].type !== "");

	if (hasWeap.length == 1) return 2;

	const find = (x) => {
		let combo = cycle(x);

		if (hasWeap.includes(combo.toString())) return combo;

		return find(x + dir);
	};

	return find(id + dir);
};

const Game = class {
	constructor(server) {
		this.fps = 60;
		this.sendRate = 30;
		this.tickLength = 1000 / this.fps;
		this.previousTick = Date.now();
		this.previousSend = Date.now();
		this.actualTicks = 0;
		this.inLoop = false;

		this.gameId = crypto.randomBytes(36).toString("hex");
		this.gameMode = gameModes.diffuse;

		this.players = [];
		this.objects = [];
		this.bullets = [];

		this.map = {
			min: -300,
			max: 300,
			pad: 24
		};

		this.collisionSystem = new System();

		// Loot Spawning from Objects.js
		for (var i = 0; i < 20; i++) {
			this.spawnLoot(0, 5, Math.random() > 0.5 ? "mp5" : "m14");
		}

		// Object Spawning from Objects.js
		this.spawnObject(5, 5, `crate_02`);
		this.spawnObject(2, 0, `crate_01`);
		this.spawnObject(-6, 2, `tree_01`);
		this.spawnObject(-10, 4, `tree_01`);

		this.server = server;
		this.room = server.raw.room(this.gameId);

		const gameLoop = () => {
			var now = Date.now();

			this.actualTicks++;
			if (this.previousTick + this.tickLength <= now) {
				var delta = (now - this.previousTick) / (1000 / 60);
				this.previousTick = now;

				this.update(delta);

				this.actualTicks = 0;
			}

			if (Date.now() - this.previousTick < this.tickLength - 16) {
				setTimeout(gameLoop);
			} else {
				setImmediate(gameLoop);
			}
		};

		gameLoop();
	}

	spawnBullet(x, y, dir, owner, type, moving) {
		let bullet = new Bullet(
			x + (weapons[type].width + animations[type].gun.x - 0.4) * Math.cos(dir * deg2Rad),
			y + (weapons[type].width + animations[type].gun.x - 0.4) * Math.sin(dir * deg2Rad),
			dir + (weapons[type].spread || 3) * (moving ? 2 : 1) * (2 * (Math.random() - 0.5))
		);

		bullet.owner = owner;
		bullet.speed = weapons[type].bulletSpeed || 0.2;
		bullet.range = weapons[type].range || 10;
		bullet.damage = weapons[type].damage || 5;
		bullet.create({ system: this.collisionSystem, Circle });

		this.bullets.push(bullet);
	}

	spawnLoot(x, y, type, qty = 0, create = true) {
		let item = new LootClass(x, y, this.objects.length, type);

		this.objects.push(item);

		if (create) {
			item.create({ Circle, system: this.collisionSystem });
		}

		item.qty = qty;

		return item;
	}

	spawnObject(x, y, type, create = true) {
		let object = new ObjectClass(x, y, this.objects.length, type);

		this.objects.push(object);

		if (create) {
			object.create({
				Circle,
				Box,
				system: this.collisionSystem
			});
		}

		if (type.includes("crate")) {
			object.onDestroy = this.crateDestroyed.bind(this);
		}

		return object;
	}

	crateDestroyed(x, y, type) {
		let rarity = objects[type].contentRarity;

		this.spawnLoot(x, y, "mp5");
	}

	inMap(x, y, pad = false, rad = 0) {
		let min = this.map.min + rad - (pad ? this.map.pad : 0);
		let max = this.map.max - rad + (pad ? this.map.pad : 0);

		return x >= min && y >= min && x <= max && y <= max;
	}

	update(delta) {
		if (this.inLoop) return;

		this.inLoop = true;

		let now = Date.now();
		let shouldSend = now - this.previousSend >= 1000 / this.sendRate;

		// do logic
		forEach(this.bullets, (bullet) => {
			let now = Date.now();

			if (!bullet.active && now - bullet.deactivated > 170) {
				bullet.done = true;
			}

			if (bullet.active) {
				bullet.move(bullet.speed * delta);

				const potentials = this.collisionSystem.getPotentials(bullet._collider);

				potentials.some((collider) => {
					if (
						collider.__type == "bullet" ||
						collider.__type == "loot" ||
						(collider.__type == "player" && collider.__pid == bullet.owner)
					)
						return false;

					if (this.collisionSystem.checkCollision(bullet._collider, collider)) {
						const { overlap, overlapN } = this.collisionSystem.response;

						if (collider.__type == "player") {
							let player = this.players[collider.__pid];

							if (player.dead) return false;

							player.damage(bullet.damage, this.collisionSystem);
						}

						if (collider.__type == "object") {
							let object = this.objects[collider.__oid];

							if (object.destroyed) return false;

							object.damage(bullet.damage, this.collisionSystem);
						}

						bullet.move(-overlap);
						bullet.active = false;
						bullet.deactivated = now;
						this.collisionSystem.remove(bullet._collider);

						return true;
					}
				});

				if (bullet.distance > bullet.range || !this.inMap(bullet.x, bullet.y, true)) {
					bullet.active = false;
					bullet.deactivated = now;
					this.collisionSystem.remove(bullet._collider);
				}
			}
		});
		forEach(this.players, (player) => {
			if (player.dead) return;
			if (player.disconnected) return;
			if (!player.lastHealth) {
				player.lastHealth = player.health;
			}

			let moveX = player.moveRight - player.moveLeft;
			let moveY = player.moveDown - player.moveUp;

			if (moveX || moveY) {
				let moveDir = Math.atan2(moveY, moveX);

				player.move(
					Math.cos(moveDir) * player.speed * delta,
					Math.sin(moveDir) * player.speed * delta,
					false
				);
			}

			if (!this.inMap(player.x, player.y, false, 1)) {
				player.move(
					clamp(player.x, this.map.min + 1, this.map.max - 1),
					clamp(player.y, this.map.min + 1, this.map.max - 1),
					true
				);
			}

			let weap = player.weapons[player.curWeap] || {};
			let weapStats = weapons[weap.type];

			if (!weapStats) {
				player.curWeap = 2;
				weap = player.weapons[2];
				weapStats = weapons[weap.type];
			}

			if (!player.lastShot) player.lastShot = 0;

			player.shooting = false;

			if (!player.mouseDown && player.mouseWasDown) {
				player.change();
				player.mouseWasDown = false;
			}

			if (player.mouseDown && now - player.lastShot > (weapStats.shootDelay || 150)) {
				switch (weapStats.type) {
					case "melee": {
						player.shooting = true;
						player.change();
						player.lastShot = now;
						break;
					}
					case "gun": {
						if (weap.ammo > -1) {
							let shouldShoot = weapStats.semi ? !player.mouseWasDown : true;

							if (shouldShoot) {
								player.shooting = true;
								for (var i = 0; i < (weapStats.bulletCount || 1); i++) {
									this.spawnBullet(
										player.x,
										player.y,
										player.angle,
										player.id,
										weap.type,
										moveX || moveY
									);
								}
								player.change();
								player.lastShot = now;
							}
						}
						break;
					}
				}

				player.mouseWasDown = true;
			}
			if (player.inputChanged) {
				player.change();
				player.inputChanged = false;
			}
			if (player.invChanged || player.health !== player.lastHealth) {
				player.channel.raw.emit(
					localState.encode({
						weapon1Type: idFromWeap(player.weapons[0].type),
						weapon2Type: idFromWeap(player.weapons[1].type),
						weapon3Type: idFromWeap(player.weapons[2].type),
						weapon4Type: idFromWeap(player.weapons[3].type),
						weapon1Ammo: player.weapons[0].ammo,
						weapon2Ammo: player.weapons[1].ammo,
						weapon3Ammo: player.weapons[2].ammo,
						weapon4Ammo: player.weapons[3].ammo,
						weapId: player.curWeap,
						health: player.health
					})
				);
				player.change();
				player.invChanged = false;
				player.lastHealth = player.health;
			}

			if (!player.interact) player.alreadyInteracted = false;
			player.lastInteraction = player.lastInteraction || 0;
			player.lastNonInteract = player.lastNonInteract || 0;

			const potentials = this.collisionSystem.getPotentials(player._collider);

			forEach(
				potentials.sort(
					(a, b) =>
						calcDistance(a.pos.x, a.pos.y, player.x, player.y) -
						calcDistance(b.pos.x, b.pos.y, player.x, player.y)
				),
				(collider) => {
					if (collider.__type == "bullet" || collider.__type == "player") return;

					if (this.collisionSystem.checkCollision(player._collider, collider)) {
						if (collider.__oid != undefined && this.objects[collider.__oid].destroyed)
							return;

						if (collider.__type == "loot") {
							if (
								player.interact &&
								!player.alreadyInteracted &&
								now - player.lastInteraction >= 100 &&
								now - player.lastNonInteract <= 50
							) {
								player.alreadyInteracted = true;
								player.lastInteraction = now;

								let obj = this.objects[collider.__oid];
								let item = obj.item;

								switch (items[item].type) {
									case "gun": {
										if (
											player.weapons[0].type != "" &&
											player.weapons[1].type != ""
										) {
											if (
												player.curWeap != 2 &&
												player.weapons[player.curWeap].type !== item
											) {
												obj.item = player.weapons[player.curWeap].type;
												obj.change();
												player.weapons[player.curWeap].type = item;
												player.weapons[player.curWeap].ammo = obj.qty;
												//obj.destroy(this.collisionSystem);
											}
										} else {
											if (player.weapons[0].type == "") {
												player.weapons[0].type = item;
												player.weapons[0].ammo = obj.qty;
												player.curWeap = 0;
												obj.destroy(this.collisionSystem);
											} else if (player.weapons[1].type == "") {
												player.weapons[1].type = item;
												player.weapons[1].ammo = obj.qty;
												player.curWeap = 1;
												obj.destroy(this.collisionSystem);
											}
										}

										player.invChanged = true;
										break;
									}
								}
							} else {
								if (!player.interact) player.lastNonInteract = now;
							}
						} else {
							const { overlapV } = this.collisionSystem.response;

							player.move(-overlapV.x, -overlapV.y, false);

							let object = this.objects[collider.__oid];

							if (object.damage && player.shooting && weapStats.type == "melee") {
								object.damage(weapStats.damage, this.collisionSystem);
							}
						}
					}
				}
			);
		});
		forEach(this.objects, (object) => {
			if (object.destroyed) return;
			if (categoryFromId(object.category) == "object") return;
			if (object.collisions == undefined) object.collisions = 0;

			const potentials = this.collisionSystem.getPotentials(object._collider);

			forEach(potentials, (collider) => {
				if (collider.__oid == undefined) return;
				if (object.collisions > 10) return;

				if (this.collisionSystem.checkCollision(object._collider, collider)) {
					const { overlapV, aInB, bInA } = this.collisionSystem.response;

					if (aInB || bInA) {
						object.move(Math.random() ** 2, Math.random() ** 2, false);
					} else {
						object.collisions += 2;
						object.move(-overlapV.x * 1.2, -overlapV.y * 1.2, false);
					}
				}
			});

			object.collisions -= 1;
			object.collisions = Math.max(0, object.collisions);
		});

		// Remove bullets that are "done"
		this.bullets = this.bullets.filter((bullet) => !bullet.done);

		// Don't send a bullets message if there are no bullets
		if (!!this.bullets.length) {
			this.room.emit(
				bullets.encode({
					bullets: mapBullets(this.bullets)
				})
			);
		}

		// Send unique message to each player based on
		// 		what the player can see and what has changed
		// Only send when it is time
		if (shouldSend) {
			this.previousSend = now;

			forEach(this.players, (player) => {
				if (player.disconnected) return;

				let players = mapPlayers(
					filter(this.players, (p) => {
						if (!p.seenList) p.seenList = [];

						p.lastShouldSendShoot = p.shouldSendShoot;
						p.shouldSendShoot = now - p.lastShot < 50;

						if (p.lastShouldSendShoot !== p.shouldSendShoot) {
							p.change();
						}

						// Can player see p?
						if (!player.canSee(p.x, p.y, 3)) {
							// if not, remove player from p's seen-by list
							p.seenList = Object.values(filter(p.seenList, (e) => e != player.id));

							return false;
						} else {
							// if so, check if p has been updated
							if (p.seenList.includes(player.id)) return false;
						}

						// Add player to p's seen-by list
						p.seenList.push(player.id);
						return true;
					})
				);
				let objects = mapObjects(
					filter(this.objects, (o) => {
						if (!player.canSee(o.x, o.y, 5)) return false;
						if (o.seenList.includes(player.id)) return false;

						o.seenList.push(player.id);
						return true;
					})
				);

				// No need to send if nothing has changed
				if (!!players.length || !!objects.length)
					player.channel.raw.emit(
						gameState.encode({
							players,
							objects
						})
					);
			});
		}

		this.inLoop = false;
	}

	playerInput(
		id,
		{
			moveLeft,
			moveRight,
			moveDown,
			moveUp,
			interact,
			mouseDown,
			angle,
			prevWeap,
			nextWeap,
			curWeap,
			drop
		}
	) {
		let player = this.players[id];

		//console.log(arguments[1]);

		player.moveLeft = moveLeft;
		player.moveRight = moveRight;
		player.moveDown = moveDown;
		player.moveUp = moveUp;
		player.interact = interact;
		player.mouseDown = mouseDown;
		player.rotate(angle);

		if (nextWeap || prevWeap) {
			player.curWeap = changeWeap(player.curWeap, prevWeap ? -1 : 1, player.weapons);
			player.invChanged = true;
		}

		if (
			(drop == 1 && player.weapons[0].type !== "") ||
			(drop == 2 && player.weapons[1].type !== "")
		) {
			let id = drop == 1 ? 0 : 1;
			let weap = player.weapons[id];
			let loot = this.spawnLoot(
				player.x - Math.cos(player.angle * deg2Rad),
				player.y - Math.sin(player.angle * deg2Rad),
				weap.type,
				weap.ammo
			);
			player.weapons[id] = { type: "", ammo: 0 };
			player.curWeap = 1 - id;
			player.invChanged = true;
		}

		if (curWeap !== 4) {
			if (player.weapons[curWeap].type !== "") {
				player.curWeap = curWeap;
				player.invChanged = true;
			}
		}
	}

	disconnect(id) {
		this.players[id].disconnected = true;
	}

	playerLeft(channel) {
		if (!channel.id || !this.players[channel.id]) return;

		this.players[channel.id].disconnected = true;
	}

	addPlayer(channel) {
		let player = new Player(false, this.map);

		player.cid = channel.id;
		player.channel = channel;
		player.id = Object.keys(this.players).length;
		channel.pid = player.id;
		player.create({ system: this.collisionSystem, Circle });
		player.invChanged = true;

		channel.join(this.gameId);

		this.players.push(player);

		player.channel.raw.emit(
			welcomeState.encode({
				pov: player.id,
				gameMode: this.gameMode
			})
		);
	}
};

const io = geckos({
	authorization: (auth, request) => {
		return true;
	},
	cors: {
		origin: (req) => {
			return "*";
		}
	},
	iceServers
});
const game = new Game(io);

io.listen(3000);
io.onConnection((channel) => {
	channel.onDisconnect(() => {
		game.playerLeft(channel);
	});

	channel.onRaw(({ buffer }) => {
		let arr = new BitArray(buffer);
		let messageType = arr.getUint(3);

		switch (messageType) {
			case messageIds.input: {
				//inputState.decode(arr);
				game.playerInput(channel.pid, inputState.decode(arr));
				break;
			}
		}
	});

	channel.onDisconnect(() => {
		game.disconnect(channel.pid);
	});

	game.addPlayer(channel);
});
