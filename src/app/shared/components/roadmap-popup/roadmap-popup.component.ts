import {
  Component,
  OnInit,
  ViewChildren,
  ElementRef,
  QueryList,
  OnDestroy,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BoardService } from '../../../core/services/board.service';

import { sha256 } from 'js-sha256';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-roadmap-popup',
  templateUrl: './roadmap-popup.component.html',
  styleUrls: ['./roadmap-popup.component.scss'],
})
export class RoadmapPopupComponent implements OnInit, OnDestroy {
  @ViewChildren('inputElem') inputElements!: QueryList<ElementRef>;
  roadmapCodeForm!: FormGroup;
  controlsArray: AbstractControl[] = [];
  invalidInput: boolean = false;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<RoadmapPopupComponent>,
    private boardService: BoardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.roadmapCodeForm = this.formBuilder.group({
      boardName: ['', Validators.required],
      roadmapCode0: ['', [Validators.required, Validators.pattern('\\d')]],
      roadmapCode1: ['', [Validators.required, Validators.pattern('\\d')]],
      roadmapCode2: ['', [Validators.required, Validators.pattern('\\d')]],
      roadmapCode3: ['', [Validators.required, Validators.pattern('\\d')]],
      roadmapCode4: ['', [Validators.required, Validators.pattern('\\d')]],
      roadmapCode5: ['', [Validators.required, Validators.pattern('\\d')]],
    });

    // Convert controls object to an iterable array
    this.controlsArray = Object.values(this.roadmapCodeForm.controls).filter(
      (control) => control !== this.roadmapCodeForm.controls['boardName']
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onInput(event: any, index: number) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    if (value.length > 1) {
      target.value = value.slice(0, 1);
    }

    if (/\d/.test(value)) {
      this.invalidInput = false;
      if (index < this.controlsArray.length - 1) {
        this.controlsArray[index + 1].enable();
      }
    } else if (value === '') {
      this.invalidInput = false;
    } else {
      target.value = '';
      this.invalidInput = true;
    }
  }

  onKeyUp(event: KeyboardEvent, currentIndex: number): void {
    if (event.key.length === 1 && !isNaN(Number(event.key))) {
      const nextIndex = currentIndex + 1;
      if (nextIndex < this.inputElements.length) {
        setTimeout(() => {
          this.inputElements.toArray()[nextIndex].nativeElement.focus();
        }, 50);
      }
    } else if (event.key === 'Backspace' || event.key === 'Delete') {
      this.invalidInput = false;
      const prevIndex = currentIndex - 1;
      if (prevIndex >= 0) {
        this.inputElements.toArray()[prevIndex].nativeElement.focus();
      }
    }
  }

  onSubmit() {
    if (this.roadmapCodeForm.valid) {
      const boardName = this.roadmapCodeForm.controls['boardName'].value;
      const code = this.controlsArray.map((control) => control.value).join('');
      const hashedCode = sha256(code);
      this.boardService
        .createNewBoard(boardName, hashedCode)
        .then((boardId) => {
          this.dialogRef.close();
          this.router.navigate(['/board', boardId, 'editor']);
        })
        .catch((error) => {
          console.error('Error creating new board:', error);
        });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}