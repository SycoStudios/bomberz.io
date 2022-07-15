import { BitArray } from "@codezilluh/bitarray.js";
import { messageIds } from "../modules/meta/messageIds.js";

let fraction = (2 ** 14 - 1) / 180;

const encode = ({ bullets }) => {
	let arr = new BitArray();

	arr.addUint(messageIds.bullets, 3);
	arr.addUint(bullets.length, 10);

	for (var i = 0; i < bullets.length; i++) {
		let bullet = bullets[i];

		arr.addInt(Math.round(bullet.x * 10 ** 2), 16);
		arr.addInt(Math.round(bullet.y * 10 ** 2), 16);
		arr.addInt(Math.round(bullet.startX * 10 ** 2), 16);
		arr.addInt(Math.round(bullet.startY * 10 ** 2), 16);
		arr.addInt(Math.round(bullet.angle * fraction), 15);
		arr.addUint(Math.round(bullet.speed * 100), 8);
		arr.addUint(bullet.type, 5);
		arr.addBit(bullet.team);
	}

	return arr.encode();
};

const decode = (arr) => {
	let data = {
		bullets: []
	};

	let bulletLength = arr.getUint(10, 3);

	for (var i = 0; i < bulletLength; i++) {
		let offset = 13 + i * 93;

		data.bullets.push({
			x: arr.getInt(16, offset) / 10 ** 2,
			y: arr.getInt(16, 16 + offset) / 10 ** 2,
			startX: arr.getInt(16, 32 + offset) / 10 ** 2,
			startY: arr.getInt(16, 48 + offset) / 10 ** 2,
			angle: arr.getInt(15, 64 + offset) / fraction,
			speed: arr.getUint(8, 79 + offset) / 100,
			type: arr.getUint(5, 87 + offset),
			team: arr.getBit(92 + offset)
		});
	}

	return data;
};

export default {
	encode,
	decode
};
