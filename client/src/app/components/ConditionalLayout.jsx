'use client';
import { usePathname } from 'next/navigation';
import Navbar from '../ui/dashboard/navbar/navbar';
import Sidebar from '../ui/dashboard/sidebar/sidebar';
import Style from '../styles/dashboard.module.css';

export default function ConditionalLayout({ children }) {
	const pathname = usePathname();
	const isEmbedRoute = pathname?.startsWith('/forms/embed');
	
	if (isEmbedRoute) {
		return <>{children}</>;
	}
	
	return (
		<div className={Style.container}>
			<div className={Style.menu}>
				<Sidebar />
			</div>
			<div className={Style.content}>
				<Navbar />
				{children}
			</div>
		</div>
	);
}

