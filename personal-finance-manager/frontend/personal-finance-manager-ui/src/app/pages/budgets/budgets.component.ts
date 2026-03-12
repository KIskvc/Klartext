import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { BudgetService } from '../../services/budget.service';
import { CategoryService } from '../../services/category.service';
import { ToastService } from '../../services/toast.service';
import { CustomSelectComponent, SelectOption } from '../../components/custom-select/custom-select.component';

interface BudgetCard {
  categoryId: string;
  categoryName: string;
  budgetId: string | null;
  inputAmount: number | null;
  savedAmount: number | null;
  saving: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [FormsModule, CustomSelectComponent],
  templateUrl: './budgets.component.html',
  styleUrl: './budgets.component.scss',
})
export class BudgetsComponent implements OnInit {
  private readonly budgetService = inject(BudgetService);
  private readonly categoryService = inject(CategoryService);
  private readonly toast = inject(ToastService);

  cards: BudgetCard[] = [];
  loading = signal(true);
  error = signal<string | null>(null);

  selectedYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth() + 1;

  yearOptions: SelectOption[] = (() => {
    const cur = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => ({ value: cur + 1 - i, label: String(cur + 1 - i) }));
  })();

  monthOptions: SelectOption[] = [
    { value: 1,  label: 'January' },  { value: 2,  label: 'February' },
    { value: 3,  label: 'March' },    { value: 4,  label: 'April' },
    { value: 5,  label: 'May' },      { value: 6,  label: 'June' },
    { value: 7,  label: 'July' },     { value: 8,  label: 'August' },
    { value: 9,  label: 'September'}, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' },
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      categories: this.categoryService.getAll(),
      budgets: this.budgetService.getAll(this.selectedYear, this.selectedMonth),
    }).subscribe({
      next: ({ categories, budgets }) => {
        const expense = categories.filter(c => c.type === 'Expense');
        this.cards = expense.map(cat => {
          const budget = budgets.find(b => b.categoryId === cat.id);
          return {
            categoryId: cat.id,
            categoryName: cat.name,
            budgetId: budget?.id ?? null,
            inputAmount: budget?.amount ?? null,
            savedAmount: budget?.amount ?? null,
            saving: false,
          };
        });
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load budgets.');
        this.loading.set(false);
      },
    });
  }

  onPeriodChange(): void {
    this.loadData();
  }

  isDirty(card: BudgetCard): boolean {
    return card.inputAmount !== card.savedAmount;
  }

  save(card: BudgetCard): void {
    if (card.saving) return;

    const amount = card.inputAmount;

    if ((amount === null || amount <= 0) && card.budgetId) {
      card.saving = true;
      this.budgetService.delete(card.budgetId).subscribe({
        next: () => {
          card.budgetId = null;
          card.savedAmount = null;
          card.inputAmount = null;
          card.saving = false;
          this.toast.show('Budget removed');
        },
        error: () => {
          card.saving = false;
          this.toast.show('Error saving', 'error');
        },
      });
      return;
    }

    if (amount === null || amount <= 0) return;

    card.saving = true;
    this.budgetService.set({
      categoryId: card.categoryId,
      year: this.selectedYear,
      month: this.selectedMonth,
      amount,
    }).subscribe({
      next: (budget) => {
        card.budgetId = budget.id;
        card.savedAmount = budget.amount;
        card.inputAmount = budget.amount;
        card.saving = false;
        this.toast.show('Budget saved');
      },
      error: (err) => {
        card.saving = false;
        const msg: string = err.error?.message ?? 'Error saving';
        this.toast.show(msg, 'error');
      },
    });
  }

  get periodLabel(): string {
    return `${MONTH_NAMES[this.selectedMonth - 1]} ${this.selectedYear}`;
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(amount);
  }
}
