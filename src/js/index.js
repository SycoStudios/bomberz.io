import { Application, Container, Text, TextStyle, Sprite } from "pixi.js";
import { Bullet } from "../../modules/bullet";
import { Input } from "../../modules/input";
import { Player } from "../../modules/player";
import { gameState, welcomeState, inputState, localState, checkSchemaId } from "../../models/index";
import geckos from "@geckos.io/client";
import { forEach } from "../../modules/optimized";
import { actions } from "../../modules/meta/actions";
import { weapons, weapFromId } from "../../modules/meta/weapons";
import { Language } from "../../modules/lang";
import { categoryFromId } from "../../modules/meta/objCategories";
import { calcDistance, clamp, deg2Rad, getRandomInt, lerp } from "../../modules/math";
import { Audio } from "../../modules/audio";
import { itemFromId } from "../../modules/meta/itemTypes";
import { BitArray } from "@codezilluh/bitarray.js";
import { messageIds } from "../../modules/meta/messageIds";
import LootClass from "../../modules/loot.js";
import ObjectClass from "../../modules/object.js";
import bullets from "../../models/bullets";
import { objFromId, objects as objectData } from "../../modules/meta/objects";
import { Circle, Box, System } from "detect-collisions";

const app = new Application({
	antialias: true,
	backgroundColor: 0x10a753,
	resizeTo: window
});
const channel = geckos({ port: 3000 });
const lang = new Language();
const input = new Input();
const audio = new Audio();
const keybinds = {
	moveLeft: "a",
	moveRight: "d",
	moveUp: "w",
	moveDown: "s",
	interact: "f"
};
const data = {
	players: {},
	bullets: [],
	objects: [],
	pov: 0,
	gameMode: 0,
	spectating: false,
	playersJustSeen: [],
	lastFrameTime: Date.now(),
	collisionSystem: new System()
};
const layers = {
	floors: new Container(),
	bullets: new Container(),
	objects: new Container(),
	players: new Container(),
	roofs: new Container()
};
const UI = {
	interact: document.querySelector(".interact"),
	deathScreen: document.querySelector("#death")
};
const init = () => {
	audio.volume(1);

	document.body.appendChild(app.view);
	resize();

	app.stage.addChild(layers.floors, layers.objects, layers.bullets, layers.players, layers.roofs);
};
const focus = (x, y) => {
	audio.setPos(x, y);
	app.stage.pivot.set(x, y);
};
const sendInput = (input, weap = undefined, drop = undefined) => {
	input.weapKey = input.getKeyDown(1)
		? 0
		: input.getKeyDown(2)
		? 1
		: input.getKeyDown(3)
		? 2
		: input.getKeyDown(4)
		? 3
		: 4;

	let msg = inputState.encode({
		moveLeft: input.getKeyDown(keybinds.moveLeft),
		moveRight: input.getKeyDown(keybinds.moveRight),
		moveDown: input.getKeyDown(keybinds.moveDown),
		moveUp: input.getKeyDown(keybinds.moveUp),
		interact: input.getKeyDown(keybinds.interact),
		mouseDown: input.getButtonDown(0),
		prevWeap: input.weapChange < 0,
		nextWeap: input.weapChange > 0,
		curWeap: weap != undefined ? weap : input.weapKey,
		angle: input.mouseAngle,
		drop
	});

	input.weapKey = 4;
	input.weapChange = 0;

	channel.raw.emit(msg);
};
const resize = () => {
	app.resize(window.innerWidth, window.innerHeight);
	app.stage.position.set(window.innerWidth / 2, window.innerHeight / 2);
	app.stage.scale.set(Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2) / 28);
};
const dataUpdate = ({ players = [], objects = [], bullets = [] }) => {
	if (players.length > 0 || objects.length > 0) {
		data.playersJustSeen = [];

		forEach(players, (player) => {
			data.playersJustSeen.push(player.id);

			if (!data.players[player.id]) {
				data.players[player.id] = new Player(true);

				layers.players.addChild(
					data.players[player.id].create(
						{
							Sprite,
							Text,
							TextStyle,
							Container,
							Circle,
							system: data.collisionSystem
						},
						data.pov == player.id || !data.spectating
					)
				);
			}

			let p = data.players[player.id];

			p.dead = player.dead;

			if (player.id == data.pov) {
				focus(player.x, player.y);
			}

			if (!p._container.visible) p._container.visible = true;

			if (!player.dead) {
				p.rotate(player.angle);
				p.move(player.x, player.y);
				p.curWeap = weapFromId(player.curWeap);
				p.action = player.action;

				if (p.action == actions.shoot) {
					audio.playSound(p.curWeap + "_shoot", { x: p.x, y: p.y });
				}
			} else {
				p._playerRip.visible = true;
				p._playerBody.visible = false;
				p._leftHand.visible = false;
				p._rightHand.visible = false;
				p._weapon.visible = false;

				if (player.id == data.pov) {
					audio.sounds.title_looped.play();
					UI.deathScreen.classList.remove("hidden");
				}

				p.rotate(0);
				p.move(player.x, player.y);

				layers.players.removeChild(p._container);
				layers.floors.addChild(p._container);
			}
		});

		forEach(objects, (object) => {
			let category = categoryFromId(object.category);

			if (object.destroyed) {
				if (data.objects[object.id]) {
					data.objects[object.id].destroy(data.collisionSystem);
					data.objects[object.id] = undefined;
				}

				return;
			}

			switch (category) {
				case "loot": {
					if (
						!!data.objects[object.id]
							? data.objects[object.id].item !== itemFromId(object.data)
							: true
					) {
						if (!!data.objects[object.id]) {
							data.objects[object.id].destroy();
						}

						data.objects[object.id] = new LootClass(
							object.x,
							object.y,
							object.id,
							object.data,
							true
						);
						data.objects[object.id].category = category;

						layers.objects.addChild(
							data.objects[object.id].create({ Sprite, Container })
						);

						data.objects[object.id]._container.scale.set(0.5);
					}

					data.objects[object.id].targetX = object.x;
					data.objects[object.id].targetY = object.y;
					break;
				}
				case "object": {
					if (!data.objects[object.id]) {
						data.objects[object.id] = new ObjectClass(
							object.x,
							object.y,
							object.id,
							objFromId(object.data),
							true
						);

						let o = data.objects[object.id];

						o.category = category;

						layers[o.layer].addChild(
							o.create(
								{ Sprite, Container, Box, Circle, system: data.collisionSystem },
								true
							)
						);

						if (objectData[objFromId(object.data)].rotate) {
							o._container.rotation = getRandomInt(180 * deg2Rad);
						}
					}
					break;
				}
			}
		});

		forEach(data.players, (player, id) => {
			if (!player._container.visible) return;

			if (!data.playersJustSeen.includes(id)) {
				if (!data.players[data.pov].canSee(player.x, player.y, 3)) {
					player._container.visible = false;
				}
			}
		});
	} else {
		if (bullets.length > 0) {
			forEach(bullets, (bullet, i) => {
				if (!data.bullets[i]) {
					data.bullets.push(new Bullet(bullet.x, bullet.y, bullet.angle, true));
					layers.bullets.addChild(data.bullets[i].create({ Container, Sprite }));
				}

				let b = data.bullets[i];

				b.x = bullet.x;
				b.y = bullet.y;
				b.startX = bullet.startX;
				b.startY = bullet.startY;
				b.dist = b.distance * (1 - bullet.deactivating / 170);
				b._container.alpha = 0.8 * (1 - bullet.deactivating / 170);
				b.angle = bullet.angle;

				b.update();
			});

			if (data.bullets.length > bullets.length) {
				forEach(data.bullets, (bullet, i) => {
					if (i >= bullets.length) {
						bullet._container.destroy();
					}
				});

				data.bullets.splice(bullets.length - data.bullets.length);
			}
		}
	}
};
const animateUpdate = () => {
	requestAnimationFrame(animateUpdate);

	let touching = [];
	let now = Date.now();
	let delta = (now - data.lastFrameTime) / (1000 / 60);

	if (data.pov != undefined && !data.spectating) {
		let player = data.players[data.pov];

		if (!player || player.dead) return;

		let moveLeft = input.getKeyDown(keybinds.moveLeft);
		let moveRight = input.getKeyDown(keybinds.moveRight);
		let moveUp = input.getKeyDown(keybinds.moveUp);
		let moveDown = input.getKeyDown(keybinds.moveDown);

		let moveX = moveRight - moveLeft;
		let moveY = moveDown - moveUp;

		if (moveX || moveY) {
			let moveDir = Math.atan2(moveY, moveX);

			player.move(
				Math.cos(moveDir) * player.speed * delta,
				Math.sin(moveDir) * player.speed * delta,
				false
			);

			let potentials = data.collisionSystem.getPotentials(player._collider);

			forEach(potentials, (collider) => {
				if (
					collider.__type == "bullet" ||
					collider.__type == "player" ||
					collider.__type == "loot"
				)
					return;

				if (data.collisionSystem.checkCollision(player._collider, collider)) {
					const { overlapV } = data.collisionSystem.response;

					player.move(-overlapV.x, -overlapV.y, false);
				}
			});

			focus(player.x, player.y);
		}

		player.rotate(input.mouseAngle);
	}

	data.lastFrameTime = now;

	forEach(data.players, (p) => {
		const weap = p.curWeap;
		const weapStats = weapons[weap];

		if (p.dead) {
			return (p._weapon.visible = false);
		}

		switch (p.action) {
			case actions.punch:
			case actions.shoot: {
				if (weapStats.multipleAnims) {
					p.animate(Math.random() > 0.5 ? weapStats.animL : weapStats.animR);
				} else {
					p.shooting = true;
				}

				break;
			}
			case actions.none: {
				p.idleAnim = weap;
				p.animate(weap);
				p.wasShoot = p.shooting;
				p.shooting = false;

				break;
			}
		}

		if (p.shooting || p.wasShoot) {
			p._weapsContainer.position.x -= p.wasShoot ? 0.04 : 0.02;
		} else {
			p._weapsContainer.position.x += 0.005;
		}

		p._weapsContainer.position.x = clamp(p._weapsContainer.position.x, -0.08, 0);

		p.setWeap(p.curWeap, Sprite);
	});
	forEach(data.objects, (object) => {
		if (!object) return;
		if (object.destroyed) return;

		switch (object.category) {
			case "loot": {
				let dist = calcDistance(
					object.x,
					object.y,
					data.players[data.pov].x,
					data.players[data.pov].y
				);
				if (dist <= 1.9) {
					touching.push({ dist, name: object.item });
				}
				data.objects[object.id]._container.scale.set(
					clamp(data.objects[object.id]._container.scale.x + 0.05, 0, 1)
				);
				data.objects[object.id].move(
					lerp(data.objects[object.id].x, data.objects[object.id].targetX || 0, 0.2),
					lerp(data.objects[object.id].y, data.objects[object.id].targetY || 0, 0.2),
					true
				);
				break;
			}
		}
	});

	if (touching.length > 0) {
		let item = touching.sort((a, b) => a.dist - b.dist)[0];

		if (UI.interact.children[0].innerText != keybinds.interact.toUpperCase())
			UI.interact.children[0].innerText = keybinds.interact.toUpperCase();
		if (UI.interact.children[1].innerText != lang.getText(item.name))
			UI.interact.children[1].innerText = lang.getText(item.name);
		if (UI.interact.classList.contains("hidden")) UI.interact.classList.remove("hidden");
	} else {
		if (!UI.interact.classList.contains("hidden")) UI.interact.classList.add("hidden");
	}
};

