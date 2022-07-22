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
		lootImage: new URL("../../src/img/m1911_item.png?as=webp&width=300", import.meta.url).href,
		bodyImage: new URL("../../src/img/m1911_body.png?as=webp&width=300", import.meta.url).href,
		storeData: {
			cost: 0,
			class: "sidearm"
		}
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
		lootImage: new URL("../../src/img/mp5_item.png?as=webp&width=300", import.meta.url).href,
		bodyImage: new URL("../../src/img/mp5_body.png?as=webp&width=200", import.meta.url).href,
		storeData: {
			cost: 1000,
			class: "smg"
		}
	},
	assault_rifle: {
		type: "gun",
		height: 0.4,
		width: 3.06,
		bulletSpeed: 0.5,
		shootDelay: 100,
		range: 55,
		spread: 2,
		damage: 9,
		lootImage: new URL(
			"../../src/img/assault_rifle_item.png?as=webp&width=300",
			import.meta.url
		).href,
		bodyImage: new URL(
			"../../src/img/assault_rifle_body.png?as=webp&width=300",
			import.meta.url
		).href,
		storeData: {
			cost: 1500,
			class: "rifle"
		}
	},
	burst_rifle: {
		type: "gun",
		height: 0.4,
		width: 2.88,
		bulletSpeed: 0.5,
		shootDelay: 200,
		burstDelay: 40,
		range: 55,
		spread: 1.5,
		damage: 7,
		burst: true,
		lootImage: new URL("../../src/img/burst_rifle_item.png?as=webp&width=300", import.meta.url)
			.href,
		bodyImage: new URL("../../src/img/burst_rifle_body.png?as=webp&width=300", import.meta.url)
			.href,
		storeData: {
			cost: 2100,
			class: "rifle"
		}
	},
	marksman_rifle: {
		type: "gun",
		height: 0.4,
		width: 3.06,
		bulletSpeed: 0.6,
		shootDelay: 180,
		range: 62,
		spread: 0.5,
		damage: 13,
		semi: true,
		lootImage: new URL(
			"../../src/img/marksman_rifle_item.png?as=webp&width=300",
			import.meta.url
		).href,
		bodyImage: new URL(
			"../../src/img/marksman_rifle_body.png?as=webp&width=300",
			import.meta.url
		).href,
		storeData: {
			cost: 2700,
			class: "rifle"
		}
	},
	sniper: {
		type: "gun",
		height: 0.4,
		width: 3.06,
		bulletSpeed: 0.6,
		shootDelay: 180,
		range: 62,
		spread: 0.5,
		damage: 13,
		semi: true,
		lootImage: new URL(
			"../../src/img/marksman_rifle_item.png?as=webp&width=300",
			import.meta.url
		).href,
		bodyImage: new URL(
			"../../src/img/marksman_rifle_body.png?as=webp&width=300",
			import.meta.url
		).href,
		storeData: {
			cost: 1100,
			class: "sniper"
		}
	},
	lmg: {
		type: "gun",
		height: 0.4,
		width: 3.06,
		bulletSpeed: 0.6,
		shootDelay: 180,
		range: 62,
		spread: 0.5,
		damage: 13,
		semi: true,
		lootImage: new URL(
			"../../src/img/marksman_rifle_item.png?as=webp&width=300",
			import.meta.url
		).href,
		bodyImage: new URL(
			"../../src/img/marksman_rifle_body.png?as=webp&width=300",
			import.meta.url
		).href,
		storeData: {
			cost: 1700,
			class: "heavy"
		}
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
		lootImage: new URL("../../src/img/r870_item.png?as=webp&width=300", import.meta.url).href,
		bodyImage: new URL("../../src/img/r870_body.png?as=webp&width=300", import.meta.url).href,
		storeData: {
			cost: 900,
			class: "shotgun"
		}
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
