import { Ticket } from './ticket';

export interface MoveTicketEvent extends Ticket {
  targetSprintId: string;
  targetMonthId: string;
  updatedSourceTickets: Ticket[];
  updatedTargetTickets: Ticket[];
}
