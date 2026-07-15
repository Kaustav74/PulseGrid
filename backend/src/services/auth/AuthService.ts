import jwt from 'jsonwebtoken';
import { UserModel } from '../../models';
const JWT_SECRET = process.env.JWT_SECRET || 'pulsegrid-secret';

export const AuthService = {
  login: async (username: string, password: string) => {
    const user = UserModel.findByUsername(username);
    if (!user) return null;
    const valid = await UserModel.validatePassword(user, password);
    if (!valid) return null;
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    return { user, token };
  },
  verifyToken: (token: string) => { try { return jwt.verify(token, JWT_SECRET) as any; } catch { return null; } },
  getUserFromToken: (token: string) => {
    const decoded = AuthService.verifyToken(token);
    if (!decoded) return null;
    return UserModel.findById(decoded.id);
  },
};
