import {
  Component, Input, forwardRef, HostListener, inject, ElementRef, signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

interface CalendarDay {
  day: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-date-picker',
  standalone: true,
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DatePickerComponent),
    multi: true,
  }],
})
export class DatePickerComponent implements ControlValueAccessor {
  private readonly el = inject(ElementRef);

  @Input() invalid = false;
  @Input() placeholder = 'Select date';

  isOpen = signal(false);
  isDisabled = signal(false);
  openUpward = signal(false);
  private value = signal(''); // YYYY-MM-DD

  displayYear = signal(new Date().getFullYear());
  displayMonth = signal(new Date().getMonth()); // 0-indexed

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  readonly WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  readonly MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  get displayLabel(): string {
    const v = this.value();
    if (!v) return '';
    const [y, m, d] = v.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('de-AT', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  }

  get hasValue(): boolean { return !!this.value(); }

  get monthLabel(): string {
    return `${this.MONTHS[this.displayMonth()]} ${this.displayYear()}`;
  }

  get calendarDays(): CalendarDay[] {
    const year = this.displayYear();
    const month = this.displayMonth();
    const val = this.value();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Monday-first: Sun=0 → shift to 6, Mon=1 → 0, …
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const today = new Date();
    const todayStr = fmt(today.getFullYear(), today.getMonth() + 1, today.getDate());

    const days: CalendarDay[] = [];

    // Leading days from previous month
    for (let i = startDow; i > 0; i--) {
      const d = new Date(year, month, 1 - i);
      days.push({ day: d.getDate(), month: d.getMonth(), year: d.getFullYear(), isCurrentMonth: false, isToday: false, isSelected: false });
    }

    // Current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const ds = fmt(year, month + 1, d);
      days.push({ day: d, month, year, isCurrentMonth: true, isToday: ds === todayStr, isSelected: ds === val });
    }

    // Trailing days to complete the grid (fill to multiple of 7)
    const total = Math.ceil(days.length / 7) * 7;
    let trail = 1;
    while (days.length < total) {
      const d = new Date(year, month + 1, trail++);
      days.push({ day: d.getDate(), month: d.getMonth(), year: d.getFullYear(), isCurrentMonth: false, isToday: false, isSelected: false });
    }

    return days;
  }

  toggle(): void {
    if (this.isDisabled()) return;
    if (!this.isOpen()) {
      const v = this.value();
      if (v) {
        const [y, m] = v.split('-').map(Number);
        this.displayYear.set(y);
        this.displayMonth.set(m - 1);
      } else {
        this.displayYear.set(new Date().getFullYear());
        this.displayMonth.set(new Date().getMonth());
      }
      // Flip upward if there's not enough room below (~280px for calendar)
      const rect = this.el.nativeElement.getBoundingClientRect();
      this.openUpward.set(rect.bottom + 290 > window.innerHeight);
    } else {
      this.onTouched();
    }
    this.isOpen.update(v => !v);
  }

  selectDay(day: CalendarDay): void {
    const ds = fmt(day.year, day.month + 1, day.day);
    this.value.set(ds);
    this.onChange(ds);
    this.onTouched();
    this.isOpen.set(false);
  }

  prevMonth(): void {
    if (this.displayMonth() === 0) { this.displayMonth.set(11); this.displayYear.update(y => y - 1); }
    else { this.displayMonth.update(m => m - 1); }
  }

  nextMonth(): void {
    if (this.displayMonth() === 11) { this.displayMonth.set(0); this.displayYear.update(y => y + 1); }
    else { this.displayMonth.update(m => m + 1); }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      if (this.isOpen()) this.onTouched();
      this.isOpen.set(false);
    }
  }

  writeValue(value: string): void { this.value.set(value ?? ''); }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void { this.isDisabled.set(disabled); }
}

function fmt(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
