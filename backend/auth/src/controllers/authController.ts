import { Request, Response } from 'express';
import * as authService from '../services/authService';

export const register = async (req: Request, res: Response) => {
	const { email, password } = req.body;

	try {
		const result = await authService.registerUser(email, password);
		res.status(201).json(result);
	} catch (error: any) {
		res.status(400).json({ error: error.message });
	}
};

export const login = async (req: Request, res: Response) => {
	const { email, password } = req.body;

	try {
		const token = await authService.loginUser(email, password);
		res.status(201).json({ token });
	} catch (error: any) {
		res.status(400).json({ error: error.message });
	}
};
