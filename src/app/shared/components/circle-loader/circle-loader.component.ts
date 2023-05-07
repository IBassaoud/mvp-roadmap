import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-circle-loader',
  templateUrl: './circle-loader.component.html',
  styleUrls: ['./circle-loader.component.scss'],
})
export class CircleLoaderComponent {
  @Input() diameter: number = 50;
  @Input() strokeWidth: number = 5;
}
