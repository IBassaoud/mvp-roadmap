import { Component, OnInit, Output, EventEmitter } from '@angular/core'; // Import Output and EventEmitter

@Component({
  selector: 'app-rotate-device-prompt',
  templateUrl: './rotate-device-prompt.component.html',
  styleUrls: ['./rotate-device-prompt.component.scss']
})
export class RotateDevicePromptComponent implements OnInit {

  @Output() close = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
  }

  closeOverlay(): void {
    this.close.emit();
  }

}
