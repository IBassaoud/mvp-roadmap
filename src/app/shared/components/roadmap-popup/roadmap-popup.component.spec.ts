import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoadmapPopupComponent } from './roadmap-popup.component';

describe('RoadmapPopupComponent', () => {
  let component: RoadmapPopupComponent;
  let fixture: ComponentFixture<RoadmapPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoadmapPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoadmapPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
