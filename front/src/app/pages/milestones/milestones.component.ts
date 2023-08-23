// Import necessary Angular modules and services
import { Component, Renderer2, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MonthService } from 'src/app/core/services/month.service';
import { SprintService } from 'src/app/core/services/sprint.service';
import { TicketService } from 'src/app/core/services/ticket.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { Sprint } from 'src/app/core/interfaces/sprint';
import { Ticket } from 'src/app/core/interfaces/ticket';
import { Month } from 'src/app/core/interfaces/month';

// Define interfaces for Sprint with associated Tickets and Milestones
interface SprintWithTickets extends Sprint {
  tickets?: Ticket[];
}

interface Milestone {
  icon?: string | null;
  svgIcon?: string | null;
  iconUrl?: string | null;
  label: string;
  content: SprintWithTickets[];
  gradient?: string;
}

// Mapping interface for milestones to months and sprints
interface MilestoneMapping {
  [key: string]: { month: string, sprints: string[] }[];
}

// Component metadata
@Component({
  selector: 'app-milestones',
  templateUrl: './milestones.component.html',
  styleUrls: ['./milestones.component.scss'],
})
export class MilestonesComponent implements OnInit {
  position: 'start' | 'end' | 'center' = 'center';
  orientation: 'vertical' | 'horizontal' = 'horizontal';
  reverse: boolean = false;
  milestones: Milestone[] = this.initializeMilestones();
  loading = false;

  // Constructor with dependency injection for necessary services and modules
  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private route: ActivatedRoute,
    private monthService: MonthService,
    private sprintService: SprintService,
    private ticketService: TicketService,
    private snackbarService: SnackbarService
  ) {
  }

  // Lifecycle hook that initializes the component
  ngOnInit(): void {
    const boardId = this.route.snapshot.paramMap.get('boardId');
    if (boardId) {
      this.fetchAllMonths(boardId);
    }
  }

  // Initialize milestones for the timeline
  private initializeMilestones(): Milestone[] {
    return [
      { label: 'Mid Q1', content: [] },
      { label: 'End of Q1', content: [] },
      { label: 'Mid Q2', content: [] },
      { label: 'End of Q2', content: [] },
      { label: 'Mid Q3', content: [] },
      { label: 'End of Q3', content: [] },
      { label: 'Mid Q4', content: [] },
      { label: 'End of Q4', content: [] }
    ];
  }

  // Fetch all months for a given board ID
  private async fetchAllMonths(boardId: string): Promise<void> {
    this.loading = true;
    try {
      const months = await this.monthService.getMonthsPromise(boardId);
      if (months && months.length > 0) {
        await this.createMilestonesFromMonths(months);
        this.calculateGradients();
        this.setTimelineItemBackgrounds();
      }
    } catch (error) {
      this.snackbarService.showError('Error fetching months.');
      console.error('Error in fetchAllMonths:', error);
    } finally {
      this.loading = false;
    }
  }

  /**
   * Create milestones based on the fetched months.
   * This method maps each milestone to its corresponding months and sprints.
   * It then fetches the tickets for each sprint and associates them with the milestone.
   */
  private async createMilestonesFromMonths(months: Month[]): Promise<void> {
    const milestoneMapping: MilestoneMapping = this.getMilestoneMapping();
  
    for (const milestone of this.milestones) {
      const dataForMilestone = milestoneMapping[milestone.label];
      if (dataForMilestone) {
        for (const data of dataForMilestone) {
          const month = months.find(m => m.name === data.month);
          if (month && month.boardId && month.id) {
            const sprints = await this.sprintService.getSprintsPromise(month.boardId, month.id);
            const sprintsForMilestone = sprints.filter(s => this.isSprintNameMatched(s.name, data.sprints));
            for (const sprint of sprintsForMilestone) {
              if (sprint.id && month.boardId && month.id) {
                const tickets = await this.ticketService.getTicketsPromise(month.boardId, month.id, sprint.id);
                const sprintWithTickets: SprintWithTickets = {
                  ...sprint,
                  tickets: tickets
                };
                milestone.content.push(sprintWithTickets);
              }
            }
          }
        }
      }
    }
  }

  // Check if a sprint name matches any of the provided sprint names
  private isSprintNameMatched(sprintName: string | undefined, sprintNames: string[]): boolean {
    if (!sprintName) return false;
    for (const name of sprintNames) {
      if (sprintName.includes(name)) {
        return true;
      }
    }
    return false;
  }

  // Get mapping of milestones to months and sprints
  private getMilestoneMapping(): MilestoneMapping {
    return {
      'Mid Q1': [{ month: 'January', sprints: ['Sprint 1', 'Sprint 2'] }, { month: 'February', sprints: ['Sprint 1'] }],
      'End of Q1': [{ month: 'February', sprints: ['Sprint 2'] }, { month: 'March', sprints: ['Sprint 1', 'Sprint 2'] }],
      'Mid Q2': [{ month: 'April', sprints: ['Sprint 1', 'Sprint 2'] }, { month: 'May', sprints: ['Sprint 1'] }],
      'End of Q2': [{ month: 'May', sprints: ['Sprint 2'] }, { month: 'June', sprints: ['Sprint 1', 'Sprint 2'] }],
      'Mid Q3': [{ month: 'July', sprints: ['Sprint 1', 'Sprint 2'] }, { month: 'August', sprints: ['Sprint 1'] }],
      'End of Q3': [{ month: 'August', sprints: ['Sprint 2'] }, { month: 'September', sprints: ['Sprint 1', 'Sprint 2'] }],
      'Mid Q4': [{ month: 'October', sprints: ['Sprint 1', 'Sprint 2'] }, { month: 'November', sprints: ['Sprint 1'] }],
      'End of Q4': [{ month: 'November', sprints: ['Sprint 2'] }, { month: 'December', sprints: ['Sprint 1', 'Sprint 2'] }]
    };
  }

  // Set background colors for timeline items
  private setTimelineItemBackgrounds(): void {
    const timelineItems = this.el.nativeElement.querySelectorAll('.ngx-mat-timeline-item-line');
    timelineItems.forEach((item: HTMLElement, index: number) => {
      this.renderer.setStyle(item, 'background', this.milestones[index].gradient);
    });
  }

  // Calculate gradient colors for milestones
  private calculateGradients(): void {
    const totalMilestones = this.milestones.length;
    this.milestones.forEach((milestone: Milestone, index: number) => {
      const fromColor = this.calculateColor(index, totalMilestones, true);
      const toColor = this.calculateColor(index, totalMilestones, false);
      milestone.gradient = `linear-gradient(to bottom right, ${fromColor}, ${toColor})`;
    });
  }

  // Calculate color based on index and total milestones
  private calculateColor(index: number, total: number, isFrom: boolean): string {
    const fromR = 0, fromG = 159, fromB = 255;
    const toR = 236, toG = 47, toB = 75;
    const factor = isFrom ? index : index + 1;
    const r = fromR + factor * (toR - fromR) / total;
    const g = fromG + factor * (toG - fromG) / total;
    const b = fromB + factor * (toB - fromB) / total;
    return `rgba(${r}, ${g}, ${b}, .3)`;
  }
}