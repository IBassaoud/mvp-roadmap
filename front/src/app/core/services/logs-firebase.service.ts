import { Inject, Injectable, Injector, forwardRef } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { firstValueFrom } from 'rxjs';
import { LogsType } from 'src/app/core/interfaces/logs-firebase';
import {Timestamp} from 'firebase/firestore'

async function getNameFromResolvedPromise(promise: Promise<any>): Promise<string> {
  const data = await promise;
  return data['name'];
}

@Injectable({
  providedIn: 'root'
})
export class LogsFirebaseService {

  interval: NodeJS.Timer ;
  logId =''

  constructor(private db: AngularFirestore) {
    this.getMonthId()
    this.interval = setInterval(() => {
      this.getMonthId()
    }, 900000);
  }

  private getMonthId() {
    console.log('get Month')
    const date = new Date()

    this.logId = date.getMonth() + '-' + date.getFullYear()
  }

  private async getOneMonthById(boardId: string, monthId: string) {
    const monthDocRef = this.db
    .collection('boards')
    .doc(boardId)
    .collection('months')
    .doc(monthId)

    const result = await firstValueFrom(monthDocRef.get())

    if (result.exists) {
      let resultData = result.data();
      if (resultData) {
        return resultData;
      } else {
        throw 'Data is missing in the result';
      }
    } else {
      throw 'Can\'t find month';
    }
  }

  private async getOneSprintById(boardId: string, monthId: string, sprintId: string) {
    const sprintDocRef = this.db
    .collection('boards')
    .doc(boardId)
    .collection('months')
    .doc(monthId)
    .collection('sprints')
    .doc(sprintId);

    const result = await firstValueFrom(sprintDocRef.get())

    if (result.exists) {
      let resultData = result.data();
      if (resultData) {
        return resultData;
      } else {
        throw 'Data is missing in the result';
      }
    } else {
      throw 'Can\'t find sprint';
    }
  }

  async addLogs(boardId: string, type: LogsType, info: any) { // Pas necessaire now
    /* await this.db
      .collection('boards')
      .doc(boardId)
      .collection('logsMonth')
      .doc(this.logId)
      .collection('logs').add({
        type: type,
        info: info,
        timestamp: Timestamp.fromDate(new Date())
      }) */
  }

  async addLogsStackHolderCreateTicket(boardId: string, id: string, name: string, monthId: string, sprintId: string) {
    try {
      const [month, sprint] = await Promise.all([
        getNameFromResolvedPromise(this.getOneMonthById(boardId, monthId)),
        getNameFromResolvedPromise(this.getOneSprintById(boardId, monthId, sprintId)),
      ]);

      await this.db
      .collection('boards')
      .doc(boardId)
      .collection('logsStackHolder')
      .add({
        id: id,
        type: LogsType.CreateTicket,
        name: name,
        month: month,
        sprint: sprint,
        archived: false,
        timestamp: Timestamp.fromDate(new Date())
      })
    } catch (error) {
      console.error("An error occurred while saving stackHolder log", error);
      throw "An error occurred while saving stackHolder log"
    }
  }

  async addLogsStackHolderMoveTicket(boardId: string, id: string, name: string, oldMonthId: string, oldSprintId: string, monthId: string, sprintId: string) {
    try {
      const [month, sprint, oldMonth, oldSprint] = await Promise.all([
        getNameFromResolvedPromise(this.getOneMonthById(boardId, monthId)),
        getNameFromResolvedPromise(this.getOneSprintById(boardId, monthId, sprintId)),
        getNameFromResolvedPromise(this.getOneMonthById(boardId, oldMonthId)),
        getNameFromResolvedPromise(this.getOneSprintById(boardId, oldMonthId, oldSprintId)),
      ]);

      await this.db
        .collection('boards')
        .doc(boardId)
        .collection('logsStackHolder')
        .add({
          id: id,
          name: name,
          type: LogsType.MoveTicket,
          month: month,
          sprint: sprint,
          oldMonth: oldMonth,
          oldSprint: oldSprint,
          archived: false,
          timestamp: Timestamp.fromDate(new Date())
        })
    } catch (error) {
      console.error("An error occurred while saving stackHolder log", error);
      throw "An error occurred while saving stackHolder log"
    }
  }

  async addLogsStackHolderDeleteTicket(boardId: string, id: string, name: string, monthId: string, sprintId: string) {
    try {
      const [month, sprint] = await Promise.all([
        getNameFromResolvedPromise(this.getOneMonthById(boardId, monthId)),
        getNameFromResolvedPromise(this.getOneSprintById(boardId, monthId, sprintId)),
      ]);

      await this.db
        .collection('boards')
        .doc(boardId)
        .collection('logsStackHolder')
        .add({
          id: id,
          name: name,
          type: LogsType.DeleteTicket,
          month: month,
          sprint: sprint,
          archived: false,
          timestamp: Timestamp.fromDate(new Date())
        })
    } catch (error) {
      console.error("An error occurred while saving stackHolder log", error);
      throw "An error occurred while saving stackHolder log"
    }
  }

  async getAllLogsStackHolder(boardId: string, onlyNoArchived: boolean = true) {
    try {

      let querySnapshot

      if (onlyNoArchived) {
        querySnapshot = await firstValueFrom(this.db
          .collection('boards')
          .doc(boardId)
          .collection('logsStackHolder', ref => ref.where('archived', '!=', true))
          .get());
      } else {
        querySnapshot = await firstValueFrom(this.db
          .collection('boards')
          .doc(boardId)
          .collection('logsStackHolder')
          .get());
      }

      const logs: any[] = [];

      querySnapshot.forEach((doc) => {
        logs.push({ idDoc: doc.id, ...doc.data() });
      });
      return logs;
    } catch (error) {
      console.error("Error getting documents from 'logsStackHolder': ", error);
      throw new Error("Error retrieving documents");
    }
  }

  async deleteLogsStackHolder(boardId: string, id: string) {
    try {
      const docRef = this.db
        .collection('boards')
        .doc(boardId)
        .collection('logsStackHolder')
        .doc(id);

      await docRef.delete();

      console.info(`Document with ID ${id} successfully deleted from 'logsStackHolder'`);
    } catch (error) {
      console.error("Error deleting document from 'logsStackHolder': ", error);
      throw new Error("Error deleting document");
    }
  }

  async archiveLogsStackHolder(boardId: string, id: string) {
    try {
      const docRef = this.db
        .collection('boards')
        .doc(boardId)
        .collection('logsStackHolder')
        .doc(id);

      await docRef.update({
        archived: true
      });

      console.info(`Document with ID ${id} successfully archived in 'logsStackHolder'`);
    } catch (error) {
      console.error("Error archiving document in 'logsStackHolder': ", error);
      throw new Error("Error archiving document");
    }
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }
}
