import { Component, Inject, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TicketService } from 'src/app/core/services/ticket.service';
import { Ticket, TicketPriority, TicketStatus } from 'src/app/core/interfaces/ticket';
import { Impact, Board, TicketReference } from 'src/app/core/interfaces/board';
import { ColorMapType } from 'src/app/core/interfaces/color-map';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { BoardService } from 'src/app/core/services/board.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Subject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap  } from 'rxjs/operators';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-ticket-edit-dialog',
  templateUrl: './ticket-edit-dialog.component.html',
  styleUrls: ['./ticket-edit-dialog.component.scss'],
})
export class TicketEditDialogComponent implements OnInit {
  @ViewChild('impactContainer', { static: false }) impactContainer?: ElementRef;
  @ViewChild('impactDropdown', { static: false }) impactDropdown?: ElementRef;
  @ViewChild('newImpactInput', { static: false }) newImpactInput?: ElementRef;
  @ViewChild(MatMenuTrigger, { static: false }) matMenuTrigger?: MatMenuTrigger;

  ticketForm: FormGroup;
  loading = false;
  ticketStatuses = Object.values(TicketStatus);
  isEditorMode: boolean;
  showImpactDropdown = false;
  impacts: Impact[] = [];
  createImpactPreview: string | null = null;
  showPreview = false;
  previewMenuItem: string | null = null;
  previewColor: string | null = null;
  
  impactExists = false;
  searchedImpact: Impact | null = null;
  lastInputValue: string | null = null;

  readonly colorMap: ColorMapType = {
    'Gray': '#505050',
    'Brown': '#5a2d2d',
    'Orange': '#ff5500',
    'Yellow': '#b3b300',
    'Green': '#006600',
    'Blue': '#000099',
    'Purple': '#660066',
    'Pink': '#ff0066',
    'Red': '#990000',
  };

