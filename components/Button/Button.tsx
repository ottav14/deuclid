import styles from "./Button.module.css";
import Image from 'next/image';
import { useState, useImperativeHandle, forwardRef, MouseEventHandler } from 'react';

interface ButtonProps {
	image: string;
	action: MouseEventHandler<HTMLButtonElement>;
	state: boolean;
	toggle: boolean;
	setState: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ image, action, state=false, toggle=true, setState }, ref) => {

		const [isActive, setIsActive] = useState(state);

		const mouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
			action(e);
			if(toggle)
				setIsActive(!isActive);
			else
				setIsActive(true);
		}

		const mouseUp = () => {
			if(!toggle) {
				setIsActive(false);
			}

		}

		useImperativeHandle(ref, () => ({
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
	}
);
export default Button;