channel.onConnect((error) => {
	requestAnimationFrame(animateUpdate);

	channel.onRaw((buffer) => {
		let arr = new BitArray(buffer);
		let messageType = arr.getUint(3, 0);

		switch (messageType) {
			case messageIds.update: {
				dataUpdate(gameState.decode(arr));
				break;
			}
			case messageIds.bullets: {
				dataUpdate(bullets.decode(arr));
				break;
			}
			case messageIds.welcome: {
				let msg = welcomeState.decode(arr);

				data.pov = msg.pov;
				data.gameMode = msg.gameMode;

				sendInput(input);

				break;
			}
			case messageIds.local: {
				let {
					weapon1Type,
					weapon2Type,
					weapon3Type,
					weapon4Type,
					weapon1Ammo,
					weapon2Ammo,
					weapon3Ammo,
					weapon4Ammo,
					weapId,
					health
				} = localState.decode(arr);
				let weaps = [
					{ type: weapFromId(weapon1Type), ammo: weapon1Ammo },
					{ type: weapFromId(weapon2Type), ammo: weapon2Ammo },
					{ type: weapFromId(weapon3Type), ammo: weapon3Ammo },
					{ type: weapFromId(weapon4Type), ammo: weapon4Ammo }
				];
				let weapSlots = document.querySelectorAll(".box.weaponSlot");

				data.curWeap = weapId;
				data.weapons = weaps;

				for (var i = 0; i < 4; i++) {
					if (i == weapId) {
						weapSlots[i].classList.add("active");
					} else {
						weapSlots[i].classList.remove("active");
					}

					if (weaps[i].type == "") {
						weapSlots[i].classList.add("none");
						weapSlots[i].children[0].src = "";
						weapSlots[i].children[1].children[0].innerText = "";
						continue;
					}

					weapSlots[i].classList.remove("none");

					weapSlots[i].children[0].src = weapons[weaps[i].type].lootImage || "";
					weapSlots[i].children[1].children[0].innerText = lang.getText(weaps[i].type);

					if (!weapSlots[i].children[1].children[1]) continue;

					weapSlots[i].children[1].children[1].children[0].innerText = weaps[i].ammo;
					weapSlots[i].children[1].children[1].children[1].innerText = "200";
				}

				document.querySelector("#healthAmnt").style.width = `${health}%`;

				break;
			}
		}
	});
});

channel.onDisconnect(() => {
	cancelAnimationFrame(animateUpdate);
});

input.on("change", sendInput);

window.addEventListener("load", init);
window.addEventListener("resize", resize);
window.addEventListener("mousemove", input.bound);
window.addEventListener("mousedown", input.bound);
window.addEventListener("mouseup", input.bound);
window.addEventListener("keydown", input.bound);
window.addEventListener("keyup", input.bound);
window.addEventListener("wheel", input.bound);
window.addEventListener("contextmenu", input.bound);

document.querySelectorAll(".weaponSlot").forEach((slot, i) => {
	slot.addEventListener("click", (e) => {
		sendInput(input, i);
	});
	slot.addEventListener("contextmenu", (e) => {
		e.preventDefault();
		sendInput(input, undefined, i == 0 ? 1 : i == 1 ? 2 : i == 4 ? 3 : 0);
	});
});
