import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessPopupComponent } from './access-popup.component';

describe('AccessPopupComponent', () => {
  let component: AccessPopupComponent;
  let fixture: ComponentFixture<AccessPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccessPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
