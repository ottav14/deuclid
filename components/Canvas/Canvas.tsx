"use client"

import styles from "./Canvas.module.css";
import Button from "../Button/Button.tsx";
import circleIcon from "../../public/icons/circle.svg";
import lineIcon from "../../public/icons/line.svg";
import { useRef, useState, useEffect } from 'react';
import { drawScreen } from "./draw.tsx";

const Canvas = () => {
	const canvasRef = useRef(null);
	const [isDrawing, setIsDrawing] = useState(false);
	const [currentMode, setMode] = useState('circle');
	const [currentCircle, setCurrentCircle] = useState(null);
	const [currentPoint, setCurrentPoint] = useState(null);
	const [currentLine, setCurrentLine] = useState(null);
	const [circles, setCircles] = useState([]);
	const [points, setPoints] = useState([]);
	const [lines, setLines] = useState([]);
	const ctxRef = useRef(null);
	const circleButtonRef = useRef();
	const lineButtonRef = useRef();
	const buttonRefs = {
		"circle": circleButtonRef,
	   	"line": lineButtonRef
	};

	const drawLoop = () => {
		drawScreen(circles, points, lines, currentCircle, currentPoint, currentLine, canvasRef.current);
	}

	const point = (x, y) => { 
		const p = { x: x, y: y };
		setPoints(previousPoints => [...previousPoints, p]);
		setCurrentPoint(points.length);

		return p;
	}

	const circle = (x, y, r) => { 

		const c = { x: x, y: y, r: r };
		setCircles(previousCircles => [...previousCircles, c]);
		setCurrentCircle(circles.length);

		return c;
	}

	const line = (x1, y1, x2, y2) => { 

		const l = { x1: x1, y1: y1, x2: x2, y2: y2 };
		setLines(previousLines => [...previousLines, l]);
		setCurrentLine(lines.length);

		return l;
	}

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
			switch(currentMode) {
				case "circle":
					circle(pos.x, pos.y, 30);
					point(pos.x, pos.y);
					break;
				case "line":
					line(pos.x, pos.y, pos.x, pos.y);
					point(pos.x, pos.y);
					break;
			}
		}

	}

	const mouseUp = () => {

	}

	const mouseMove = (e) => {
		if(isDrawing) {
			let pos = screenToCanvas(e);
			switch(currentMode) {
				case "circle":
					let newCircles = circles;
					let c = circles[currentCircle];
					let d = distance(pos.x, pos.y, c.x, c.y);
					c.r = d;
					newCircles[currentCircle] = c;
					setCircles(newCircles);
					break;
				case "line":
					let newLines = lines;
					let l = lines[currentLine];
					l.x2 = pos.x;
					l.y2 = pos.y;
					/*
					newLines[currentLine] = l;
					setLines(newLines);
				   */
					break;
			}
			drawLoop();
		}

	}

	const enterCircleMode = () => {

		const currentRef = buttonRefs[currentMode];
		currentRef.current.setState(false);
		setMode("circle");
		setIsDrawing(false);

	}

	const enterLineMode = () => {
		
		const currentRef = buttonRefs[currentMode];
		currentRef.current.setState(false);
		setMode("line");
		setIsDrawing(false);

	}

	useEffect(() => {

		drawLoop();

	}, []);

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

