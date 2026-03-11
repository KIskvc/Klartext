import { TestBed } from '@angular/core/testing';
import { OverviewComponent } from './overview.component';

describe('OverviewComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(OverviewComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
