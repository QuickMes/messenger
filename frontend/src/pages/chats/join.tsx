import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface JwtPayload {
	id: number;
	email: string;
}

export default function JoinChatPage() {
	const router = useRouter();
	const { invitation } = router.query;
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!invitation) return;
		const token = localStorage.getItem('token');
		if (!token) {
			router.push('/login');
			return;
		}

		const joinChat = async () => {
			try {
				const res = await fetch('http://localhost:5000/api/chats/join', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						invitationLink: invitation,
						userId: jwtDecode<JwtPayload>(token).id,
					}),
				});
				if (!res.ok) {
					const errData = await res.json();
					throw new Error(errData.error || 'Error joining chat');
				}
				const data = await res.json();
				// Предполагаем, что backend возвращает объект чата в поле data.chat
				router.push(`/chats/${data.chat.id}`);
			} catch {
				setError('Error joining chat');
			} finally {
				setLoading(false);
			}
		};

		joinChat();
	}, [invitation, router]);

	if (loading) return <div className="p-4">Joining chat...</div>;
	if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

	return null;
}
