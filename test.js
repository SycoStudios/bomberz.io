import { exec } from "child_process";

exec("npm start");
exec("node website");
exec("npx parcel src/index.html --no-cache");

console.log("✓ opened game server");
console.log("✓ hosting database server");
console.log("✓ hosting dev live reload");
