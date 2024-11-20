export const drawBackground = (canvas) => {
	const ctx = canvas.getContext('2d');

	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

}

export const drawCircle = (circle, canvas) => {
	const ctx = canvas.getContext('2d');

	ctx.strokeStyle = "blue";
	ctx.beginPath(); 
	ctx.arc(circle.x, circle.y, circle.r, 0, 2*Math.PI);
	ctx.stroke();
	ctx.closePath();
}

export const drawCircles = (circles, canvas) => {
	for(let i=0; i<circles.length; i++) {
		drawCircle(circles[i], canvas);
	}
}

export const drawPoint = (point, canvas) => {
	const ctx = canvas.getContext('2d');

	ctx.fillStyle = "blue";
	ctx.beginPath(); 
	ctx.arc(point.x, point.y, 3, 0, 2*Math.PI);
	ctx.fill();
	ctx.closePath();
}

export const drawPoints = (points, canvas) => {
	for(let i=0; i<points.length; i++) {
		drawPoint(points[i], canvas);
	}
}

export const drawScreen = (circles, points, canvas) => {
	drawBackground(canvas);
	drawCircles(circles, canvas);
	drawPoints(points, canvas);
}
