import { Request, Response } from 'express';
import pool from '../models/database';
import { v4 as uuidv4 } from 'uuid';
import { generateOptimalSchedule } from '../services/scheduler';

export const generateSchedule = async (req: Request, res: Response) => {
  try {
    const { weekStart, weekEnd, config } = req.body;
    
    const tasksResult = await pool.query(
      `SELECT t.*, f.name as factory_name, f.latitude, f.longitude, f.address 
       FROM tasks t 
       JOIN factories f ON t.factory_id = f.id 
       WHERE t.status = 'pending' AND t.scheduled_date >= $1 AND t.scheduled_date <= $2 
       ORDER BY t.deadline ASC`,
      [weekStart, weekEnd]
    );
    
    const inspectorsResult = await pool.query('SELECT * FROM inspectors');
    const unavailabilityResult = await pool.query('SELECT * FROM inspector_unavailability');
    
    const schedule = await generateOptimalSchedule(
      tasksResult.rows,
      inspectorsResult.rows,
      unavailabilityResult.rows,
      config
    );
    
    const scheduleId = uuidv4();
    await pool.query(
      'INSERT INTO schedules (id, week_start, week_end, total_cost, total_travel_time, workload_variance, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [scheduleId, weekStart, weekEnd, schedule.totalCost, schedule.totalTravelTime, schedule.workloadVariance, 'draft']
    );
    
    for (const assignment of schedule.assignments) {
      await pool.query(
        `INSERT INTO assignments (schedule_id, task_id, inspector_id, scheduled_date, estimated_arrival_time, estimated_departure_time, travel_time, route) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [scheduleId, assignment.taskId, assignment.inspectorId, assignment.scheduledDate, assignment.estimatedArrivalTime, assignment.estimatedDepartureTime, assignment.travelTime, JSON.stringify(assignment.route)]
      );
    }
    
    const result = await pool.query('SELECT * FROM schedules WHERE id = $1', [scheduleId]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: '生成排班失败' });
  }
};

export const getSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const scheduleResult = await pool.query('SELECT * FROM schedules WHERE id = $1', [id]);
    if (scheduleResult.rows.length === 0) {
      return res.status(404).json({ error: '排班方案不存在' });
    }
    
    const assignmentsResult = await pool.query(
      `SELECT a.*, t.task_type, t.estimated_duration, f.name as factory_name, f.address, i.name as inspector_name 
       FROM assignments a 
       JOIN tasks t ON a.task_id = t.id 
       JOIN factories f ON t.factory_id = f.id 
       JOIN inspectors i ON a.inspector_id = i.id 
       WHERE a.schedule_id = $1 
       ORDER BY a.scheduled_date ASC`,
      [id]
    );
    
    res.json({
      ...scheduleResult.rows[0],
      assignments: assignmentsResult.rows
    });
  } catch (error) {
    res.status(500).json({ error: '获取排班方案失败' });
  }
};

export const updateSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const result = await pool.query(
      'UPDATE schedules SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '排班方案不存在' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: '更新排班方案失败' });
  }
};
