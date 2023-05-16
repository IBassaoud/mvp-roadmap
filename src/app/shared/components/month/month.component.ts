import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Month } from 'src/app/core/interfaces/month';
import { Sprint } from 'src/app/core/interfaces/sprint';
import { SprintService } from 'src/app/core/services/sprint.service';
import { Subscription } from 'rxjs';


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
  private subscriptions: Subscription = new Subscription();

  constructor(
    private sprintService: SprintService
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
        this.sprints = sprints
          .filter((sprint) => sprint != null && sprint.name != null)
          .sort((a, b) => a.name!.localeCompare(b.name!));
      });

    this.subscriptions.add(sprintsSub);
  }
}
