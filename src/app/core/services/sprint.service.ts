import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

import { Sprint } from '../interfaces/sprint';

@Injectable({
  providedIn: 'root',
})
export class SprintService {
  constructor(private db: AngularFirestore) {}

  async createSprintsForMonth(boardId: string, monthId: string): Promise<void> {
    const sprintNames = ['Sprint 1', 'Sprint 2'];
    const sprintPromises = sprintNames.map((name) =>
      this.createSprint(boardId, monthId, { boardId, monthId, name })
    );
    await Promise.all(sprintPromises);
  }

  async createSprint(
    boardId: string,
    monthId: string,
    sprint: Sprint
  ): Promise<void> {
    const monthRef = this.db
      .collection('boards')
      .doc(boardId)
      .collection('months')
      .doc(monthId);
    await monthRef.collection('sprints').add(sprint);
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
