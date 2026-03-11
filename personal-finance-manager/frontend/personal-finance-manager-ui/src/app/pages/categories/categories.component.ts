import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CategoryService } from '../../services/category.service';
import { ToastService } from '../../services/toast.service';
import { Category, CategoryType, CreateCategoryRequest } from '../../models/category.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  categories = signal<Category[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  showForm = signal(false);
  editingCategory = signal<Category | null>(null);
  showDeleteConfirm = signal(false);
  deletingCategory = signal<Category | null>(null);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    type: [null as CategoryType | null, Validators.required],
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.error.set(null);
    this.categoryService.getAll().subscribe({
      next: (cats) => { this.categories.set(cats); this.loading.set(false); },
      error: () => { this.error.set('Failed to load categories.'); this.loading.set(false); },
    });
  }

  openCreate(): void {
    this.editingCategory.set(null);
    this.form.reset({ name: '', type: null });
    this.showForm.set(true);
  }

  openEdit(category: Category): void {
    this.editingCategory.set(category);
    this.form.patchValue({ name: category.name, type: category.type });
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  submitForm(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { name, type } = this.form.getRawValue();
    const payload = { name: name!.trim(), type: type! } satisfies CreateCategoryRequest;
    const editing = this.editingCategory();

    if (editing) {
      this.categoryService.update(editing.id, payload).subscribe({
        next: () => { this.toast.show('Category updated'); this.closeForm(); this.loadCategories(); },
        error: () => this.toast.show('Failed to update category', 'error'),
      });
    } else {
      this.categoryService.create(payload).subscribe({
        next: () => { this.toast.show('Category created'); this.closeForm(); this.loadCategories(); },
        error: () => this.toast.show('Failed to create category', 'error'),
      });
    }
  }

  confirmDelete(category: Category): void {
    this.deletingCategory.set(category);
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.deletingCategory.set(null);
  }

  executeDelete(): void {
    const cat = this.deletingCategory();
    if (!cat) return;
    this.categoryService.delete(cat.id).subscribe({
      next: () => { this.toast.show('Category deleted'); this.cancelDelete(); this.loadCategories(); },
      error: (err) => {
        const msg = err.status === 409 ? 'Cannot delete — category has transactions.' : 'Failed to delete.';
        this.toast.show(msg, 'error');
        this.cancelDelete();
      },
    });
  }

  setType(type: CategoryType): void {
    this.form.patchValue({ type });
  }
}
