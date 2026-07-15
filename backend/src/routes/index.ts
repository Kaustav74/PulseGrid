import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { NodeController } from '../controllers/NodeController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.post('/auth/login', AuthController.login);
router.get('/nodes', authMiddleware, NodeController.getNodes);
router.get('/triage', authMiddleware, NodeController.getTriage);
export default router;
