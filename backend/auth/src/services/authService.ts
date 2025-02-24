import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from 'shared-prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'test';

export const registerUser = async (email: string, password: string) => {
	// Проверка есть ли пользователь с таким email в бд
	const existingUser = await prisma.user.findUnique({ where: { email } });
	if (existingUser) {
		throw new Error('The user already exists');
	}

	// Хеширование пароля
	const hashedPassword = await bcrypt.hash(password, 10);

	// Создание пользователя в бд
	const user = await prisma.user.create({
		data: {
			email,
			password: hashedPassword,
		},
	});

	return {
		message: 'User successfully registered',
		user: {
			id: user.id,
			email: user.email,
			createdAt: user.createdAt,
		},
	};
};

export const loginUser = async (email: string, password: string) => {
	// Получение пользователя из бд
	const user = await prisma.user.findUnique({ where: { email } });
	if (!user) {
		throw new Error('User not found');
	}

	// Проверка пароля
	const isValid = await bcrypt.compare(password, user.password);
	if (!isValid) {
		throw new Error('Invalid password');
	}

	const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
		expiresIn: '1h',
	});
	return token;
};
