import {
  Component, Input, ElementRef, HostListener,
  forwardRef, inject, signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  value: any;
  label: string;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

@Component({
  selector: 'app-custom-select',
  standalone: true,
  templateUrl: './custom-select.component.html',
  styleUrl: './custom-select.component.scss',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CustomSelectComponent),
    multi: true,
  }],
})
export class CustomSelectComponent implements ControlValueAccessor {
  private readonly el = inject(ElementRef);

  @Input() options: SelectOption[] = [];
  @Input() groups: SelectGroup[] = [];
  @Input() placeholder = 'Select…';
  @Input() invalid = false;
  @Input() emptyMessage = '';

  isOpen = signal(false);
  selectedValue = signal<any>(undefined);
  isDisabled = signal(false);

  private onChange: (v: any) => void = () => {};
  private onTouched: () => void = () => {};

  get selectedLabel(): string {
    const all = [...this.options, ...this.groups.flatMap(g => g.options)];
    const found = all.find(o => o.value === this.selectedValue());
    return found ? found.label : this.placeholder;
  }

  get hasValue(): boolean {
    const v = this.selectedValue();
    return v !== null && v !== undefined && v !== '';
  }

  get isEmpty(): boolean {
    return this.options.length === 0 && this.groups.every(g => g.options.length === 0);
  }

  toggle(): void {
    if (this.isDisabled()) return;
    this.isOpen.update(v => !v);
  }

  select(value: any): void {
    this.selectedValue.set(value);
    this.onChange(value);
    this.onTouched();
    this.isOpen.set(false);
  }

  isSelected(value: any): boolean {
    return this.selectedValue() === value;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      if (this.isOpen()) this.onTouched();
      this.isOpen.set(false);
    }
  }

  writeValue(value: any): void { this.selectedValue.set(value); }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void { this.isDisabled.set(disabled); }
}
