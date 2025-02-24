import { Router } from 'express';
import {
	addMessageToChat,
	createChat,
	getChatById,
	getChats,
	joinChat,
} from '../controllers/chatController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticateJWT, getChats); // Получение своего списка чатов для пользователя

router.post('/', createChat); // Создание нового чата

router.get('/:id', getChatById); // Получение чата по ID

router.post('/:id/message', addMessageToChat); // Добавление сообщение в чат

router.post('/join', joinChat); // Добавление в чат по приглашению

export default router;
