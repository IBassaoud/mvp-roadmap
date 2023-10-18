import { Inject, Injectable, forwardRef } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';

import { Ticket } from '../interfaces/ticket';
import { LogsFirebaseService } from 'src/app/core/services/logs-firebase.service';
import { LogsType } from 'src/app/core/interfaces/logs-firebase';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  constructor(private db: AngularFirestore, private logsFire: LogsFirebaseService) {}

  async createTicket(
    boardId: string,
    monthId: string,
    sprintId: string,
    ticket: Partial<Ticket>,
    position: number,
    ignoreLogs: boolean = false
  ): Promise<string> {
    if (!boardId || !monthId || !sprintId) {
      throw new Error('Required fields are missing');
    }

    const ticketRef = this.db
      .collection('boards')
      .doc(boardId)
      .collection('months')
      .doc(monthId)
      .collection('sprints')
      .doc(sprintId)
      .collection('tickets')
      .doc();

      if (!ignoreLogs) {
        this.logsFire.addLogs(boardId, LogsType.CreateTicket, {name: ticket.title, id: ticketRef.ref.id})
        this.logsFire.addLogsStackHolderCreateTicket(boardId, ticketRef.ref.id, ticket.title ||'', monthId, sprintId)
      }

    await ticketRef.set({
      ...ticket,
      id: ticketRef.ref.id,
      position: position,
    });
    return ticketRef.ref.id
  }

  async createDefaultTickets(boardId: string, monthId: string, sprintId: string): Promise<void> {
    const ticketNames = ['TBD', 'TBD', 'TBD'];
    const ticketPromises = ticketNames.map((title, i) => {
      const ticket = { title, description: '', boardId, monthId, sprintId };
      return this.createTicket(boardId, monthId, sprintId, ticket, i);
    });
    await Promise.all(ticketPromises);
  }

  getTickets(
    boardId: string,
    monthId: string,
    sprintId: string
  ): Observable<Ticket[]> {
    return this.db
      .collection('boards')
      .doc(boardId)
      .collection('months')
      .doc(monthId)
      .collection('sprints')
      .doc(sprintId)
      .collection<Ticket>('tickets')
      .valueChanges({ idField: 'id' });
  }

  async getTicketsPromise(
    boardId: string,
    monthId: string,
    sprintId: string
  ): Promise<Ticket[]> {
    const snapshot = await this.db
      .collection('boards')
      .doc(boardId)
      .collection('months')
      .doc(monthId)
      .collection('sprints')
      .doc(sprintId)
      .collection<Ticket>('tickets')
      .ref.get();

    return snapshot.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id } as Ticket)
    );
  }

  async updateTicket(id: string, ticket: Partial<Ticket>): Promise<void> {
    if (!ticket.boardId || !ticket.monthId || !ticket.sprintId) {
      throw new Error('Required fields are missing');
    }

    const docRef = this.db
      .collection('boards')
      .doc(ticket.boardId)
      .collection('months')
      .doc(ticket.monthId)
      .collection('sprints')
      .doc(ticket.sprintId)
      .collection('tickets')
      .doc(id);

    this.logsFire.addLogs(ticket.boardId, LogsType.EditTicket, {name: ticket.title, id: id})

    await docRef.update({
      ...ticket,
      boardId: ticket.boardId,
      monthId: ticket.monthId,
      sprintId: ticket.sprintId,
    });
  }

  deleteTicket(
    ticketId: string,
    boardId: string,
    monthId: string,
    sprintId: string,
    ticketTitle: string,
    ignoreLogs: boolean
  ): Promise<void> {
    console.log(ignoreLogs)
    if (!ignoreLogs) {
      this.logsFire.addLogs(boardId, LogsType.DeleteTicket, {id: ticketId})
      this.logsFire.addLogsStackHolderDeleteTicket(boardId, ticketId, ticketTitle, monthId, sprintId)
    }

    return this.db
      .collection('boards')
      .doc(boardId)
      .collection('months')
      .doc(monthId)
      .collection('sprints')
      .doc(sprintId)
      .collection('tickets')
      .doc(ticketId)
      .delete();
  }

  public async getNewTicketPosition(
    boardId: string,
    monthId: string,
    sprintId: string
  ): Promise<number> {
    const tickets$: Observable<Ticket[]> = this.getTickets(
      boardId,
      monthId,
      sprintId
    );
    const tickets: Ticket[] = await firstValueFrom(tickets$);
    const positions = tickets.map((ticket) => ticket.position!);
    const maxPosition = positions.length ? Math.max(...positions) : 0;
    return maxPosition + 1;
  }
}
