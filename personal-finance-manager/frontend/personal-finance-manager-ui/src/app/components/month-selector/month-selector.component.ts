import { Component, input, output, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomSelectComponent } from '../../components/custom-select/custom-select.component';

@Component({
  selector: 'app-month-selector',
  standalone: true,
  imports: [FormsModule, CustomSelectComponent],
  template: `
    <div class="period-row">
      <div class="period-field">
        <app-custom-select
          [options]="yearOptions"
          [ngModel]="year()"
          (ngModelChange)="year.set($event); periodChange.emit()"
        />
      </div>
      <div class="period-field">
        <app-custom-select
          [options]="monthOptions"
          [ngModel]="month()"
          (ngModelChange)="month.set($event); periodChange.emit()"
        />
      </div>
    </div>
  `,
  styles: `
    .period-row { display: flex; gap: 10px; }
    .period-field { width: 160px; }
  `,
})
export class MonthSelectorComponent {
  year = model<number>(new Date().getFullYear());
  month = model<number>(new Date().getMonth() + 1);
  periodChange = output();

  private readonly currentYear = new Date().getFullYear();

  readonly yearOptions = Array.from({ length: 6 }, (_, i) => {
    const y = this.currentYear + 1 - i;
    return { value: y, label: String(y) };
  });

  readonly monthOptions = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];
}
