import { Request, Response } from 'express';
import pool from '../models/database';
import { v4 as uuidv4 } from 'uuid';

export const getInspectors = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT * FROM inspectors ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: '获取验货员列表失败' });
  }
};

export const createInspector = async (req: Request, res: Response) => {
  try {
    const { name, baseAddress, baseLatitude, baseLongitude, contact, maxWorkHoursPerWeek } = req.body;
    const id = uuidv4();
    
    const [result] = await pool.query(
      'INSERT INTO inspectors (id, name, base_address, base_latitude, base_longitude, contact, max_work_hours_per_week) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, baseAddress, baseLatitude, baseLongitude, contact, maxWorkHoursPerWeek || 40]
    );
    
    res.status(201).json({ id, name, baseAddress, baseLatitude, baseLongitude, contact, maxWorkHoursPerWeek });
  } catch (error) {
    res.status(500).json({ error: '创建验货员失败' });
  }
};

export const updateInspector = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, baseAddress, baseLatitude, baseLongitude, contact, maxWorkHoursPerWeek } = req.body;
    
    const [result] = await pool.query(
      'UPDATE inspectors SET name = ?, base_address = ?, base_latitude = ?, base_longitude = ?, contact = ?, max_work_hours_per_week = ? WHERE id = ?',
      [name, baseAddress, baseLatitude, baseLongitude, contact, maxWorkHoursPerWeek, id]
    );
    
    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: '验货员不存在' });
    }
    
    const [rows] = await pool.query('SELECT * FROM inspectors WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: '更新验货员失败' });
  }
};

export const deleteInspector = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [hasAssignments] = await pool.query(
      'SELECT COUNT(*) as count FROM assignments WHERE inspector_id = ?',
      [id]
    );
    
    if ((hasAssignments as any)[0].count > 0) {
      return res.status(400).json({ error: '该验货员有关联的任务分配，无法删除' });
    }
    
    await pool.query('DELETE FROM inspector_unavailability WHERE inspector_id = ?', [id]);
    await pool.query('DELETE FROM inspectors WHERE id = ?', [id]);
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: '删除验货员失败' });
  }
};
