import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { sha256 } from 'js-sha256';

@Component({
  selector: 'app-access-popup',
  templateUrl: './access-popup.component.html',
  styleUrls: ['./access-popup.component.scss'],
})
export class AccessPopupComponent {
  accessCodeForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AccessPopupComponent>,
  ) {
    this.accessCodeForm = this.formBuilder.group({
      accessCode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  submitForm() {
    if (this.accessCodeForm.valid) {
      const accessCode = this.accessCodeForm.get('accessCode')?.value;
      this.dialogRef.close(accessCode);
    }
  }
}
