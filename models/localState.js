import { BitArray } from "@codezilluh/bitarray.js";
import { messageIds } from "../modules/meta/messageIds.js";

const encode = ({
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
}) => {
	let arr = new BitArray();

	arr.addUint(messageIds.self, 3);
	arr.addUint(weapon1Type, 5);
	arr.addUint(weapon2Type, 5);
	arr.addUint(weapon3Type, 5);
	arr.addUint(weapon4Type, 5);

	arr.addUint(weapon1Ammo, 6);
	arr.addUint(weapon2Ammo, 6);
	arr.addUint(weapon3Ammo, 4);
	arr.addUint(weapon4Ammo, 5);

	arr.addUint(weapId, 4);
	arr.addUint(health, 7);

	return arr.encode();
};

const decode = (arr) => {
	return {
		weapon1Type: arr.getUint(5, 3),
		weapon2Type: arr.getUint(5, 8),
		weapon3Type: arr.getUint(5, 13),
		weapon4Type: arr.getUint(5, 18),
		weapon1Ammo: arr.getUint(6, 23),
		weapon2Ammo: arr.getUint(6, 29),
		weapon3Ammo: arr.getUint(4, 35),
		weapon4Ammo: arr.getUint(5, 39),
		weapId: arr.getUint(4, 44),
		health: arr.getUint(7, 48)
	};
};

export default {
	encode,
	decode
};
