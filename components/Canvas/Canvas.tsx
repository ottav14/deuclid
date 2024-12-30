"use client"

import styles from "./Canvas.module.css";
import Button from "../Button/Button.tsx";
import circleIcon from "../../public/icons/circle.svg";
import lineIcon from "../../public/icons/line.svg";
import plusIcon from "../../public/icons/plus.svg";
import minusIcon from "../../public/icons/minus.svg";
import { useRef, useState, useEffect } from 'react';
import { drawScreen, getClosest, distance, getMousePosition } from "./draw.ts";
import { Circle, Point, Line } from "../types.ts";
import { add, sub, mult, dot } from '../linearAlgebra.ts';

const Canvas = () => {
	const zoomSpeed = 1.05;
	const snapTolerance = 20;

	const [currentMode, setMode] = useState('circle');
	const [currentCircle, setCurrentCircle] = useState(null);
	const [currentPoint, setCurrentPoint] = useState(null);
	const [currentLine, setCurrentLine] = useState(null);
	const [zoom, setZoom] = useState(1);
	const [isDrawing, setIsDrawing] = useState(false);
	const [shiftHeld, setShiftHeld] = useState(false);
	const [isMoving, setIsMoving] = useState(false);
	const [drawFlag, setDrawFlag] = useState(false);
	const [circles, setCircles] = useState([]);
	const [points, setPoints] = useState([]);
	const [temporaryPoints, setTemporaryPoints] = useState([]);
	const [lines, setLines] = useState([]);
	const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });
	const [closestPoint, setClosestPoint] = useState(null);
	const canvasRef = useRef(null);
	const circleButtonRef = useRef(null);
	const lineButtonRef = useRef(null);
	const zoomInRef = useRef(null);
	const zoomOutRef = useRef(null);
	const buttonRefs = {
		'circle': circleButtonRef,
	   	'line': lineButtonRef
	};

	const drawLoop = () => {
		setDrawFlag(!drawFlag);	
	}

	const point = (x, y, temporary = false, color = 'blue') => { 
		const p = { x: x, y: y, color: color};
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

	const roundToDecimals = (val, places) => {
		const factor = Math.pow(10, places);
		return Math.round(factor * val) / factor; 
	}

	const calcCircleIntersections = () => {
		const c1 = circles[currentCircle];
		const intersections = [];
		// Circle x circle
		for(let i = 0; i < circles.length; i++) {
			if(i != currentCircle) {
				const c2 = circles[i];
				const d = roundToDecimals(distance(c1.x, c1.y, c2.x, c2.y), 2);
				const R = roundToDecimals(c1.r + c2.r, 2);

				if(d == R) {
					const dx = roundToDecimals(c1.x - c2.x, 2);
					const dy = roundToDecimals(c1.y - c2.y, 2);
					const thetaX = roundToDecimals(Math.acos(dx / R), 2);
					const thetaY = roundToDecimals(Math.asin(dy / R), 2);
					const p = {
						x: c1.x - c1.r * Math.cos(thetaX),
						y: c1.y - c1.r * Math.sin(thetaY)
					};
					point(p.x, p.y);
				}
				else if(d < R) {
					const A = 2 * (c2.x - c1.x);
					const B = 2 * (c2.y - c1.y);
					const C = c1.x*c1.x + c1.y*c1.y - c1.r*c1.r - c2.x*c2.x - c2.y*c2.y + c2.r*c2.r;
					if(B != 0) {
						const p = 1 + A*A / (B*B);
						const q = -2 * c1.x + 2 * A / B * (C / B + c1.y);
						const r = c1.x*c1.x + Math.pow(C / B + c1.y, 2) - c1.r*c1.r;
						const x1 = (-q + Math.sqrt(q*q - 4*p*r)) / (2*p);
						const x2 = (-q - Math.sqrt(q*q - 4*p*r)) / (2*p);
						const y1 = -A / B * x1 - C / B;
						const y2 = -A / B * x2 - C / B;
						point(x1, y1);
						point(x2, y2);
					}
					else {
						const x = -C / A;
						const k = -C / A - c1.x;
						const y1 = c1.y + Math.sqrt(c1.r*c1.r - k*k);
						const y2 = c1.y - Math.sqrt(c1.r*c1.r - k*k);
						point(x, y1);
						point(x, y2);
					}
				}

			}
		}
		// Circle x line
		for(let i = 0; i < lines.length; i++) {
			const l = lines[i];
			const a = (l.y2 - l.y1) / (l.x2 - l.x1);
			const b = l.y1 - a * l.x1;
			const c = c1.x;
			const d = c1.y;

			const A = a*a + 1;
			const B = 2*a*b - 2*a*d - 2*c;
			const C = b*b + c*c + d*d - c1.r*c1.r - 2*b*d;

			const x1 = (-B + Math.sqrt(B*B - 4*A*C)) / (2*A);
			const x2 = (-B - Math.sqrt(B*B - 4*A*C)) / (2*A);

			const y1 = a*x1 + b;
			const y2 = a*x2 + b;
			
			point(x1, y1);
			point(x2, y2);
		}


	}

	const calcLineIntersections = () => {

		const l1: Line = lines[currentLine];
		const intersections = [];
		// Line x line
		for(let i = 0; i < lines.length; i++) {
			if(i != currentLine) {
				const l2: Line = lines[i];
				const a: number = (l1.y2 - l1.y1) / (l1.x2 - l1.x1);
				const b: number = l1.y1 - a * l1.x1;
				const c: number = (l2.y2 - l2.y1) / (l2.x2 - l2.x1);
				const d: number = l2.y1 - c * l2.x1;
				const p: Point = {
					x: (d - b) / (a - c),
					y: ((a*d - a*b + c*d - b*c) / (a - c) + b + d) / 2
				}
				point(p.x, p.y);
			}
		}	

		// Line x circle
		for(let i = 0; i < circles.length; i++) {
			const circ = circles[i];
			const a = (l1.y2 - l1.y1) / (l1.x2 - l1.x1);
			const b = l1.y1 - a * l1.x1;
			const c = circ.x;
			const d = circ.y;

			const A = a*a + 1;
			const B = 2*a*b - 2*a*d - 2*c;
			const C = b*b + c*c + d*d - circ.r*circ.r - 2*b*d;

			const x1 = (-B + Math.sqrt(B*B - 4*A*C)) / (2*A);
			const x2 = (-B - Math.sqrt(B*B - 4*A*C)) / (2*A);

			const y1 = a*x1 + b;
			const y2 = a*x2 + b;
			
			point(x1, y1);
			point(x2, y2);
		}	


	}

	const mouseDown = (e) => {
		if(shiftHeld)
			setIsMoving(true);	
		else {
			setIsDrawing(!isDrawing);
			if(!isDrawing && closestPoint != null) {
				switch(currentMode) {
					case 'circle':
						circle(closestPoint.x, closestPoint.y, 30);
						break;
					case 'line':
						line(closestPoint.x, closestPoint.y, closestPoint.x, closestPoint.y);
						point(closestPoint.x, closestPoint.y, true);
						break;
				}
			}
			else {
				switch(currentMode) {
					case 'circle':
						calcCircleIntersections();
						break;
					case 'line':
						calcLineIntersections();
						break;
				}
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
		const closest = getClosest(e, cameraOffset, canvasRef.current, points);

		// Update closestPoint
		if(closestPoint === null || closestPoint.x != closest.x || closestPoint.y != closest.y) {
			setTemporaryPoints([]);
			point(closest.x, closest.y, true, 'grey');
			setClosestPoint(closest);
		}

		// Update drawings
		if(isMoving) {
			setCameraOffset({
				x: cameraOffset.x + e.movementX,
				y: cameraOffset.y + e.movementY
			});
		}
		else if(isDrawing) {
			const canvas = canvasRef.current;
			switch(currentMode) {
				case 'circle':
					const c = circles[currentCircle];
					c.r = distance(closest.x, closest.y, c.x, c.y);
					point(closest.x, closest.y, true, 'grey');
					break;
				case 'line':
					const l = lines[currentLine];
					l.x2 = closest.x;
					l.y2 = closest.y;
					break;
			}
		}

		drawLoop();

	}

	const keyDown = (e) => {

		switch(e.key) {
			case 'Shift':
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
		setMode('circle');
		setIsDrawing(false);

	}

	const enterLineMode = () => {
		
		const currentRef = buttonRefs[currentMode]; 
		currentRef.current.setState(false);
		setMode('line');
		setIsDrawing(false);

	}

	const zoomIn = () => {
		setZoom(zoom * zoomSpeed);
		drawLoop();
	}

	const zoomOut = () => {
		setZoom(zoom * (2-zoomSpeed));
		drawLoop();
	}

	useEffect(() => {

		const canvas = canvasRef.current;
		setCameraOffset({
			x: canvas.width/2, 
			y: canvas.height/2
		});
		drawLoop();

	}, []);

	useEffect(() => {

		drawScreen(circles, points, temporaryPoints, lines, currentCircle, currentPoint, currentLine, cameraOffset, zoom, canvasRef.current);

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
				<div className={styles.modeControls}>
					<Button ref={circleButtonRef} id='circle' image={circleIcon} action={enterCircleMode} state={true} />
					<Button ref={lineButtonRef} id='line' image={lineIcon} action={enterLineMode} />
				</div>
				<div className={styles.zoomControls}>
					<Button ref={zoomInRef} id='circle' image={plusIcon} toggle={false} action={zoomIn} />
					<Button ref={zoomOutRef} id='line' image={minusIcon} toggle={false} action={zoomOut} />
				</div>
			</div>
		</div>
	);
};

export default Canvas;

