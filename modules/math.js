export const calcDistance = (x, y, xx, yy) => {
	return Math.sqrt((x - xx) ** 2 + (y - yy) ** 2);
};

export const calcAngle = (x, y, xx, yy, deg) => {
	return Math.atan2(y - yy, x - xx) * (deg ? rad2Deg : 1);
};

export const lerp = (v0, v1, t) => {
	return v0 * (1 - t) + v1 * t;
};

export const clamp = (num, min, max) => {
	return Math.max(min, Math.min(max, num));
};

export const absCeil = (num) => {
	return num > 0 ? Math.ceil(num) : Math.floor(num);
};

export const deg2Rad = Math.PI / 180;
export const rad2Deg = 180 / Math.PI;
