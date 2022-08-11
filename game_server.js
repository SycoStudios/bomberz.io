import geckos, { iceServers } from "@geckos.io/server";
import { inputState, loadout } from "./models/index.js";
import { messageIds } from "./modules/meta/messageIds.js";
import { BitArray } from "@codezilluh/bitarray.js";
import Game from "./game.js";
import { filter } from "./modules/optimized.js";

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
const getOpenGame = () => {
	games = filter(games, (g) => {
		return !g.gameOver && g.activePlayers < 10 && g.round.inCoolDown;
	});

	let openGames = Object.keys(games).sort(
		(a, b) => games[a].activePlayers - games[b].activePlayers
	);

	if (openGames.length == 0) {
		let game = new Game(io);

		games[game.gameId] = game;

		return game.gameId;
	} else {
		return openGames[0];
	}
};
let games = {};

io.listen(3000);
io.onConnection((channel) => {
	channel.gameId = getOpenGame();

	let game = games[channel.gameId];

	channel.onDisconnect(() => {
		if (!game) return;

		game.playerLeft(channel);
		channel.__disconnected = true;
	});

	channel.onRaw(({ buffer }) => {
		if (!game) return;
		if (channel.__disconnected) return;

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

	channel.on("protocol", (v) => {
		if (!game) return;

		if (v == game.protocol) {
			channel.joined = true;
			channel.emit("joined");
			game.addPlayer(channel);
		} else {
			channel.emit("outdated");
		}
	});

	channel.on("token", (token) => {
		if (!game) return;

		game.playerToken(channel.pid, token);
	});
});
