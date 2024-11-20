"use client"

import styles from "./Canvas.module.css";
import Button from "../Button/Button.tsx";
import circleIcon from "../../public/icons/circle.svg";
import lineIcon from "../../public/icons/line.svg";
import { useRef, useState, useEffect } from 'react';
import { circle, point, drawScreen } from "./draw.tsx";

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

	const point = (x, y) => { 
		const p = { x: x, y: y };
		setPoints(previousPoints => [...previousPoints, p]);

		return p;
	}

	const circle = (x, y, r) => { 

		const c = { x: x, y: y, r: r };
		setCircles(previousCircles => [...previousCircles, c]);
		setCurrentCircle(circles.length);

		return c;
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

	const distance = (x1, y1, x2, y2) => {
		const dx = x2 - x1;
		const dy = y2 - y1;
		return Math.sqrt(dx*dx + dy*dy);
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
			drawScreen(circles, points, canvasRef.current);
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

