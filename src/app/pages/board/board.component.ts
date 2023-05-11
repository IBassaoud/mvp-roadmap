import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Board } from 'src/app/core/interfaces/board';
import { Month } from 'src/app/core/interfaces/month';
import { BoardService } from 'src/app/core/services/board.service';
import { MonthService } from 'src/app/core/services/month.service';
import { CarouselComponent } from '../../shared/components/carousel/carousel.component';

import { MonthNames } from '../../core/constants/month-names';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit, OnDestroy {
  @ViewChild(CarouselComponent) carousel: CarouselComponent = new CarouselComponent;

  boardName = '';
  months: Month[] = [];
  boardId: string = '';
  loading = false; 

  private subscriptions: Subscription = new Subscription();

  constructor(private boardService: BoardService, private route: ActivatedRoute, private monthService:MonthService) {}

  ngOnInit(): void {
    const routeId = this.route.snapshot.paramMap.get('boardId');
    if (routeId) {
      this.boardId = routeId;
      this.fetchBoard();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  fetchBoard() {
    this.loading = true; // set loading to true before fetching data

    if (this.boardId) {
      const boardSub = this.boardService.getBoard(this.boardId).subscribe((board: Board) => {
        this.boardName = board.name || '';
      });

      const monthsSub = this.monthService.getMonths(this.boardId).subscribe((months: Month[]) => {
        this.months = months.sort(
          (a, b) =>
            MonthNames.indexOf(a.name) - MonthNames.indexOf(b.name)
        );
        this.loading = false; // set loading to false once data is loaded
      });

      this.subscriptions.add(boardSub);
      this.subscriptions.add(monthsSub);
    }
  }

  toggleEditorView(): void {
    // Add your logic to toggle the editor view
  }

  addMonth(): void {
    const currentMonthCount = this.months.length;

    if (currentMonthCount < 12) {
      const nextMonthName = MonthNames[currentMonthCount];
      const newMonth: Month = { boardId: this.boardId, name: nextMonthName };

      this.monthService.createMonth(this.boardId, newMonth).then(() => {
        this.fetchBoard();
        // Call showLastCreatedMonth method after fetching the updated board
        this.carousel.showLastCreatedMonth();
      });
    }
  }

  isAddMonthDisabled(): boolean {
    return this.months.length >= 12;
  }
}
