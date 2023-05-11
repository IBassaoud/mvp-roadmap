import { Component, Input, OnInit } from '@angular/core';
import { Ticket, TicketPriority, TicketStatus } from 'src/app/core/interfaces/ticket';

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss']
})
export class TicketComponent implements OnInit {
  @Input() ticket!: Ticket;

  constructor() {}

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
}
