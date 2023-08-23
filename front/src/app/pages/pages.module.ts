import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LandingComponent } from './landing/landing.component';
import { BoardComponent } from './board/board.component';
import { SharedModule } from '../shared/shared.module';
import { AccessPopupComponent } from './board/access-popup/access-popup.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PublishRoadmapComponent } from './publish-roadmap/publish-roadmap.component';
import { NotifySubscribersComponent } from './notify-subscribers/notify-subscribers.component';
import { MilestonesComponent } from './milestones/milestones.component';
import { MatStepperModule } from '@angular/material/stepper';
import { TimelineModule } from 'primeng/timeline';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { NgxMatTimelineModule } from 'ngx-mat-timeline';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    LandingComponent,
    BoardComponent,
    AccessPopupComponent,
    PublishRoadmapComponent,
    NotifySubscribersComponent,
    MilestonesComponent,
    
  ],
  imports: [
    SharedModule,
    CommonModule,
    MatTooltipModule,
    MatStepperModule,
    TimelineModule,
    CardModule,
    ButtonModule,
    NgxMatTimelineModule,
    MatRadioModule,
    MatCheckboxModule,
    MatTabsModule,
    MatCardModule,
    FormsModule
  ],
  providers: [DatePipe],
})
export class PagesModule { }