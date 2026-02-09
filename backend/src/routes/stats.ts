import { Router } from 'express';
import { getCostStats } from '../controllers/stats';

const router = Router();

router.get('/cost', getCostStats);

export { router as statsRoutes };
