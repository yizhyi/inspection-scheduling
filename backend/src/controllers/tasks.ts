import { Request, Response } from 'express';
import pool from '../models/database';
import { v4 as uuidv4 } from 'uuid';

export const getTasks = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    let query = 'SELECT t.*, f.name as factory_name FROM tasks t JOIN factories f ON t.factory_id = f.id';
    let params: any[] = [];
    
    if (status) {
      query += ' WHERE t.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY t.scheduled_date ASC';
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: '获取任务列表失败' });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const { factoryId, scheduledDate, estimatedDuration, taskType, deadline, priority } = req.body;
    const id = uuidv4();
    
    await pool.query(
      'INSERT INTO tasks (id, factory_id, scheduled_date, estimated_duration, task_type, deadline, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, factoryId, scheduledDate, estimatedDuration, taskType, deadline, priority || 0, 'pending']
    );
    
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: '创建任务失败' });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { factoryId, scheduledDate, estimatedDuration, taskType, deadline, priority, status } = req.body;
    
    const [result] = await pool.query(
      'UPDATE tasks SET factory_id = ?, scheduled_date = ?, estimated_duration = ?, task_type = ?, deadline = ?, priority = ?, status = ? WHERE id = ?',
      [factoryId, scheduledDate, estimatedDuration, taskType, deadline, priority, status, id]
    );
    
    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: '任务不存在' });
    }
    
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: '更新任务失败' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: '删除任务失败' });
  }
};
