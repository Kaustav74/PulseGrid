import { Request, Response } from 'express';
import { AuthService } from '../services/auth/AuthService';

export const AuthController = {
  login: async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });
    const result = await AuthService.login(username, password);
    if (!result) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ user: { id: result.user.id, username: result.user.username, fullName: result.user.full_name, role: result.user.role }, token: result.token });
  },
};
