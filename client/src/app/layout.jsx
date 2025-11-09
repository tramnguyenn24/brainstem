import React, { Suspense } from 'react';
import Navbar from './ui/dashboard/navbar/navbar';
import Sidebar from './ui/dashboard/sidebar/sidebar';
import ClientProviders from './components/ClientProviders';
import PageTitle from './components/PageTitle';

import Style from "./styles/dashboard.module.css";
import "./styles/globals.css";

export const metadata = {
	title: 'Brainstem',
	description: 'Brainstem - Hệ thống quản lý',
};

const RootLayout = ({children}) => {
	return (
		<html lang="en">
			<head>
				<title>Brainstem</title>
			</head>
			<body>
				<PageTitle title="Brainstem" />
				<ClientProviders>
					<div className={Style.container}>
						<div className={Style.menu}>
							<Sidebar />
						</div>
						<div className={Style.content}>
							<Navbar />
							{children}
						</div>
					</div>
				</ClientProviders>
			</body>
		</html>
	)
}

export default RootLayout