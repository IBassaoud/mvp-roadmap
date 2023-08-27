export interface Ticket {
  id: string;
  boardId: string;
  sprintId: string;
  monthId: string; 
  title: string;
  description?: string;
  status?: TicketStatus;
  assignee?: string;
  createdAt?: Date;
  updatedAt?: Date;
  priority?: TicketPriority | null | undefined;
  link?: string; 
  position?: number;
  impact?: ImpactItem[];
}

export enum TicketStatus {
  Todo = 'todo',
  InProgress = 'in_progress',
  Done = 'done'
}

export enum TicketPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high'
}

export interface ImpactItem {
  name: string;
  position: number;
  color: string;
}