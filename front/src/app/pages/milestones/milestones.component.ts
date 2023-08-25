// Import necessary Angular modules and services
import { Component, Renderer2, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MonthService } from 'src/app/core/services/month.service';
import { SprintService } from 'src/app/core/services/sprint.service';
import { TicketService } from 'src/app/core/services/ticket.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { Sprint } from 'src/app/core/interfaces/sprint';
import { Ticket } from 'src/app/core/interfaces/ticket';
import { Month } from 'src/app/core/interfaces/month';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { TicketEditDialogComponent } from '../../shared/components/ticket/ticket-edit-dialog/ticket-edit-dialog.component';
import { Platform } from '@angular/cdk/platform';

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

@Component({
  selector: 'app-milestones',
  templateUrl: './milestones.component.html',
  styleUrls: ['./milestones.component.scss'],
})
export class MilestonesComponent implements OnInit {
  isEditorMode: boolean = false;
  position: 'start' | 'end' | 'center' = 'center';
  orientation: 'vertical' | 'horizontal' = 'horizontal';
  reverse: boolean = false;
  milestones: Milestone[] = this.initializeMilestones();
  loading: boolean = false;
  showRotatePrompt: boolean = false;
  isMediumOrMobile: boolean = false;
  filteredMilestones = [];
  lengthDiff = 0;


  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private route: ActivatedRoute,
    private router: Router,
    private monthService: MonthService,
    private sprintService: SprintService,
    private ticketService: TicketService,
    private snackbarService: SnackbarService,
    private breakpointObserver: BreakpointObserver,
    private dialog: MatDialog,
    private platform: Platform,
  ) {
    this.breakpointObserver.observe([
      Breakpoints.HandsetPortrait,
      Breakpoints.HandsetLandscape,
      Breakpoints.TabletPortrait,
      Breakpoints.TabletLandscape,
    ]).subscribe(result => {
      // Check if the platform is iOS
      if (this.platform.IOS) {
        // Apply specific logic for iOS, such as using window.orientation
        this.showRotatePrompt = window.orientation === 0;
      } else {
        // Existing logic for other platforms
        this.showRotatePrompt = result.breakpoints[Breakpoints.HandsetPortrait];
      }
      this.isMediumOrMobile = result.matches;
    });
  
    // If you want to handle orientation changes on iOS, you can add this:
    if (this.platform.IOS) {
      window.addEventListener('resize', this.checkOrientation.bind(this));
    }
  }

  ngOnInit(): void {
    const boardId = this.route.snapshot.paramMap.get('boardId');
    if (boardId) {
      this.fetchAllMonths(boardId).then(() => {
        // Filter out milestones with no content
        const originalLength = this.milestones.length;
        this.milestones = this.milestones.filter(milestone => milestone.content.length > 0);
        this.lengthDiff = originalLength - this.milestones.length;
        // Adjust the timeline width at the end
        if (this.milestones.length <= 4) {
          this.lengthDiff = this.lengthDiff + .6
        }
      });
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
  // Method do dynamicly change the timeline width at the end || Binded to class .timeline-line-right width
  getTimelineWidth(): string {
    const extraWidth = 100 + (57.5 * this.lengthDiff);
    return `calc(100% + ${extraWidth}px)`;
  }

  checkOrientation() {
    this.showRotatePrompt = window.orientation === 0;
  }

  // Fetch all months for a given board ID
  private async fetchAllMonths(boardId: string): Promise<void> {
    this.loading = true;
    try {
      const months = await this.monthService.getMonthsPromise(boardId);
      if (months && months.length > 0) {
        await this.createMilestonesFromMonths(months);
        this.adjustStartingMilestone();
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
    // Create a map for faster lookup
    const monthMap = new Map(months.map(m => [m.name, m]));
  
    const allSprintsAndTickets = await Promise.all(
      this.milestones.map(async (milestone:Milestone) => {
        const dataForMilestone = milestoneMapping[milestone.label];
        if (dataForMilestone) {
          return Promise.all(
            dataForMilestone.map(async data => {
              const month = monthMap.get(data.month);
              if (month && month.boardId && month.id) {
                const sprints = await this.sprintService.getSprintsPromise(month.boardId, month.id);
                const sprintsForMilestone = sprints.filter(s => this.isSprintNameMatched(s.name, data.sprints));
                return Promise.all(
                  sprintsForMilestone.map(async (sprint: Sprint) => {
                    if (sprint.id && month.boardId && month.id) {
                      const tickets = await this.ticketService.getTicketsPromise(month.boardId, month.id, sprint.id);
                      return { ...sprint, tickets } as SprintWithTickets;
                    }
                    return null;
                  })
                ).then(results => results.filter(result => result !== null) as SprintWithTickets[]);
              }
              return [];
            })
          ).then(results => results.flat());
        }
        return [];
      })
    );
  
    // Associate the results with the milestones
    this.milestones.forEach((milestone: Milestone, index) => {
      milestone.content = allSprintsAndTickets[index] || [];
    });
  }

  private adjustStartingMilestone(): void {
    const currentMonthIndex = new Date().getMonth();
    const previousMonthIndex = currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    let startMilestoneIndex = 0;
    for (const milestone of this.milestones) {
      const dataForMilestone = this.getMilestoneMapping()[milestone.label];
      if (dataForMilestone) {
        const hasCurrentOrPreviousMonth = dataForMilestone.some(data => data.month === monthNames[currentMonthIndex] || data.month === monthNames[previousMonthIndex]);
        const hasTickets = milestone.content.some(sprintWithTickets => sprintWithTickets.tickets && sprintWithTickets.tickets.length > 0);

        if (hasCurrentOrPreviousMonth && hasTickets) {
          break;
        }
      }
      startMilestoneIndex++;
    }

    if (startMilestoneIndex > 0 && startMilestoneIndex < this.milestones.length) {
      this.milestones = this.milestones.slice(startMilestoneIndex);
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

  getMonthsForMilestone(milestoneLabel: string): string {
    const milestoneData = this.getMilestoneMapping()[milestoneLabel];
    if (milestoneData) {
      const details = milestoneData.map(data => {
        const sprints = data.sprints.join(', ');
        return `${data.month}: ${sprints}`;
      }).join('\n');
      return `${details}`;
    }
    return '';
  }

  onCloseRotatePrompt(): void {
    this.showRotatePrompt = false;
  }

  showScrollIndicator(milestone: any): boolean {
    if (this.isMediumOrMobileDevice()) {
      let totalTickets = 0;
      for (const sprint of milestone.content) {
        totalTickets += sprint.tickets.length;
      }
      return totalTickets > 5;
    }
    return false;
  }

  isMediumOrMobileDevice(): boolean {
    return this.isMediumOrMobile;
  }

  navigateToRoadmap() {
    const boardId = this.route.snapshot.paramMap.get('boardId');
    if (boardId) {
      this.router.navigate(['/board', boardId]);
    }
  }

  openEditDialog(ticket: any): void {
    const dialogRef = this.dialog.open(TicketEditDialogComponent, {
      width: '520px',
      height: '542px',
      panelClass: 'custom-popup',
      data: { ticket: ticket, isEditorMode: this.isEditorMode },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && this.isEditorMode) {
        // Only update the ticket if we are in editor mode
        ticket = result;
      }
    });
  }
  // And don't forget to remove the event listener if you added it:
  ngOnDestroy() {
    if (this.platform.IOS) {
      window.removeEventListener('resize', this.checkOrientation.bind(this));
    }
  }
}
