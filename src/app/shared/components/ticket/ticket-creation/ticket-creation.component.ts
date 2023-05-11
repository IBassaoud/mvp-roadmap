import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TicketCreationDialogComponent } from '../ticket-creation-dialog/ticket-creation-dialog.component';
import { BoardService } from 'src/app/core/services/board.service';
import { TicketService } from 'src/app/core/services/ticket.service';

@Component({
  selector: 'app-ticket-creation',
  templateUrl: './ticket-creation.component.html',
  styleUrls: ['./ticket-creation.component.scss']
})
export class TicketCreationComponent implements OnInit {
  @Input() boardId!: string;
  @Input() sprintId!: string;

  constructor(private dialog: MatDialog, private boardService: BoardService, private ticketService:TicketService) {}

  ngOnInit(): void {}

  // openTicketCreationDialog(): void {
  //   const dialogRef = this.dialog.open(TicketCreationDialogComponent, {
  //     width: '400px',
  //     data: { boardId: this.boardId, sprintId: this.sprintId }
  //   });

  //   dialogRef.afterClosed().subscribe((result) => {
  //     if (result) {
  //       this.ticketService.createTicket(this.boardId, this.sprintId, result);
  //     }
  //   });
  // }
}
