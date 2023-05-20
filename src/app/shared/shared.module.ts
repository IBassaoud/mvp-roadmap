import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';

import { CircleLoaderComponent } from './components/circle-loader/circle-loader.component';
import { AppHeaderComponent } from './components/app-header/app-header.component';
import { AppFooterComponent } from './components/app-footer/app-footer.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RoadmapPopupComponent } from './components/roadmap-popup/roadmap-popup.component';
import { CustomButtonComponent } from './components/custom-button/custom-button.component';
import { TicketComponent } from './components/ticket/ticket.component';
import { SprintComponent } from './components/sprint/sprint.component';
import { MonthComponent } from './components/month/month.component';
import { CarouselComponent } from './components/carousel/carousel.component';
import { TicketCreationDialogComponent } from './components/ticket/ticket-creation-dialog/ticket-creation-dialog.component';
import { TicketEditDialogComponent } from './components/ticket/ticket-edit-dialog/ticket-edit-dialog.component';
import { ConfirmationDialogComponent } from './components/ticket/confirmation-dialog/confirmation-dialog.component';

@NgModule({
  declarations: [
    AppHeaderComponent,
    AppFooterComponent,
    CircleLoaderComponent,
    RoadmapPopupComponent,
    CustomButtonComponent,
    TicketComponent,
    SprintComponent,
    MonthComponent,
    CarouselComponent,
    TicketCreationDialogComponent,
    TicketEditDialogComponent,
    ConfirmationDialogComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    DragDropModule,
    MatButtonModule,
    MatIconModule,
    DragDropModule,
    MatSelectModule,
    MatTooltipModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AppHeaderComponent,
    AppFooterComponent,
    CircleLoaderComponent,
    RoadmapPopupComponent,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    CustomButtonComponent,
    TicketComponent,
    SprintComponent,
    MonthComponent,
    CarouselComponent,
    TicketCreationDialogComponent,
    TicketEditDialogComponent,
    DragDropModule,
    MatButtonModule,
    MatIconModule,
    DragDropModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule { }
