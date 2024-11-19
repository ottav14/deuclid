import styles from "./Canvas.module.css";
import Button from "../Button/Button.tsx";
import circleIcon from "../../public/icons/circle.svg";
import lineIcon from "../../public/icons/line.svg";
import { useRef, useState, useEffect } from 'react';

const Canvas = () => {
	const canvasRef = useRef(null);
	const [isDrawing, setIsDrawing] = useState(false);
	const [currentMode, setMode] = useState('circle');
	const [currentColor, setCurrentColor] = useState('black'); // Default color
	const circles = [];
	const ctxRef = useRef(null);
	const circleButtonRef = useRef();
	const lineButtonRef = useRef();
	const currentCircleRef = useRef(null);
	const buttonRefs = {
		"circle": circleButtonRef,
	   	"line": lineButtonRef
	};

	const circle = (x, y, r) => { 

		const c = { x: x, y: y, r: r };
		circles.push(c);

		return c;
	}

	const distance = (x1, y1, x2, y2) => {
		const dx = x2 - x1;
		const dy = y2 - y1;
		return Math.sqrt(dx*dx + dy*dy);
	}

	const drawCircle = (circle) => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');

		ctx.beginPath(); 
		ctx.arc(circle.x, circle.y, circle.r, 0, 2*Math.PI);
		ctx.fill();
		ctx.stroke();
		ctx.closePath();
	}

	const drawCircles = () => {
		for(let i=0; i<circles.length; i++) {
			drawCircle(circles[i]);
		}
	}

	useEffect(() => {
		// Get the canvas context once the component is mounted
		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');

		ctx.fillStyle = "white";
		ctx.strokeStyle = "blue";
		ctx.lineWidth = 2;

		drawCircles();


	}, []);

	const screenToCanvas = (e) => {
		const canvas = canvasRef.current;
		const rect = canvas.getBoundingClientRect();
		return { x: e.clientX - rect.left, y: e.clientY - rect.top };
	}

	const mouseDown = (e) => {
		const canvas = canvasRef.current;
		setIsDrawing(!isDrawing);
			
		const pos = screenToCanvas(e);
		currentCircle = circle(pos.x, pos.y, 30);
		drawCircles();

	}

	const mouseUp = () => {

	}

	const mouseMove = (e) => {

		if(isDrawing && currentMode == "circle") {
			currentCircle.r = distance(e.clientX, e.clientY, currentCircle.x, currentCircle.y);
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

