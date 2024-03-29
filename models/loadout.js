import { BitArray } from "@codezilluh/bitarray.js";
import { messageIds } from "../modules/meta/messageIds.js";

let arr = new BitArray();

const encode = ({ selectedWeap }) => {
	arr.reset();

	arr.addUint(messageIds.loadout, 3);
	arr.addUint(selectedWeap, 5);

	return arr.encode();
};

const decode = (arr) => {
	return {
		selectedWeap: arr.getUint(5, 3)
	};
};

export default {
	encode,
	decode
};
