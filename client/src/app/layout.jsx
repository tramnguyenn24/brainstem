import React, { Suspense } from 'react';
import ClientProviders from './components/ClientProviders';
import PageTitle from './components/PageTitle';
import ConditionalLayout from './components/ConditionalLayout';

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
					<ConditionalLayout>
						{children}
					</ConditionalLayout>
				</ClientProviders>
			</body>
		</html>
	)
}

export default RootLayout