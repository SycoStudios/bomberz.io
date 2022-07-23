import geckos, { iceServers } from "@geckos.io/server";
import { inputState, loadout } from "./models/index.js";
import { messageIds } from "./modules/meta/messageIds.js";
import { BitArray } from "@codezilluh/bitarray.js";
import Game from "./game.js";

const io = geckos({
	authorization: (auth, request) => {
		return true;
	},
	cors: {
		origin: (req) => {
			return "*";
		}
	},
	iceServers
});
const game = new Game(io);

io.listen(3000);
io.onConnection((channel) => {
	channel.onDisconnect(() => {
		game.playerLeft(channel);
	});

	channel.onRaw(({ buffer }) => {
		let arr = new BitArray(buffer);
		let messageType = arr.getUint(3);

		switch (messageType) {
			case messageIds.input: {
				game.playerInput(channel.pid, inputState.decode(arr));
				break;
			}
			case messageIds.loadout: {
				game.playerLoadout(channel.pid, loadout.decode(arr));
			}
		}
	});

	game.addPlayer(channel);
});
