export interface Summary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  categoryBreakdowns: CategoryBreakdown[];
  highestExpenseCategory: TopExpenseCategory | null;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  categoryType: 'Income' | 'Expense';
  totalAmount: number;
  budgetAmount: number | null;
  budgetDifference: number | null;
}

export interface TopExpenseCategory {
  categoryName: string;
  amount: number;
}
