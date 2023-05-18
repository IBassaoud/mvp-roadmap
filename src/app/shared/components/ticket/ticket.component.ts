import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  Ticket,
  TicketPriority,
  TicketStatus,
} from 'src/app/core/interfaces/ticket';
import { TicketEditDialogComponent } from './ticket-edit-dialog/ticket-edit-dialog.component';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { TicketService } from 'src/app/core/services/ticket.service';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss'],
})
export class TicketComponent implements OnInit {
  @Input() ticket!: Ticket;
  @Input() isEditorMode: boolean = false;
  @Input() boardId?: string;
  @Input() monthId?: string;
  @Input() sprintId?: string;

  constructor(private dialog: MatDialog, private snackBarService: SnackbarService, private ticketService: TicketService) {}

  ngOnInit(): void {}

  getPriorityClass(priority: TicketPriority | null | undefined): string {
    switch (priority) {
      case TicketPriority.Low:
        return 'low-priority';
      case TicketPriority.Medium:
        return 'medium-priority';
      case TicketPriority.High:
        return 'high-priority';
      default:
        return '';
    }
  }

  openEditDialog(): void {
      const dialogRef = this.dialog.open(TicketEditDialogComponent, {
        width: '520px',
        height: '542px',
        panelClass: 'custom-popup',
        data: { ticket: this.ticket, isEditorMode: this.isEditorMode },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result && this.isEditorMode) {
          // Only update the ticket if we are in editor mode
          this.ticket = result;
        }
      });
  }

  confirmDelete(event: Event): void {
    event.stopPropagation(); // Prevent click event propagation to the parent
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '300px'
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.deleteTicket();
      }
    });
  }

  private async deleteTicket(): Promise<void> {
    if (!this.ticket.id || !this.boardId || !this.monthId || !this.sprintId) {
      console.error('Missing required properties');
      return;
    }
    try {
      await this.ticketService.deleteTicket(this.ticket.id, this.boardId, this.monthId, this.sprintId);
      this.snackBarService.showSuccess('Ticket deleted successfully!');
    } catch (error) {
      this.snackBarService.showError('Error while deleting ticket');
      console.error(error);
    }
  }
}
