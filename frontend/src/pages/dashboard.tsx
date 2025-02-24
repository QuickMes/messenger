import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Dashboard() {
	const router = useRouter();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Проверяем, есть ли токен в localStorage
		const token = localStorage.getItem('token');
		if (!token) {
			// Если токена нет – перенаправляем на страницу входа
			router.push('/login');
		} else {
			// Если токен найден, можно добавить дополнительную проверку валидности
			setLoading(false);
		}
	}, [router]);

	if (loading) {
		return <p>Загрузка...</p>;
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			<div className="bg-white p-6 rounded shadow-md w-full max-w-lg">
				<h1 className="text-2xl font-bold mb-4">Dashboard</h1>
				<p>Welcome!</p>
			</div>
		</div>
	);
}
