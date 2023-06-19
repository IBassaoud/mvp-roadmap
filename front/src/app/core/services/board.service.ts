import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Board } from '../interfaces/board';

import { MonthService } from './month.service';
import { SprintService } from './sprint.service';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  constructor(
    private db: AngularFirestore,
    private monthService: MonthService,
    private sprintService: SprintService
  ) {}

  async createNewBoard(boardName: string, pinCode: string, editorAccessOnCreation: boolean): Promise<string> {
    const board: Board = {
      name: boardName,
      code: pinCode,
      editorAccessOnCreation,
    };

    const boardRef = await this.db.collection('boards').add(board);

    const defaultMonths = await this.monthService.createDefaultMonths(boardRef.id);
    for (const month of defaultMonths) {
      await this.sprintService.createSprintsForMonth(boardRef.id, month.id!);
    }

    return boardRef.id;
  }

  getBoard(boardId: string): Observable<Board> {
    return this.db
      .collection<Board>('boards')
      .doc<Board>(boardId)
      .valueChanges()
      .pipe(
        map((board) => {
          if (!board) {
            throw new Error('Board not found');
          }
          return { id: boardId, ...board };
        })
      );
  }

  updateBoard(boardId: string, updates: Partial<Board>): Promise<void> {
    return this.db.collection('boards').doc(boardId).update(updates);
  }
}
