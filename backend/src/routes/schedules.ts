import { Router } from 'express';
import { generateSchedule, getSchedule, updateSchedule } from '../controllers/schedules';

const router = Router();

router.post('/generate', generateSchedule);
router.get('/:id', getSchedule);
router.put('/:id', updateSchedule);

export { router as scheduleRoutes };
