import { Application, Container, Text, TextStyle, Sprite, Graphics } from "pixi.js";
import { Bullet } from "../../modules/bullet";
import { Input } from "../../modules/input";
import { Player } from "../../modules/player";
import {
	gameState,
	welcomeState,
	inputState,
	localState,
	bullets,
	roundInfo
} from "../../models/index";
import { filter, forEach, map } from "../../modules/optimized";
import { actions } from "../../modules/meta/actions";
import { weapons, weapFromId } from "../../modules/meta/weapons";
import { dictionary, Language } from "../../modules/lang";
import { categoryFromId } from "../../modules/meta/objCategories";
import { calcAngle, calcDistance, clamp, deg2Rad, getRandomInt, lerp } from "../../modules/math";
import { Audio } from "../../modules/audio";
import { itemFromId } from "../../modules/meta/itemTypes";
import { BitArray } from "@codezilluh/bitarray.js";
import { messageIds } from "../../modules/meta/messageIds";
import { objFromId, objects as objectData } from "../../modules/meta/objects";
import { Circle, Box, System } from "detect-collisions";
import LootClass from "../../modules/loot.js";
import ObjectClass from "../../modules/object.js";
import Settings from "../../modules/settings.js";
import geckos from "@geckos.io/client";

let listeners = [];
let loggedIn = false;

