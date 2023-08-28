export interface TicketReference {
  idTicket: string;
  position: number;
  monthId: string;
  sprintId: string;
}

export interface Impact {
  id?: string;
  name: string;
  color: string;
  tickets?: TicketReference[];
}

export interface Board {
  id?: string;
  name?: string;
  code?: string;
  editorAccessOnCreation?: boolean;
  impacts?: Impact[];
}
