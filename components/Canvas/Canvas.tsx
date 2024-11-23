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
		"circle": circleButtonRef,
	   	"line": lineButtonRef
	};

	const drawLoop = (): void => {
		setDrawFlag(!drawFlag);	
	}

	const point = (x: number, y: number, temporary: boolean = false, color: string = "blue"): Point => { 
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

	const mouseDown = (e: React.MouseEvent<HTMLCanvasElement>): void => {
		if(shiftHeld)
			setIsMoving(true);	
		else {
			setIsDrawing(!isDrawing);
			if(!isDrawing) {
				const pos = getClosest(e, cameraOffset, canvasRef.current);
				switch(currentMode) {
					case "circle":
						circle(pos.x, pos.y, 30);
						if(temporaryPoints.length > 0)
							temporaryPoints[temporaryPoints.length-1].color = "blue";
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
				case "circle":
					const newCircles: Circle = circles;
					const c: Circle = circles[currentCircle];
					const d: number = distance(pos.x, pos.y, c.x, c.y);
					c.r = d;
					point(pos.x, pos.y, true, "grey");
					break;
				case "line":
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
			point(closest.x, closest.y, true, "grey");
			setClosestPoint(closest);
		}
		drawLoop();

	}

	const keyDown = (e: React.KeyboardEvent<HTMLCanvasElement>): void => {

		switch(e.key) {
			case "Shift":
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
		setMode("circle");
		setIsDrawing(false);

	}

	const enterLineMode = (): void => {
		
		const currentRef = buttonRefs[currentMode]; 
		currentRef.current.setState(false);
		setMode("line");
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

		drawLoop();

	}, []);

	useEffect((): void => {

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
				<div className={styles.modeControls}>
					<Button ref={circleButtonRef} id="circle" image={circleIcon} action={enterCircleMode} state={true} />
					<Button ref={lineButtonRef} id="line" image={lineIcon} action={enterLineMode} />
				</div>
				<div className={styles.zoomControls}>
					<Button ref={zoomInRef} id="circle" image={plusIcon} toggle={false} action={zoomIn} />
					<Button ref={zoomOutRef} id="line" image={minusIcon} toggle={false} action={zoomOut} />
				</div>
			</div>
		</div>
	);
};

export default Canvas;

