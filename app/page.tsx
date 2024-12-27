"use client"

import styles from "./page.module.css";
import Head from 'next/head';
import Canvas from '../components/Canvas/Canvas.tsx';
import Button from '../components/Button/Button.tsx';

const Home = () => {
	return (
		<>
			<Head>
				<title>Deuclid</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<main className={styles.main}>
				<Canvas />
			</main>
		</>
	);
}
export default Home;
