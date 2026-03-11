export interface Budget {
  id: string;
  categoryId: string;
  categoryName: string;
  year: number;
  month: number;
  amount: number;
}

export interface SetBudgetRequest {
  categoryId: string;
  year: number;
  month: number;
  amount: number;
}
