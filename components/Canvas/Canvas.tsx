"use client"

import styles from "./Canvas.module.css";
import Button from "../Button/Button.tsx";
import circleIcon from "../../public/icons/circle.svg";
import lineIcon from "../../public/icons/line.svg";
import { useRef, useState, useEffect } from 'react';

const Canvas = () => {
	const canvasRef = useRef(null);
	const [isDrawing, setIsDrawing] = useState(false);
	const [currentMode, setMode] = useState('circle');
	const [currentCircle, setCurrentCircle] = useState(null);
	const [circles, setCircles] = useState([]);
	const [points, setPoints] = useState([]);
	const ctxRef = useRef(null);
	const circleButtonRef = useRef();
	const lineButtonRef = useRef();
	const buttonRefs = {
		"circle": circleButtonRef,
	   	"line": lineButtonRef
	};

	const circle = (x, y, r) => { 

		const c = { x: x, y: y, r: r };
		setCircles(previousCircles => [...previousCircles, c]);
		setCurrentCircle(circles.length);

		return c;
	}

	const point = (x, y) => { 

		const p = { x: x, y: y };
		setPoints(previousPoints => [...previousPoints, p]);
		console.log(points);

		return p;
	}

	const distance = (x1, y1, x2, y2) => {
		const dx = x2 - x1;
		const dy = y2 - y1;
		return Math.sqrt(dx*dx + dy*dy);
	}

	const drawBackground = () => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');

		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		
	}

	const drawCircle = (circle) => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');

		ctx.strokeStyle = "blue";
		ctx.beginPath(); 
		ctx.arc(circle.x, circle.y, circle.r, 0, 2*Math.PI);
		ctx.stroke();
		ctx.closePath();
	}

	const drawCircles = () => {
		for(let i=0; i<circles.length; i++) {
			drawCircle(circles[i]);
		}
	}

	const drawPoint = (point) => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');

		ctx.fillStyle = "blue";
		ctx.beginPath(); 
		ctx.arc(point.x, point.y, 3, 0, 2*Math.PI);
		ctx.fill();
		ctx.closePath();
	}

	const drawPoints = () => {
		for(let i=0; i<points.length; i++) {
			drawPoint(points[i]);
		}
	}

	const drawScreen = () => {
		drawBackground();
		drawCircles();
		drawPoints();
	}

	useEffect(() => {
		// Get the canvas context once the component is mounted
		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');

	}, []);

	const screenToCanvas = (e) => {
		const canvas = canvasRef.current;
		const rect = canvas.getBoundingClientRect();
		return { x: e.clientX - rect.left, y: e.clientY - rect.top };
	}

	const mouseDown = (e) => {
		setIsDrawing(!isDrawing);
			
		if(!isDrawing) {
			const pos = screenToCanvas(e);
			circle(pos.x, pos.y, 30);
			point(pos.x, pos.y);
		}

	}

	const mouseUp = () => {

	}

	const mouseMove = (e) => {

		if(isDrawing && currentMode == "circle") {
			let newCircles = circles;
			let c = circles[currentCircle];
			let pos = screenToCanvas(e);
			let d = distance(pos.x, pos.y, c.x, c.y);
			c.r = d;
			newCircles[currentCircle] = c;
			setCircles(newCircles);
			drawScreen();
		}

	}

	const enterCircleMode = () => {

		const currentRef = buttonRefs[currentMode];
		currentRef.current.setState(false);
		setMode("circle");

	}


	const enterLineMode = () => {
		
		const currentRef = buttonRefs[currentMode];
		currentRef.current.setState(false);
		setMode("line");

	}

	return (
		<div className={styles.main}>
			<canvas
				ref={canvasRef}
				width="800"
				height="800"
				className={styles.canvas}
				onMouseDown={mouseDown}
				onMouseUp={mouseUp}
				onMouseMove={mouseMove}
			/>
			<div className={styles.controls}>
				<Button ref={circleButtonRef} id="circle" image={circleIcon} action={enterCircleMode} state={true} />
				<Button ref={lineButtonRef} id="line" image={lineIcon} action={enterLineMode} />
			</div>
		</div>
	);
};

export default Canvas;

