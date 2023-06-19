import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TicketService } from 'src/app/core/services/ticket.service';
import {
  Ticket,
  TicketPriority,
  TicketStatus,
} from 'src/app/core/interfaces/ticket';
import { SnackbarService } from 'src/app/core/services/snackbar.service';

@Component({
  selector: 'app-ticket-creation-dialog',
  templateUrl: './ticket-creation-dialog.component.html',
  styleUrls: ['./ticket-creation-dialog.component.scss'],
})
export class TicketCreationDialogComponent implements OnInit {
  ticketForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<TicketCreationDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { boardId: string; sprintId: string; monthId: string },
    private fb: FormBuilder,
    private snackbarService: SnackbarService,
    private ticketService: TicketService
  ) {
    this.ticketForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.maxLength(280)],
      priority: [TicketPriority.Low],
      link: [''],
    });
  }

  ngOnInit(): void {}

  private async getTicketsSafe(): Promise<Ticket[]> {
    const tickets = await this.ticketService.getTicketsPromise(
      this.data.boardId,
      this.data.monthId,
      this.data.sprintId
    );
    return tickets || [];
  }


  async onSubmit(): Promise<void> {
    if (!this.data.boardId || !this.data.sprintId || !this.data.monthId) {
      this.snackbarService.showError('Required data is missing');
      return;
    }

    if (this.ticketForm.valid) {
      const formValues = this.ticketForm.value;
      const newTicket: Partial<Ticket> = {
        title: formValues.title,
        boardId: this.data.boardId,
        monthId: this.data.monthId,
        sprintId: this.data.sprintId,
        description: formValues.description,
        status: TicketStatus.Todo,
        priority: formValues.priority
          ? TicketPriority.High
          : TicketPriority.Low,
        createdAt: new Date(),
        updatedAt: new Date(),
        link:formValues.link,
        assignee: '',
      };

      const tickets: Ticket[] = await this.getTicketsSafe();

      const newPosition = await this.ticketService.getNewTicketPosition(
        this.data.boardId,
        this.data.monthId,
        this.data.sprintId
      );

      for (const [index, ticket] of tickets.entries()) {
        if (index >= newPosition) {
          ticket.position = index + 1;
          await this.ticketService.updateTicket(ticket.id!, ticket);
        }
      }

      newTicket.position = newPosition;

      try {
        await this.ticketService.createTicket(
          this.data.boardId,
          this.data.monthId,
          this.data.sprintId,
          newTicket,
          newPosition
        );

        this.dialogRef.close();
        this.snackbarService.showSuccess('Ticket created successfully');
      } catch (error) {
        console.error(error);
        this.snackbarService.showError(
          'An error occurred while creating the ticket'
        );
      }
    }
  }
}
