// RPM to MS delay: 1 / (RPM / 60000)
export const weapons = {
	"": false,
	fists: {
		type: "melee",
		multipleAnims: true,
		animR: "punchR",
		animL: "punchL",
		lootImage: new URL("../../src/img/fists_item.png?as=webp&width=60", import.meta.url).href,
		damage: 17
	},
	pistol: {
		type: "gun",
		height: 0.35,
		width: 1.36,
		bulletSpeed: 0.5,
		shootDelay: 330,
		range: 50,
		spread: 1,
		damage: 16,
		semi: true,
		lootImage: new URL("../../src/img/m1911_item.png?as=webp&width=120", import.meta.url).href,
		bodyImage: new URL("../../src/img/m1911_body.png?as=webp&width=300", import.meta.url).href
	},
	smg: {
		type: "gun",
		height: 0.34,
		width: 1.6,
		bulletSpeed: 0.4,
		shootDelay: 66,
		range: 30,
		spread: 9,
		damage: 8,
		lootImage: new URL("../../src/img/mp5_item.png?as=webp&width=120", import.meta.url).href,
		bodyImage: new URL("../../src/img/mp5_body.png?as=webp&width=200", import.meta.url).href
	},
	assault_rifle: {
		type: "gun",
		height: 0.53,
		width: 3.7,
		bulletSpeed: 0.5,
		shootDelay: 100,
		range: 55,
		spread: 1,
		damage: 9,
		lootImage: new URL(
			"../../src/img/assault_rifle_item.png?as=webp&width=120",
			import.meta.url
		).href,
		bodyImage: new URL(
			"../../src/img/assault_rifle_body.png?as=webp&width=300",
			import.meta.url
		).href
	},
	burst_rifle: {
		type: "gun",
		height: 0.49,
		width: 2.22,
		bulletSpeed: 0.5,
		shootDelay: 100,
		range: 55,
		spread: 1,
		damage: 9,
		lootImage: new URL("../../src/img/burst_rifle_item.png?as=webp&width=120", import.meta.url)
			.href,
		bodyImage: new URL("../../src/img/burst_rifle_body.png?as=webp&width=300", import.meta.url)
			.href
	},
	marksman_rifle: {
		type: "gun",
		height: 0.36,
		width: 3.42,
		bulletSpeed: 0.6,
		shootDelay: 86,
		range: 62,
		spread: 1,
		damage: 8,
		semi: true,
		lootImage: new URL("../../src/img/m14_item.png?as=webp&width=120", import.meta.url).href,
		bodyImage: new URL("../../src/img/m14_body.png?as=webp&width=300", import.meta.url).href
	},
	pump_shotgun: {
		type: "gun",
		height: 0.44,
		width: 2.82,
		bulletSpeed: 0.4,
		shootDelay: 620,
		bulletCount: 5,
		range: 20,
		semi: true,
		spread: 9,
		damage: 7,
		lootImage: new URL("../../src/img/r870_item.png?as=webp&width=120", import.meta.url).href,
		bodyImage: new URL("../../src/img/r870_body.png?as=webp&width=300", import.meta.url).href
	}
};

const weapNames = Object.keys(weapons);

export const idFromWeap = (weap) => {
	let index = weapNames.indexOf(weap);

	return index >= 0 ? index : undefined;
};

export const weapFromId = (id) => {
	return weapNames[id];
};
