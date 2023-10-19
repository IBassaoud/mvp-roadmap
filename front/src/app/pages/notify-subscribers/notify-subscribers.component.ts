import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NewsletterService } from 'src/app/core/services/newsletter.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { LogsFirebaseService } from '../../core/services/logs-firebase.service';
import { LogsType } from 'src/app/core/interfaces/logs-firebase';

function extractSprintNumber(sprintString: string) {
  const sprintNumber = sprintString.split(' ')[1]; // Divisez par l'espace et prenez le second élément (le numéro)
  return parseInt(sprintNumber); // Convertissez la partie numérique en un entier
}

function monthToNumber(monthName: string) {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const index = months.indexOf(monthName);
  return index > -1 ? index : null;
}

@Component({
  selector: 'app-notify-subscribers',
  templateUrl: './notify-subscribers.component.html',
  styleUrls: ['./notify-subscribers.component.scss']
})
export class NotifySubscribersComponent implements OnInit {
  messageForm: FormGroup;
  loading = false
  isEditorMode = true

  loadingMessage: boolean = false

  constructor(
    public dialogRef: MatDialogRef<NotifySubscribersComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { boardId: string; sprintId: string; monthId: string },
    private formBuilder: FormBuilder,
    private newsletterService: NewsletterService,
    private snackbarService: SnackbarService,
    private logsFirebase: LogsFirebaseService
    ) {
      this.messageForm = this.formBuilder.group({
        message: ''
      })
    }

  ngOnInit(): void {
  }

  async generateResponse(type: 'summarize' | 'new' | 'delayed') {
    try {
      this.loadingMessage = true
      let logs = await this.logsFirebase.getAllLogsStackHolder(this.data.boardId)

      if (type === 'new') {
        logs = logs.filter((log) => log.type === LogsType.CreateTicket)
      } else if (type === 'delayed') {
        logs = logs.filter((log) => log.type === LogsType.MoveTicket)
      } else {
        logs = logs.filter((log) => log.type === LogsType.MoveTicket || log.type === LogsType.CreateTicket || log.type === LogsType.DeleteTicket)
      }

      logs.sort((a, b) => (a.timestamp.toMillis ? a.timestamp.toMillis() : a.timestamp) - (b.timestamp.toMillis ? b.timestamp.toMillis() : b.timestamp));

      const result = logs.map((log) => {
        if (log.type === LogsType.CreateTicket) {
          return  log.name + ' has been planned to be delivered during the ' + log.sprint + ' of ' + log.month
        }  else if (log.type === LogsType.MoveTicket) {
          const oldMonthNumber = monthToNumber(log.oldMonth);
          const newMonthNumber = monthToNumber(log.month);
          const oldSprintNumber = extractSprintNumber(log.oldSprint);
          const newSprintNumber = extractSprintNumber(log.sprint);

          if (oldMonthNumber === null || newMonthNumber === null) {
            return 'Error: Unrecognized month name.';
          }

          const isMovedSooner = newMonthNumber < oldMonthNumber || (newMonthNumber === oldMonthNumber && newSprintNumber < oldSprintNumber);

          if (isMovedSooner) {
            return log.name + ' which was planned to be delivered during the ' + log.oldSprint + ' of ' + log.oldMonth + ' is expected sooner and will be delivered during the ' + log.sprint + ' of ' + log.month;
          } else {
            return log.name + ' which was planned to be delivered during the ' + log.oldSprint + ' of ' + log.oldMonth + ' is delayed and is now expected during the ' + log.sprint + ' of ' + log.month;
          }
        } else if (log.type === LogsType.DeleteTicket) {
          return log.name + ' which was planned to be delivered during the ' + log.sprint + ' of ' + log.month + ' has been deprioritized and is not expected to be shipped anymore.'
        }
        return ''
      })
      this.messageForm.setValue({message: result.join('\n')})
    } catch (error) {
      console.error('An error occurred:', error);
    } finally {
      this.loadingMessage = false;
    }
  }

  async notifySubscribers(): Promise<void> {
    try {
      console.log(this.data.boardId, this.messageForm.value.message)
      await this.newsletterService.sendNotificationToSubscribers(this.data.boardId, this.messageForm.value.message)
      this.snackbarService.showSuccess('Notification sent to subscribers')
      this.dialogRef.close()
    } catch (err) {
      this.snackbarService.showError('Error sending notification')
    }
  }

}
