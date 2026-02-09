import { Request, Response } from 'express';
import pool from '../models/database';
import { v4 as uuidv4 } from 'uuid';
import { Inspector } from '../models/types';

export const getInspectors = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM inspectors ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: '获取验货员列表失败' });
  }
};

export const createInspector = async (req: Request, res: Response) => {
  try {
    const { name, baseAddress, baseLatitude, baseLongitude, contact, maxWorkHoursPerWeek } = req.body;
    const id = uuidv4();
    
    const result = await pool.query(
      'INSERT INTO inspectors (id, name, base_address, base_latitude, base_longitude, contact, max_work_hours_per_week) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [id, name, baseAddress, baseLatitude, baseLongitude, contact, maxWorkHoursPerWeek || 40]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: '创建验货员失败' });
  }
};

export const updateInspector = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, baseAddress, baseLatitude, baseLongitude, contact, maxWorkHoursPerWeek } = req.body;
    
    const result = await pool.query(
      'UPDATE inspectors SET name = $1, base_address = $2, base_latitude = $3, base_longitude = $4, contact = $5, max_work_hours_per_week = $6 WHERE id = $7 RETURNING *',
      [name, baseAddress, baseLatitude, baseLongitude, contact, maxWorkHoursPerWeek, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '验货员不存在' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: '更新验货员失败' });
  }
};

export const deleteInspector = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const hasAssignments = await pool.query(
      'SELECT COUNT(*) FROM assignments WHERE inspector_id = $1',
      [id]
    );
    
    if (parseInt(hasAssignments.rows[0].count) > 0) {
      return res.status(400).json({ error: '该验货员有关联的任务分配，无法删除' });
    }
    
    await pool.query('DELETE FROM inspector_unavailability WHERE inspector_id = $1', [id]);
    await pool.query('DELETE FROM inspectors WHERE id = $1', [id]);
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: '删除验货员失败' });
  }
};
