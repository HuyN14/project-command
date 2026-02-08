export type HealthStatus = 'green' | 'yellow' | 'red';
export type TaskStatus = 'not-started' | 'in-progress' | 'completed' | 'blocked';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type RiskStatus = 'open' | 'mitigated' | 'closed';

export interface Metric {
  id: string;
  name: string;
  target: string;
  current: string;
  status: HealthStatus;
}

export interface Task {
  id: string;
  title: string;
  owner: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string;
  estimateHours: number;
  milestoneId: string;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: TaskStatus;
  tasks: Task[];
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  probability: number;
  impact: number;
  owner: string;
  mitigationPlan: string;
  status: RiskStatus;
  reviewDate: string;
  linkedMilestoneId?: string;
}

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  influence: number;
  interest: number;
  expectations: string;
  communicationCadence: string;
  notes: string;
}

export interface Decision {
  id: string;
  date: string;
  title: string;
  context: string;
  options: string[];
  chosen: string;
  rationale: string;
  impact: string;
  madeBy: string;
}

export interface Project {
  id: string;
  name: string;
  goal: string;
  healthStatus: HealthStatus;
  startDate: string;
  endDate: string;
  metrics: Metric[];
  milestones: Milestone[];
  risks: Risk[];
  stakeholders: Stakeholder[];
  decisions: Decision[];
}
