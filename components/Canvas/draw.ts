import { Circle, Point, Line } from "../types.ts";

const gridDistance: number = 20;
const pointSize: number = 5;

const onScreen = (x: number, y: number, canvas: number): void => {
	return x >= 0 && x < canvas.width && y >= 0 && y < canvas.height;
};

const getGridOffset = (cameraOffset: Point): Point => {
	return {
		x: cameraOffset.x % gridDistance,
		y: cameraOffset.y % gridDistance
	};
}

const drawBackground = (canvas: HTMLCanvasElement, ctx): void => {
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

const drawGrid = (cameraOffset: Point, canvas: HTMLCanvasElement, ctx): void => {
	const offset: Point = getGridOffset(cameraOffset);
	const mid: Point = { x: canvas.width/2, y: canvas.height/2 };

	ctx.strokeStyle = "black";
	ctx.beginPath();
	for(let i: number = 1; i<=canvas.width/gridDistance/2+1; i++) {

		// Horizontal
		ctx.moveTo(mid.x + i*gridDistance + offset.x, 0);
		ctx.lineTo(mid.x + i*gridDistance + offset.x, canvas.height);

		ctx.moveTo(mid.x - i*gridDistance + offset.x, 0);
		ctx.lineTo(mid.x - i*gridDistance + offset.x, canvas.height);

		// Vertical
		ctx.moveTo(0, mid.y + i*gridDistance + offset.y);
		ctx.lineTo(canvas.width, mid.y + i*gridDistance + offset.y);

		ctx.moveTo(0, mid.y - i*gridDistance+ offset.y);
		ctx.lineTo(canvas.width, mid.y - i*gridDistance + offset.y);

	}
	// Axis
	ctx.moveTo(mid.x + offset.x, 0);
	ctx.lineTo(mid.x + offset.x, canvas.height);

	ctx.moveTo(0, mid.y + offset.y);
	ctx.lineTo(canvas.width, mid.y + offset.y);
	
	ctx.stroke();
	ctx.closePath();
}

const drawCircle = (circle: Circle, current: boolean, cameraOffset: Point, canvas: HTMLCanvasElement, ctx): void => {
	const center: Point = { x: canvas.width/2, y: canvas.height/2 };
	const pos: Point = { 
		x: circle.x + cameraOffset.x,
		y: circle.y + cameraOffset.y
	};
	
	ctx.strokeStyle = (current) ? "blue" : "red";
	ctx.beginPath(); 
	ctx.arc(pos.x, pos.y, circle.r, 0, 2*Math.PI);
	ctx.stroke();
	ctx.closePath();
}

const drawPoint = (point: Point, current: boolean, cameraOffset: Point, ctx): void => {
	ctx.fillStyle = (current) ? "blue" : "red";
	ctx.beginPath(); 
	ctx.arc(point.x + cameraOffset.x, point.y + cameraOffset.y, pointSize, 0, 2*Math.PI);
	ctx.fill();
	ctx.closePath();
}

const drawLine = (line: Line, current: boolean, cameraOffset: Point, canvas: HTMLCanvasElement, ctx): void => {
	if(line.x1 === line.x2 && line.y1 === line.y2)
		return

	const p: Point = {
		x: line.x1 + cameraOffset.x,
		y: line.y1 + cameraOffset.y
	}

	const q: Point = {
		x: line.x2 + cameraOffset.x,
		y: line.y2 + cameraOffset.y
	}

	let m: number = (q.y - p.y) / (q.x - p.x);

	const b: number = p.y - m * p.x;

	const p0: Point = {
		x: 0,
		y: b
	}
	const p1: Point = {
		x: canvas.width,
		y: m * canvas.width + b
	}

	ctx.strokeStyle = (current) ? "blue" : "red";
	ctx.beginPath();
	ctx.moveTo(p0.x, p0.y);
	ctx.lineTo(p1.x, p1.y);
	ctx.stroke();
	ctx.closePath();
}

const drawCircles = (circles: Circle[], currentCircle: number, cameraOffset: Point, canvas: HTMLCanvasElement, ctx): void => {
	for(let i=0; i<circles.length; i++) {
		drawCircle(circles[i], (i==currentCircle), cameraOffset, canvas, ctx);
	}
}

const drawPoints = (points: Point[], currentPoint: number, temporaryPoints: Points[], cameraOffset: Point, ctx): void => {
	for(let i=0; i<points.length; i++) {
		drawPoint(points[i], (i==currentPoint), cameraOffset, ctx);
	}
	for(let i=0; i<temporaryPoints.length; i++) {
		drawPoint(temporaryPoints[i], true, cameraOffset, ctx);
	}
}

const drawLines = (lines: Line[], currentLine: number, cameraOffset: Point, canvas: HTMLCanvasElement, ctx): void => {
	for(let i=0; i<lines.length; i++) {
		drawLine(lines[i], (i==currentLine), cameraOffset, canvas, ctx);
	}
}

export const drawScreen = (circles: Circle[], points: Point[], temporaryPoints: Point[], lines: Line[], currentCircle: number, currentPoint: number, currentLine: number, cameraOffset: Point, canvas: HTMLCanvasElement) => {
	const ctx = canvas.getContext('2d');

	drawBackground(canvas, ctx);

	ctx.lineWidth = 1;
	drawGrid(cameraOffset, canvas, ctx);

	ctx.lineWidth = 4;
	drawCircles(circles, currentCircle, cameraOffset, canvas, ctx);
	drawPoints(points, currentPoint, temporaryPoints, cameraOffset, ctx);
	drawLines(lines, currentLine, cameraOffset, canvas, ctx);
}
