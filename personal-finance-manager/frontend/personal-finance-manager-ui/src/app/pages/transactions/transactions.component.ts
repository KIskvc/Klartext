import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';

import { TransactionService } from '../../services/transaction.service';
import { CategoryService } from '../../services/category.service';
import { ToastService } from '../../services/toast.service';
import { Transaction, CreateTransactionRequest } from '../../models/transaction.model';
import { Category } from '../../models/category.model';
import { CustomSelectComponent, SelectOption, SelectGroup } from '../../components/custom-select/custom-select.component';
import { DatePickerComponent } from '../../components/date-picker/date-picker.component';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CustomSelectComponent, DatePickerComponent],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss',
})
export class TransactionsComponent implements OnInit {
  private readonly transactionService = inject(TransactionService);
  private readonly categoryService = inject(CategoryService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  transactions = signal<Transaction[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  selectedYear: number | null = new Date().getFullYear();
  selectedMonth: number | null = new Date().getMonth() + 1;

  // Form modal
  showForm = signal(false);
  editingTransaction = signal<Transaction | null>(null);
  loadingCategories = signal(false);
  incomeCategories = signal<Category[]>([]);
  expenseCategories = signal<Category[]>([]);

  // Delete confirm
  showDeleteConfirm = signal(false);
  deletingTransaction = signal<Transaction | null>(null);

  form = this.fb.group({
    categoryId: ['', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    description: ['', [Validators.maxLength(500)]],
    date: ['', Validators.required],
  });

  yearOptions: SelectOption[] = (() => {
    const cur = new Date().getFullYear();
    return [
      { value: null, label: 'All years' },
      ...Array.from({ length: 5 }, (_, i) => ({ value: cur - i, label: String(cur - i) })),
    ];
  })();

  monthOptions: SelectOption[] = [
    { value: null, label: 'All months' },
    { value: 1, label: 'January' },   { value: 2, label: 'February' },
    { value: 3, label: 'March' },     { value: 4, label: 'April' },
    { value: 5, label: 'May' },       { value: 6, label: 'June' },
    { value: 7, label: 'July' },      { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' },
  ];

  categoryGroups = computed<SelectGroup[]>(() => {
    const groups: SelectGroup[] = [];
    const income = this.incomeCategories();
    const expense = this.expenseCategories();
    if (income.length) groups.push({ label: 'Income', options: income.map(c => ({ value: c.id, label: c.name })) });
    if (expense.length) groups.push({ label: 'Expense', options: expense.map(c => ({ value: c.id, label: c.name })) });
    return groups;
  });

  ngOnInit(): void {
    this.loadTransactions();
    this.loadCategories();
  }

  loadTransactions(): void {
    this.loading.set(true);
    this.error.set(null);
    this.transactionService.getAll(
      this.selectedYear ?? undefined,
      this.selectedMonth ?? undefined,
    ).subscribe({
      next: (txs) => { this.transactions.set(txs); this.loading.set(false); },
      error: () => { this.error.set('Failed to load transactions.'); this.loading.set(false); },
    });
  }

  loadCategories(): void {
    this.loadingCategories.set(true);
    this.categoryService.getAll().subscribe({
      next: (cats) => {
        this.incomeCategories.set(cats.filter(c => c.type === 'Income'));
        this.expenseCategories.set(cats.filter(c => c.type === 'Expense'));
        this.loadingCategories.set(false);
      },
      error: () => this.loadingCategories.set(false),
    });
  }

  onFilterChange(): void {
    this.loadTransactions();
  }

  openCreate(): void {
    this.editingTransaction.set(null);
    this.form.reset({ categoryId: '', amount: null, description: '', date: this.todayIso() });
    this.showForm.set(true);
  }

  openEdit(t: Transaction): void {
    this.editingTransaction.set(t);
    this.form.patchValue({ categoryId: t.categoryId, amount: t.amount, description: t.description, date: t.date });
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); }

  submitForm(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const raw = this.form.getRawValue();
    const payload = {
      categoryId: raw.categoryId!,
      amount: raw.amount!,
      description: raw.description || null,
      date: raw.date!,
    } satisfies CreateTransactionRequest;

    const editing = this.editingTransaction();
    if (editing) {
      this.transactionService.update(editing.id, payload).subscribe({
        next: () => { this.toast.show('Transaction updated'); this.closeForm(); this.loadTransactions(); },
        error: () => this.toast.show('Failed to update transaction', 'error'),
      });
    } else {
      this.transactionService.create(payload).subscribe({
        next: () => { this.toast.show('Transaction created'); this.closeForm(); this.loadTransactions(); },
        error: () => this.toast.show('Failed to create transaction', 'error'),
      });
    }
  }

  confirmDelete(t: Transaction): void {
    this.deletingTransaction.set(t);
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.deletingTransaction.set(null);
  }

  executeDelete(): void {
    const t = this.deletingTransaction();
    if (!t) return;
    this.transactionService.delete(t.id).subscribe({
      next: () => { this.toast.show('Transaction deleted'); this.cancelDelete(); this.loadTransactions(); },
      error: () => { this.toast.show('Failed to delete transaction', 'error'); this.cancelDelete(); },
    });
  }

  formatAmount(t: Transaction): string {
    const prefix = t.categoryType === 'Income' ? '+' : '–';
    return `${prefix}${t.amount.toFixed(2)} €`;
  }

  formatDate(dateStr: string): string {
    const [y, m, d] = dateStr.split('-');
    return `${d}.${m}.${y}`;
  }

  private todayIso(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
