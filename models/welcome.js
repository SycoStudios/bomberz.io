import { BitArray } from "@codezilluh/bitarray.js";
import { messageIds } from "../modules/meta/messageIds.js";

const encode = ({ pov }) => {
	let arr = new BitArray();

	arr.addUint(messageIds.welcome, 3);
	arr.addUint(pov, 7);

	return arr.encode();
};

const decode = (arr) => {
	return {
		pov: arr.getUint(7, 3)
	};
};

export default {
	encode,
	decode
};
