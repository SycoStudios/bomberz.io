import { BitArray } from "@codezilluh/bitarray.js";
import { messageIds } from "../modules/meta/messageIds.js";

let arr = new BitArray();

const encode = ({ pov, gameMode }) => {
	arr.reset();

	arr.addUint(messageIds.welcome, 3);
	arr.addUint(pov, 7);
	arr.addUint(gameMode, 4);

	return arr.encode();
};

const decode = (arr) => {
	return {
		pov: arr.getUint(7, 3),
		gameMode: arr.getUint(4, 10)
	};
};

export default {
	encode,
	decode
};
