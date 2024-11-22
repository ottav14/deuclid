import styles from "./Button.module.css";
import Image from 'next/image';
import { useState, useImperativeHandle, forwardRef } from 'react';

const Button = forwardRef(({ image, action, state=false, toggle=true, setState }, ref): void => {

	const [isActive, setIsActive] = useState<boolean>(state);

	const mouseDown = (): void => {
		action();
		if(toggle)
			setIsActive(!isActive);
		else
			setIsActive(true);
	}

	const mouseUp = (): void => {
		if(!toggle) {
			setIsActive(false);
			console.log("up");
		}

	}

	useImperativeHandle(ref, (): void => ({
		setState: (state) => {
			setIsActive(state);
		}
	}));


	return (
		<button 
			className={styles.button} 
			onMouseDown={mouseDown}
			onMouseUp={mouseUp}
			style={{
				backgroundColor: isActive ? '#f00' : '#555'
			}}
		>
			<Image
				src={image}
				className={styles.img}
				alt="Failed to display image"
			/>
		</button>
	);
});
export default Button;
