export const dictionary = {
	// weap names
	fists: {
		en: "Fists",
		es: "Puños"
	},
	ak47: {
		en: "AK-47"
	},
	mp5: {
		en: "MP5"
	},
	m9: {
		en: "M9"
	},
	m1911: {
		en: "M1911"
	},
	m16: {
		en: "M16"
	},
	m14: {
		en: "M14"
	},
	r870: {
		en: "R870"
	},
	// ammo types
	9: {
		en: "9mm"
	},
	762: {
		en: "7.62mm"
	},
	45: {
		en: ".45 ACP"
	},
	556: {
		en: "5.56mm"
	},
	12: {
		en: "12g"
	},
	// interface
	join: {
		en: "Join game",
		es: "Unete al juego"
	},
	joining: {
		en: "Joining game",
		es: "Uniéndose al juego"
	},
	failed: {
		en: "Failed joining game",
		es: "No se pudo unir al juego"
	},
	try_again: {
		en: "Try again?",
		es: "¿Intentar otra vez?"
	},
	pickup: {
		en: "Pickup",
		es: "Tomar"
	},
	use: {
		en: "Use",
		es: "Utilizar"
	},
	reload: {
		en: "Reload",
		es: "Recarga"
	},
	empty_gun: {
		en: "No ammo",
		es: "Sin municiones"
	},
	empty_item: {
		en: "Out of *",
		es: "Sin *"
	}
};

export class Language {
	constructor() {
		this.language = "en";
	}

	setLang(lang) {
		this.language = lang;
	}

	getText(text) {
		return dictionary[text][this.language] || dictionary[text]["en"];
	}
}
