import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { TicketService } from './ticket.service';

import { Sprint } from '../interfaces/sprint';

@Injectable({
  providedIn: 'root',
})
export class SprintService {
  constructor(private db: AngularFirestore, private ticketService: TicketService) {}

  async createSprintsForMonth(boardId: string, monthId: string): Promise<void> {
    const sprintNames = ['Sprint 1', 'Sprint 2'];
    const sprintPromises = sprintNames.map(async (name) => {
      const sprint = await this.createSprint(boardId, monthId, { boardId, monthId, name });
      if (sprint.id) {
        return this.ticketService.createDefaultTickets(boardId, monthId, sprint.id);
      } else {
        throw new Error('Failed to create a sprint');
      }
    });
    await Promise.all(sprintPromises);
  }

  async createSprint(
    boardId: string,
    monthId: string,
    sprint: Sprint
  ): Promise<Sprint> {
    const monthRef = this.db
      .collection('boards')
      .doc(boardId)
      .collection('months')
      .doc(monthId);
    const sprintRef = await monthRef.collection('sprints').add({
      ...sprint,
      isCollapsed: false,
    });
    return { id: sprintRef.id, ...sprint };
  }


  getSprints(boardId: string, monthId: string): Observable<Sprint[]> {
    return this.db
      .collection('boards')
      .doc(boardId)
      .collection('months')
      .doc(monthId)
      .collection<Sprint>('sprints')
      .valueChanges({ idField: 'id' });
  }

  updateSprint(
    sprintId: string,
    boardId: string,
    monthId: string,
    sprint: Partial<Sprint>
  ): Promise<void> {
    return this.db
      .collection('boards')
      .doc(boardId)
      .collection('months')
      .doc(monthId)
      .collection('sprints')
      .doc(sprintId)
      .update(sprint);
  }

  deleteSprint(
    sprintId: string,
    boardId: string,
    monthId: string
  ): Promise<void> {
    return this.db
      .collection('boards')
      .doc(boardId)
      .collection('months')
      .doc(monthId)
      .collection('sprints')
      .doc(sprintId)
      .delete();
  }
}
