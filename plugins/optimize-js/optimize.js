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
	"x",
	"y",
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
	"recSec"
];
const clean = (code) => {
	let n = code;

	// props.forEach((p) => {
	// 	let x = randomBytes(2).toString("hex");

	// 	n = n.replace(new RegExp(`\\.${p}`, "g"), `._${x}`);
	// 	n = n.replace(new RegExp(`\\["${p}"\\]`, "g"), `['_${x}']`);
	// 	n = n.replace(new RegExp(`${p}:`, "g"), `_${x}:`);
	// });

	return n;
};
const dictionary = readFileSync(resolve(__dirname, "../../modules/lang.js"), "utf-8").match(
	/(\w+)(?=: {)/g
);

module.exports = new Optimizer({
	async optimize({ contents, map, bundle }) {
		if (true || !bundle.env.shouldOptimize) {
			return { contents, map };
		}

		let { code } = await minify(contents, {
			compress: {
				booleans_as_integers: true,
				//drop_console: true,
				keep_fargs: false,
				passes: 2
			},
			mangle: {
				reserved: [],
				properties: {
					reserved: [],
					regex: new RegExp(`^(${props.join("|")})`)
				}
			}
		});

		return { contents: clean(code) };
	}
});
