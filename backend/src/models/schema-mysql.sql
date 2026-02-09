CREATE TABLE IF NOT EXISTS inspectors (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  base_address TEXT NOT NULL,
  base_latitude FLOAT NOT NULL,
  base_longitude FLOAT NOT NULL,
  contact VARCHAR(255),
  max_work_hours_per_week INT DEFAULT 40,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS factories (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  contact VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
  id CHAR(36) PRIMARY KEY,
  factory_id CHAR(36) NOT NULL,
  scheduled_date DATE NOT NULL,
  estimated_duration FLOAT NOT NULL,
  task_type VARCHAR(100),
  deadline DATE,
  priority INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (factory_id) REFERENCES factories(id)
);

CREATE TABLE IF NOT EXISTS inspector_unavailability (
  id CHAR(36) PRIMARY KEY,
  inspector_id CHAR(36) NOT NULL,
  date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (inspector_id) REFERENCES inspectors(id)
);

CREATE TABLE IF NOT EXISTS schedules (
  id CHAR(36) PRIMARY KEY,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  total_cost FLOAT DEFAULT 0,
  total_travel_time FLOAT DEFAULT 0,
  workload_variance FLOAT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assignments (
  id CHAR(36) PRIMARY KEY,
  schedule_id CHAR(36) NOT NULL,
  task_id CHAR(36) NOT NULL,
  inspector_id CHAR(36) NOT NULL,
  scheduled_date DATE NOT NULL,
  estimated_arrival_time TIMESTAMP,
  estimated_departure_time TIMESTAMP,
  travel_time FLOAT,
  route JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_schedule_task (schedule_id, task_id),
  FOREIGN KEY (schedule_id) REFERENCES schedules(id),
  FOREIGN KEY (task_id) REFERENCES tasks(id),
  FOREIGN KEY (inspector_id) REFERENCES inspectors(id)
);

CREATE TABLE IF NOT EXISTS schedule_config (
  id CHAR(36) PRIMARY KEY,
  weight_time FLOAT DEFAULT 1,
  weight_cost FLOAT DEFAULT 1,
  weight_workload FLOAT DEFAULT 1,
  transport_mode VARCHAR(20) DEFAULT 'car',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
