import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/router';
import { FormEvent, useState } from 'react';

interface JwtPayload {
	id: number;
	email: string;
}

export default function CreateNewsFeedItemPage() {
	const router = useRouter();
	const [type, setType] = useState('');
	const [content, setContent] = useState('');
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		const token = localStorage.getItem('token');
		if (!token) {
			router.push('/login');
			return;
		}

		let decoded: JwtPayload;
		try {
			decoded = jwtDecode<JwtPayload>(token);
		} catch {
			setError('Invalid token');
			return;
		}

		const item = {
			type,
			content,
			authorId: decoded.id,
			authorEmail: decoded.email,
			// createdAt можно не передавать, так как устанавливается автоматически в базе
		};

		try {
			const res = await fetch('http://localhost:7000/api/newsfeed', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ userId: decoded.id, item }),
			});

			if (!res.ok) {
				const errData = await res.json();
				throw new Error(errData.error || 'Error creating news feed item');
			}
			router.push('/newsfeed');
		} catch {
			setError('Error creating news feed item');
		}
	};

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">Create News Feed Item</h1>
			{error && <p className="text-red-500">{error}</p>}
			<form onSubmit={handleSubmit} className="flex flex-col space-y-4">
				<label>
					Type:
					<input
						type="text"
						className="border p-2"
						value={type}
						onChange={(e) => setType(e.target.value)}
						required
					/>
				</label>
				<label>
					Content:
					<textarea
						className="border p-2"
						value={content}
						onChange={(e) => setContent(e.target.value)}
						required
					/>
				</label>
				<button type="submit" className="bg-blue-500 text-white p-2 rounded">
					Create
				</button>
			</form>
		</div>
	);
}
