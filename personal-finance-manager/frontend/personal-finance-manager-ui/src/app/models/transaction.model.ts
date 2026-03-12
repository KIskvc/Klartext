import { CategoryType } from './category.model';

export interface Transaction {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryType: CategoryType;
  amount: number;
  description: string | null;
  date: string; // ISO date string: "YYYY-MM-DD"
  createdAt: string;
}

export interface CreateTransactionRequest {
  categoryId: string;
  amount: number;
  description: string | null;
  date: string; // "YYYY-MM-DD"
}

export interface UpdateTransactionRequest {
  categoryId: string;
  amount: number;
  description: string | null;
  date: string; // "YYYY-MM-DD"
}
