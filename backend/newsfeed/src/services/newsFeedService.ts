import Redis from 'ioredis';
import { prisma } from 'shared-prisma';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// TTL в секундах (24 часа)
const CACHE_EXPIRATION = 24 * 60 * 60;

// Функция создания новости: сохраняет в Postgres и кэширует в Redis
export const createNewsFeedItem = async (itemData: {
	type: string;
	content: string;
	authorId: number;
	authorEmail: string;
}) => {
	const createdItem = await prisma.newsFeedItem.create({
		data: itemData,
	});
	// Кэшируем новость по ключу newsfeed:item:<id>
	await redis.set(
		`newsfeed:item:${createdItem.id}`,
		JSON.stringify(createdItem),
		'EX',
		CACHE_EXPIRATION,
	);
	return createdItem;
};

// Функция получения новости по id: сначала пытается найти в Redis, затем в Postgres
export const getNewsFeedItemById = async (id: number) => {
	const cacheKey = `newsfeed:item:${id}`;
	const cached = await redis.get(cacheKey);
	if (cached) {
		return JSON.parse(cached);
	}
	const item = await prisma.newsFeedItem.findUnique({
		where: { id },
	});
	if (item) {
		await redis.set(cacheKey, JSON.stringify(item), 'EX', CACHE_EXPIRATION);
	}
	return item;
};

// Функция получения всех новостных элементов (например, для ленты)
export const getAllNewsFeedItems = async () => {
	// TODO: добавить сортировку по createdAt desc, пагинацию и т.д.
	const items = await prisma.newsFeedItem.findMany({
		orderBy: { createdAt: 'desc' },
	});
	// Для каждого элемента можно обновить кэш (опционально)
	for (const item of items) {
		await redis.set(
			`newsfeed:item:${item.id}`,
			JSON.stringify(item),
			'EX',
			CACHE_EXPIRATION,
		);
	}
	return items;
};
