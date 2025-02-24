import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Chat {
	id: number;
	name: string;
}

export default function ChatListPage() {
	const [chats, setChats] = useState<Chat[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (!token) {
			window.location.href = '/login';
			return;
		}

		fetch('http://localhost:5000/api/chats', {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
			.then((res) => res.json())
			.then((data) => {
				setChats(data);
				setLoading(false);
			})
			.catch(() => {
				setError('Error with get chats');
				setLoading(false);
			});
	}, []);

	if (loading) {
		return <div className="p-4">Loading...</div>;
	}

	if (error) {
		return <div className="p-4 text-red-500">{error}</div>;
	}

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">My chats</h1>
			{chats.length === 0 ? (
				<p>You don`t have any chat rooms yet. Create a new chat room!</p>
			) : (
				<ul>
					{chats.map((chat) => (
						<li
							key={chat.id}
							className="border p-2 mb-2 rounded hover:bg-gray-100">
							<Link href={`/chats/${chat.id}`}>
								<a className="text-xl">{chat.name}</a>
							</Link>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
