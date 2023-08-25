import { Component, OnInit, OnDestroy, ViewChild, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Board } from 'src/app/core/interfaces/board';
import { Month } from 'src/app/core/interfaces/month';

import { BoardService } from 'src/app/core/services/board.service';
import { MonthService } from 'src/app/core/services/month.service';
import { SprintService } from 'src/app/core/services/sprint.service';

import { CarouselComponent } from '../../shared/components/carousel/carousel.component';
import { MonthNames } from '../../core/constants/month-names';
import { forkJoin, Subscription, of } from 'rxjs';
import { take, finalize, catchError, first } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { AccessPopupComponent } from './access-popup/access-popup.component';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { sha256 } from 'js-sha256';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NewsletterService } from 'src/app/core/services/newsletter.service';
import { NewsletterSubscription, BoardSubscription } from 'src/app/core/interfaces/newsletter-subscription';
import { NotifySubscribersComponent } from '../notify-subscribers/notify-subscribers.component';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit, OnDestroy {
  @ViewChild(CarouselComponent) carouselComponent!: CarouselComponent;
  @ViewChild(NotifySubscribersComponent ) NotifySubscribersComponent!: CarouselComponent;
  board: Board = {};
  boardName = '';
  boardId: string = '';
  months: Month[] = [];

  isEditorMode: boolean = false;
  userHasEditorRights: boolean = true;
  loading = false;

  currentMonth = new Date().getMonth();
  isAddMonthDisabled = false;

  private subscriptions = new Subscription();

  newsletterForm: FormGroup;

  constructor(
    private boardService: BoardService,
    private route: ActivatedRoute,
    private monthService: MonthService,
    private dialog: MatDialog,
    private snackbarService: SnackbarService,
    private router: Router,
    private newsletterService: NewsletterService,
    private sprintService: SprintService,
  ) {
    this.newsletterForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email])
    });
  }

  ngOnInit(): void {
    this.boardId = this.route.snapshot.paramMap.get('boardId') || '';
    if (this.boardId) {
      this.fetchBoardData();
      this.getBoard();
    }
  }

  onMonthDeleted(deletedMonthId: string): void {
    this.months = this.months.filter(month => month.id !== deletedMonthId);
    this.isAddMonthDisabled = this.months.length >= 12;
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
  
    const boardRequest = this.boardService.getBoard(this.boardId).pipe(
      first(),
      catchError(error => {
        this.snackbarService.showError('Board not found.');
        this.router.navigate(['/']);
        return of(null);
      })
    );
  
    const monthsRequest = this.monthService.getMonths(this.boardId).pipe(
      first(),
      catchError(error => {
        return of(null);
      })
    );
  
    forkJoin([boardRequest, monthsRequest])
    .pipe(finalize(() => this.loading = false))
    .subscribe(([board, months]) => {
      if (board) {
        this.boardName = board.name || '';
        if (board.editorAccessOnCreation) {
          this.isEditorMode = true;
          this.boardService.updateBoard(this.boardId, { editorAccessOnCreation: false });
        }
      }
  
      if (months) {
        this.months = months.sort(
          (a, b) => MonthNames.indexOf(a.name) - MonthNames.indexOf(b.name)
        );
        // Check if the last month is December
        this.isAddMonthDisabled = this.months.length > 0 && this.months[this.months.length - 1].name === 'December';
      }
    });
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
      // Get the last month in the array
      const lastMonth = this.months[this.months.length - 1].name;
  
      // Get the index of the last month in the MonthNames array
      const lastMonthIndex = MonthNames.indexOf(lastMonth);
  
      // Determine the next month's index. If the last month is December, the next month's index should be 0 (January)
      const nextMonthIndex = (lastMonthIndex + 1) % MonthNames.length;
  
      // Get the next month's name
      const nextMonthName = MonthNames[nextMonthIndex];
  
      const newMonth: Month = { boardId: this.boardId, name: nextMonthName };
  
      this.monthService
        .createMonth(this.boardId, newMonth)
        .then(() => {
          this.fetchBoardData();
          this.carouselComponent?.showLastCreatedMonth();
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }  

  selectMonth(monthIndex: number): void {
    if (this.carouselComponent) {
      this.carouselComponent.scrollToMonth(monthIndex);
    }
  }

  // News letter methods handling
  onNewsletterSubscribe(): void {
    if (this.newsletterForm.valid) {
      const email = this.newsletterForm.value.email;
      this.newsletterService.getSubscriptionByEmail(email).pipe(take(1)).subscribe(
        (subscription) => {
          if (subscription === null) {
            // Subscription for this email doesn't exist yet. Create it.
            const newSubscription: NewsletterSubscription = {
              email: email,
              boardSubscriptions: [{
                boardId: this.boardId,
                subscriptionDate: new Date()
              }]
            };
            this.newsletterService.createSubscription(newSubscription).then(() => {
              this.snackbarService.showSuccess(`Thank you! ${email} will receive updates about changes to this roadmap.`);
            }).catch((error) => {
              this.snackbarService.showError('An error occurred while creating the subscription');
            });
          } else if (subscription.boardSubscriptions.find(bs => bs.boardId === this.boardId)) {
            // Already subscribed to this board
            this.snackbarService.showError(`The email ${email} is already subscribed to updates for this roadmap.`);
          } else {
            // Exists, but not subscribed to this board yet
            const boardSubscription: BoardSubscription = {
              boardId: this.boardId,
              subscriptionDate: new Date()
            };
            this.newsletterService.addBoardSubscription(email, boardSubscription).then(() => {
              this.snackbarService.showSuccess(`Thank you! ${email} will receive updates about changes to this roadmap.`);
            }).catch((error) => {
              this.snackbarService.showError('An error occurred while adding the board subscription');
            });
          }
        },
        (error) => {
          // console.error(error);
          this.snackbarService.showError('An error occurred while checking the subscription');
        }
      );
    } else {
      this.snackbarService.showError('Please enter a valid email');
    }
  }

  publishBoard(): void {
    this.router.navigate(['/publish', this.boardId]);
  }

  redirectToMilestones(): void {
    this.router.navigate(['/milestones', this.boardId]);
  }
  
  notifySubscriber(): void {
    this.dialog.open(NotifySubscribersComponent, {
      data: { boardId: this.boardId }
    })
  }
}
