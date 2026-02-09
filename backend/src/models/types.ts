export interface Location {
  address: string;
  latitude: number;
  longitude: number;
}

export interface Inspector {
  id: string;
  name: string;
  baseLocation: Location;
  contact: string;
  maxWorkHoursPerWeek: number;
  unavailableDates: string[];
}

export interface Factory {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  contact: string;
}

export interface Task {
  id: string;
  factoryId: string;
  scheduledDate: Date;
  estimatedDuration: number;
  taskType: string;
  deadline: Date;
  priority: number;
  status: 'pending' | 'assigned' | 'completed';
}

export interface Assignment {
  taskId: string;
  inspectorId: string;
  scheduledDate: Date;
  estimatedArrivalTime: Date;
  estimatedDepartureTime: Date;
  travelTime: number;
  route: Location[];
}

export interface Schedule {
  id: string;
  weekStart: Date;
  weekEnd: Date;
  assignments: Assignment[];
  totalCost: number;
  totalTravelTime: number;
  workloadVariance: number;
  status: 'draft' | 'confirmed' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleConfig {
  weightTime: number;
  weightCost: number;
  weightWorkload: number;
  transportMode: 'car' | 'train' | 'public_transport';
}
