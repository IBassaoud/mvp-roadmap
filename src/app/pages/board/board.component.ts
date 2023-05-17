import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Board } from 'src/app/core/interfaces/board';
import { Month } from 'src/app/core/interfaces/month';
import { BoardService } from 'src/app/core/services/board.service';
import { MonthService } from 'src/app/core/services/month.service';
import { CarouselComponent } from '../../shared/components/carousel/carousel.component';
import { MonthNames } from '../../core/constants/month-names';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AccessPopupComponent } from './access-popup/access-popup.component';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { sha256 } from 'js-sha256';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit, OnDestroy {
  @ViewChild(CarouselComponent) carouselComponent!: CarouselComponent;
  board: Board = {};
  boardName = '';
  boardId: string = '';
  months: Month[] = [];

  isEditorMode: boolean = false;
  userHasEditorRights: boolean = true; 
  loading = true;

  currentMonth = new Date().getMonth();
  isAddMonthDisabled = false;

  private subscriptions = new Subscription();

  constructor(
    private boardService: BoardService,
    private route: ActivatedRoute,
    private monthService: MonthService,
    private dialog: MatDialog,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.boardId = this.route.snapshot.paramMap.get('boardId') || '';
    if (this.boardId) {
      this.fetchBoardData();
      this.getBoard();
    }
  }

  getBoard(): void {
    this.boardService.getBoard(this.boardId).subscribe((board) => {
      this.board = board;
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  fetchBoardData(): void {
    this.loading = true;

    const boardSub = this.boardService.getBoard(this.boardId).subscribe(
      (board: Board) => {
        this.boardName = board.name || '';
        this.loading = false;
      },
      (error) => {
        console.error(error);
        this.loading = false;
      }
    );
    const monthsSub = this.monthService.getMonths(this.boardId).subscribe(
      (months: Month[]) => {
        this.months = months.sort(
          (a, b) => MonthNames.indexOf(a.name) - MonthNames.indexOf(b.name)
        );
        this.loading = false;
        this.isAddMonthDisabled = this.months.length >= 12;
      },
      (error) => {
        console.error(error);
        this.loading = false;
      }
    );

    this.subscriptions.add(boardSub);
    this.subscriptions.add(monthsSub);
  }

  toggleEditorView(): void {
    if (!this.isEditorMode) {
      this.openAccessPopup();
    } else {
      this.isEditorMode = false;
    }
  }

  openAccessPopup(): void {
    if (this.userHasEditorRights) {
      const dialogRef = this.dialog.open(AccessPopupComponent, {
        width: '390px',
        height: '542px',
        panelClass: 'custom-popup'
      });
      dialogRef.afterClosed().subscribe((result: any) => {
        if (result) {
          const enteredCodeHash = sha256(result);
          if (enteredCodeHash === this.board.code) {
            this.isEditorMode = true;
            this.snackbarService.showSuccess(
              'Access granted. You are now in editor mode.'
            );
          } else {
            this.snackbarService.showError('Invalid code. Please try again.');
          }
        }
      });
    } else {
      this.snackbarService.showError('You do not have editor rights for this board.');
    }
  }

  addMonth(): void {
    if (!this.isAddMonthDisabled) {
      const nextMonthName = MonthNames[this.months.length];
      const newMonth: Month = { boardId: this.boardId, name: nextMonthName };

      this.monthService
        .createMonth(this.boardId, newMonth)
        .then(() => {
          this.fetchBoardData();
          this.carouselComponent.showLastCreatedMonth();
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }
}
