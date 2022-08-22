import { Player } from "./modules/player.js";
import { Bullet } from "./modules/bullet.js";
import { forEach, map, filter } from "./modules/optimized.js";
import {
	gameState,
	welcomeState,
	localState,
	bullets,
	roundInfo,
	playerInfo
} from "./models/index.js";
import { actions } from "./modules/meta/actions.js";
import { weapons, idFromWeap, weapFromId } from "./modules/meta/weapons.js";
import { Circle, Box, Polygon, System } from "detect-collisions";
import { calcDistance, clamp, deg2Rad } from "./modules/math.js";
import { animations } from "./modules/meta/animations.js";
import { idFromItem, items } from "./modules/meta/itemTypes.js";
import { idFromObj, objects, objFromId } from "./modules/meta/objects.js";
import { categoryFromId } from "./modules/meta/objCategories.js";
import { gameModes } from "./modules/meta/gameModes.js";
import axios from "axios";
import LootClass from "./modules/loot.js";
import ObjectClass from "./modules/object.js";
import crypto from "crypto";

let seconds = 1000;
let minutes = 60 * seconds;

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
			id: p.id,
			team: p.team
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
			scale: o.scale,
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
			speed: b.speed,
			angle: b.angle,
			type: b.bulletType,
			team: b.team
		};
	});
