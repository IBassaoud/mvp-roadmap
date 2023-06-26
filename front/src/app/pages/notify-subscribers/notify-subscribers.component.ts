import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NewsletterService } from 'src/app/core/services/newsletter.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';

@Component({
  selector: 'app-notify-subscribers',
  templateUrl: './notify-subscribers.component.html',
  styleUrls: ['./notify-subscribers.component.scss']
})
export class NotifySubscribersComponent implements OnInit {
  messageForm: FormGroup;
  loading = false
  isEditorMode = true

  constructor(
    public dialogRef: MatDialogRef<NotifySubscribersComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { boardId: string; sprintId: string; monthId: string },
    private formBuilder: FormBuilder,
    private newsletterService: NewsletterService,
    private snackbarService: SnackbarService,
    ) {
      this.messageForm = this.formBuilder.group({
        message: ''
      })
    }

  ngOnInit(): void {
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
