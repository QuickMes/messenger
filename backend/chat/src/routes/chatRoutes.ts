import { Router } from 'express';
import {
	addMessageToChat,
	addUserToChatController,
	createChat,
	getChatById,
	getChats,
	joinChat,
	regenerateInvitationLinkController,
} from '../controllers/chatController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticateJWT, getChats); // Получение своего списка чатов для пользователя

router.post('/', createChat); // Создание нового чата

router.get('/:id', getChatById); // Получение чата по ID

router.post('/:id/message', addMessageToChat); // Добавление сообщение в чат

router.post('/join', joinChat); // Добавление в чат по приглашению

router.post('/:chatId/add-user', authenticateJWT, addUserToChatController) // Добавление пользователя в чат

router.post('/:chatId/reg-invite', authenticateJWT, regenerateInvitationLinkController) // Обновление ссылки на чат

export default router;
