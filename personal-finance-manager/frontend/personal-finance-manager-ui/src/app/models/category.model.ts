export type CategoryType = 'Income' | 'Expense';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  createdAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  type: CategoryType;
}

export interface UpdateCategoryRequest {
  name: string;
  type: CategoryType;
}
