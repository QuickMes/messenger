import { AuthRequest } from '@/middlewares/authMiddleware';
import { NextFunction, Request, Response } from 'express';
import * as chatService from '../services/chatService';

export const getChats = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		const userId = req.user.id;
		const chats = await chatService.getChatsForUser(userId);
		res.json(chats);
	} catch (error: any) {
		next(error);
	}
};

export const createChat = async (req: Request, res: Response) => {
	try {
		const { name, ownerId, invitationEnabled, friendIds } = req.body;
		const chat = await chatService.createChat(
			name,
			ownerId,
			invitationEnabled,
			friendIds,
		);
		res.status(201).json(chat);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

export const getChatById = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const chatId = parseInt(req.params.id, 10);
		const chat = await chatService.getChatById(chatId);
		if (!chat) {
			res.status(404).json({ error: 'Chat not found' });
			return;
		}
		res.json(chat);
	} catch (error: any) {
		next(error);
	}
};

export const addMessageToChat = async (req: Request, res: Response) => {
	try {
		const chatId = parseInt(req.params.id, 10);
		const { sender, content } = req.body;
		const message = await chatService.addMessageToChat(chatId, sender, content);
		res.status(201).json(message);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

// Контроллер для присоеденение к чату по приглашению
export const joinChat = async (req: Request, res: Response) => {
	try {
		const { invitationLink, userId } = req.body;
		const result = await chatService.joinChatByInvitation(
			invitationLink,
			userId,
		);
		res.status(200).json(result);
	} catch (error: any) {
		res.status(500).json({ error: error.messages });
	}
};

// Добавление пользователя в чат
export const addUserToChatController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const chatId = parseInt(req.params.chatId, 10)
		const {userId} = req.body
		const member = await chatService.addUserToChat(chatId, userId)
		res.status(201).json(member)
	} catch (error: any) {
		next(error)
	}
}

// Для регенерации ссылок
export const regenerateInvitationLinkController = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const chatId = parseInt(req.params.chatId, 10)
		const ownerId = req.user.id // из middleware
		const updateChat = await chatService.regenerateInvitationLink(chatId, ownerId)
		res.json(updateChat)
	} catch (error: any) {
		next(error)
	}
}