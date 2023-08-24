import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RotateDevicePromptComponent } from './rotate-device-prompt.component';

describe('RotateDevicePromptComponent', () => {
  let component: RotateDevicePromptComponent;
  let fixture: ComponentFixture<RotateDevicePromptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RotateDevicePromptComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RotateDevicePromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
