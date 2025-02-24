import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test';

export interface AuthRequest extends Request {
	user?: any;
}

export const authenticateJWT = (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	const authHeader = req.headers.authorization;
	if (authHeader) {
		// Ожидаемый формат "Bearer <token>"
		const token = authHeader.split(' ')[1];
		jwt.verify(token, JWT_SECRET, (err, user) => {
			if (err) {
				return res.status(403).json({ error: 'Invalid token' });
			}
			req.user = user;
			next();
		});
	} else {
		res.status(401).json({ error: 'Missing token' });
	}
};
