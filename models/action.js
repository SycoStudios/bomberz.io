import { BitArray } from "@codezilluh/bitarray.js";
import { messageIds } from "../modules/meta/messageIds.js";

let arr = new BitArray();

const encode = ({ id, action }) => {
	arr.reset();

	arr.addUint(messageIds.action, 3);
	arr.addUint(id, 7);
	arr.addUint(action, 4);

	return arr.encode();
};

const decode = (arr) => {
	return {
		id: arr.getUint(7, 3),
		action: arr.getUint(4, 10)
	};
};

export default {
	encode,
	decode
};
