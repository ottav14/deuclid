const drawBackground = (canvas, ctx) => {
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
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
	ctx.arc(point.x + cameraOffset.x, point.y + cameraOffset.y, 3, 0, 2*Math.PI);
	ctx.fill();
	ctx.closePath();
}

const drawLine = (line, current, cameraOffset, canvas, ctx) => {
	if(line.x1 === line.x2 && line.y1 === line.y2)
		return

	let m = (line.y2 - line.y1) / (line.x2 - line.x1);

	const b = line.y1 - m * line.x1;

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

const drawPoints = (points, currentPoint, cameraOffset, ctx) => {
	for(let i=0; i<points.length; i++) {
		drawPoint(points[i], (i==currentPoint), cameraOffset, ctx);
	}
}

const drawLines = (lines, currentLine, cameraOffset, canvas, ctx) => {
	for(let i=0; i<lines.length; i++) {
		drawLine(lines[i], (i==currentLine), cameraOffset, canvas, ctx);
	}
}

export const drawScreen = (circles, points, lines, currentCircle, currentPoint, currentLine, cameraOffset, canvas) => {
	const ctx = canvas.getContext('2d');
	drawBackground(canvas, ctx);
	drawCircles(circles, currentCircle, cameraOffset, ctx);
	drawPoints(points, currentPoint, cameraOffset, ctx);
	drawLines(lines, currentLine, cameraOffset, canvas, ctx);
}
