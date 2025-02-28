import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';

interface NewsFeedItem {
	// Определите поля, которые возвращаются из backend
	id: number;
	type: string;
	content: string;
	createdAt: string;
}

interface JwtPayload {
	id: number;
	email: string;
}

export default function NewsFeedPage() {
	const [feed, setFeed] = useState<NewsFeedItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Предположим, что у нас id пользователя хранится в localStorage
		const token = localStorage.getItem('token');
		if (!token) {
			setError('User not identified');
			setLoading(false);
			return;
		}
		try {
			const decoded = jwtDecode<JwtPayload>(token);
			const userId = decoded.id;
			fetch(`http://localhost:7000/api/newsfeed?userId=${userId}`)
				.then((res) => res.json())
				.then((data) => {
					setFeed(data);
					setLoading(false);
				})
				.catch(() => {
					setError('Error loading news feed');
					setLoading(false);
				});
		} catch {
			setError('Ivalid token');
			setLoading(false);
		}
	}, []);

	if (loading) return <div className="p-4">Loading news feed...</div>;
	if (error) return <div className="p-4 text-red-500">{error}</div>;

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">My News Feed</h1>
			{feed.length === 0 ? (
				<p>No news feed items.</p>
			) : (
				<ul>
					{feed.map((item) => (
						<li key={item.id} className="border p-2 mb-2 rounded">
							<div className="font-bold">{item.type}</div>
							<div>{item.content}</div>
							<div className="text-xs text-gray-500">
								{new Date(item.createdAt).toLocaleString()}
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
