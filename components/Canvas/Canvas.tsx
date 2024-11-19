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
	const ctxRef = useRef(null);
	const circleButtonRef = useRef();
	const lineButtonRef = useRef();
	const buttonRefs = {
		"circle": circleButtonRef,
	   	"line": lineButtonRef
	};

	useEffect(() => {
		// Get the canvas context once the component is mounted
		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');
		ctxRef.current = ctx;
		ctx.lineCap = 'round'; // Smooth line edges

	}, []);

	const mouseDown = (e) => {
		const canvas = canvasRef.current;
		setIsDrawing(true);
	}

	const mouseUp = () => {
		const canvas = canvasRef.current;
		setIsDrawing(false);
	}

	const mouseMove = (e) => {

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

