import { Component, OnInit, inject, signal } from '@angular/core';
import { MonthSelectorComponent } from '../../components/month-selector/month-selector.component';
import { SummaryService } from '../../services/summary.service';
import { Summary } from '../../models/summary.model';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [MonthSelectorComponent],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss',
})
export class SummaryComponent implements OnInit {
  private readonly summaryService = inject(SummaryService);

  loading = signal(false);
  error = signal<string | null>(null);
  summary = signal<Summary | null>(null);

  selectedYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth() + 1;

  private readonly currencyFormatter = new Intl.NumberFormat('de-AT', {
    style: 'currency',
    currency: 'EUR',
  });

  ngOnInit(): void {
    this.loadSummary();
  }

  onPeriodChange(): void {
    this.loadSummary();
  }

  loadSummary(): void {
    this.loading.set(true);
    this.error.set(null);

    this.summaryService.getSummary(this.selectedYear, this.selectedMonth).subscribe({
      next: (data) => {
        this.summary.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message ?? 'Failed to load summary');
        this.loading.set(false);
      },
    });
  }

  formatCurrency(amount: number): string {
    return this.currencyFormatter.format(amount);
  }

  formatDiff(diff: number | null): string {
    if (diff === null) return '–';
    const abs = Math.abs(diff);
    const formatted = this.currencyFormatter.format(abs).replace('€', '€\u00A0').replace(/^\s+/, '');
    if (diff >= 0) {
      return `+${this.currencyFormatter.format(abs)}`;
    }
    return `–${this.currencyFormatter.format(abs).replace('-', '')}`;
  }

  hasData(): boolean {
    const s = this.summary();
    if (!s) return false;
    return s.categoryBreakdowns.length > 0 || s.highestExpenseCategory !== null;
  }
}
