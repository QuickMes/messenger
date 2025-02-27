import { prisma } from 'shared-prisma';
import { v4 as uuidv4 } from 'uuid';

// Создание чата
export const createChat = async (
	name: string,
	ownerId: number,
	invitationEnabled: boolean = false,
	friendIds: number[] = [],
) => {
	let invitationLink = null;
	let invitationExpiresAt = null;

	if (invitationEnabled) {
		invitationLink = uuidv4();

		// Установка срока действия ссылки на 2 часа от создания
		invitationExpiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
	}

	const chat = await prisma.chat.create({
		data: {
			name,
			ownerId,
			invitationEnabled,
			invitationLink,
			invitationExpiresAt,
			members: {
				create: [
					{ userId: ownerId },
					...friendIds.map((id) => ({ userId: id })),
				],
			},
		},
		include: {
			members: true,
		},
	});

	return chat;
};

export const getChatById = async (chatId: number) => {
	return prisma.chat.findUnique({
		where: { id: chatId },
		include: { messages: true },
	});
};

export const addMessageToChat = async (
	chatId: number,
	sender: string,
	content: string,
) => {
	const chat = await prisma.chat.findUnique({
		where: { id: chatId },
	});

	if (!chat) {
		throw new Error('Chat not found');
	}

	return prisma.message.create({
		data: {
			chatId,
			sender,
			content,
		},
	});
};

export const getChatsForUser = async (userId: number) => {
	return prisma.chat.findMany({
		where: {
			members: {
				some: { userId },
			},
		},
		include: {
			messages: true,
			members: true,
		},
	});
};

// Присоединение к чату по приглашению
export const joinChatByInvitation = async (
	invitationLink: string,
	userId: number,
) => {
	// Поиск чата по ссылке
	const chat = await prisma.chat.findUnique({
		where: { invitationLink },
		include: { members: true },
	});

	if (!chat) {
		throw new Error('Chat was not found at the specified link');
	}

	// Проверка действительна ли ссылка
	if (!chat.invitationExpiresAt || chat.invitationExpiresAt < new Date()) {
		throw new Error('Link expired');
	}

	// Проверка является ли пользователь уже участником чата
	const isMember = chat.members.some((member) => member.userId === userId);
	if (isMember) {
		throw new Error('The user is already a member of the chat room');
	}

	const member = await prisma.chatMember.create({
		data: {
			chatId: chat.id,
			userId,
		},
	});

	return { chat, member };
};

// Присоединение к чату пользователя
export const addUserToChat = async (chatId: number, userId: number) => {
	// Проверка существует ли чат и если существует получаем список пользователей
	const chat = await prisma.chat.findUnique({
		where: { id: chatId },
		include: { members: true },
	});

	if (!chat) {
		throw new Error('Chat not found');
	}

	// Проверка является ли пользователь уже участником чата
	const alreadyMember = chat.members.some((member) => member.userId === userId);
	if (alreadyMember) {
		throw new Error('The user is already a member of the chat room');
	}

	return prisma.chatMember.create({
		data: {
			chatId: chat.id,
			userId,
		},
	});
};

// Функция генерации ссылки
export const regenerateInvitationLink = async (
	chatId: number,
	ownerId: number,
) => {
	// Поиск чата по id
	const chat = await prisma.chat.findUnique({ where: { id: chatId } });
	if (!chat) {
		throw new Error('Chat not found');
	}

	// Проверка что это владелец чата
	if (chat.ownerId !== ownerId) {
		throw new Error('Only the chat owner can update the invitation');
	}

	const invitationLink = uuidv4();
	const invitationExpiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
	return prisma.chat.update({
		where: { id: chatId },
		data: {
			invitationLink,
			invitationExpiresAt,
			invitationEnabled: true,
		},
	});
};
