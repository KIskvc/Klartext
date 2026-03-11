import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Budget, SetBudgetRequest } from '../models/budget.model';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5068/api/budgets';

  getAll(year?: number, month?: number): Observable<Budget[]> {
    let params = new HttpParams();
    if (year != null) params = params.set('year', year);
    if (month != null) params = params.set('month', month);
    return this.http.get<Budget[]>(this.baseUrl, { params });
  }

  set(request: SetBudgetRequest): Observable<Budget> {
    return this.http.put<Budget>(this.baseUrl, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
