import { useRouter } from 'next/router';
import { useState } from 'react';

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
			});
			const data = await res.json();

			if (!res.ok) {
				setError(data.error || 'Error logih');
			} else {
				// Сохранение токена, например, в localStorage
				localStorage.setItem('token', data.token);
				// Перенаправление в защищенную часть приложения
				router.push('/dashboard');
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Error');
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			<form
				onSubmit={handleLogin}
				className="bg-white p-6 rounded shadow-md w-full max-w-sm">
				<h2 className="text-xl font-bold mb-4">Login</h2>
				{error && <p className="text-red-500 mb-2">{error}</p>}
				<input
					type="email"
					placeholder="Email"
					className="border p-2 mb-4 w-full"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
				/>
				<input
					type="password"
					placeholder="Password"
					className="border p-2 mb-4 w-full"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
				/>
				<button
					type="submit"
					className="bg-blue-500 text-white p-2 rounded w-full">
					Login
				</button>
			</form>
		</div>
	);
}
