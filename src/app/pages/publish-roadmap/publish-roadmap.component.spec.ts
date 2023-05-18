import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishRoadmapComponent } from './publish-roadmap.component';

describe('PublishRoadmapComponent', () => {
  let component: PublishRoadmapComponent;
  let fixture: ComponentFixture<PublishRoadmapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PublishRoadmapComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublishRoadmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
