import { Point } from './types.ts';

export const add = (a: Point, b: Point): Point => {
	return { 
		x: a.x + b.x,
		y: a.y + b.y
	};
}

export const sub = (a: Point, b: Point): Point => {
	return { 
		x: a.x - b.x,
		y: a.y - b.y
	};
}

export const mult = (a: number, v: Point): Point => {
	return { 
		x: a + v.x,
		y: a + v.y
	};
}

export const dot = (a: Point, b: Point): number => {
	return a.x * b.x + a.y * b.y;
}