const audio = new Audio();
const settings = new Settings("game-settings", {
	sfxVol: document.querySelector("#sfx_vol"),
	musicVol: document.querySelector("#music_vol"),
	lang: document.querySelector("#lang")
});
const lang = new Language();
const addEventListener = (type, listener) => {
	listeners.push([type, listener]);

	window.addEventListener(type, listener);
};
const removeEventListeners = () => {
	forEach(listeners, ([type, listener]) => {
		window.removeEventListener(type, listener);
	});
};
const removeCanvases = () => {
	let canvases = document.querySelectorAll("canvas");

	forEach(canvases, (cvs) => {
		document.body.removeChild(cvs);
	});
};
const replaceInText = (element, pattern, replacement) => {
	for (let node of element.childNodes) {
		switch (node.nodeType) {
			case Node.ELEMENT_NODE:
				replaceInText(node, pattern, replacement);
				break;
			case Node.TEXT_NODE:
				node.textContent = node.textContent.replace(pattern, replacement);
				break;
			case Node.DOCUMENT_NODE:
				replaceInText(node, pattern, replacement);
		}
	}
};
const startGame = (done) => {
	removeEventListeners();
	removeCanvases();

	console.log("Game started");

	const app = new Application({
		antialias: true,
		backgroundColor: 0x10a753,
		resizeTo: window
	});
	const channel = geckos({ port: 3000 });
	const input = new Input();
	const keybinds = {
		moveLeft: "a",
		moveRight: "d",
		moveUp: "w",
		moveDown: "s",
		interact: "f",
		pause: "Escape"
	};
	const data = {
		started: false,
		players: {},
		bullets: [],
		objects: [],
		pov: 0,
		gameMode: 0,
		spectating: false,
		playersJustSeen: [],
		lastFrameTime: Date.now(),
		collisionSystem: new System(),
		map: {
			min: -300,
			max: 300,
			pad: 24
		},
		lastKeybind: {}
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
		deathScreen: document.querySelector("#death"),
		pauseMenu: document.querySelector(".pauseMenu")
	};
	const init = () => {
		document.body.appendChild(app.view);
		drawGrid();
		resize();

		app.stage.addChild(
			layers.floors,
			layers.objects,
			layers.players,
			layers.bullets,
			layers.roofs
		);
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
					data.players[player.id].id = player.id;

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
							true
						)
					);
				}

				let p = data.players[player.id];

				p.dead = player.dead;
				p.setSkin("bomb_skin_01", Sprite);

				if (player.id == data.pov && data.spectating) {
					focus(player.x, player.y);
				}

				if (!p._container.visible) p._container.visible = true;

				if (!player.dead) {
					if (player.id == data.pov && !data.spectating) {
						data.team = player.team;
						p.actualX = player.x;
						p.actualY = player.y;
					} else {
						p.rotate(player.angle);
						p.move(player.x, player.y);
					}
					p.team = player.team;
					p.curWeap = weapFromId(player.curWeap);
					p.action = player.action;

					if (p.action == actions.shoot && p.lastAction !== p.action) {
						audio.playSound(p.curWeap + "_shoot", { x: p.x, y: p.y });
					}

					p.lastAction = p.action;
				} else {
					p._playerRip.visible = true;
					p._playerBody.visible = false;
					p._playerSkin.visible = false;
					p._leftHand.visible = false;
					p._rightHand.visible = false;
					p._weapon.visible = false;

					if (player.id == data.pov) {
						audio.playMenuTheme();
						UI.deathScreen.classList.remove("hidden");
					}

					data.collisionSystem.remove(p._collider);

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
									{
										Sprite,
										Container,
										Box,
										Circle,
										system: data.collisionSystem
									},
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
					let id = data.bullets.length;
					data.bullets.push(new Bullet(bullet.x, bullet.y, bullet.angle, true));

					layers.bullets.addChild(
						data.bullets[id].create(
							{ Container, Sprite, Circle, system: data.collisionSystem },
							true
						)
					);

					let b = data.bullets[id];

					b.active = true;
					b.x = bullet.x;
					b.y = bullet.y;
					b.startX = bullet.startX;
					b.startY = bullet.startY;
					b.speed = bullet.speed;
					b.angle = bullet.angle;
					b.bulletType = bullet.type;
					b.team = bullet.team;
					b.range = weapons[weapFromId(bullet.type)].range || 100;

					b.update();
				});
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
			let deltaSpeed = player.speed * delta;

			if (moveX || moveY) {
				let moveDir = Math.atan2(moveY, moveX);

				player.move(Math.cos(moveDir) * deltaSpeed, Math.sin(moveDir) * deltaSpeed, false);

				if (!inMap(player.x, player.y, false, 1)) {
					player.move(
						clamp(player.x, data.map.min + 1, data.map.max - 1),
						clamp(player.y, data.map.min + 1, data.map.max - 1),
						true
					);
				}

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
			} else {
				player.move(
					lerp(player.x, player.actualX, 0.35),
					lerp(player.y, player.actualY, 0.35),
					true
				);
			}

			focus(player.x, player.y);

			player.rotate(input.mouseAngle);
		}

		data.lastFrameTime = now;

		forEach(data.players, (p) => {
			const weap = p.curWeap;
			const weapStats = weapons[weap];

			if (p.dead) {
				return (p._weapon.visible = false);
			}

			if (p.team !== data.team) {
				p._playerSkin.tint = 0xff0000;
			} else {
				p._playerSkin.tint = 0xffffff;
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
		forEach(data.bullets, (bullet) => {
			if (!bullet || bullet.done) return;
			if (bullet.deactivating >= 170) {
				bullet.done = true;
				return;
			}
			if (!bullet.active) {
				bullet.deactivating = clamp(now - bullet.deactivated, 0, 170);
				bullet.update();
				return;
			}

			bullet.move(bullet.speed);

			let potentials = data.collisionSystem.getPotentials(bullet._collider);

			potentials.some((collider) => {
				if (collider.__type == "bullet" || collider.__type == "loot") return false;
				if (collider.__type == "player" && data.players[collider.__pid].team == bullet.team)
					return false;

				if (data.collisionSystem.checkCollision(bullet._collider, collider)) {
					const { overlap, overlapN } = data.collisionSystem.response;

					bullet.move(-overlap);
					bullet.active = false;
					bullet.deactivated = now;
					data.collisionSystem.remove(bullet._collider);

					return true;
				}
			});

			if (bullet.distance > bullet.range || !inMap(bullet.x, bullet.y, true)) {
				bullet.active = false;
				bullet.deactivated = now;
				data.collisionSystem.remove(bullet._collider);
			}
		});

		data.bullets = filter(data.bullets, (b) => !b.done);

		if (input.getKeyDown(keybinds.pause) && !data.lastKeybind.pause) {
			UI.pauseMenu.classList.toggle("hidden");
		}

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

		data.lastKeybind.pause = input.getKeyDown(keybinds.pause);
	};
	const inMap = (x, y, pad = false, rad = 0) => {
		let min = data.map.min + rad - (pad ? data.map.pad : 0);
		let max = data.map.max - rad + (pad ? data.map.pad : 0);

		return x >= min && y >= min && x <= max && y <= max;
	};
	const drawGrid = () => {
		let map = data.map;
		let grid = new Graphics();

		let gridSize = 12;

		grid.lineStyle(0.1, 0, 0.15);

		for (let k = map.min - map.pad; k <= map.max + map.pad; k += gridSize) {
			grid.moveTo(k, map.min - map.pad);
			grid.lineTo(k, map.max + map.pad);
		}

		for (let k = map.min - map.pad; k <= map.max + map.pad; k += gridSize) {
			grid.moveTo(map.min - map.pad, k);
			grid.lineTo(map.max + map.pad, k);
		}

		grid.lineStyle(0);
		grid.beginFill(0, 0.2);
		// Left
		grid.drawRect(map.min - map.pad, map.min - map.pad, map.pad, (map.max + map.pad) * 2);
		// Top
		grid.drawRect(map.min, map.min - map.pad, map.max * 2, map.pad);
		// Right
		grid.drawRect(map.max, map.min - map.pad, map.pad, (map.max + map.pad) * 2);
		// Bottom
		grid.drawRect(map.min, map.max, map.max * 2, map.pad);

		layers.floors.addChildAt(grid, 0);
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

					if (!data.started) {
						done();
					}

					data.started = true;
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
						weapSlots[i].children[1].children[0].innerText = lang.getText(
							weaps[i].type
						);

						if (!weapSlots[i].children[1].children[1]) continue;
						if (!weapSlots[i].children[1].children[1].children.length) continue;

						weapSlots[i].children[1].children[1].children[0].innerText = weaps[i].ammo;
						weapSlots[i].children[1].children[1].children[1].innerText = "200";
					}

					document.querySelector("#healthAmnt").style.width = `${health}%`;

					break;
				}
				case messageIds.roundInfo: {
					let info = roundInfo.decode(arr);
					//console.log(roundInfo.decode(arr));
				}
			}
		});
	});
	channel.onDisconnect(() => {
		cancelAnimationFrame(animateUpdate);
	});
	input.on("change", sendInput);

	addEventListener("resize", resize);
	addEventListener("mousemove", input.bound);
	addEventListener("mousedown", input.bound);
	addEventListener("mouseup", input.bound);
	addEventListener("keydown", input.bound);
	addEventListener("keyup", input.bound);
	addEventListener("wheel", input.bound);
	addEventListener("contextmenu", input.bound);

	init();

	document.querySelectorAll(".weaponSlot").forEach((slot, i) => {
		slot.addEventListener("click", (e) => {
			sendInput(input, i);
		});
		slot.addEventListener("contextmenu", (e) => {
			e.preventDefault();
			sendInput(input, undefined, i == 0 ? 1 : i == 1 ? 2 : i == 4 ? 3 : 0);
		});
	});
};
const loadUserData = () => {
	fetch(
		"/api/user_data/?" +
			new URLSearchParams({
				token: settings.token
			}),
		{
			method: "post"
		}
	)
		.then((e) => e.json())
		.then(({ data, error }) => {
			if (error) {
				settings.setToken(false);
				return;
			}

			loggedIn = true;

			document.querySelector("#infoUsername").innerText = data.username;
			document.querySelectorAll(".loggedIn").forEach((e) => e.classList.remove("hidden"));
			document.querySelectorAll(".loggedOut").forEach((e) => e.classList.add("hidden"));
			console.log(data);
		});
};

