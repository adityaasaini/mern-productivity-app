import { Router } from 'express';
import { getAllTasks, addTask, deleteTask, deleteMultipleTasks, getTaskById, updateTask, getTaskStats } from '../controllers/taskController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.get('/tasks', verifyToken, getAllTasks);
router.get('/tasks/stats', verifyToken, getTaskStats);
router.post('/add-task', verifyToken, addTask);
router.delete('/delete/:id', verifyToken, deleteTask);
router.delete('/delete-multiple', verifyToken, deleteMultipleTasks);
router.get('/task/:id', verifyToken, getTaskById);
router.put('/update-task/:id', verifyToken, updateTask);

export default router;
