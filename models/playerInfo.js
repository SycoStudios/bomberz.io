import { BitArray } from "@codezilluh/bitarray.js";
import { messageIds } from "../modules/meta/messageIds.js";

let fraction = (2 ** 14 - 1) / 180;

const encode = (players) => {
	let arr = new BitArray();

	arr.addUint(messageIds.playerInfo, 3);
	arr.addUint(players.length, 7);

	for (var i = 0; i < players.length; i++) {
		let player = players[i];

		arr.addUint(player.id, 7);
		arr.addUint(player.credits, 20);
		arr.addUint(player.username.length, 5);
		for (var k = 0; k < player.username.length; k++) {
			arr.addUint(player.username.charCodeAt(k), 8);
		}
	}

	return arr.encode();
};

const decode = (arr) => {
	let data = [];

	let playerLength = arr.getUint(7, 3);

	let offset = 10;

	for (var i = 0; i < playerLength; i++) {
		let player = {
			id: arr.getUint(7, offset),
			credits: arr.getUint(20, 7 + offset),
			username: ""
		};

		let nameLen = arr.getUint(5, 27 + offset);

		for (var k = 0; k < nameLen; k++) {
			player.username += String.fromCharCode(arr.getUint(8, 32 + offset));
			offset += 8;
		}

		data.push(player);

		offset += 32;
	}

	return data;
};

export default {
	encode,
	decode
};