const mapPlayerInfo = (players) =>
	map(players, (p) => {
		return {
			username: p.username || "",
			credits: p.credits,
			id: p.id
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
const loopAngle = (angle) => {
	if (angle <= 180 && angle >= -180) return angle;
	if (angle > 180) return loopAngle(angle - 360);
	if (angle < -180) return loopAngle(angle + 360);
};
const runAsync = (fn, params, cb) => {
	new Promise((resolve, reject) => {
		fn(params);
	})
		.then(cb || (() => {}))
		.catch((e) => console.log(e));
};

const Round = class Round {
	constructor(roundLength, roundCoolDown) {
		this.startTime = Date.now();
		this.roundLength = roundLength;
		this.roundCoolDown = roundCoolDown;
		this.winningTeam = undefined;
		this.bombPlanted = undefined;
		this.done = 0;
	}

	get inCoolDown() {
		return Date.now() - this.startTime < this.roundCoolDown;
	}

	get isOver() {
		if (this.winningTeam) return true;

		let over = this.bombPlanted
			? Date.now() - this.bombPlanted >= this.roundLength * 0.45
			: Date.now() - this.startTime >= this.roundLength + this.roundCoolDown;

		if (over) this.done = Date.now();

		return over;
	}

	get timeLeft() {
		if (this.isOver) return 0;

		return this.inCoolDown
			? this.roundCoolDown - (Date.now() - this.startTime)
			: this.bombPlanted
			? this.roundLength * 0.45 - (Date.now() - this.bombPlanted)
			: this.roundLength + this.roundCoolDown - (Date.now() - this.startTime);
	}

	get active() {
		return !this.inCoolDown && !this.isOver;
	}

	get timeTaken() {
		return this.done - this.startTime;
	}

	bombPlanted() {
		this.bombPlanted = Date.now();
	}

	setWinners(team) {
		this.done = Date.now();
		this.winningTeam = team;
	}
};

export default class Game {
	constructor(server) {
		this.fps = 60;
		this.sendRate = 30;
		this.tickLength = 1000 / this.fps;
		this.previousTick = Date.now();
		this.previousSend = Date.now();
		this.actualTicks = 0;
		this.inLoop = false;

		this.protocol = 1;

		this.apiKey = "apiKey123";
		this.apiURL = `http://73.145.149.66:1234/server_api/${this.apiKey}`;

		this.gameId = crypto.randomBytes(36).toString("hex");
		this.gameMode = gameModes.diffuse;
		this.gameOver = false;
		this.gameStarted = Date.now();

		this.players = [];
		this.objects = [];
		this.bullets = [];

		this.currentRound = 0;
		this.rounds = [];
		this.roundLength = 100 * seconds;
		this.roundCoolDown = 30 * seconds;
		this.plantingTeam = 0;

		this.map = {
			min: -300,
			max: 300,
			pad: 24
		};
		this.teams = [[], []];

		this.collisionSystem = new System();

		// Loot Spawning from Objects.js
		for (var i = 0; i < 20; i++) {
			//this.spawnLoot(0, 5, Math.random() > 0.5 ? "assault_rifle" : "marksman_rifle");
		}

		// Object Spawning from Objects.js
		//this.spawnObject(5, 5, `crate_02`);
		this.spawnObject(2, 0, `building_01`);
		//this.spawnObject(-6, 2, `tree_01`);
		//this.spawnObject(-10, 4, `tree_01`);
		//this.spawnObject(3, 7, `bomb`);

		// this.spawnObject(1.4, 1.4, `crate_01`);
		// this.spawnObject(2.7 + 1.4, 2.7 + 1.4, `crate_01`);

		this.server = server;
		this.room = server.room(this.gameId);
		this.rawRoom = server.raw.room(this.gameId);

		const gameLoop = () => {
			if (this.gameOver) return;

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

	get round() {
		return this.rounds[this.currentRound];
	}

	get activePlayers() {
		return filter(this.players, (player) => !player.disconnected).length;
	}

	sendRoundInfo() {
		runAsync(() => {
			let info = {
				id: this.currentRound,
				timeLeft: Math.round(this.round.timeLeft / seconds),
				team0Wins: filter(this.rounds, (e) => e.winningTeam == 0).length,
				team1Wins: filter(this.rounds, (e) => e.winningTeam == 1).length,
				team0Alive: filter(this.players, (e) => !e.dead && e.team == 0).length,
				team1Alive: filter(this.players, (e) => !e.dead && e.team == 1).length,
				coolDown: this.round.inCoolDown
			};

			this.rawRoom.emit(roundInfo.encode(info));
		});
	}

	sendPlayerInfo(player) {
		runAsync(() => {
			let arr = [];

			if (player) {
				arr.push(player);
			} else {
				arr = this.players;
			}

			arr = mapPlayerInfo(arr);

			this.rawRoom.emit(playerInfo.encode(arr));
		});
	}

	sendLocalState(player) {
		runAsync(() =>
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
			)
		);
	}

	addRound() {
		let round = new Round(this.roundLength, this.roundCoolDown);

		this.rounds.push(round);
		this.currentRound = this.rounds.length - 1;
	}

	onSameTeam(id1, id2) {
		return (
			this.players[id1] &&
			this.players[id2] &&
			this.players[id1].team === this.players[id2].team
		);
	}

	spawnBullet(x, y, dir, owner, type, moving) {
		runAsync(() => {
			let startX =
				x + (weapons[type].width + animations[type].gun.x - 0.5) * Math.cos(dir * deg2Rad);
			let startY =
				y + (weapons[type].width + animations[type].gun.x - 0.5) * Math.sin(dir * deg2Rad);
			let rayData = this.collisionSystem.raycast(
				{
					x: x + Math.cos(dir * deg2Rad),
					y: y + Math.sin(dir * deg2Rad)
				},
				{
					x: startX + Math.cos(dir * deg2Rad),
					y: startY + Math.sin(dir * deg2Rad)
				},
				(body) => {
					if (body.__type == "loot" || body.__type == "bullet") return false;
					if (
						body.__oid &&
						this.objects[body.__oid] &&
						this.objects[body.__oid].destroyed
					) {
						this.collisionSystem.remove(body);
						return false;
					}
					if (
						body.__pid == owner ||
						this.onSameTeam(body.__pid, owner) ||
						(this.players[body.__pid] && this.players[body.__pid].dead)
					)
						return false;

					return true;
				}
			);
			let bullet;

			if (rayData && rayData.point) {
				bullet = new Bullet(rayData.point.x, rayData.point.y, dir);
				bullet.speed = 0.05;
			} else {
				bullet = new Bullet(
					startX,
					startY,
					loopAngle(
						dir +
							(weapons[type].spread || 3) *
								(moving ? 2 : 1) *
								(2 * (Math.random() - 0.5))
					)
				);
				bullet.speed = weapons[type].bulletSpeed || 0.2;
			}

			bullet.owner = owner;
			bullet.range = weapons[type].range || 10;
			bullet.damage = weapons[type].damage || 5;
			bullet.bulletType = idFromWeap(type);
			bullet.start = Date.now();
			bullet.team = this.players[owner].team;
			bullet.create({ system: this.collisionSystem, Circle });

			this.bullets.push(bullet);
		});
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
		let objData = objects[type];

		if (objData.compound) {
			forEach(objData.children, (obj) => {
				this.spawnObject(x + obj.x, y + obj.y, obj.type, create);
			});
		} else {
			let object = new ObjectClass(x, y, this.objects.length, type);

			this.objects.push(object);

			if (create) {
				object.create({
					Circle,
					Polygon,
					Box,
					system: this.collisionSystem
				});
			}

			if (objData.contentRarity !== undefined) {
				object.onDestroy = this.crateDestroyed.bind(this);
			}
		}
	}

	crateDestroyed(x, y, type) {
		let rarity = objects[type].contentRarity;

		this.spawnLoot(x, y, "smg");
	}

	inMap(x, y, pad = false, rad = 0) {
		let min = this.map.min + rad - (pad ? this.map.pad : 0);
		let max = this.map.max - rad + (pad ? this.map.pad : 0);

		return x >= min && y >= min && x <= max && y <= max;
	}

	resetPlayer(id) {
		let player = this.players[id];

		if (!player) return;

		player.dead = false;
		player.health = 100;
		player.move(0, 0, true);
	}

	endGame() {
		this.gameOver = true;
		this.sendRoundInfo();
		this.room.emit("gameOver", {});

		setTimeout(() => {
			forEach(this.players, (player) => {
				if (player.disconnected) return;

				player.disconnected = true;

				player.channel.leave();
				player.channel.close();
			});
			this.players = [];
			this.objects = [];
			this.bullets = [];
		}, 5 * seconds);
	}

	update(delta) {
		if (this.inLoop) return;
		if (!this.round) {
			this.addRound();
		}
		if (this.round.isOver) {
			if (this.round.winningTeam == undefined) {
				this.round.setWinners(this.plantingTeam);
			}

			let team0Wins = filter(this.rounds, (e) => e.winningTeam == 0).length;
			let team1Wins = filter(this.rounds, (e) => e.winningTeam == 1).length;

			// First to 9 wins, 17 possible rounds
			if (team0Wins == 9 || team1Wins == 9 || this.currentRound == 16) {
				return this.endGame();
			}

			// Switch sides after 8 rounds
			if (this.currentRound == 7) {
				this.plantingTeam = 1;
			}

			this.addRound();
		}

		this.inLoop = true;

		let now = Date.now();
		let shouldSend = now - this.previousSend >= 1000 / this.sendRate;

		if (
			!this.lastRoundInfo ||
			now - this.lastRoundInfo.time > seconds ||
			this.round.active != this.lastRoundInfo.active
		) {
			this.sendRoundInfo();
			this.lastRoundInfo = {
				active: !!this.round.active,
				time: now
			};
		}

		// do logic
		forEach(this.bullets, (bullet) => {
			let now = Date.now();

			if (!bullet.active) {
				bullet.done = true;
			}

			if (bullet.active) {
				bullet.move(bullet.speed * delta);

				const potentials = this.collisionSystem.getPotentials(bullet._collider);

				potentials.some((collider) => {
					if (
						collider.__type == "bullet" ||
						collider.__type == "loot" ||
						(collider.__type == "player" &&
							(collider.__pid == bullet.owner ||
								this.onSameTeam(collider.__pid, bullet.owner)))
					)
						return false;

					if (this.collisionSystem.checkCollision(bullet._collider, collider)) {
						const { overlap, overlapN } = this.collisionSystem.response;

						if (collider.__type == "player") {
							let player = this.players[collider.__pid];

							if (player.dead) return false;

							player.damage(bullet.damage, this.collisionSystem);

							let owner = this.players[bullet.owner];

							if (player.dead && owner) {
								owner.credits += 300;
								owner.points += 15;
								player.points -= 15;

								this.sendPlayerInfo(owner);
							}
						}

						if (collider.__type == "object") {
							let object = this.objects[collider.__oid];

							if (object.destroyed) return false;

							object.damage(bullet.damage, this.collisionSystem);
						}

						//bullet.move(-overlap);
						bullet.active = false;
						this.collisionSystem.remove(bullet._collider);

						return true;
					}
				});

				if (bullet.distance > bullet.range || !this.inMap(bullet.x, bullet.y, true)) {
					bullet.active = false;
					this.collisionSystem.remove(bullet._collider);
				}
			}
		});
		forEach(this.players, (player) => {
			if (!this.round.active) {
				this.resetPlayer(player.id);
				return;
			}

			if (player.dead || player.disconnected) return;

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
			} else {
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
							if (
								collider.__oid != undefined &&
								this.objects[collider.__oid].destroyed
							)
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
								const { overlapV, aInB, bInA } = this.collisionSystem.response;

								player.move(-overlapV.x, -overlapV.y, false);
							}
						}
					}
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

			if (weapStats.burst) {
				if (!player.mouseDown && player.shotInBurst == 3) {
					player.shotInBurst = 0;
				}
			} else {
				player.shotInBurst = 0;
			}

			if (
				(player.mouseDown ||
					(weapStats.burst && player.shotInBurst !== 0 && player.shotInBurst < 3)) &&
				now - player.lastShot >
					((player.shotInBurst == 0 ? weapStats.shootDelay : weapStats.burstDelay) || 300)
			) {
				switch (weapStats.type) {
					case "melee": {
						if (!player.mouseWasDown) {
							player.shooting = true;
							player.change();
							player.lastShot = now;

							// Cast a punch ray
							// TODO: make it variable (defined by weapStats)
							let rayData = this.collisionSystem.raycast(
								{
									x: player.x + Math.cos(player.angle * deg2Rad),
									y: player.y + Math.sin(player.angle * deg2Rad)
								},
								{
									x: player.x + Math.cos(player.angle * deg2Rad) * 2.5,
									y: player.y + Math.sin(player.angle * deg2Rad) * 2.5
								},
								(body) => {
									if (body.type == "loot" || body.type == "bullet") return false;
									if (
										body.__pid == player.id ||
										this.onSameTeam(body.__pid, player.id) ||
										(this.players[body.__pid] &&
											this.players[body.__pid].dead) ||
										(this.objects[body.__oid] &&
											this.objects[body.__oid].destroyed)
									)
										return false;

									return true;
								}
							);

							if (rayData && rayData.collider) {
								let collider = rayData.collider;
								let ent;

								if (collider.__type == "object") ent = this.objects[collider.__oid];
								if (collider.__type == "player") ent = this.players[collider.__pid];

								if (ent && ent.damage) {
									ent.damage(weapStats.damage, this.collisionSystem);
								}
							}
						}
						break;
					}
					case "gun": {
						if (weap.ammo > -1) {
							if (!player.shotInBurst) player.shotInBurst = 0;
							let shouldShoot = weapStats.semi
								? !player.mouseWasDown
								: weapStats.burst
								? player.shotInBurst < 3
								: true;

							if (shouldShoot) {
								player.shotInBurst++;
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
				this.sendLocalState(player);

				player.change();
				player.invChanged = false;
				player.lastHealth = player.health;
			}
		});
		forEach(this.objects, (object) => {
			if (object.destroyed) return;
			if (categoryFromId(object.category) == "object") return;

			const potentials = this.collisionSystem.getPotentials(object._collider);

			forEach(potentials, (collider) => {
				if (collider.__oid == undefined) return;
				if (this.objects[collider.__oid].destroyed) {
					this.collisionSystem.remove(collider);
					return;
				}

				if (this.collisionSystem.checkCollision(object._collider, collider)) {
					const { overlapV } = this.collisionSystem.response;

					object.move(-overlapV.x, -overlapV.y, false);
				}
			});
		});

		// Remove bullets that are "done"
		this.bullets = filter(this.bullets, (bullet) => !bullet.done);

		// Send unique message to each player based on what the player can see and what has changed
		// Only send when it is time
		if (shouldSend) {
			this.previousSend = now;

			// Don't send a bullets message if there are no bullets
			if (!!this.bullets.length) {
				this.rawRoom.emit(
					bullets.encode({
						bullets: mapBullets(
							filter(
								this.bullets,
								(bullet) =>
									bullet.start > now || now - bullet.start <= this.sendRate
							)
						)
					})
				);
			}

			forEach(this.players, (player) => {
				if (player.disconnected) return;

				let players = mapPlayers(
					filter(this.players, (p) => {
						if (!p.seenList) p.seenList = [];

						let weapStats = weapons[p.weapons[p.curWeap].type];

						p.lastShouldSendShoot = p.shouldSendShoot;
						p.shouldSendShoot =
							now - p.lastShot <
							(weapons[p.weapons[p.curWeap].type].shootDelay || 150) / 2;

						if (p.lastShouldSendShoot !== p.shouldSendShoot) {
							p.change();
						}

						// Can player see p?
						if (!player.canSee(p.x, p.y, 3)) {
							// if not, remove player from p's seen-by list
							p.seenList = filter(p.seenList, (e) => e != player.id);

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
							objects,
							sec: player.sec
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
			drop,
			sec
		}
	) {
		let player = this.players[id];

		if (this.gameOver || !player || player.disconnected || player.dead) return;

		//console.log(arguments[1]);

		player.moveLeft = moveLeft;
		player.moveRight = moveRight;
		player.moveDown = moveDown;
		player.moveUp = moveUp;
		player.interact = interact;
		player.mouseDown = mouseDown;
		player.sec = sec;
		player.rotate(angle);

		if (!player.mouseDown) {
			if (nextWeap || prevWeap) {
				player.curWeap = changeWeap(player.curWeap, prevWeap ? -1 : 1, player.weapons);
				player.invChanged = true;
			}

			if (curWeap !== 4) {
				if (player.weapons[curWeap].type !== "") {
					player.curWeap = curWeap;
					player.invChanged = true;
				}
			}
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
	}

	playerLoadout(id, { selectedWeap }) {
		let player = this.players[id];

		if (this.round.inCoolDown && player && !player.disconnected) {
			if (selectedWeap != 31) {
				let weapName = weapFromId(selectedWeap);
				let weapData = weapons[weapName];
				let storeData = weapData.storeData;

				if (storeData && player.credits >= storeData.cost) {
					player.credits -= storeData.cost;

					if (storeData.class != "sidearm") {
						player.weapons[0].type = weapName;
						player.weapons[0].ammo = weapData.ammo.mag;
					} else {
						player.weapons[1].type = weapName;
						player.weapons[1].ammo = weapData.ammo.mag;
					}

					player.invChanged = true;

					this.sendPlayerInfo(player);
					this.sendLocalState(player);
				}
			}
		}
	}

	playerToken(id, token) {
		let player = this.players[id];

		if (!player || player.disconnected) return;

		axios
			.get(`${this.apiURL}/check_token/${token}`, {
				headers: { "x-real": "yes" }
			})
			.then(({ data: response }) => {
				if (!response || response.error) return;

				player.token = token;
				player.username = response.data;

				this.sendPlayerInfo(player);
			})
			.catch((err) => {
				console.log(err);
			});
	}

	playerLeft(channel) {
		if (!channel.pid || !this.players[channel.pid]) return;

		this.players[channel.pid].disconnected = true;
	}

	addPlayer(channel) {
		if (this.gameOver) {
			return this.endGame();
		}

		let player = new Player(false, this.map);

		player.cid = channel.id;
		player.channel = channel;
		player.id = Object.keys(this.players).length;
		channel.pid = player.id;
		player.create({ system: this.collisionSystem, Circle });
		player.credits = 800; // credits for purchasing weaps
		player.points = 0; // rank change points

		channel.join(this.gameId);

		this.players.push(player);

		if (this.teams[0].length > this.teams[1].length) {
			player.team = 1;
			this.teams[1].push(player.id);
		} else {
			player.team = 0;
			this.teams[0].push(player.id);
		}

		player.channel.raw.emit(
			welcomeState.encode({
				pov: player.id,
				gameMode: this.gameMode
			})
		);

		this.sendPlayerInfo();
		this.sendLocalState(player);

		this.lastRoundInfo = 0;
	}
}
