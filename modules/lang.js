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
	add_friend: {
		en: "Add Friend",
		es: "Agregar Amigo"
	},
	friends_name: {
		en: "Enter your friend's name",
		es: "Ingresa el nombre de tu amigo"
	},
	friend_requests: {
		en: "Friend Requests",
		es: "Peticiones de Amistad"
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
	no_password: {
		en: "Password cannot be blank",
		es: "La contraseña no puede estar en blanco"
	},
	no_username: {
		en: "Username cannot be blank",
		es: "Nombre de usuario no puede estar en blanco"
	},
	no_email: {
		en: "Email cannot be blank",
		es: "El email no puede estar en blanco"
	},
	email_invalid: {
		en: "Email must be valid",
		es: "El email debe ser válido"
	},
	username_taken: {
		en: "Username already taken",
		es: "El nombre de usuario ya está en uso"
	},
	username_too_short: {
		en: "Username too long",
		es: "Nombre de usuario demasiado largo"
	},
	username_too_long: {
		en: "Username too short",
		es: "Nombre de usuario demasiado corto"
	},
	password_too_short: {
		en: "Password too short",
		es: "Contraseña demasiado corta"
	},
	password_too_long: {
		en: "Password too long",
		es: "Contraseña demasiado larga"
	},
	password_check_fail: {
		en: "Passwords don't match",
		es: "Las contraseñas no coinciden"
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
	skins: {
		en: "Skins",
		es: "Pieles"
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
