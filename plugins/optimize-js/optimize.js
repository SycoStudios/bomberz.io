const { Optimizer } = require("@parcel/plugin");
const { minify } = require("terser");
const { readFileSync } = require("fs");
const { resolve } = require("path");
const { randomBytes } = require("crypto");
const props = [
	"dead",
	"skin",
	"weapons",
	"health",
	"curWeap",
	"angle",
	"changed",
	"seenList",
	"_isLocal",
	"move",
	"rotate",
	"damage",
	"canSee",
	"update",
	"create",
	"setWeap",
	"animate",
	"change",
	"speed",
	"_container",
	"_playerBody",
	"_playerSkin",
	"_leftHand",
	"_rightHand",
	"_weapsContainer",
	"_weapon",
	"_playerRip",
	"_collider",
	"setToken",
	"distance",
	"active",
	"deactivating",
	"startX",
	"startY",
	"destroyed",
	"category",
	"__pid",
	"__oid",
	"owner",
	"qty",
	"_container",
	"_background",
	"_item",
	"buttons",
	"keys",
	"keysOld",
	"buttonsOld",
	"mouseX",
	"mouseY",
	"getButtonDown",
	"getKeyDown",
	"mouseAngle",
	"team",
	"moveLeft",
	"moveRight",
	"moveUp",
	"moveDown",
	"mouseDown",
	"interact",
	"prevWeap",
	"nextWeap",
	"drop",
	"angle",
	"curWeap",
	"sec",
	"selectedWeap",
	"weapId",
	"credits",
	"username",
	"timeLeft",
	"coolDown",
	"pov",
	"gameMode",
	"started",
	"collisionSystem",
	"spectating",
	"playerInfo",
	"recSec",
	"players",
	"objects",
	"bullets",
	"id",
	"x",
	"x"
];
const clean = (code) => {
	let n = code;

	props.forEach((p) => {
		let x = randomBytes(2).toString("hex");

		n = n.replace(new RegExp(`(?<!Object)\\.${p}(?=\W)(?=\S)`, "g"), `._${x}`);
		n = n.replace(new RegExp(`(?<!Object)\\["${p}"\\]`, "g"), `['_${x}']`);
		n = n.replace(new RegExp(`(?<!Object|const|let)(\\W)${p}:`, "g"), `$1_${x}:`);
		n = n.replace(new RegExp(`(?<!Object)(\\})${p}\\(`, "g"), `$1_${x}(`);
		n = n.replace(new RegExp(`(?<!Object)(\\W)\\.${p}=`, "g"), `$1._${x}=`);
	});

	return n;
};
const dictionary = readFileSync(resolve(__dirname, "../../modules/lang.js"), "utf-8").match(
	/(\w+)(?=: {)/g
);

module.exports = new Optimizer({
	async optimize({ contents, map, bundle }) {
		if (!bundle.env.shouldOptimize) {
			return { contents, map };
		}

		if (contents.includes("@pixi/constants")) {
			let { code } = await minify(contents, {
				toplevel: true,
				compress: {
					drop_console: true,
					passes: 20
				}
			});

			return { contents: code };
		} else {
			let cleanedCode = (await minify(contents, { toplevel: true })).code;
			let { code } = await minify(cleanedCode, {
				compress: {
					booleans_as_integers: true,
					drop_console: true,
					keep_fargs: false,
					passes: 20
				},
				mangle: {
					properties: {
						regex: new RegExp(`^(${props.join("|")})`)
					}
				},
				toplevel: true
			});

			return { contents: code };
		}
	}
});
