import { BitArray } from "@codezilluh/bitarray.js";
import { messageIds } from "../modules/meta/messageIds.js";

let fraction = (2 ** 14 - 1) / 180;

const encode = ({ players, objects }) => {
	let arr = new BitArray();

	arr.addUint(messageIds.update, 3);
	arr.addUint(players.length, 7);
	arr.addUint(objects.length, 6);

	for (var i = 0; i < players.length; i++) {
		let player = players[i];

		arr.addUint(player.id, 7);
		arr.addInt(Math.round(player.x * 10 ** 4), 23);
		arr.addInt(Math.round(player.y * 10 ** 4), 23);
		arr.addInt(Math.round(player.angle * fraction), 15);
		arr.addUint(player.action, 4);
		arr.addUint(player.curWeap, 5);
		arr.addBit(player.dead);
		arr.addBit(player.team);
	}

	for (var i = 0; i < objects.length; i++) {
		let object = objects[i];

		arr.addUint(object.id, 11);
		arr.addUint(object.category, 5);
		arr.addUint(object.data, 7);
		arr.addInt(Math.round(object.x * 10 ** 2), 16);
		arr.addInt(Math.round(object.y * 10 ** 2), 16);
		arr.addBit(object.destroyed);
	}

	return arr.encode();
};

const decode = (arr) => {
	let data = {
		players: [],
		objects: []
	};

	let playerLength = arr.getUint(7, 3);
	let objectLength = arr.getUint(6, 10);

	for (var i = 0; i < playerLength; i++) {
		let offset = 16 + i * 79;

		data.players.push({
			id: arr.getUint(7, offset),
			x: arr.getInt(23, 7 + offset) / 10 ** 4,
			y: arr.getInt(23, 30 + offset) / 10 ** 4,
			angle: arr.getInt(15, 53 + offset) / fraction,
			action: arr.getUint(4, 68 + offset),
			curWeap: arr.getUint(5, 72 + offset),
			dead: arr.getBit(77 + offset),
			team: arr.getBit(78 + offset)
		});
	}

	for (var i = 0; i < objectLength; i++) {
		let offset = 16 + playerLength * 79 + i * 56;

		data.objects.push({
			id: arr.getUint(11, offset),
			category: arr.getUint(5, 11 + offset),
			data: arr.getUint(7, 16 + offset),
			x: arr.getInt(16, 23 + offset) / 10 ** 2,
			y: arr.getInt(16, 39 + offset) / 10 ** 2,
			destroyed: arr.getBit(55 + offset)
		});
	}

	return data;
};

export default {
	encode,
	decode
};
