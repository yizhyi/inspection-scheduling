import { Inspector, Task, Assignment, Schedule } from '../models/types';

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateTravelTime(distance: number, transportMode: string = 'car'): number {
  const speeds = {
    car: 60,
    train: 80,
    public_transport: 40
  };
  return distance / speeds[transportMode as keyof typeof speeds];
}

function calculateCost(distance: number, transportMode: string = 'car'): number {
  const costPerKm = {
    car: 2,
    train: 0.8,
    public_transport: 0.5
  };
  return distance * costPerKm[transportMode as keyof typeof costPerKm];
}

async function generateOptimalSchedule(
  tasks: any[],
  inspectors: any[],
  unavailability: any[],
  config: any
): Promise<Schedule> {
  const assignments: Assignment[] = [];
  const inspectorAvailability = new Map<string, Set<string>>();
  
  inspectors.forEach((inspector: any) => {
    inspectorAvailability.set(inspector.id, new Set<string>());
    const unavail = unavailability.filter((u: any) => u.inspector_id === inspector.id);
    unavail.forEach((u: any) => inspectorAvailability.get(inspector.id)!.add(u.date));
  });
  
  const inspectorWorkload = new Map<string, number>();
  inspectors.forEach((inspector: any) => inspectorWorkload.set(inspector.id, 0));
  
  const sortedTasks = [...tasks].sort((a, b) => {
    const deadlineDiff = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    if (deadlineDiff !== 0) return deadlineDiff;
    return b.priority - a.priority;
  });
  
  for (const task of sortedTasks) {
    const taskDate = new Date(task.scheduled_date).toISOString().split('T')[0];
    
    let bestInspector: any = null;
    let bestScore = Infinity;
    
    for (const inspector of inspectors) {
      if (inspectorAvailability.get(inspector.id)!.has(taskDate)) continue;
      
      const distance = calculateDistance(
        inspector.base_latitude,
        inspector.base_longitude,
        task.latitude,
        task.longitude
      );
      
      const travelTime = calculateTravelTime(distance, config?.transportMode);
      const cost = calculateCost(distance, config?.transportMode);
      const newWorkload = (inspectorWorkload.get(inspector.id) || 0) + task.estimated_duration + travelTime;
      
      if (newWorkload > inspector.max_work_hours_per_week) continue;
      
      const workloadPenalty = newWorkload / inspector.max_work_hours_per_week;
      
      const weightTime = config?.weightTime || 1;
      const weightCost = config?.weightCost || 1;
      const weightWorkload = config?.weightWorkload || 1;
      
      const score = weightTime * travelTime + weightCost * cost + weightWorkload * workloadPenalty;
      
      if (score < bestScore) {
        bestScore = score;
        bestInspector = inspector;
      }
    }
    
    if (bestInspector) {
      const distance = calculateDistance(
        bestInspector.base_latitude,
        bestInspector.base_longitude,
        task.latitude,
        task.longitude
      );
      
      const travelTime = calculateTravelTime(distance, config?.transportMode);
      const scheduledDate = new Date(task.scheduled_date);
      const arrivalTime = new Date(scheduledDate);
      arrivalTime.setHours(9, 0, 0);
      
      const departureTime = new Date(arrivalTime);
      departureTime.setHours(departureTime.getHours() + task.estimated_duration + travelTime);
      
      assignments.push({
        taskId: task.id,
        inspectorId: bestInspector.id,
        scheduledDate,
        estimatedArrivalTime: arrivalTime,
        estimatedDepartureTime: departureTime,
        travelTime,
        route: [
          {
            address: bestInspector.base_address,
            latitude: bestInspector.base_latitude,
            longitude: bestInspector.base_longitude
          },
          {
            address: task.address,
            latitude: task.latitude,
            longitude: task.longitude
          }
        ]
      });
      
      inspectorWorkload.set(
        bestInspector.id,
        (inspectorWorkload.get(bestInspector.id) || 0) + task.estimated_duration + travelTime
      );
    }
  }
  
  const workloads = Array.from(inspectorWorkload.values());
  const avgWorkload = workloads.reduce((a, b) => a + b, 0) / workloads.length;
  const variance = workloads.reduce((sum, w) => sum + Math.pow(w - avgWorkload, 2), 0) / workloads.length;
  
  let totalCost = 0;
  let totalTravelTime = 0;
  
  assignments.forEach(assignment => {
    const inspector = inspectors.find(i => i.id === assignment.inspectorId);
    const task = tasks.find(t => t.id === assignment.taskId);
    if (inspector && task) {
      const distance = calculateDistance(
        inspector.base_latitude,
        inspector.base_longitude,
        task.latitude,
        task.longitude
      );
      totalCost += calculateCost(distance, config?.transportMode);
      totalTravelTime += calculateTravelTime(distance, config?.transportMode);
    }
  });
  
  return {
    id: '',
    weekStart: new Date(),
    weekEnd: new Date(),
    assignments,
    totalCost,
    totalTravelTime,
    workloadVariance: variance,
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

export { generateOptimalSchedule, calculateDistance, calculateTravelTime, calculateCost };
