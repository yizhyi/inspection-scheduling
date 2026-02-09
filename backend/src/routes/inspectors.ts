import { Router } from 'express';
import { getInspectors, createInspector, updateInspector, deleteInspector } from '../controllers/inspectors';

const router = Router();

router.get('/', getInspectors);
router.post('/', createInspector);
router.put('/:id', updateInspector);
router.delete('/:id', deleteInspector);

export { router as inspectorRoutes };
