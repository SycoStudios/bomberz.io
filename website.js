import express from "express";
import fs, { write } from "fs";
import { decode, encode, Encrypter } from "./models/profile.js";
import { createHash } from "crypto";

let blockedIPs = [];
let users = {};

const app = express();
const port = 80;
const clean = (string) => {
	return string.replace(/\W/gi, "").toLowerCase();
};
const getUser = (name) => {
	try {
		name = clean(name);

		if (!users[name]) {
			let path = `database/users/${name}`;

			if (!fs.existsSync(path)) return false;

			users[name] = decode(fs.readFileSync(path, "utf-8"));
		}

		return users[name];
	} catch (e) {
		return false;
	}
};
const writeUser = (name) => {
	name = clean(name);

	if (!users[name]) return false;

	fs.writeFileSync(`database/users/${name.toLowerCase()}`, encode(users[name]));
};
const getToken = (name, e = false) => {
	let user = getUser(name);

	if (!user) return false;

	let data = `${user.username}|${user.password}|${user.ip}`;

	if (e) {
		return data;
	} else {
		return enc.encrypt(data, "hex");
	}
};
const readToken = (token) => {
	try {
		let arr = enc.decrypt(token, "hex").split("|");

		return {
			username: arr[0],
			password: arr[1],
			ip: arr[2]
		};
	} catch (e) {
		return false;
	}
};
const tokenValid = (token, req) => {
	if (!token) return false;

	let data = readToken(token);

	if (!data) return false;

	let user = getUser(data.username);

	if (!user) return false;

	if (req && hash(req.ip) !== user.ip) return false;

	return user.username == data.username && user.password == data.password && user.ip == data.ip
		? data
		: false;
};
const send = (res, code, data) => {
	return res.status(code > 1 ? code : 200).send(
		JSON.stringify({
			error: code !== 200 ? true : undefined,
			data:
				code == 403
					? "forbidden"
					: code == 404
					? "not_found"
					: code == 500
					? "server_error"
					: data
		})
	);
};
const hash = (data) => {
	return createHash("sha256").update(data).digest("base64");
};
const enc = new Encrypter("@VeryStrongPassword+Secret!");
const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i;

app.use(express.static("dist"));

app.post("/api/register/", (req, res) => {
	if (!req.headers.referer || blockedIPs.includes(req.ip)) {
		return send(res, 403);
	} else {
		const username = clean(req.query.username || "");
		const password = req.query.password;
		const email = req.query.email;

		let errors = [];

		if (!username) errors.push("No username");
		if (!password) errors.push("No password");
		if (!email) errors.push("No email");
		if (username && (username.length > 16 || username.length < 3))
			errors.push(`Username too ${username.length > 16 ? "long" : "short"}`);
		if (password && (password.length < 6 || password.length > 32))
			errors.push(`Password too ${password.length > 32 ? "long" : "short"}`);
		if (email && !emailRegex.test(email)) errors.push("Email not valid");

		if (errors.length) {
			return send(res, true, errors);
		}

		let file = `database/users/${username.toLowerCase()}`;

		if (fs.existsSync(file)) {
			errors.push("Username taken");
			return send(res, true, errors);
		}

		let profile = encode({
			username: req.query.username.replace(/\W/gi, ""),
			password: hash(password),
			email: enc.encrypt(email),
			ip: hash(req.ip),
			friends: [],
			points: 0,
			matches: []
		});

		fs.writeFileSync(file, profile);

		return send(res, 200, { token: getToken(username) });
	}
});
app.post("/api/login", (req, res) => {
	if (!req.headers.referer || blockedIPs.includes(req.ip)) {
		return send(res, 403);
	} else {
		const username = req.query.username;
		const password = req.query.password;

		let errors = [];

		if (!username) errors.push("No username");
		if (!password) errors.push("No password");

		if (errors.length > 0) return send(res, true, errors);

		let user = getUser(username);

		if (user.password == hash(password)) {
			user.ip = hash(req.ip);
			writeUser(user.username);
			send(res, 200, { token: getToken(user.username) });
		} else {
			send(res);
		}
	}
});
app.post("/api/user_data", (req, res) => {
	let valid = tokenValid(req.query.token, req);

	if (!valid) return send(res, true, "not_signed_in");

	let user = getUser(valid.username);

	send(res, 200, {
		username: user.username,
		email: enc.decrypt(user.email),
		friends: user.friends,
		friendReqs: user.friendReqs,
		skins: user.skins,
		points: user.points,
		matches: user.matches,
		created: user.created
	});
});
app.post("/api/add_friend/:username", (req, res) => {
	let valid = tokenValid(req.query.token, req);

	if (!valid) return send(res, true, "not_signed_in");
	if (!req.params.username) return send(res);

	let friend = getUser(req.params.username);
	let self = getUser(valid.username);

	if (self.friendReqs.includes(friend.username)) {
		self.friends.push(friend.username);
		friend.friends.push(self.username);

		self.friendReqs = self.friendReqs.filter((name) => name !== friend.username);

		writeUser(self.username);
	} else {
		friend.friendReqs.push(valid.username);
	}

	writeUser(friend.username);

	send(res, 200);
});
app.post("/api/accept_friend/:username", (req, res) => {
	let valid = tokenValid(req.query.token, req);

	if (!valid) return send(res, true, "not_signed_in");
	if (!req.params.username) return send(res);

	let self = getUser(valid.username);
	let friend = getUser(req.params.username);

	if (!friend || !self.friendReqs.includes(friend.username)) return send(res);

	self.friends.push(friend.username);
	friend.friends.push(self.username);

	self.friendReqs = self.friendReqs.filter((name) => name !== friend.username);

	writeUser(self.username);
	writeUser(friend.username);
});
app.post("/api/deny_friend/:username", (req, res) => {
	let valid = tokenValid(req.query.token, req);

	if (!valid) return send(res, true, "not_signed_in");
	if (!req.params.username) return send(res);

	let self = getUser(valid.username);

	self.friendReqs = self.friendReqs.filter((name) => name !== req.params.username);

	writeUser(self.username);
});

// So that game servers can interact with the main storage server
let apiKey = "apiKey123";

app.get("/server_api/:apiKey/check_token/:token", (req, res) => {
	if (req.params.apiKey !== apiKey) return send(res, 403);

	let valid = tokenValid(req.params.token);
	if (valid) {
		send(res, 200, valid.username);
	} else {
		send(res);
	}
});
app.get("/server_api/:apiKey/add_match", (req, res) => {
	if (req.params.apiKey !== apiKey) return send(res, 403);

	let user = getUser(req.query.username);

	if (!user) return send(res);

	user.matches.push({
		won: req.query.won,
		kills: req.query.kills,
		points: req.query.points
	});
	user.points += req.query.points;

	writeUser(req.query.username);

	send(res, 200);
});

app.use((req, res) => {
	return send(res, 404);
});

app.listen(port, () => {
	console.log("Website up on port", port);
});
