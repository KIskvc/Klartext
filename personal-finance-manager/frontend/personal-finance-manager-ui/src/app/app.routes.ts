import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'summary', pathMatch: 'full' },
  {
    path: 'summary',
    loadComponent: () => import('./pages/summary/summary.component').then(m => m.SummaryComponent),
  },
  {
    path: 'overview',
    loadComponent: () => import('./pages/overview/overview.component').then(m => m.OverviewComponent),
  },
  {
    path: 'transactions',
    loadComponent: () => import('./pages/transactions/transactions.component').then(m => m.TransactionsComponent),
  },
  {
    path: 'categories',
    loadComponent: () => import('./pages/categories/categories.component').then(m => m.CategoriesComponent),
  },
  {
    path: 'budgets',
    loadComponent: () => import('./pages/budgets/budgets.component').then(m => m.BudgetsComponent),
  },
  { path: '**', redirectTo: 'summary' },
];
