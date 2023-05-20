import { Component, Input, OnChanges, OnInit, OnDestroy, SimpleChanges, Output, EventEmitter, HostBinding } from '@angular/core';
import { Month } from 'src/app/core/interfaces/month';
import { saveLastViewedMonthIndex, loadLastViewedMonthIndex } from './utils';
import { slideInAnimation } from 'src/app/core/animations/carousel.animation';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  animations: [slideInAnimation],
})
export class CarouselComponent implements OnInit, OnDestroy, OnChanges {
  @Input() months: Month[] = [];
  @Input() boardId: string = '';
  @Input() isEditorMode: boolean = false; 
  @Output() visibleMonthsChange = new EventEmitter<{ start: number, end: number }>();
  @Output() monthDeleted = new EventEmitter<string>();
  currentIndex = 0;
  state = 0;
  @HostBinding('@slideIn') slideInTrigger: number = 0;

  ngOnInit(): void {
    this.updateDisplayedMonths();
  }

  ngOnDestroy(): void {
    saveLastViewedMonthIndex(this.boardId, this.currentIndex);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['months']) {
      this.updateDisplayedMonths();
    }
  }

  updateDisplayedMonths(): void {
    const savedIndex = loadLastViewedMonthIndex(this.boardId);
    if (savedIndex !== null && savedIndex <= this.months.length - 3) {
      this.currentIndex = savedIndex;
    } else {
      this.currentIndex = Math.max(0, this.months.length - 3);
    }
    this.slideInTrigger = this.currentIndex;
    this.emitVisibleMonths();
  }

  hasPrevious(): boolean {
    return this.currentIndex > 0;
  }

  hasNext(): boolean {
    return this.currentIndex < this.months.length - 3;
  }

  previous(): void {
    if (this.hasPrevious()) {
      this.currentIndex--;
      this.slideInTrigger = this.currentIndex;
      saveLastViewedMonthIndex(this.boardId, this.currentIndex);
      this.emitVisibleMonths();
    }
  }

  next(): void {
    if (this.hasNext()) {
      this.currentIndex++;
      this.slideInTrigger = this.currentIndex;
      saveLastViewedMonthIndex(this.boardId, this.currentIndex);
      this.emitVisibleMonths();
    }
  }

  onMonthDeleted(deletedMonthId: string): void {
    this.months = this.months.filter(month => month.id !== deletedMonthId);
    this.state++;
    this.slideInTrigger = this.currentIndex;
    this.monthDeleted.emit(deletedMonthId);
    this.updateDisplayedMonths();
  }

  showLastCreatedMonth(): void {
    this.currentIndex = Math.max(0, this.months.length - 2);
    this.slideInTrigger = this.currentIndex;
    saveLastViewedMonthIndex(this.boardId, this.currentIndex);
    this.emitVisibleMonths();
  }

  scrollToMonth(monthIndex: number): void {
    if (monthIndex >= 1 && monthIndex <= this.months.length - 2) {
      this.currentIndex = monthIndex - 1;
    } else if (monthIndex < 1) {
      this.currentIndex = 0;
    } else if (monthIndex > this.months.length - 2) {
      this.currentIndex = Math.max(0, this.months.length - 3);
    }
    this.slideInTrigger = this.currentIndex;
    saveLastViewedMonthIndex(this.boardId, this.currentIndex);
    this.emitVisibleMonths();
  }

  emitVisibleMonths(): void {
    this.visibleMonthsChange.emit({ start: this.currentIndex, end: this.currentIndex + 3 });
  }
}
