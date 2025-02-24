import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/router';
import { useState } from 'react';

interface JwtPayload {
	id: number;
	email: string;
}

export default function CreateChatPage() {
	const router = useRouter();
	const [name, setName] = useState('');
	const [invitationEnable, setInvitationEnable] = useState(false);
	const [error, setError] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const token = localStorage.getItem('token');
		if (!token) {
			router.push('/login');
			return;
		}

		// const ownerId = 1; // TODO: Переписать добавить при авторизации сохранение своего id для ownerId

		let ownerId: number;
		try {
			const decoded = jwtDecode<JwtPayload>(token);
			ownerId = decoded.id;
		} catch {
			setError('Error with decode token');
			return;
		}

		const payload = {
			name,
			ownerId,
			invitationEnable,
			friendIds: [], // TODO: Добавить функционал добавления друзей в чат
		};

		try {
			const res = await fetch('http://localhost:5000/api/chats', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(payload),
			});
			if (!res.ok) {
				const errData = await res.json();
				throw new Error(errData.error || 'Error create chat');
			}
			const data = await res.json();
			router.push(`/chats/${data.id}`);
		} catch {
			setError('Error');
		}
	};

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">Create new chat</h1>
			{error && <div className="text-red-500">{error}</div>}
			<form onSubmit={handleSubmit} className="flex flex-col space-y-4">
				<label className="flex flex-col">
					Name chat:
					<input
						type="text"
						className="border p-2 mt-1"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
					/>
				</label>
				<label className="flex items-center space-x-2">
					<input
						type="checkbox"
						checked={invitationEnable}
						onChange={(e) => setInvitationEnable(e.target.checked)}
					/>
					<span>Include a link invitation (valid for 2 hours)</span>
				</label>
				<button type="submit" className="bg-blue-500 text-white p-2 rounded">
					Create chat
				</button>
			</form>
		</div>
	);
}
