import { Request, Response } from 'express';
import pool from '../models/database';

export const getCostStats = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.id,
        s.week_start,
        s.week_end,
        s.total_cost,
        s.total_travel_time,
        s.workload_variance,
        COUNT(a.id) as task_count
      FROM schedules s
      LEFT JOIN assignments a ON s.id = a.schedule_id
      GROUP BY s.id
      ORDER BY s.week_start DESC
      LIMIT 10
    `);
    
    const inspectorWorkload = await pool.query(`
      SELECT 
        i.id,
        i.name,
        COUNT(a.id) as task_count,
        COALESCE(SUM(t.estimated_duration + a.travel_time), 0) as total_hours
      FROM inspectors i
      LEFT JOIN assignments a ON i.id = a.inspector_id
      LEFT JOIN tasks t ON a.task_id = t.id
      LEFT JOIN schedules s ON a.schedule_id = s.id
      WHERE s.status = 'confirmed'
      GROUP BY i.id, i.name
    `);
    
    res.json({
      scheduleHistory: result.rows,
      inspectorWorkload: inspectorWorkload.rows
    });
  } catch (error) {
    res.status(500).json({ error: '获取成本统计失败' });
  }
};
