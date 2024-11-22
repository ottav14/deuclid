const gridDistance = 50;
const pointSize = 5;

const onScreen = (x, y, canvas) => {
	return x >= 0 && x < canvas.width && y >= 0 && y < canvas.height;
}

const getGridOffset = (cameraOffset) => {
	return {
		x: cameraOffset.x % gridDistance,
		y: cameraOffset.y % gridDistance
	};
}

export const getClosest = (x, y, cameraOffset) => {
	const offset = getGridOffset(cameraOffset);
	return {
		x: x - offset,
		y: y - offset
	};
}

const drawBackground = (canvas, ctx) => {
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

const drawGrid = (cameraOffset, canvas, ctx) => {
	const offset = getGridOffset(cameraOffset);
	for(let i=0; i<=canvas.width/gridDistance+1; i++) {
		ctx.strokeStyle = "black";
		ctx.beginPath();

		// Horizontal
		ctx.moveTo(i*gridDistance + offset.x, 0);
		ctx.lineTo(i*gridDistance + offset.x, canvas.height);

		// Vertical
		ctx.moveTo(0, i*gridDistance + offset.y);
		ctx.lineTo(canvas.width, i*gridDistance + offset.y);

		ctx.stroke();
		ctx.closePath();
	}
}

const drawCircle = (circle, current, cameraOffset, ctx) => {
	ctx.strokeStyle = (current) ? "blue" : "red";
	ctx.beginPath(); 
	ctx.arc(circle.x + cameraOffset.x, circle.y + cameraOffset.y, circle.r, 0, 2*Math.PI);
	ctx.stroke();
	ctx.closePath();
}

const drawPoint = (point, current, cameraOffset, ctx) => {
	ctx.fillStyle = (current) ? "blue" : "red";
	ctx.beginPath(); 
	ctx.arc(point.x + cameraOffset.x, point.y + cameraOffset.y, pointSize, 0, 2*Math.PI);
	ctx.fill();
	ctx.closePath();
}

const drawLine = (line, current, cameraOffset, canvas, ctx) => {
	if(line.x1 === line.x2 && line.y1 === line.y2)
		return

	const p = {
		x: line.x1 + cameraOffset.x,
		y: line.y1 + cameraOffset.y
	}

	const q = {
		x: line.x2 + cameraOffset.x,
		y: line.y2 + cameraOffset.y
	}

	let m = (q.y - p.y) / (q.x - p.x);

	const b = p.y - m * p.x;

	const p0 = {
		x: 0,
		y: b
	}
	const p1 = {
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

const drawCircles = (circles, currentCircle, cameraOffset, ctx) => {
	for(let i=0; i<circles.length; i++) {
		drawCircle(circles[i], (i==currentCircle), cameraOffset, ctx);
	}
}

const drawPoints = (points, currentPoint, temporaryPoints, cameraOffset, ctx) => {
	for(let i=0; i<points.length; i++) {
		drawPoint(points[i], (i==currentPoint), cameraOffset, ctx);
	}
	for(let i=0; i<temporaryPoints.length; i++) {
		drawPoint(temporaryPoints[i], true, cameraOffset, ctx);
	}
}

const drawLines = (lines, currentLine, cameraOffset, canvas, ctx) => {
	for(let i=0; i<lines.length; i++) {
		drawLine(lines[i], (i==currentLine), cameraOffset, canvas, ctx);
	}
}

export const drawScreen = (circles, points, temporaryPoints, lines, currentCircle, currentPoint, currentLine, cameraOffset, canvas) => {
	const ctx = canvas.getContext('2d');

	drawBackground(canvas, ctx);

	ctx.lineWidth = 2;
	drawGrid(cameraOffset, canvas, ctx);

	ctx.lineWidth = 4;
	drawCircles(circles, currentCircle, cameraOffset, ctx);
	drawPoints(points, currentPoint, temporaryPoints, cameraOffset, ctx);
	drawLines(lines, currentLine, cameraOffset, canvas, ctx);
}
