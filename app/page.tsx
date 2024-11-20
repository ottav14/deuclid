"use client"

import styles from "./page.module.css";
import Head from 'next/head';
import Canvas from '../components/Canvas/Canvas.tsx';
import Button from '../components/Button/Button.tsx';

export default function Home() {
	return (
		<>
			<Head>
				<title>Deuclid</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<main className={styles.main}>
				<h1 className={styles.pageTitle}>Deuclid</h1>
				<div className={styles.interface}>
					<Canvas />
				</div>
			</main>
		</>
	);
}

