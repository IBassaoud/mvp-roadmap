import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

import { Month } from '../interfaces/month';

import { SprintService } from './sprint.service';

@Injectable({
  providedIn: 'root',
})
export class MonthService {
  constructor(
    private db: AngularFirestore,
    private sprintService: SprintService
  ) {}

  async createDefaultMonths(boardId: string): Promise<Month[]> {
    const defaultMonthsData: Omit<Month, 'id'>[] = [
      { boardId, name: 'January' },
      { boardId, name: 'February' },
      { boardId, name: 'March' },
    ];

    const monthPromises = defaultMonthsData.map((month) =>
      this.db.collection('boards').doc(boardId).collection('months').add(month)
    );
    const monthRefs = await Promise.all(monthPromises);

    return monthRefs.map((monthRef, index) => ({
      id: monthRef.id,
      ...defaultMonthsData[index],
    }));
  }

  async createMonth(boardId: string, month: Month): Promise<void> {
    const boardRef = this.db.collection('boards').doc(boardId);
    const monthRef = await boardRef.collection('months').add(month);

    // Create sprints for the new month
    await this.sprintService.createSprintsForMonth(boardId, monthRef.id);
  }

  getMonths(boardId: string): Observable<Month[]> {
    return this.db
      .collection<Month>('boards')
      .doc(boardId)
      .collection<Month>('months')
      .valueChanges({ idField: 'id' });
  }

  updateMonth(
    monthId: string,
    boardId: string,
    month: Partial<Month>
  ): Promise<void> {
    return this.db
      .collection('boards')
      .doc(boardId)
      .collection('months')
      .doc(monthId)
      .update(month);
  }

  deleteMonth(monthId: string, boardId: string): Promise<void> {
    return this.db
      .collection('boards')
      .doc(boardId)
      .collection('months')
      .doc(monthId)
      .delete();
  }
}
