import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CircleLoaderComponent } from '../../shared/components/circle-loader/circle-loader.component';
import { RoadmapPopupComponent } from '../../shared/components/roadmap-popup/roadmap-popup.component';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  loading = false;

  constructor(private dialog: MatDialog) {}

  openPopup() {
    this.dialog.open(RoadmapPopupComponent, {
      width: '390px',
      height: '542px',
      panelClass: 'custom-popup'
    });
  }
}
