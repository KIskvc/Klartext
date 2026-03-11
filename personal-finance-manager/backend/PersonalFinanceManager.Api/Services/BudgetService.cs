using Microsoft.EntityFrameworkCore;
using PersonalFinanceManager.Api.Data;
using PersonalFinanceManager.Api.DTOs;
using PersonalFinanceManager.Api.Models;

namespace PersonalFinanceManager.Api.Services;

public class BudgetService(AppDbContext db) : IBudgetService
{
    public async Task<IEnumerable<BudgetResponse>> GetAllAsync(int? year, int? month)
    {
        var query = db.Budgets
            .AsNoTracking()
            .Include(b => b.Category)
            .AsQueryable();

        if (year.HasValue)
            query = query.Where(b => b.Year == year.Value);

        if (month.HasValue)
            query = query.Where(b => b.Month == month.Value);

        return await query
            .OrderBy(b => b.Year)
            .ThenBy(b => b.Month)
            .ThenBy(b => b.Category.Name)
            .Select(b => new BudgetResponse
            {
                Id = b.Id,
                CategoryId = b.CategoryId,
                CategoryName = b.Category.Name,
                Year = b.Year,
                Month = b.Month,
                Amount = b.Amount,
            })
            .ToListAsync();
    }

    public async Task<(BudgetSetResult Result, BudgetResponse? Budget)> SetAsync(SetBudgetRequest request)
    {
        var category = await db.Categories.FindAsync(request.CategoryId);
        if (category is null)
            return (BudgetSetResult.CategoryNotFound, null);

        if (category.Type != CategoryType.Expense)
            return (BudgetSetResult.CategoryNotExpense, null);

        var budget = await db.Budgets.FirstOrDefaultAsync(b =>
            b.CategoryId == request.CategoryId &&
            b.Year == request.Year &&
            b.Month == request.Month);

        if (budget is null)
        {
            budget = new Budget
            {
                Id = Guid.NewGuid(),
                CategoryId = request.CategoryId,
                Year = request.Year,
                Month = request.Month,
                Amount = request.Amount,
            };
            db.Budgets.Add(budget);
        }
        else
        {
            budget.Amount = request.Amount;
        }

        await db.SaveChangesAsync();

        return (BudgetSetResult.Success, new BudgetResponse
        {
            Id = budget.Id,
            CategoryId = budget.CategoryId,
            CategoryName = category.Name,
            Year = budget.Year,
            Month = budget.Month,
            Amount = budget.Amount,
        });
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var budget = await db.Budgets.FindAsync(id);
        if (budget is null) return false;

        db.Budgets.Remove(budget);
        await db.SaveChangesAsync();
        return true;
    }
}