  constructor(
    private dialogRef: MatDialogRef<TicketEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    private data: { ticket: Ticket; isEditorMode: boolean },
    private fb: FormBuilder,
    private snackbarService: SnackbarService,
    private ticketService: TicketService,
    private dialog: MatDialog,
    private elementRef: ElementRef,
    private boardService: BoardService
  ) {
    this.isEditorMode = this.data.isEditorMode;
    // Initialize impacts from the board instead of the ticket
    this.boardService
      .getBoard(this.data.ticket.boardId)
      .subscribe((board: Board) => {
        this.impacts =
          board.impacts?.filter((impact) => {
            return impact.tickets?.some((ticket) => {
              return (
                ticket.idTicket === this.data.ticket.id &&
                ticket.monthId === this.data.ticket.monthId &&
                ticket.sprintId === this.data.ticket.sprintId
              );
            });
          }) || [];
      });
    this.ticketForm = this.fb.group({
      boardId: [{ value: '', disabled: !this.isEditorMode }, Validators.required],
      monthId: [{ value: '', disabled: !this.isEditorMode },Validators.required],
      sprintId: [{ value: '', disabled: !this.isEditorMode },Validators.required],
      title: [{ value: '', disabled: !this.isEditorMode }, Validators.required],
      description: [{ value: '', disabled: !this.isEditorMode },Validators.maxLength(280)],
      priority: [{ value: TicketPriority.Low, disabled: !this.isEditorMode }],
      link: [{ value: '', disabled: !this.isEditorMode }, Validators.pattern('https?://.+')],
      status: [{ value: TicketStatus.Todo, disabled: !this.isEditorMode }],
      impacts: [this.impacts, [Validators.required, Validators.maxLength(4)]],
    });
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  get colorKeys(): string[] {
    return Object.keys(this.colorMap);
  }

  // Method to handle clicks on the impactContainer
  @HostListener('click', ['$event'])
  clickInside(event: Event): void {
    if (this.impactContainer?.nativeElement.contains(event.target)) {
      this.showImpactDropdown = true; // Always set to true when clicking inside the impactContainer
    }
  }

  // Method to handle clicks outside the impactContainer and impactDropdown
  @HostListener('document:click', ['$event'])
  clickout(event: Event): void {
    const impactContainer = this.impactContainer?.nativeElement;
    const impactDropdown = this.impactDropdown?.nativeElement;
    const clickedElement = event.target as HTMLElement;

    const isMatMenuClicked = clickedElement.classList.contains('custom-mat-menu') || clickedElement.closest('.custom-mat-menu') || clickedElement.classList.contains('cdk-overlay-backdrop');
  
    if (
      impactContainer &&
      !impactContainer.contains(event.target) &&
      impactDropdown &&
      !impactDropdown.contains(event.target) &&
    !isMatMenuClicked  
    ) {
      this.showImpactDropdown = false; // Close the dropdown only when clicking outside both the impactContainer and impactDropdown
      this.createImpactPreview = null; // Reset the input value
      this.showPreview = false; // Hide the preview
      if (this.newImpactInput?.nativeElement) {
        this.newImpactInput.nativeElement.value = ''; // Reset the input field
      }
    }
  }

  toggleImpactDropdown(): void {
    this.showImpactDropdown = !this.showImpactDropdown;
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
      impacts: this.impacts,
    });
  }

  onDrop(event: CdkDragDrop<Impact[]>): void {
    moveItemInArray(this.impacts, event.previousIndex, event.currentIndex);
    this.impacts.forEach((impact, index) => {
      impact.tickets?.forEach((ticket) => {
        if (ticket.idTicket === this.data.ticket.id) {
          ticket.position = index;
        }
      });
    });
    this.ticketForm.get('impacts')?.setValue(this.impacts);
  }

  async onSubmit(): Promise<void> {
    if (!this.ticketForm.valid || !this.isEditorMode) {
      return;
    }

    this.loading = true;
    try {
      const updatedTicket = this.prepareTicketData();
      await this.ticketService.updateTicket(this.data.ticket.id, updatedTicket);

      // Update the board's impacts
      const boardId = this.data.ticket.boardId;
      await this.boardService.updateBoard(boardId, { impacts: this.impacts });

      this.snackbarService.showSuccess(
        'Ticket and impacts updated successfully'
      );
      this.dialogRef.close();
    } catch (error) {
      console.error(error);
      this.snackbarService.showError('An error occurred while updating');
    } finally {
      this.loading = false;
    }
  }

  private prepareTicketData(): Partial<Ticket> {
    const formValues = this.ticketForm.value;
    const updatedTicket: Partial<Ticket> = {
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

    // Update the impact tickets based on unique monthId, sprintId, and ticketId
    this.impacts.forEach((impact) => {
      impact.tickets = impact.tickets?.filter((ticket) => {
        return (
          ticket.idTicket !== this.data.ticket.id &&
          ticket.monthId === this.data.ticket.monthId &&
          ticket.sprintId === this.data.ticket.sprintId
        );
      });
      impact.tickets?.push({
        idTicket: this.data.ticket.id,
        position: this.data.ticket.position || 0,
        monthId: this.data.ticket.monthId,
        sprintId: this.data.ticket.sprintId,
      });
    });

    return updatedTicket;
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

  handleNewImpact(newImpact: string): void {
    if (!newImpact) return;

    // Use the searched impact if available
    const impactToAdd = this.searchedImpact || {
      name: newImpact,
      color: this.getRandomColor(),
      tickets: [
        {
          idTicket: this.data.ticket.id,
          position: this.impacts.length,
          monthId: this.data.ticket.monthId,
          sprintId: this.data.ticket.sprintId,
        },
      ],
    };

    this.impacts.push(impactToAdd);
    this.ticketForm.get('impacts')?.setValue(this.impacts);
    // Reset the input
    this.createImpactPreview = null;
    this.showPreview = false;
  }

  deleteImpact(index: number): void {
    this.impacts.splice(index, 1);
    this.ticketForm.get('impact')?.setValue(this.impacts);
  }

  getRandomColor(): string {
    const colorKeys = Object.keys(this.colorMap);
    const randomIndex = Math.floor(Math.random() * colorKeys.length);
    return this.colorMap[colorKeys[randomIndex]];
  }

  preventFormSubmit(event: Event): void {
    if ((event as KeyboardEvent).key === 'Enter') {
      event.preventDefault();
    }
  }

  private filterImpacts(term: string): Impact[] {
    if (!term.trim()) {
      this.createImpactPreview = null;
      this.impactExists = false;
      return this.impacts;
    }
  
    const filteredImpacts = this.impacts.filter(impact => impact.name.toLowerCase().includes(term.toLowerCase()));
  
    // Set the impactExists flag based on whether the term exactly matches any existing impact names
    this.impactExists = this.impacts.some(impact => impact.name.toLowerCase() === term.toLowerCase());
  
    if (this.impactExists) {
      this.previewMenuItem = 'Select';
    } else {
      this.previewMenuItem = 'Create';
    }

    return filteredImpacts;
  }

  checkImpactExists(term: string): void {
    // If the input is empty, reset everything and generate a new random color
    if (!term) {
      this.createImpactPreview = null;
      this.showPreview = false;
      this.previewColor = this.getRandomColor(); // Generate a new random color
      return;
    }
  
    // Fetch impact from the database using the board service
    this.boardService.searchImpactByLabel(this.data.ticket.boardId, term)
      .subscribe((impact: Impact | null) => {
        this.searchedImpact = impact;
  
        if (impact) {
          this.previewMenuItem = 'Select';
          this.previewColor = impact.color; // Keep the color of the ticket matched
        } else {
          this.previewMenuItem = 'Create';
          // Only generate a new random color if the input was previously empty
          if (this.lastInputValue === null || this.lastInputValue === '') {
            this.previewColor = this.getRandomColor();
          }
        }
  
        this.createImpactPreview = term;
        this.showPreview = true;
        this.lastInputValue = term; // Store the last input value
      });
  }

  previewBackgroundColor(): string {
    if (this.impactExists) {
      const existingImpact = this.impacts.find(impact => impact.name.toLowerCase() === this.createImpactPreview?.toLowerCase());
      return existingImpact?.color || '#333333'; // Fallback to gray
    }
    return this.previewColor || this.getRandomColor(); // Use the previewColor if available
  }

  handleImpactPreview(): void {
    if (this.previewMenuItem === 'Select') {
      this.updateOrAddImpact(this.createImpactPreview, true);
    } else if (this.previewMenuItem === 'Create') {
      this.updateOrAddImpact(this.createImpactPreview, false);
    }

    // Reset the previewMenuItem and input after handling the preview
    this.previewMenuItem = null;
    this.createImpactPreview = null;
    this.showPreview = false;
  }

  updateOrAddImpact(impactName: string | null, isUpdate: boolean): void {
    if (!impactName) return;

    const existingImpact = this.impacts.find(impact => impact.name.toLowerCase() === impactName.toLowerCase());

    if (isUpdate && existingImpact) {
      this.addOrUpdateTicketReference(existingImpact);
      return;
    }

    if (!isUpdate && !existingImpact) {
      const newImpactItem: Impact = {
        name: impactName,
        color: this.getRandomColor(),
        tickets: [this.createTicketReference()],
      };
      this.impacts.push(newImpactItem);
      this.ticketForm.get('impacts')?.setValue(this.impacts);
    }
  }

  addOrUpdateTicketReference(impact: Impact): void {
    const newTicketReference = this.createTicketReference();

    // Check if the ticket reference already exists
    const ticketExists = impact.tickets?.some(ticket => 
      ticket.idTicket === newTicketReference.idTicket &&
      ticket.monthId === newTicketReference.monthId &&
      ticket.sprintId === newTicketReference.sprintId
    );

    if (!ticketExists) {
      impact.tickets?.push(newTicketReference);
    }
  }

  createTicketReference(): TicketReference {
    return {
      idTicket: this.data.ticket.id,
      position: this.impacts.length,
      monthId: this.data.ticket.monthId,
      sprintId: this.data.ticket.sprintId,
    };
  }

  changeImpactColor(impact: Impact, newColor: string): void {
    impact.color = newColor;
  }
}
