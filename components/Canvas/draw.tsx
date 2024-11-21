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

const drawLine = (line, current, cameraOffset, ctx) => {
	ctx.strokeStyle = "blue";
	ctx.beginPath();
	ctx.moveTo(line.x1 + cameraOffset.x, line.y1 + cameraOffset.y);
	ctx.lineTo(line.x2 + cameraOffset.x, line.y2 + cameraOffset.y);
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

const drawLines = (lines, currentLine, cameraOffset, ctx) => {
	for(let i=0; i<lines.length; i++) {
		drawLine(lines[i], (i==currentLine), cameraOffset, ctx);
	}
}

export const drawScreen = (circles, points, lines, currentCircle, currentPoint, currentLine, cameraOffset, canvas) => {
	const ctx = canvas.getContext('2d');
	drawBackground(canvas, ctx);
	drawCircles(circles, currentCircle, cameraOffset, ctx);
	drawPoints(points, currentPoint, cameraOffset, ctx);
	drawLines(lines, currentLine, cameraOffset, ctx);
}
