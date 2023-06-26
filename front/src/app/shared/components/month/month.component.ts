import { Component, Input, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { Month } from 'src/app/core/interfaces/month';
import { Sprint } from 'src/app/core/interfaces/sprint';
import { SprintService } from 'src/app/core/services/sprint.service';
import { Subscription } from 'rxjs';
import { MonthService } from 'src/app/core/services/month.service';

@Component({
  selector: 'app-month',
  templateUrl: './month.component.html',
  styleUrls: ['./month.component.scss'],
})
export class MonthComponent implements OnInit, OnDestroy {
  @Input() month!: Month;
  @Input() boardId!: string;
  @Input() isEditorMode: boolean = false;
  sprints: Sprint[] = [];
  showDeleteIcon: boolean = false;
  private subscriptions: Subscription = new Subscription();
  @Output() monthDeleted = new EventEmitter();

  constructor(
    private sprintService: SprintService,
    private monthService: MonthService,
  ) {}

  ngOnInit(): void {
      this.fetchSprints();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  fetchSprints(): void {
    const sprintsSub = this.sprintService
      .getSprints(this.boardId, this.month.id!)
      .subscribe((sprints: Sprint[]) => {
        if (sprints && sprints.length > 0) {
          this.sprints = sprints
            .filter((sprint) => sprint != null && sprint.name != null)
            .sort((a, b) => a.name!.localeCompare(b.name!));
        } else {
          this.sprints = [];
        }
      });
  
    this.subscriptions.add(sprintsSub);
  }

  async deleteMonth(): Promise<void> {
    try {
      if (this.month.id && this.boardId) {
        await this.monthService.deleteMonth(this.boardId, this.month.id);
        this.monthDeleted.emit(this.month.id);
      }
    } catch (error) {
      console.error('Failed to delete month:', error);
    }
  }
}
