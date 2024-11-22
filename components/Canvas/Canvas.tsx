"use client"

import styles from "./Canvas.module.css";
import Button from "../Button/Button.tsx";
import circleIcon from "../../public/icons/circle.svg";
import lineIcon from "../../public/icons/line.svg";
import { useRef, useState, useEffect } from 'react';
import { drawScreen, getClosest } from "./draw.tsx";

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
	const [shiftHeld, setShiftHeld] = useState(false);
	const [isMoving, setIsMoving] = useState(false);
	const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });
	const [temporaryPoints, setTemporaryPoints] = useState([]);
	const [drawFlag, setDrawFlag] = useState(false);
	const ctxRef = useRef(null);
	const circleButtonRef = useRef();
	const lineButtonRef = useRef();
	const buttonRefs = {
		"circle": circleButtonRef,
	   	"line": lineButtonRef
	};

	const drawLoop = () => {
		setDrawFlag(!drawFlag);	
	}

	const point = (x, y, temporary=false) => { 
		const p = { x: x, y: y };
		if(temporary)
			setTemporaryPoints(previousPoints => [...previousPoints, p]);
		else
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
		return { x: e.clientX - rect.left - cameraOffset.x, y: e.clientY - rect.top - cameraOffset.y };
	}

	const distance = (x1, y1, x2, y2) => {
		const dx = x2 - x1;
		const dy = y2 - y1;
		return Math.sqrt(dx*dx + dy*dy);
	}

	const mouseDown = (e) => {
		if(shiftHeld)
			setIsMoving(true);	
		else {
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
						point(pos.x, pos.y, true);
						break;
				}
			}
			else {
				setTemporaryPoints([]);
				setCurrentCircle(null);
				setCurrentPoint(null);
				setCurrentLine(null);
				drawLoop();
			}
		}

	}

	const mouseUp = () => {
		setIsMoving(false);
	}

	const mouseMove = (e) => {
		if(isMoving) {
			setCameraOffset({
				x: cameraOffset.x + e.movementX,
				y: cameraOffset.y + e.movementY
			});
		}
		else if(isDrawing) {
			let pos = screenToCanvas(e);
			switch(currentMode) {
				case "circle":
					let newCircles = circles;
					let c = circles[currentCircle];
					let d = distance(pos.x, pos.y, c.x, c.y);
					c.r = d;
					break;
				case "line":
					let newLines = lines;
					let l = lines[currentLine];
					l.x2 = pos.x;
					l.y2 = pos.y;
					break;
			}
		}
		else {
			const closest = getClosest(e.clientX, e.clientY, cameraOffset);
			console.log(closest.x + " " + closest.y);
		//	point(closest.x, closest.y, true);
		}
		drawLoop();

	}

	const keyDown = (e) => {

		switch(e.key) {
			case "Shift":
				setShiftHeld(true);
				break;

		}
		drawLoop();
	}

	const keyUp = (e) => {

		setShiftHeld(false);

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

	useEffect(() => {

		drawScreen(circles, points, temporaryPoints, lines, currentCircle, currentPoint, currentLine, cameraOffset, canvasRef.current);

	}, [drawFlag]);

	return (
		<div className={styles.main}>
			<canvas
				ref={canvasRef}
				width={window.innerWidth-80}
				height={window.innerHeight}
				className={styles.canvas}
				tabIndex={0}
				onMouseDown={mouseDown}
				onMouseUp={mouseUp}
				onMouseMove={mouseMove}
				onKeyDown={keyDown}
				onKeyUp={keyUp}
			/>
			<div className={styles.controls}>
				<Button ref={circleButtonRef} id="circle" image={circleIcon} action={enterCircleMode} state={true} />
				<Button ref={lineButtonRef} id="line" image={lineIcon} action={enterLineMode} />
			</div>
		</div>
	);
};

export default Canvas;

