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

	joining: {
		en: "Joining game",
		es: "Uniéndose al juego"
	},
	join: {
		en: "Join game",
		es: "Unete al juego"
	},
	failed_joining: {
		en: "Failed joining game",
		es: "No se pudo unir al juego"
	},
	try_again: {
		en: "Try again?",
		es: "¿Intentar otra vez?"
	},
	empty_gun: {
		en: "No ammo",
		es: "Sin municiones"
	},
	empty_item: {
		en: "Out of *",
		es: "Sin *"
	},
	music_vol: {
		en: "Music Volume",
		es: "Volumen de la Música"
	},
	sfx_vol: {
		en: "SFX Volume",
		es: "Volumen SFX"
	},
	server_error: {
		en: "Server Error",
		es: "Error del Servidor"
	},
	wrong_ip: {
		en: "Unrecognized IP Address",
		es: "Dirección IP no reconocida"
	},
	game_info: {
		en: "Game Info",
		es: "Sobre"
	},
	screen_mode: {
		en: "Screen Mode",
		es: "Modo de Pantalla"
	},
	not_signed_in: {
		en: "Not signed in",
		es: "No registrado"
	},
	confirm_password: {
		en: "Confirm Password",
		es: "Confirmar Clave"
	},
	need_an_account: {
		en: "Need an Account?",
		es: "¿Necesita una Cuenta?"
	},
	have_an_account: {
		en: "Have an Account?",
		es: "¿Tienes una Cuenta?"
	},
	leaderboard: {
		en: "Leaderboard",
		es: "Clasificación"
	},
	privacy: {
		en: "Privacy",
		es: "Privacidad"
	},
	terms: {
		en: "Terms",
		es: "Términos"
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
	},
	back: {
		en: "Back",
		es: "Volver"
	},
	not_found: {
		en: "Not Found",
		es: "No Encontrada"
	},
	forbidden: {
		en: "Access Forbidden",
		es: "Acceso Prohibido"
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
	logout: {
		en: "Logout",
		es: "Cerrar Sesión"
	},
	login: {
		en: "Login",
		es: "Acceso"
	},
	register: {
		en: "Register",
		es: "Registrar"
	},
	username: {
		en: "Username",
		es: "Usuario"
	},
	password: {
		en: "Password",
		es: "Clave"
	},
	email: {
		en: "Email"
	},
	language: {
		en: "Language",
		es: "Idioma"
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
