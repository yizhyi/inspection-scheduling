import { Request, Response } from 'express';
import pool from '../models/database';
import { v4 as uuidv4 } from 'uuid';

export const getFactories = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT * FROM factories ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: '获取工厂列表失败' });
  }
};

export const createFactory = async (req: Request, res: Response) => {
  try {
    const { name, address, latitude, longitude, contact } = req.body;
    const id = uuidv4();
    
    await pool.query(
      'INSERT INTO factories (id, name, address, latitude, longitude, contact) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, address, latitude, longitude, contact]
    );
    
    const [rows] = await pool.query('SELECT * FROM factories WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: '创建工厂失败' });
  }
};

export const updateFactory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, address, latitude, longitude, contact } = req.body;
    
    const [result] = await pool.query(
      'UPDATE factories SET name = ?, address = ?, latitude = ?, longitude = ?, contact = ? WHERE id = ?',
      [name, address, latitude, longitude, contact, id]
    );
    
    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: '工厂不存在' });
    }
    
    const [rows] = await pool.query('SELECT * FROM factories WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: '更新工厂失败' });
  }
};

export const deleteFactory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [hasTasks] = await pool.query(
      'SELECT COUNT(*) as count FROM tasks WHERE factory_id = ?',
      [id]
    );
    
    if ((hasTasks as any)[0].count > 0) {
      return res.status(400).json({ error: '该工厂有关联的任务，无法删除' });
    }
    
    await pool.query('DELETE FROM factories WHERE id = ?', [id]);
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: '删除工厂失败' });
  }
};
