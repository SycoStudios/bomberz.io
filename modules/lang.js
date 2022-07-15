export const dictionary = {
	// weap names
	fists: {
		en: "Fists",
		es: "Puños"
	},
	assault_rifle: {
		en: "Assault Rifle",
		es: "Rifle de Asalto"
	},
	burst_rifle: {
		en: "Burst Rifle",
		es: "Rifle de Ráfaga"
	},
	smg: {
		en: "SMG",
		es: "Subfusil"
	},
	pistol: {
		en: "Pistol",
		es: "Pistola"
	},
	marksman_rifle: {
		en: "Marksman Rifle",
		es: "Rifle de Tirador"
	},
	pump_shotgun: {
		en: "Pump Shotgun",
		es: "Escopeta"
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
	},
	language: {
		en: "Language",
		es: "Idioma"
	},
	music_vol: {
		en: "Music Volume",
		es: "Volumen de la Música"
	},
	sfx_vol: {
		en: "SFX Volume",
		es: "Volumen SFX"
	},
	not_signed_in: {
		en: "Not signed in",
		es: "No registrado"
	},
	settings: {
		en: "Settings",
		es: "Ajustes"
	},
	friends: {
		en: "Friends",
		es: "Amigos"
	},
	account: {
		en: "Account",
		es: "Perfil"
	},
	leaderboard: {
		en: "Leaderboard",
		es: "Tabla de Clasificación"
	},
	privacy: {
		en: "Privacy",
		es: "Privacidad"
	},
	terms: {
		en: "Terms",
		es: "Términos"
	},
	socials: {
		en: "Socials",
		es: "Redes Sociales"
	},
	casual: {
		en: "Casual"
	},
	competitive: {
		en: "Competitive",
		es: "Competitivo"
	},
	deathmatch: {
		en: "Deathmatch",
		es: "Combate-a-Muerte"
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
