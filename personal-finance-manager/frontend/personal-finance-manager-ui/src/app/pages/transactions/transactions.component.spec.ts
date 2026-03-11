import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { TransactionsComponent } from './transactions.component';

describe('TransactionsComponent', () => {
  let component: TransactionsComponent;
  let fixture: ComponentFixture<TransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionsComponent],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should format income amount with + prefix', () => {
    const t: any = { categoryType: 'Income', amount: 100 };
    expect(component.formatAmount(t)).toBe('+100.00 €');
  });

  it('should format expense amount with – prefix', () => {
    const t: any = { categoryType: 'Expense', amount: 50.5 };
    expect(component.formatAmount(t)).toBe('–50.50 €');
  });
});
