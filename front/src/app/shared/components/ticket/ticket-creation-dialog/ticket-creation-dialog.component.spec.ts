import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketCreationDialogComponent } from './ticket-creation-dialog.component';

describe('TicketCreationDialogComponent', () => {
  let component: TicketCreationDialogComponent;
  let fixture: ComponentFixture<TicketCreationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TicketCreationDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketCreationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
