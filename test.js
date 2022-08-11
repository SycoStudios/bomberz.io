import { exec } from "child_process";

exec("npm start", (err) => {
	if (err) {
		console.log("\n✖ error in game server");
	}
});
exec("node website", (err) => {
	if (err) {
		console.log("\n✖ error in database server");
	}
});
exec("npx parcel src/index.html --no-cache", (err) => {
	if (err) {
		console.log("\n✖ error in dev live reload");
	}
});

console.log("✓ opened game server");
console.log("✓ hosting database server");
console.log("✓ hosting dev live reload");
