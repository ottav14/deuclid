import styles from "./Button.module.css";
import Image from 'next/image';
import { useState, useImperativeHandle, forwardRef } from 'react';

const Button = forwardRef(({ image, action, state = false, setState }, ref) => {

	const [isActive, setIsActive] = useState(state);

	const onClick = () => {
		action();
		setIsActive(!isActive);
	}

	useImperativeHandle(ref, () => ({
		setState: (state) => {
			setIsActive(state);
		}
	}));


	return (
		<button 
			className={styles.button} 
			onClick={onClick}
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
