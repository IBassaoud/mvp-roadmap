import {
  Component,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import lottie from 'lottie-web';
import { CircleLoaderComponent } from '../../shared/components/circle-loader/circle-loader.component';
import { RoadmapPopupComponent } from '../../shared/components/roadmap-popup/roadmap-popup.component';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent implements OnDestroy {
  loading = false;
  creatingBoard: boolean = false;
  private animation: any;

  @ViewChild('lottieContainer', { static: false }) lottieContainer!: ElementRef;

  constructor(private dialog: MatDialog, private router: Router) {}

  openPopup() {
    const dialogRef = this.dialog.open(RoadmapPopupComponent, {
      width: '390px',
      height: '542px',
      panelClass: 'custom-popup',
    });
  
    dialogRef.afterClosed().subscribe((boardId) => {
      this.creatingBoard = true;
      if (boardId) {
        setTimeout(() => {
          this.startAnimation(boardId);
        }, 0);
      }
    });
  }
  
  startAnimation(boardId: string) {
    if (this.lottieContainer) {
      try {
        this.animation = lottie.loadAnimation({
          container: this.lottieContainer.nativeElement,
          path: 'assets/animations/animation-building-page.json',
          renderer: 'svg',
          loop: true,
          autoplay: true,
        });
        this.animation.addEventListener('DOMLoaded', () => {
          setTimeout(() => {
            this.router.navigate(['/board', boardId]);
          }, 5000);
        });
      } catch (error) {
        console.error('Error loading the animation: ', error);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.animation) {
      this.animation.destroy();
    }
  }
}
