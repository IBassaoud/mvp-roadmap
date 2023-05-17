import { Component, Input, OnChanges, OnInit, OnDestroy, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Month } from 'src/app/core/interfaces/month';
import { saveLastViewedMonthIndex, loadLastViewedMonthIndex } from './utils';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent implements OnInit, OnDestroy, OnChanges {
  @Input() months: Month[] = [];
  @Input() boardId: string = '';
  @Input() isEditorMode: boolean = false; 
  @Output() visibleMonthsChange = new EventEmitter<{ start: number, end: number }>();
  currentIndex = 0;

  constructor() {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    saveLastViewedMonthIndex(this.boardId, this.currentIndex);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['months']) {
      const savedIndex = loadLastViewedMonthIndex(this.boardId);
      if (savedIndex !== null && savedIndex <= this.months.length - 3) {
        this.currentIndex = savedIndex;
      } else {
        this.currentIndex = Math.max(0, this.months.length - 3);
      }
      this.emitVisibleMonths();
    }
  }

  visibleMonths(): Month[] {
    return this.months.slice(this.currentIndex, this.currentIndex + 3);
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
      saveLastViewedMonthIndex(this.boardId, this.currentIndex);
      this.emitVisibleMonths();
    }
  }

  next(): void {
    if (this.hasNext()) {
      this.currentIndex++;
      saveLastViewedMonthIndex(this.boardId, this.currentIndex);
      this.emitVisibleMonths();
    }
  }

  showLastCreatedMonth(): void {
    this.currentIndex = Math.max(0, this.months.length - 3);
    saveLastViewedMonthIndex(this.boardId, this.currentIndex);
    this.emitVisibleMonths();
  }

  private emitVisibleMonths(): void {
    this.visibleMonthsChange.emit({ start: this.currentIndex, end: this.currentIndex + 2 });
  }
}
