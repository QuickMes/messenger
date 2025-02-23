import { useRouter } from 'next/router';
import { useState } from 'react';

export default function RegisterPage() {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const res = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
			});
			const data = await res.json();

			if (!res.ok) {
				setError(data.error || 'Error registration');
			} else {
				setMessage('Registration was successful! Now you can log in.');
				// Редирект на страницу входа после успешной регистрации
				router.push('/login');
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Error');
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			<form
				onSubmit={handleRegister}
				className="bg-white p-6 rounded shadow-md w-full max-w-sm">
				<h2 className="text-xl font-bold mb-4">Registration</h2>
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
					placeholder="Пароль"
					className="border p-2 mb-4 w-full"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
				/>
				<button
					type="submit"
					className="bg-blue-500 text-white p-2 rounded w-full">
					Register
				</button>
				{message && <p className="text-green-500 mt-2">{message}</p>}
			</form>
		</div>
	);
}
