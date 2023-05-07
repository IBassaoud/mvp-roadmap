import { Component, OnInit, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-roadmap-popup',
  templateUrl: './roadmap-popup.component.html',
  styleUrls: ['./roadmap-popup.component.scss']
})
export class RoadmapPopupComponent implements OnInit {
  @ViewChildren('inputElem') inputElements!: QueryList<ElementRef>;
  roadmapCodeForm!: FormGroup;
  controlsArray: AbstractControl[] = [];
  invalidInput: boolean = false;


  constructor(private formBuilder: FormBuilder, private dialogRef:MatDialogRef<RoadmapPopupComponent>) { }

  ngOnInit(): void {
    this.roadmapCodeForm = this.formBuilder.group({
      roadmapCode0: ['', [Validators.required, Validators.pattern('\\d')]],
      roadmapCode1: ['', [Validators.required, Validators.pattern('\\d')]],
      roadmapCode2: ['', [Validators.required, Validators.pattern('\\d')]],
      roadmapCode3: ['', [Validators.required, Validators.pattern('\\d')]],
      roadmapCode4: ['', [Validators.required, Validators.pattern('\\d')]],
      roadmapCode5: ['', [Validators.required, Validators.pattern('\\d')]],
    });
  
    // Convert controls object to an iterable array
    this.controlsArray = Object.values(this.roadmapCodeForm.controls);
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
    const code = this.controlsArray.map((control) => control.value).join('');
    console.log('Submitted 6-digit code:', code);
  }

  onCancel() {
    this.dialogRef.close();
  }
}
