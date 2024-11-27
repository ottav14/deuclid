"use client"

import styles from "./Canvas.module.css";
import Button from "../Button/Button.tsx";
import circleIcon from "../../public/icons/circle.svg";
import lineIcon from "../../public/icons/line.svg";
import plusIcon from "../../public/icons/plus.svg";
import minusIcon from "../../public/icons/minus.svg";
import { useRef, useState, useEffect } from 'react';
import { drawScreen, getClosest } from "./draw.ts";
import { Circle, Point, Line } from "../types.ts";
import { add, sub, mult, dot } from '../linearAlgebra.ts';

const Canvas = () => {
	const zoomSpeed = 1.05;
	const snapTolerance = 20;

	const [currentMode, setMode] = useState<string>('circle');
	const [currentCircle, setCurrentCircle] = useState<number>(null);
	const [currentPoint, setCurrentPoint] = useState<number>(null);
	const [currentLine, setCurrentLine] = useState<number>(null);
	const [zoom, setZoom] = useState<number>(1);
	const [isDrawing, setIsDrawing] = useState<boolean>(false);
	const [shiftHeld, setShiftHeld] = useState<boolean>(false);
	const [isMoving, setIsMoving] = useState<boolean>(false);
	const [drawFlag, setDrawFlag] = useState<boolean>(false);
	const [circles, setCircles] = useState<Circle[]>([]);
	const [points, setPoints] = useState<Point[]>([]);
	const [temporaryPoints, setTemporaryPoints] = useState<Point[]>([]);
	const [lines, setLines] = useState<Line[]>([]);
	const [cameraOffset, setCameraOffset] = useState<Point>({ x: 0, y: 0 });
	const [closestPoint, setClosestPoint] = useState<Point>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const circleButtonRef = useRef<HTMLButtonElement>(null);
	const lineButtonRef = useRef<HTMLButtonElement>(null);
	const zoomInRef = useRef<HTMLButtonElement>(null);
	const zoomOutRef = useRef<HTMLButtonElement>(null);
	const buttonRefs = {
		'circle': circleButtonRef,
	   	'line': lineButtonRef
	};

	const drawLoop = (): void => {
		setDrawFlag(!drawFlag);	
	}

	const point = (x: number, y: number, temporary: boolean = false, color: string = 'blue'): Point => { 
		const p: Point = { x: x, y: y, color: color};
		if(temporary)
			setTemporaryPoints(previousPoints => [...previousPoints, p]);
		else
			setPoints(previousPoints => [...previousPoints, p]);

		setCurrentPoint(points.length);

		return p;
	}

	const circle = (x: number, y: number, r: number): Circle => { 

		const c: Circle = { x: x, y: y, r: r };
		setCircles(previousCircles => [...previousCircles, c]);
		setCurrentCircle(circles.length);

		return c;
	}

	const line = (x1: number, y1: number, x2: number, y2: number): Line => { 

		const l: Line = { x1: x1, y1: y1, x2: x2, y2: y2 };
		setLines(previousLines => [...previousLines, l]);
		setCurrentLine(lines.length);

		return l;
	}

	const screenToCanvas = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
		const canvas: HTMLCanvasElement = canvasRef.current;
		const rect: DOMRect = canvas.getBoundingClientRect();
		return { x: e.clientX - rect.left - cameraOffset.x, y: e.clientY - rect.top - cameraOffset.y };
	}

	const distance = (x1: number, y1: number, x2: number, y2: number): number => {
		const dx: number = x2 - x1;
		const dy: number = y2 - y1;
		return Math.sqrt(dx*dx + dy*dy);
	}

	const roundToDecimals = (val: number, places: number): number => {
		const factor = Math.pow(10, places);
		return Math.round(factor * val) / factor; 
	}

	const calcCircleIntersections = (): void => {
		const c1: Circle = circles[currentCircle];
		const intersections: Point[] = [];
		// Circle x circle
		for(let i: number = 0; i < circles.length; i++) {
			if(i != currentCircle) {
				const c2: Circle = circles[i];
				const d: number = roundToDecimals(distance(c1.x, c1.y, c2.x, c2.y), 2);
				const R: number = roundToDecimals(c1.r + c2.r, 2);

				if(d == R) {
					const dx: number = roundToDecimals(c1.x - c2.x, 2);
					const dy: number = roundToDecimals(c1.y - c2.y, 2);
					const thetaX: number = roundToDecimals(Math.acos(dx / R), 2);
					const thetaY: number = roundToDecimals(Math.asin(dy / R), 2);
					const p: Point = {
						x: c1.x - c1.r * Math.cos(thetaX),
						y: c1.y - c1.r * Math.sin(thetaY)
					};
					point(p.x, p.y);
				}
				else if(d < R) {
					const A: number = 2 * (c2.x - c1.x);
					const B: number = 2 * (c2.y - c1.y);
					const C: number = c1.x*c1.x + c1.y*c1.y - c1.r*c1.r - c2.x*c2.x - c2.y*c2.y + c2.r*c2.r;
					if(B != 0) {
						const p: number = 1 + A*A / (B*B);
						const q: number = -2 * c1.x + 2 * A / B * (C / B + c1.y);
						const r: number = c1.x*c1.x + Math.pow(C / B + c1.y, 2) - c1.r*c1.r;
						const x1: number = (-q + Math.sqrt(q*q - 4*p*r)) / (2*p);
						const x2: number = (-q - Math.sqrt(q*q - 4*p*r)) / (2*p);
						const y1: number = -A / B * x1 - C / B;
						const y2: number = -A / B * x2 - C / B;
						point(x1, y1);
						point(x2, y2);
					}
					else {
						const x: number = -C / A;
						const k: number = -C / A - c1.x;
						const y1: number = c1.y + Math.sqrt(c1.r*c1.r - k*k);
						const y2: number = c1.y - Math.sqrt(c1.r*c1.r - k*k);
						point(x, y1);
						point(x, y2);
					}
				}

			}
		}
		// Circle x line
		for(let i: number = 0; i < lines.length; i++) {
			const l = lines[i];
			const c = circles[currentCircle];
			const a = (l.y2 - l.y1) / (l.x2 - l.x1);
			const b = l.y1 - a * l.x1;
			const p = 1 + a * a;
			const q = 2 * c.x + 2 * a * b + 2 * a * c.y;
			const r = c.x*c.x + b*b + 2 * b * c.y + c.y*c.y - c.r*c.r;
			const d = q*q - 4 * p * r;
			if(d > 0) {
				const x1 = (-q + Math.sqrt(q*q - 4*p*r)) / (2*p);
				const x2 = (-q - Math.sqrt(q*q - 4*p*r)) / (2*p);
				const y1 = a * x1 + b;
				const y2 = a * x2 + b;
				point(x1, y1);
				point(x2, y2);
				console.log("yep");
			}
		}
	}

	const mouseDown = (e: React.MouseEvent<HTMLCanvasElement>): void => {
		if(shiftHeld)
			setIsMoving(true);	
		else {
			setIsDrawing(!isDrawing);
			if(!isDrawing) {
				const pos: Point = getClosest(e, cameraOffset, canvasRef.current);
				switch(currentMode) {
					case 'circle':
						circle(pos.x, pos.y, 30);
						if(temporaryPoints.length > 0)
							temporaryPoints[temporaryPoints.length-1].color = 'blue';
						break;
					case 'line':
						line(pos.x, pos.y, pos.x, pos.y);
						point(pos.x, pos.y, true);
						break;
				}
			}
			else {
				switch(currentMode) {
					case 'circle':
						calcCircleIntersections();
				}
				setTemporaryPoints([]);
				setCurrentCircle(null);
				setCurrentPoint(null);
				setCurrentLine(null);
				drawLoop();
			}
		}

	}

	const mouseUp = (): void => {
		setIsMoving(false);
	}

	const mouseMove = (e: React.MouseEvent<HTMLCanvasElement>): void => {
		if(isMoving) {
			setCameraOffset({
				x: cameraOffset.x + e.movementX,
				y: cameraOffset.y + e.movementY
			});
		}
		else if(isDrawing) {
			const pos: Point = getClosest(e, cameraOffset, canvasRef.current);
			const canvas: HTMLCanvasElement = canvasRef.current;
			setTemporaryPoints([]);
			switch(currentMode) {
				case 'circle':
					const newCircles: Circle = circles;
					const c: Circle = circles[currentCircle];
					const d: number = distance(pos.x, pos.y, c.x, c.y);
					c.r = d;
					point(pos.x, pos.y, true, 'grey');
					break;
				case 'line':
					const newLines: Line[] = lines;
					const l: Line = lines[currentLine];
					l.x2 = pos.x;
					l.y2 = pos.y;
					break;
			}
		}
		const closest = getClosest(e, cameraOffset, canvasRef.current);
		if(closestPoint === null || closestPoint.x != closest.x || closestPoint.y != closest.y) {
			setTemporaryPoints([]);
			point(closest.x, closest.y, true, 'grey');
			setClosestPoint(closest);
		}
		drawLoop();

	}

	const keyDown = (e: React.KeyboardEvent<HTMLCanvasElement>): void => {

		switch(e.key) {
			case 'Shift':
				setShiftHeld(true);
				break;

		}
		drawLoop();
	}

	const keyUp = (e: React.KeyboardEvent<HTMLCanvasElement>): void => {

		setShiftHeld(false);

	}

	const enterCircleMode = (): void => {

		const currentRef: HTMLButtonElement = buttonRefs[currentMode];
		currentRef.current.setState(false);
		setMode('circle');
		setIsDrawing(false);

	}

	const enterLineMode = (): void => {
		
		const currentRef = buttonRefs[currentMode]; 
		currentRef.current.setState(false);
		setMode('line');
		setIsDrawing(false);

	}

	const zoomIn = (): void => {
		setZoom(zoom * zoomSpeed);
		drawLoop();
	}

	const zoomOut = (): void => {
		setZoom(zoom * (2-zoomSpeed));
		drawLoop();
	}

	useEffect((): void => {

		const canvas = canvasRef.current;
		setCameraOffset({
			x: canvas.width/2, 
			y: canvas.height/2
		});
		drawLoop();

	}, []);

	useEffect((): void => {

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

