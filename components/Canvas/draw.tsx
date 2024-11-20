const drawBackground = (canvas, ctx) => {
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

const drawCircle = (circle, ctx) => {
	ctx.strokeStyle = "blue";
	ctx.beginPath(); 
	ctx.arc(circle.x, circle.y, circle.r, 0, 2*Math.PI);
	ctx.stroke();
	ctx.closePath();
}

const drawPoint = (point, ctx) => {
	ctx.fillStyle = "blue";
	ctx.beginPath(); 
	ctx.arc(point.x, point.y, 3, 0, 2*Math.PI);
	ctx.fill();
	ctx.closePath();
}

const drawLine = (line, ctx) => {
	ctx.strokeStyle = "blue";
	ctx.beginPath(); 
	ctx.moveTo(line.x1, line.y1);
	ctx.lineTo(line.x2, line.y2);
	ctx.stroke();
	ctx.closePath();
}

const drawCircles = (circles, currentCircle, ctx) => {
	for(let i=0; i<circles.length; i++) {
		drawCircle(circles[i], ctx);
	}
}

const drawPoints = (points, currentPoint, ctx) => {
	for(let i=0; i<points.length; i++) {
		drawPoint(points[i], ctx);
	}
}

const drawLines = (lines, currentLine, ctx) => {
	for(let i=0; i<lines.length; i++) {
		drawLine(lines[i], ctx);
	}
}

export const drawScreen = (circles, points, lines, currentCircle, currentPoint, currentLine, canvas) => {
	const ctx = canvas.getContext('2d');
	drawBackground(canvas, ctx);
	drawCircles(circles, currentCircle, ctx);
	drawPoints(points, currentPoint, ctx);
	drawLines(lines, currentLine, ctx);
}
