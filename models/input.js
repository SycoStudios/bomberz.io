import { BitArray } from "@codezilluh/bitarray.js";
import { messageIds } from "../modules/meta/messageIds.js";

let fraction = (2 ** 14 - 1) / 180;
let arr = new BitArray();

const encode = ({
	moveLeft,
	moveRight,
	moveUp,
	moveDown,
	mouseDown,
	interact,
	prevWeap,
	nextWeap,
	drop,
	angle,
	curWeap,
	sec
}) => {
	arr.reset();

	arr.addUint(messageIds.input, 3);
	arr.setBit(moveLeft, 3);
	arr.setBit(moveRight, 4);
	arr.setBit(moveUp, 5);
	arr.setBit(moveDown, 6);
	arr.setBit(mouseDown, 7);
	arr.addUint(interact ? 1 : prevWeap ? 2 : nextWeap ? 3 : 0, 2);
	arr.addUint(drop, 4);
	arr.addInt(Math.round(angle * fraction), 15);
	arr.addUint(curWeap, 3);
	arr.addUint(sec, 8);

	return arr.encode();
};

const decode = (arr) => {
	let interactions = arr.getUint(2, 8);

	return {
		moveLeft: arr.getBit(3),
		moveRight: arr.getBit(4),
		moveUp: arr.getBit(5),
		moveDown: arr.getBit(6),
		mouseDown: arr.getBit(7),
		interact: interactions == 1,
		prevWeap: interactions == 2,
		nextWeap: interactions == 3,
		drop: arr.getUint(4, 10),
		angle: arr.getInt(15, 14) / fraction,
		curWeap: arr.getUint(3, 29),
		sec: arr.getUint(8, 32)
	};
};

export default {
	encode,
	decode
};
