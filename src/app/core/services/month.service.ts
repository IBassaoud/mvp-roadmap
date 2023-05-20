import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
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

  async deleteMonth(boardId: string, monthId: string): Promise<void> {
    try {
      console.log(
        `Deleting month with boardId ${boardId} and monthId ${monthId}`
      );
      const sprintsRef = this.db
        .collection('boards')
        .doc(boardId)
        .collection('months')
        .doc(monthId)
        .collection('sprints');
      const sprintsSnapshot = await sprintsRef.get().toPromise();

      console.log('sprintsSnapshot:', sprintsSnapshot);

      if (sprintsSnapshot?.empty) {
        console.log('No matching documents.');
        return;
      }

      sprintsSnapshot?.forEach((doc) => {
        console.log(doc.id, '=>', doc.data());
      });
      
      if (sprintsSnapshot && sprintsSnapshot.docs) {
        for (const sprint of sprintsSnapshot.docs) {
          const sprintId = sprint.id;
          console.log(`Deleting sprint with sprintId ${sprintId}`);

          // Delete all sprintStates of the current sprint
          const sprintStatesRef = this.db
            .collection('boards')
            .doc(boardId)
            .collection('months')
            .doc(monthId)
            .collection('sprints')
            .doc(sprintId)
            .collection('sprintStates');
          const sprintStatesSnapshot = await sprintStatesRef.get().toPromise();
          if (sprintStatesSnapshot && sprintStatesSnapshot.docs) {
            for (const doc of sprintStatesSnapshot.docs) {
              await doc.ref.delete();
            }
            console.log(`SprintStates deleted for sprintId ${sprintId}`);
          }

          // Delete all tickets of the current sprint
          const ticketsRef = this.db
            .collection('boards')
            .doc(boardId)
            .collection('months')
            .doc(monthId)
            .collection('sprints')
            .doc(sprintId)
            .collection('tickets');
          const ticketsSnapshot = await ticketsRef.get().toPromise();
          if (ticketsSnapshot && ticketsSnapshot.docs) {
            for (const doc of ticketsSnapshot.docs) {
              await doc.ref.delete();
            }
            console.log(`Tickets deleted for sprintId ${sprintId}`);
          }

          // Delete the sprint itself
          await sprint.ref.delete();
          console.log(`Sprint ${sprintId} deleted`);
        }
      }

      // Delete the month document itself
      const monthDocRef = this.db
        .collection('boards')
        .doc(boardId)
        .collection('months')
        .doc(monthId);
      await monthDocRef.delete();

      console.log('Month and its subcollections successfully deleted.');
    } catch (error) {
      console.error('Error deleting month:', error);
    }
  }
}
