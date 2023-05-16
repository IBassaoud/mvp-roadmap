import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TicketService } from 'src/app/core/services/ticket.service';
import { Ticket, TicketPriority, TicketStatus } from 'src/app/core/interfaces/ticket';
import { SnackbarService } from 'src/app/core/services/snackbar.service';

@Component({
  selector: 'app-ticket-edit-dialog',
  templateUrl: './ticket-edit-dialog.component.html',
  styleUrls: ['./ticket-edit-dialog.component.scss'],
})
export class TicketEditDialogComponent implements OnInit {
  ticketForm: FormGroup;
  loading = false;
  ticketStatuses = Object.values(TicketStatus);

  constructor(
    private dialogRef: MatDialogRef<TicketEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: { ticket: Ticket },
    private fb: FormBuilder,
    private snackbarService: SnackbarService,
    private ticketService: TicketService
  ) {
    this.ticketForm = this.fb.group({
      boardId: ['', Validators.required],
      monthId: ['', Validators.required],
      sprintId: ['', Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.maxLength(280)],
      priority: [TicketPriority.Low],
      link: ['', Validators.pattern('https?://.+')],
      status: [TicketStatus.Todo],
    });
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    const ticket = this.data?.ticket || {} as Ticket;
    this.ticketForm.setValue({
      boardId: ticket.boardId,
      monthId: ticket.monthId,
      sprintId: ticket.sprintId,
      title: ticket.title || '',
      description: ticket.description || '',
      priority: ticket.priority === TicketPriority.High,
      link: ticket.link || '',
      status: ticket.status || TicketStatus.Todo,
    });
  }

  async onSubmit(): Promise<void> {
    if (!this.ticketForm.valid) {
      return;
    }

    this.loading = true;
    try {
      const updatedTicket = this.prepareTicketData();
      await this.ticketService.updateTicket(this.data.ticket.id, updatedTicket);
      this.snackbarService.showSuccess('Ticket updated successfully');
      this.dialogRef.close();
    } catch (error) {
      console.error(error);
      this.snackbarService.showError('An error occurred while updating the ticket');
    } finally {
      this.loading = false;
    }
  }

  private prepareTicketData(): Partial<Ticket> {
    const formValues = this.ticketForm.value;
    return {
      boardId: formValues.boardId,
      monthId: formValues.monthId,
      sprintId: formValues.sprintId,
      title: formValues.title,
      description: formValues.description,
      status: formValues.status,
      priority: formValues.priority ? TicketPriority.High : TicketPriority.Low,
      updatedAt: new Date(),
      link: formValues.link,
    };
  }

  public formatStatus(status: string): string {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
}
