using PersonalFinanceManager.Api.DTOs;

namespace PersonalFinanceManager.Api.Services;

public enum BudgetSetResult { Success, CategoryNotFound, CategoryNotExpense }

public interface IBudgetService
{
    Task<IEnumerable<BudgetResponse>> GetAllAsync(int? year, int? month);
    Task<(BudgetSetResult Result, BudgetResponse? Budget)> SetAsync(SetBudgetRequest request);
    Task<bool> DeleteAsync(Guid id);
}
