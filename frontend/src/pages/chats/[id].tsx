import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/router';
import { FormEvent, useCallback, useEffect, useState } from 'react';

interface JwtPayload {
	id: number;
	email: string;
}

interface Message {
	id: number;
	sender: string;
	content: string;
	createdAt: string;
}

interface Chat {
	id: number;
	name: string;
	messages?: Message[];
	invitationEnabled?: boolean;
	invitationLink?: string;
	invitationExpiresAt?: string;
	ownerId?: number;
}

export default function ChatDetailPage() {
	const router = useRouter();
	const { id } = router.query;
	const [chat, setChat] = useState<Chat | null>(null);
	const [newMessage, setNewMessage] = useState('');
	const [userIdToAdd, setUserIdToAdd] = useState('');
	const [error, setError] = useState<string | null>(null);

	// Функция для получения данных чата
	const fetchChat = useCallback(async () => {
		if (!id) return;
		try {
			const res = await fetch(`http://localhost:5000/api/chats/${id}`);
			const data = await res.json();
			setChat(data);
		} catch {
			setError('Error loading chat');
		}
	}, [id]);

	useEffect(() => {
		fetchChat();
	}, [fetchChat]);

	// Отправка нового сообщения
	const handleSendMessage = async (e: FormEvent) => {
		e.preventDefault();
		if (!id) return;
		const token = localStorage.getItem('token');
		if (!token) {
			window.location.href = '/login';
			return;
		}
		try {
			const res = await fetch(`http://localhost:5000/api/chats/${id}/message`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					sender: jwtDecode<JwtPayload>(token).email,
					content: newMessage,
				}),
			});
			const message = await res.json();
			if (chat) {
				setChat({ ...chat, messages: [...(chat.messages || []), message] });
			}
			setNewMessage('');
		} catch {
			setError('Error with send message');
		}
	};

	// Перегенерация ссылки-приглашения
	const handleRegenerateInvitation = async () => {
		if (!id) return;
		const token = localStorage.getItem('token');
		try {
			const res = await fetch(
				`http://localhost:5000/api/chats/${id}/reg-invite`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);
			if (!res.ok) {
				const errData = await res.json();
				throw new Error(errData.error || 'Error regenerating invitation link');
			}

			await fetchChat();
		} catch {
			setError('Error regenerating invitation link');
		}
	};

	// Добавление пользователя в чат
	const handleAddUser = async (e: FormEvent) => {
		e.preventDefault();
		if (!id) return;
		const token = localStorage.getItem('token');
		try {
			const res = await fetch(
				`http://localhost:5000/api/chats/${id}/add-user`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ userId: parseInt(userIdToAdd, 10) }),
				},
			);
			if (!res.ok) {
				const errData = await res.json();
				throw new Error(errData.error || 'Error adding user');
			}
			await res.json();
			setUserIdToAdd('');
			// Обновление данных чата для отображения новых участников (можно расширить логику)
			await fetchChat();
		} catch {
			setError('Error adding user');
		}
	};

	if (error) {
		return <div className="p-4 text-red-500">{error}</div>;
	}

	if (!chat) {
		return <div className="p-4">Loading chat...</div>;
	}

	// Определение текущего пользователя из токена
	const token = localStorage.getItem('token');
	let currentUserId: number | null = null;
	if (token) {
		try {
			const decoded = jwtDecode<JwtPayload>(token);
			currentUserId = decoded.id;
		} catch {
			currentUserId = null;
		}
	}

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">{chat.name}</h1>

			{/* Блок для отображения ссылки-приглашения */}
			{chat.invitationEnabled && chat.invitationLink && (
				<div className="border p-4 mb-4 rounded">
					<h2 className="text-lg font-bold mb-2">Invitation Link</h2>
					<p>
						Link: <span className="font-mono">{chat.invitationLink}</span>
					</p>
					{chat.invitationExpiresAt && (
						<p>
							Expires at: {new Date(chat.invitationExpiresAt).toLocaleString()}
						</p>
					)}
					{/* Если текущий пользователь — владелец, даём возможность обновить ссылку */}
					{currentUserId && chat.ownerId === currentUserId && (
						<button
							onClick={handleRegenerateInvitation}
							className="mt-2 bg-green-500 text-white px-4 py-2 rounded">
							Regenerate Invitation Link
						</button>
					)}
				</div>
			)}

			{/* Блок для отображения сообщений */}
			<div className="border p-4 mb-4 h-96 overflow-y-scroll rounded">
				{(chat.messages || []).map((msg) => (
					<div key={msg.id} className="mb-2">
						<div className="font-bold">{msg.sender}:</div>
						<div>{msg.content}</div>
						<div className="text-xs text-gray-500">
							{new Date(msg.createdAt).toLocaleString()}
						</div>
					</div>
				))}
			</div>

			{/* Форма отправки нового сообщения */}
			<form onSubmit={handleSendMessage} className="flex flex-col mb-4">
				<input
					type="text"
					className="border p-2 mb-2 rounded"
					value={newMessage}
					onChange={(e) => setNewMessage(e.target.value)}
					placeholder="Enter message..."
					required
				/>
				<button type="submit" className="bg-blue-500 text-white p-2 rounded">
					Send
				</button>
			</form>

			{/* Форма для добавления пользователя в чат */}
			<div className="border p-4 rounded">
				<h2 className="text-lg font-bold mb-2">Add User to Chat</h2>
				<form onSubmit={handleAddUser} className="flex flex-col">
					<label className="mb-2">
						Enter User ID:
						<input
							type="text"
							className="border p-2 mt-1 rounded w-full"
							value={userIdToAdd}
							onChange={(e) => setUserIdToAdd(e.target.value)}
							required
						/>
					</label>
					<button
						type="submit"
						className="bg-blue-500 text-white px-4 py-2 rounded">
						Add User
					</button>
				</form>
			</div>
		</div>
	);
}
