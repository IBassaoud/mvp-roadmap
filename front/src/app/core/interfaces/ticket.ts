export interface Ticket {
  id: string;
  boardId: string;
  sprintId: string;
  monthId: string;
  title: string;
  description?: string;
  status?: string; // equal TicketStatus
  assignee?: string;
  createdAt?: Date;
  updatedAt?: Date;
  priority?: TicketPriority | null | undefined;
  link?: string;
  position?: number;
  complexity?: string;
}

export const TicketStatus = {
  Dlivred: {order: 0, text: 'Dlivred'},
  Ready_For_Dlivry: {order: 1, text: 'Ready for Dlivry'},
  In_Progress: {order: 2, text: 'In progress'},
  Paused: {order: 3, text: 'Paused'},
  Not_Stated: {order: 4, text: 'Not started'},
}

export enum TicketPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high'
}

export enum TicketDifficulty {
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
  XXL = 'XXL',
}

export enum TicketMode {
  Edit = "Edit",
  Create = "Create",
  View = "View"
}
