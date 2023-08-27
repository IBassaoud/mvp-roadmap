import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { TicketService } from 'src/app/core/services/ticket.service';
import {
  Ticket,
  TicketPriority,
  TicketStatus,
  ImpactItem
} from 'src/app/core/interfaces/ticket';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-ticket-edit-dialog',
  templateUrl: './ticket-edit-dialog.component.html',
  styleUrls: ['./ticket-edit-dialog.component.scss'],
})
export class TicketEditDialogComponent implements OnInit {
  ticketForm: FormGroup;
  loading = false;
  ticketStatuses = Object.values(TicketStatus);
  isEditorMode: boolean;
  showImpactDropdown = false;
  impacts: ImpactItem[] = [];

  constructor(
    private dialogRef: MatDialogRef<TicketEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    private data: { ticket: Ticket; isEditorMode: boolean },
    private fb: FormBuilder,
    private snackbarService: SnackbarService,
    private ticketService: TicketService,
    private dialog: MatDialog
  ) {
    this.isEditorMode = this.data.isEditorMode;
    this.impacts = [...(this.data.ticket.impact ?? [])];
    this.ticketForm = this.fb.group({
      boardId: [
        { value: '', disabled: !this.isEditorMode },
        Validators.required,
      ],
      monthId: [
        { value: '', disabled: !this.isEditorMode },
        Validators.required,
      ],
      sprintId: [
        { value: '', disabled: !this.isEditorMode },
        Validators.required,
      ],
      title: [{ value: '', disabled: !this.isEditorMode }, Validators.required],
      description: [
        { value: '', disabled: !this.isEditorMode },
        Validators.maxLength(280),
      ],
      priority: [{ value: TicketPriority.Low, disabled: !this.isEditorMode }],
      link: [
        { value: '', disabled: !this.isEditorMode },
        Validators.pattern('https?://.+'),
      ],
      status: [{ value: TicketStatus.Todo, disabled: !this.isEditorMode }],
      impact: [this.impacts, [Validators.required, Validators.maxLength(4)]]
    });
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    const ticket = this.data.ticket || ({} as Ticket);
    let ticketTitle = ticket.title.trim();
    if (this.isEditorMode) {
      if (ticketTitle.toLowerCase() === 'tbd') {
        ticketTitle = '';
      }
    }

    this.ticketForm.patchValue({
      boardId: ticket.boardId,
      monthId: ticket.monthId,
      sprintId: ticket.sprintId,
      title: ticketTitle,
      description: ticket.description || '',
      priority: ticket.priority === TicketPriority.High,
      link: ticket.link || '',
      status: ticket.status || TicketStatus.Todo,
      impact: this.data.ticket.impact,
    });
  }

  editImpact(index: number, updatedImpact: ImpactItem): void {
    this.impacts[index] = updatedImpact;
    this.ticketForm.get('impact')?.setValue(this.impacts);
  }

  onDrop(event: CdkDragDrop<ImpactItem[]>): void {
    moveItemInArray(this.impacts, event.previousIndex, event.currentIndex);
    // Update the position property based on the new order
    this.impacts.forEach((impact, index) => {
      impact.position = index;
    });
    this.ticketForm.get('impact')?.setValue(this.impacts);
  }
  
  async onSubmit(): Promise<void> {
    if (!this.ticketForm.valid || !this.isEditorMode) {
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
      this.snackbarService.showError(
        'An error occurred while updating the ticket'
      );
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
      impact: this.impacts
    };
  }

  async onDelete(): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '330px',
      height: '210px',
      panelClass: 'confirmation-popup',
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await this.ticketService.deleteTicket(
            this.data.ticket.id,
            this.data.ticket.boardId,
            this.data.ticket.monthId,
            this.data.ticket.sprintId
          );
          this.snackbarService.showSuccess('Ticket deleted successfully');
          this.dialogRef.close();
        } catch (error) {
          console.error(error);
          this.snackbarService.showError(
            'An error occurred while deleting the ticket'
          );
        }
      }
    });
  }

  toggleImpactDropdown(): void {
    this.showImpactDropdown = !this.showImpactDropdown;
  }

    addNewImpact(name: string, color: string): void {
      if (this.impacts.length < 4 && name && color) {
        const newImpact: ImpactItem = { name, color, position: this.impacts.length };
        this.impacts.push(newImpact);
        this.ticketForm.get('impact')?.setValue(this.impacts);
      }
    }

    updateColor(event: Event, colorDisplay: HTMLElement) {
      const color = (event.target as HTMLInputElement).value;
      colorDisplay.style.backgroundColor = color;
    }
}
