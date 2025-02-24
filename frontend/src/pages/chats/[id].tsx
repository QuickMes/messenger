import { useRouter } from 'next/router';
import { FormEvent, useEffect, useState } from 'react';

interface Message {
	id: number;
	sender: string;
	content: string;
	createdAt: string;
}

interface Chat {
	id: number;
	name: string;
	messages: Message[];
}

export default function ChatDetailPage() {
	const router = useRouter();
	const { id } = router.query;
	const [chat, setChat] = useState<Chat | null>(null);
	const [newMessage, setNewMessage] = useState('');
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!id) return;
		fetch(`http://localhost:5000/api/chats/${id}`)
			.then((res) => res.json())
			.then((data) => setChat(data))
			.catch(() => setError('Error loading chat'));
	}, [id]);

	const handleSendMessage = async (e: FormEvent) => {
		e.preventDefault();
		if (!id) return;
		const token = localStorage.getItem('token');
		try {
			const res = await fetch(`http://localhost:5000/api/chats/${id}/message`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					// TODO: Заменить sender на информацию о текущем пользователе,
					// например, email или id, полученные при аутентификации
					sender: 'user@example.com',
					content: newMessage,
				}),
			});
			const message = await res.json();
			if (chat) {
				setChat({ ...chat, messages: [...chat.messages, message] });
			}
			setNewMessage('');
		} catch {
			setError('Error with send message');
		}
	};

	if (error) {
		return <div className="p-4 text-red-500">{error}</div>;
	}

	if (!chat) {
		return <div className="p-4">Loading chat...</div>;
	}

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">{chat.name}</h1>
			<div className="border p-4 mb-4 h-96 overflow-y-scroll rounded">
				{chat.messages.map((msg) => (
					<div key={msg.id} className="mb-2">
						<div className="font-bold">{msg.sender}:</div>
						<div>{msg.content}</div>
						<div className="text-xs text-gray-500">
							{new Date(msg.createdAt).toLocaleString()}
						</div>
					</div>
				))}
			</div>
			<form onSubmit={handleSendMessage} className="flex flex-col">
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
		</div>
	);
}
