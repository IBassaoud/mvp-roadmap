import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LandingComponent } from './landing/landing.component';
import { BoardComponent } from './board/board.component';
import { SharedModule } from '../shared/shared.module';
import { AccessPopupComponent } from './board/access-popup/access-popup.component';


@NgModule({
  declarations: [
    LandingComponent,
    BoardComponent,
    AccessPopupComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
  ],
  providers: [DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PagesModule { }
