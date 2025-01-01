import { Circle, Point, Line } from '../types.ts';

export const gridResolution: number = 30;
const pointSize: number = 8;

export const distance = (a: Point, b: Point) => {
	const dx = a.x - b.x;
	const dy = a.y - b.y;
	return Math.sqrt(dx*dx + dy*dy);
}

export const getMousePosition = (e, canvas): Point => {
	const p: Point = {
		x: e.clientX - 0.5 * canvas.width,
		y: e.clientY - 0.5 * canvas.height
	}
	return p;
}

const toScreenSpace = (px: number, py: number, cameraOffset: Point, zoom: number) => {
	return {
		x: zoom * px + cameraOffset.x,
		y: zoom * py + cameraOffset.y
	}
}

const onScreen = (x: number, y: number, canvas: number): void => {
	return x >= 0 && x < canvas.width && y >= 0 && y < canvas.height;
};

const getGridOffset = (cameraOffset: Point, canvas: HTMLCanvasElement): Point => {
	return {
		x: cameraOffset.x % (canvas.width/gridResolution),
		y: cameraOffset.y % (canvas.width/gridResolution) 
	};
}

const drawBackground = (canvas: HTMLCanvasElement, ctx): void => {
	ctx.fillStyle = 'white';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

const drawGrid = (cameraOffset: Point, zoom: number, canvas: HTMLCanvasElement, ctx): void => {
	const offset: Point = getGridOffset(cameraOffset, canvas);
	const res = Math.ceil(gridResolution / zoom);
	console.log(res/zoom);
	ctx.strokeStyle = 'black';
	ctx.beginPath();
	for(let i: number = 0; i<=res/zoom; i++) {

		// Horizontal
		ctx.moveTo(i*(canvas.width/res) + offset.x, 0);
		ctx.lineTo(i*(canvas.width/res) + offset.x, canvas.height);

		// Vertical
		ctx.moveTo(0, i*(canvas.width/res) + offset.y);
		ctx.lineTo(canvas.width, i*(canvas.width/res) + offset.y);

	}
	ctx.stroke();
	ctx.closePath();
}

const drawCircle = (circle: Circle, current: boolean, cameraOffset: Point, zoom: number, canvas: HTMLCanvasElement, ctx): void => {
	const center: Point = { x: canvas.width/2, y: canvas.height/2 };
	const pos: Point = toScreenSpace(circle.x, circle.y, cameraOffset, zoom);
	
	ctx.strokeStyle = (current) ? 'blue' : 'red';
	ctx.beginPath(); 
	ctx.arc(pos.x, pos.y, zoom*circle.r, 0, 2*Math.PI);
	ctx.stroke();
	ctx.closePath();
}

const drawPoint = (point: Point, current: boolean, cameraOffset: Point, zoom: number, ctx): void => {
	const pos: Point = toScreenSpace(point.x, point.y, cameraOffset, zoom);
	ctx.fillStyle = (current) ? point.color : 'red';
	ctx.beginPath(); 
	ctx.arc(pos.x, pos.y, pointSize, 0, 2*Math.PI);
	ctx.fill();
	ctx.closePath();
}

const drawLine = (line: Line, current: boolean, cameraOffset: Point, zoom: number, canvas: HTMLCanvasElement, ctx): void => {
	if(line.x1 === line.x2 && line.y1 === line.y2)
		return

	const p: Point = toScreenSpace(line.x1, line.y1, cameraOffset, zoom);
	const q: Point = toScreenSpace(line.x2, line.y2, cameraOffset, zoom);

	let p0: Point;
	let p1: Point;

	if(p.x === q.x) {
		p0 = {
			x: p.x,
			y: 0
		}
		p1 = {
			x: p.x,
			y: canvas.height
		}
	}
	else {
		const m: number = (q.y - p.y) / (q.x - p.x);
		const b: number = p.y - m * p.x;

		p0 = {
			x: 0,
			y: b
		}
		p1 = {
			x: canvas.width,
			y: m * canvas.width + b
		}
	}

	ctx.strokeStyle = (current) ? 'blue' : 'red';
	ctx.beginPath();
	ctx.moveTo(p0.x, p0.y);
	ctx.lineTo(p1.x, p1.y);
	ctx.stroke();
	ctx.closePath();
}

export const getClosest = (e: React.MouseEvent<HTMLCanvasElement>, cameraOffset: Point, zoom: number, canvas, points): Point => {
	const offset: number = getGridOffset(cameraOffset, canvas);
	const p0: Point = {
		x: (canvas.width/gridResolution)*Math.round(gridResolution * (e.clientX-cameraOffset.x) / canvas.width),
		y: (canvas.width/gridResolution)*Math.round(gridResolution * (e.clientY-cameraOffset.y) / canvas.width)
	}
	const screen_p0 = toScreenSpace(p0.x, p0.y, cameraOffset, zoom);


	const mPos: Point = {
		x: e.clientX,
		y: e.clientY
	}


	let d: number = distance(mPos, screen_p0);
	let ix: number = -1;
	for(let i = 0; i < points.length; i++) {
		const current: Point = toScreenSpace(points[i].x, points[i].y, cameraOffset, zoom);
		const di: number = distance(mPos, current);
		if(di < d) {
			d = di;
			ix = i;
		}
	}

	if(ix === -1)
		return p0;

	return points[ix];
}

export const drawScreen = (circles: Circle[], points: Point[], temporaryPoints: Point[], lines: Line[], currentCircle: number, currentPoint: number, currentLine: number, cameraOffset: Point, zoom: number, canvas: HTMLCanvasElement) => {

	const ctx = canvas.getContext('2d');

	drawBackground(canvas, ctx);

	ctx.lineWidth = 1;
	drawGrid(cameraOffset, zoom, canvas, ctx);

	ctx.lineWidth = 4;
	for(let i=0; i<circles.length; i++) {
		drawCircle(circles[i], (i==currentCircle), cameraOffset, zoom, canvas, ctx);
	}

	for(let i=0; i<points.length; i++) {
		drawPoint(points[i], (i==currentPoint), cameraOffset, zoom, ctx);
	}
	for(let i=0; i<temporaryPoints.length; i++) {
		drawPoint(temporaryPoints[i], true, cameraOffset, zoom, ctx);
	}

	for(let i=0; i<lines.length; i++) {
		drawLine(lines[i], (i==currentLine), cameraOffset, zoom, canvas, ctx);
	}
}
