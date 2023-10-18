import { Component, Inject, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TicketService } from 'src/app/core/services/ticket.service';
import { Ticket, TicketDifficulty, TicketMode, TicketPriority, TicketStatus } from 'src/app/core/interfaces/ticket';
import { Impact, Board, TicketReference } from 'src/app/core/interfaces/board';
import { ColorMapType } from 'src/app/core/interfaces/color-map';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { BoardService } from 'src/app/core/services/board.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Subject, Observable, of  } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap , take, catchError } from 'rxjs/operators';
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

  difficultyEnum = TicketDifficulty;
  statusEnum = TicketStatus
  ticketModeEnum = TicketMode

  ticketMode: TicketMode

  ticketForm: FormGroup;
  loading = false;
  ticketStatuses = Object.values(TicketStatus);
  showImpactDropdown = false;
  impacts: Impact[] = [];
  createImpactPreview: string | null = null;
  showPreview = false;
  previewMenuItem: string | null = null;
  previewColor: string = '';

  impactExists = false;
  searchedImpact: Impact | null = null;
  lastInputValue: string | null = null;

  readonly colorMap: ColorMapType = {
    'Gray': '#9C9D9D',
    'Brown': '#6F4B07',
    'Orange': '#F2994A',
    'Yellow': '#FBBC05',
    'Green': '#34A853',
    'Blue': '#4285F4',
    'Purple': '#BB6BD9',
    'Pink': '#FF4581',
    'Red': '#EA4335',
  };

  constructor(
    public dialogRef: MatDialogRef<TicketEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    private data: { ticket: Ticket; mode: TicketMode },
    private fb: FormBuilder,
    private snackbarService: SnackbarService,
    private ticketService: TicketService,
    private dialog: MatDialog,
    private elementRef: ElementRef,
    private boardService: BoardService
  ) {
    this.ticketMode = this.data.mode;
    // Initialize impacts from the board instead of the ticket
    this.boardService
      .getBoard(this.data.ticket.boardId)
      .subscribe((board: Board) => {
        this.impacts = board.impacts?.filter((impact) => {
          return impact.tickets?.some((ticket) => {
            return (
              ticket.idTicket === this.data.ticket.id &&
              ticket.monthId === this.data.ticket.monthId &&
              ticket.sprintId === this.data.ticket.sprintId
            );
          });
        }) || [];
      });
    this.ticketForm = this.createTicketForm(this.data.ticket);
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

    const isMatMenuClicked = clickedElement.classList.contains('custom-mat-menu') || clickedElement.closest('.custom-mat-menu') || clickedElement.classList.contains('cdk-overlay-backdrop') ||
    clickedElement.tagName.toLowerCase() === 'span';

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

    if (isMatMenuClicked && this.newImpactInput) {
      this.newImpactInput.nativeElement.value = ''
    }
  }

    @HostListener('document:keydown.enter', ['$event'])
    onKeydownHandler(event: KeyboardEvent) {
      this.handleImpactPreview();
      this.resetAndHidePreview();
    }

    resetAndHidePreview(): void {
      // Reset the input field
      if (this.newImpactInput) {
        this.newImpactInput.nativeElement.value = '';
      }
      // Hide the preview div
      this.createImpactPreview = null;
      this.showPreview = false;
    }

  toggleImpactDropdown(): void {
    this.showImpactDropdown = !this.showImpactDropdown;
  }

  getKeyByValue(value: string) {
    const indexOfS = Object.values(this.statusEnum).findIndex((test) => test.text === value);

    const key = Object.keys(this.statusEnum)[indexOfS];

    return key;
  }

  private createTicketForm(ticket: Ticket): FormGroup {
    let ticketTitle = ticket.title ? ticket.title.trim() : '';
    if (this.ticketMode === TicketMode.Edit) {
      if (ticketTitle.toLowerCase() === 'tbd') {
        ticketTitle = '';
      }
    }

    const disabled = this.ticketMode === TicketMode.View

    return this.fb.group({
      boardId: [{ value: ticket.boardId, disabled: disabled }, Validators.required],
      monthId: [{ value: ticket.monthId, disabled: disabled }, Validators.required],
      sprintId: [{ value: ticket.sprintId, disabled: disabled }, Validators.required],
      title: [{ value: ticketTitle, disabled: disabled }, Validators.required],
      description: [{ value: ticket.description || '', disabled: disabled }, Validators.maxLength(280)],
      priority: [{ value: ticket.priority === TicketPriority.High, disabled: disabled }],
      link: [{ value: ticket.link || '', disabled: disabled }, Validators.pattern('https?://.+')],
      status: [{ value: ticket.status || TicketStatus.Not_Stated.text, disabled: disabled }],
      complexity: [{ value: ticket.complexity || TicketDifficulty.None.text, disabled: disabled }],
      impacts: [this.impacts, [Validators.maxLength(4)]],
    });
  }

  private initializeForm(): void {
    this.ticketForm = this.createTicketForm(this.data.ticket);
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
    if (!this.ticketForm.valid || this.ticketMode === TicketMode.View) {
      return;
    }

    this.loading = true;

    if (this.ticketMode === TicketMode.Edit) {
      await this.onSubmitEdit()
    } else {
      await this.onSubmitCreate()
    }

  }

  async onSubmitEdit(): Promise<void> {
    try {
      const board = await this.boardService.getBoardPromise(this.data.ticket.boardId);

      if (!board) {
        throw new Error('Board not found');
      }

      const updatedTicket = this.prepareTicketData();
      await this.ticketService.updateTicket(this.data.ticket.id, updatedTicket);

      const updatedImpacts = this.updateBoardImpacts(board.impacts || []);
      await this.boardService.updateBoard(this.data.ticket.boardId, { impacts: updatedImpacts });

      this.dialogRef.close();
      this.snackbarService.showSuccess('Ticket and impacts updated successfully');
    } catch (error: any) {
      console.error(error);
      this.snackbarService.showError('An error occurred while updating the board impacts');
    } finally {
      this.loading = false;
      if (this.newImpactInput) {
        this.newImpactInput.nativeElement.value = '';
      }
    }
  }

  private async getTicketsSafe(): Promise<Ticket[]> {
    const tickets = await this.ticketService.getTicketsPromise(
      this.data.ticket.boardId,
      this.data.ticket.monthId,
      this.data.ticket.sprintId
    );
    return tickets || [];
  }

  async onSubmitCreate(): Promise<void> {
    if (!this.data.ticket.boardId || !this.data.ticket.sprintId || !this.data.ticket.monthId) {
      this.snackbarService.showError('Required data is missing');
      return;
    }

    if (this.ticketForm.valid) {
      const newTicket: Partial<Ticket> = this.prepareTicketData()

      const tickets: Ticket[] = await this.getTicketsSafe();

      const newPosition = await this.ticketService.getNewTicketPosition(
        this.data.ticket.boardId,
        this.data.ticket.monthId,
        this.data.ticket.sprintId
      );

      for (const [index, ticket] of tickets.entries()) {
        if (index >= newPosition) {
          ticket.position = index + 1;
          await this.ticketService.updateTicket(ticket.id!, ticket);
        }
      }

      newTicket.position = newPosition;

      try {
        const board = await this.boardService.getBoardPromise(this.data.ticket.boardId);

        if (!board) {
          throw new Error('Board not found');
        }

        const id = await this.ticketService.createTicket(
          this.data.ticket.boardId,
          this.data.ticket.monthId,
          this.data.ticket.sprintId,
          newTicket,
          newPosition
        );

        this.data.ticket.id = id

        const updatedImpacts = this.updateBoardImpacts(board.impacts || []);
        await this.boardService.updateBoard(this.data.ticket.boardId, { impacts: updatedImpacts });

        this.dialogRef.close();
        this.snackbarService.showSuccess('Ticket created successfully');
      } catch (error) {
        console.error(error);
        this.snackbarService.showError(
          'An error occurred while creating the ticket'
        );
      } finally {
        this.loading = false;
        if (this.newImpactInput) {
          this.newImpactInput.nativeElement.value = '';
        }
      }
    }
  }

  private updateBoardImpacts(boardImpacts: Impact[]): Impact[] {
    const updatedBoardImpacts = JSON.parse(JSON.stringify(boardImpacts));

    // Remove ticket references from board impacts that are no longer associated with this ticket
    updatedBoardImpacts.forEach((impact: Impact) => {
      impact.tickets = impact.tickets?.filter((ticket: TicketReference) => {
        return !(ticket.idTicket === this.data.ticket.id &&
                ticket.monthId === this.data.ticket.monthId &&
                ticket.sprintId === this.data.ticket.sprintId);
      }) || [];
    });

    // Add or update ticket references in board impacts
    this.impacts.forEach((ticketImpact) => {
      const boardImpact = updatedBoardImpacts.find(
        (impact: Impact) => impact.name.toLowerCase() === ticketImpact.name.toLowerCase()
      );
      if (boardImpact) {
        // Update existing board impact
        boardImpact.tickets = boardImpact.tickets || [];
        boardImpact.tickets.push(this.createTicketReference());

        // Update the color of the board impact
        boardImpact.color = ticketImpact.color;
      } else {
        // Add new impact to board's impacts
        updatedBoardImpacts.push({
          ...ticketImpact,
          tickets: [this.createTicketReference()],
        });
      }
    });

    return updatedBoardImpacts;
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
      complexity: formValues.complexity,
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

  deleteImpact(index: number): void {
    const impactName = this.impacts[index].name;
    this.updateOrAddOrRemoveImpact(impactName, 'remove');
    this.impacts.splice(index, 1);
    this.ticketForm.get('impacts')?.setValue([...this.impacts]);
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
    return this.previewColor;
  }

  handleImpactPreview(): void {
    this.updateOrAddOrRemoveImpact(this.createImpactPreview, 'update');
    if (this.newImpactInput) {
      this.newImpactInput.nativeElement.value = '';
    }
      this.showPreview = false;
  }

  updateOrAddOrRemoveImpact(impactName: string | null, action: 'add' | 'update' | 'remove'): void {
    if (!impactName) return;

    let existingImpactIndex = this.impacts.findIndex(
      (impact) => impact.name.toLowerCase() === impactName.toLowerCase()
    );

    if (existingImpactIndex !== -1) {
      let updatedImpact = { ...this.impacts[existingImpactIndex] }; // Create a shallow copy

      if (action === 'remove') {
        // Remove the ticket reference from the existing impact
        updatedImpact.tickets = updatedImpact.tickets?.filter(
          (ticket) => ticket.idTicket !== this.data.ticket.id
        ) || [];
      } else {
        // Add or update the ticket reference in the existing impact
        this.addOrUpdateTicketReference(updatedImpact);
      }

      // Update the impact in the original array
      this.impacts[existingImpactIndex] = updatedImpact;
    } else if (action !== 'remove') {
      // Create a new impact only if the action is not 'remove'
      const newImpactItem: Impact = {
        name: impactName,
        color: this.previewColor,
        tickets: [this.createTicketReference()],
      };

      // Add the new impact to the current impacts list
      this.impacts.push(newImpactItem);
    }

    // Update the form value
    this.ticketForm.get('impacts')?.setValue([...this.impacts]); // Create a new array reference
  }

  addOrUpdateTicketReference(impact: Impact): void {
    const newTicketReference = this.createTicketReference();

    // Initialize impact.tickets if it's undefined
    if (!impact.tickets) {
      impact.tickets = [];
    }

    // Check if the ticket ID already exists in the board's impact tickets list
    const existingTicket = impact.tickets.find(ticket =>
      ticket.idTicket === newTicketReference.idTicket
    );

    // If the ticket ID is not found in the board's impact tickets list, add it
    if (!existingTicket) {
      impact.tickets.push(newTicketReference);
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
    // Update the color property of the impact object
    impact.color = newColor;

    // Find the index of the impact in the this.impacts array
    const index = this.impacts.findIndex(i => i.name === impact.name);

    // Update the color of the corresponding impact in the this.impacts array
    if (index !== -1) {
      this.impacts[index].color = newColor;
    }
  }

}
