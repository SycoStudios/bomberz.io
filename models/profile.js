import { randomBytes, createCipheriv, createDecipheriv, scryptSync } from "crypto";

export const encode = ({
	username = "",
	password = "",
	email = "",
	ip = "",
	friends = [],
	points = 0,
	matches = [],
	created = Date.now(),
	skins = [],
	friendReqs = []
}) => {
	return `${username}|${password}|${email}|${ip}|${friends.join(",")}|${points}|${matches
		.map((e) => Buffer.from(`${e.points}|${e.kills}|${e.won}`).toString("base64"))
		.join(",")}|${created}|${skins.join(",")}|${friendReqs.join(",")}`;
};
export const decode = (data) => {
	let arr = data.split("|");

	return {
		username: arr[0],
		password: arr[1],
		email: arr[2],
		ip: arr[3],
		friends: arr[4] == "" ? [] : arr[4].split(","),
		points: parseInt(arr[5]),
		matches:
			arr[6] == ""
				? []
				: arr[6].split(",").map((e) => {
						let data = Buffer.from(e, "base64").toString().split("|");
						return {
							points: parseInt(data[0]),
							kills: parseInt(data[1]),
							won: data[2].toLowerCase() == "true"
						};
				  }),
		created: parseInt(arr[7]),
		skins: arr[8] == "" ? [] : arr[8].split(","),
		friendReqs: arr[9] == "" ? [] : arr[9].split(",")
	};
};
export class Encrypter {
	constructor(encryptionKey) {
		this.algorithm = "aes128";
		this.key = scryptSync(encryptionKey, "salt", 16);
	}

	encrypt(clearText, type = "base64") {
		const iv = randomBytes(16);
		const cipher = createCipheriv(this.algorithm, this.key, iv);
		const encrypted = cipher.update(clearText, "utf8", type);
		return [encrypted + cipher.final(type), Buffer.from(iv).toString(type)].join(".");
	}

	decrypt(encryptedText, type = "base64") {
		const [encrypted, iv] = encryptedText.split(".");
		if (!iv) throw new Error("IV not found");
		const decipher = createDecipheriv(this.algorithm, this.key, Buffer.from(iv, type));
		return decipher.update(encrypted, type, "utf8") + decipher.final("utf8");
	}
}
