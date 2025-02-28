import { Router } from 'express';
import {
	addNewsFeedItemController,
	getNewsFeed,
	getNewsFeedItem,
} from '../controller/newsFeedController';

const router = Router();

router.get('/', getNewsFeed);

router.post('/', addNewsFeedItemController);

router.get('/:id', getNewsFeedItem);

export default router;
