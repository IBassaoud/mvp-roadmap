import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotifySubscribersComponent } from './notify-subscribers.component';

describe('NotifySubscribersComponent', () => {
  let component: NotifySubscribersComponent;
  let fixture: ComponentFixture<NotifySubscribersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotifySubscribersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotifySubscribersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
