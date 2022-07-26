import { BitArray } from "@codezilluh/bitarray.js";
import { messageIds } from "../modules/meta/messageIds.js";

let arr = new BitArray();

const encode = ({ id, timeLeft, team0Wins, team1Wins, team0Alive, team1Alive, coolDown }) => {
	arr.reset();

	arr.addUint(messageIds.roundInfo, 3);
	arr.addUint(id, 5);
	arr.addUint(timeLeft, 8);
	arr.addUint(team0Wins, 4);
	arr.addUint(team0Alive, 4);
	arr.addUint(team1Wins, 4);
	arr.addUint(team1Alive, 4);
	arr.addBit(coolDown);

	return arr.encode();
};

const decode = (arr) => {
	return {
		id: arr.getUint(5, 3),
		timeLeft: arr.getUint(8, 8),
		team0Wins: arr.getUint(4, 16),
		team0Alive: arr.getUint(4, 20),
		team1Wins: arr.getUint(4, 24),
		team1Alive: arr.getUint(4, 28),
		coolDown: !!arr.getBit(32)
	};
};

export default {
	encode,
	decode
};
