import { TestBed } from '@angular/core/testing';
import { BudgetsComponent } from './budgets.component';

describe('BudgetsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetsComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(BudgetsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
