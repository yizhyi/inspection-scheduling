import { Router } from 'express';
import { getFactories, createFactory, updateFactory, deleteFactory } from '../controllers/factories';

const router = Router();

router.get('/', getFactories);
router.post('/', createFactory);
router.put('/:id', updateFactory);
router.delete('/:id', deleteFactory);

export { router as factoryRoutes };
