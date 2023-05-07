import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-custom-button',
  templateUrl: './custom-button.component.html',
  styleUrls: ['./custom-button.component.scss']
})
export class CustomButtonComponent {
  @Input() width: number = 277;
  @Input() height: number = 44;
  @Input() disabled: boolean = false;
  @Input() buttonType: string = '';



  constructor() {}
}
