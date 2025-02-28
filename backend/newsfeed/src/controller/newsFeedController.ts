import { NextFunction, Request, Response } from 'express';
import * as newsFeedService from '../services/newsFeedService';

// Получение новостей для текущего пользователя
export const getNewsFeed = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const feed = await newsFeedService.getAllNewsFeedItems();
		res.json(feed);
	} catch (error: any) {
		next(error);
	}
};

export const addNewsFeedItemController = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const item = req.body.item;
		if (!item) {
			res.status(400).json({ error: 'Item are required' });
			return;
		}
		await newsFeedService.createNewsFeedItem(item);
		res.status(201).json({ message: 'News feed item added' });
	} catch (error: any) {
		next(error);
	}
};

export const getNewsFeedItem = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const id = parseInt(req.params.id, 10);
		const item = await newsFeedService.getNewsFeedItemById(id);
		if (!item) {
			res.status(404).json({ error: 'Item not found' });
			return;
		}
		res.json(item);
	} catch (error: any) {
		next(error);
	}
};