audio.playMenuTheme();
settings.load();
settings.addListener((type, value, init) => {
	switch (type) {
		case "lang":
			lang.setLang(value);
			if (!init) location.reload();
			break;
		case "sfxVol":
			audio.volume = value;
			break;
		case "musicVol":
			audio.sounds.title_looped.volume(value);
			break;
	}
});

forEach(Object.keys(dictionary), (term) => {
	replaceInText(document.body, new RegExp(term, "g"), lang.getText(term));
});

if (settings.token) {
	loadUserData();
}

document.querySelector("#play").onclick = () => {
	startGame(() => {
		document.querySelector("#lobby").classList.add("hidden");
		document.querySelector("#info").classList.add("hidden");
		audio.stopMenuTheme();
	});
};
document.querySelector("#playAgain").onclick = () => {
	document.querySelector("#lobby").classList.remove("hidden");
	document.querySelector("#info").classList.remove("hidden");
	document.querySelector("#death").classList.add("hidden");
	audio.stopMenuTheme();
};

window.onload = () => {
	document.querySelector("#loading").classList.add("hidden");
};
window.showMenu = (menu) => {
	document
		.querySelectorAll(".leaderboard, .account, .friends, .settings, .menu, .back")
		.forEach((el) => el.classList.add("hidden"));

	if (menu) {
		document.querySelector(menu).classList.remove("hidden");
		document.querySelector(".back").classList.remove("hidden");
		document.querySelector(".sideMenu").classList.add("stayOpen");
	} else {
		document.querySelector(".menu").classList.remove("hidden");
		document.querySelector(".sideMenu").classList.remove("stayOpen");
	}
};
window.showModal = (modal) => {
	document
		.querySelectorAll(".privacy, .terms, .socials, .changelog")
		.forEach((el) => el.classList.add("hidden"));

	if (modal) {
		document.querySelector(modal).classList.remove("hidden");
		document.querySelector("#modal").classList.remove("hidden");
	} else {
		document.querySelector("#modal").classList.add("hidden");
	}
};
window.showSignup = () => {
	document.querySelector("#signup").classList.remove("hidden");
	document.querySelector("#login").classList.add("hidden");
};
window.showLogin = () => {
	document.querySelector("#login").classList.remove("hidden");
	document.querySelector("#signup").classList.add("hidden");
};
window.setMode = (mode) => {
	if (mode == "#competitiveMode" && !loggedIn) {
		console.log("Must have an account to play competitive!");
	} else {
		document
			.querySelectorAll("#casualMode, #competitiveMode, #deathmatchMode")
			.forEach((el) => el.classList.remove("active"));

		if (mode) {
			document.querySelector(mode).classList.add("active");
		} else {
			document.querySelector("#casualMode").classList.add("active");
		}
	}
};
window.login = () => {
	let username = document.querySelector("#username_login").value;
	let password = document.querySelector("#password_login").value;

	document.querySelector("#accountErr").classList.add("hidden");

	fetch(
		"/api/login/?" +
			new URLSearchParams({
				username,
				password
			}),
		{
			method: "post"
		}
	)
		.then((e) => e.json())
		.then(({ error, data }) => {
			if (error) {
				if (data) {
					document.querySelector("#accountErr").innerText = lang.getText(data);
					document.querySelector("#accountErr").classList.remove("hidden");
				}
				return;
			}

			if (data.token) {
				settings.setToken(data.token);
				loggedIn = true;
				loadUserData();
			}
		});
};
window.signup = () => {
	let username = document.querySelector("#username_signup").value;
	let password = document.querySelector("#password_signup").value;
	let email = document.querySelector("#email_signup").value;

	document.querySelector("#accountErr").classList.add("hidden");

	fetch(
		"/api/register/?" +
			new URLSearchParams({
				username,
				password,
				email
			}),
		{
			method: "post"
		}
	)
		.then((e) => e.json())
		.then(({ error, data }) => {
			if (error) {
				if (data) {
					document.querySelector("#accountErr").innerText = lang.getText(data);
					document.querySelector("#accountErr").classList.remove("hidden");
				}
				return;
			}

			if (data.token) {
				settings.setToken(data.token);
				loggedIn = true;
				loadUserData();
			}
		});
};
window.logout = () => {
	settings.setToken(false);
	location.reload();
};
