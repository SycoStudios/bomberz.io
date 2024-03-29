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
		bulletSpeed: 0.7,
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
		},
		ammo: {
			mag: 12,
			pack: 36
		}
	},
	smg: {
		type: "gun",
		height: 0.32,
		width: 2.58,
		bulletSpeed: 0.9,
		shootDelay: 32,
		range: 32,
		spread: 11,
		damage: 8,
		lootImage: new URL("../../src/img/smg_item.png?as=webp&width=300", import.meta.url).href,
		bodyImage: new URL("../../src/img/smg_body.png?as=webp&width=200", import.meta.url).href,
		storeData: {
			cost: 1000,
			class: "smg"
		},
		ammo: {
			mag: 20,
			pack: 60
		}
	},
	enhanced_smg: {
		type: "gun",
		height: 0.35,
		width: 1.97,
		bulletSpeed: 0.7,
		shootDelay: 28,
		range: 30,
		spread: 9,
		damage: 8,
		lootImage: new URL("../../src/img/enhanced_smg_item.png?as=webp&width=300", import.meta.url)
			.href,
		bodyImage: new URL("../../src/img/enhanced_smg_body.png?as=webp&width=200", import.meta.url)
			.href,
		storeData: {
			cost: 1600,
			class: "smg"
		},
		ammo: {
			mag: 30,
			pack: 90
		}
	},
	assault_rifle: {
		type: "gun",
		height: 0.4,
		width: 3.06,
		bulletSpeed: 0.8,
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
		},
		ammo: {
			mag: 30,
			pack: 90
		}
	},
	burst_rifle: {
		type: "gun",
		height: 0.4,
		width: 2.88,
		bulletSpeed: 0.8,
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
		},
		ammo: {
			mag: 24,
			pack: 72
		}
	},
	marksman_rifle: {
		type: "gun",
		height: 0.4,
		width: 3.06,
		bulletSpeed: 0.9,
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
		},
		ammo: {
			mag: 12,
			pack: 36
		}
	},
	sniper: {
		type: "gun",
		height: 0.4,
		width: 3.06,
		bulletSpeed: 0.8,
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
		},
		ammo: {
			mag: 5,
			pack: 15
		}
	},
	lmg: {
		type: "gun",
		height: 0.4,
		width: 3.06,
		bulletSpeed: 0.7,
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
		},
		ammo: {
			mag: 50,
			pack: 100
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
		},
		ammo: {
			mag: 5,
			pack: 10
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
