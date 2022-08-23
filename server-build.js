import { minify } from "terser";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { resolve } from "path";

const minifyFile = async (fname) => {
	let file = readFileSync(fname, "utf-8");
	let { code } = await minify(file, {
		compress: {
			passes: 10
		}
	});

	writeFileSync(resolve("build-server/", fname), code);
};

if (existsSync("build-server")) {
	rmSync("build-server", {
		recursive: true
	});
}

mkdirSync("build-server");
mkdirSync("build-server/modules");
mkdirSync("build-server/modules/meta");
mkdirSync("build-server/models");

minifyFile("game_server.js");
minifyFile("game.js");
minifyFile("modules/player.js");
minifyFile("modules/object.js");
minifyFile("modules/optimized.js");
minifyFile("modules/math.js");
minifyFile("modules/loot.js");
minifyFile("modules/bullet.js");
minifyFile("modules/meta/weapons.js");
minifyFile("modules/meta/animations.js");
minifyFile("modules/meta/objects.js");
minifyFile("modules/meta/actions.js");
minifyFile("modules/meta/messageIds.js");
minifyFile("modules/meta/objCategories.js");
minifyFile("modules/meta/itemTypes.js");
minifyFile("modules/meta/skins.js");
minifyFile("modules/meta/gameModes.js");
minifyFile("models/bullets.js");
minifyFile("models/index.js");
minifyFile("models/input.js");
minifyFile("models/loadout.js");
minifyFile("models/localState.js");
minifyFile("models/playerInfo.js");
minifyFile("models/profile.js");
minifyFile("models/round.js");
minifyFile("models/update.js");
minifyFile("models/welcome.js");
