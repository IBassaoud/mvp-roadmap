import { Component, OnInit } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { RoadmapPopupComponent } from '../roadmap-popup/roadmap-popup.component';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss']
})
export class AppHeaderComponent implements OnInit {

  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
  }

  openRoadmapPopup(): void {
    const dialogRef = this.dialog.open(RoadmapPopupComponent);
  
    dialogRef.afterClosed().subscribe((roadmapCode: string) => {
      if (roadmapCode) {
        // Logic to navigate to the roadmap with the given code
        console.log('Roadmap code:', roadmapCode);
      }
    });
  }
  
}
