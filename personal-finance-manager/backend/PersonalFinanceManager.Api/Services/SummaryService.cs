using Microsoft.EntityFrameworkCore;
using PersonalFinanceManager.Api.Data;
using PersonalFinanceManager.Api.DTOs;
using PersonalFinanceManager.Api.Models;

namespace PersonalFinanceManager.Api.Services;

public class SummaryService(AppDbContext db) : ISummaryService
{
    public async Task<SummaryResponse> GetSummaryAsync(int year, int month)
    {
        // Load all transactions for the month (with category)
        var transactions = await db.Transactions
            .AsNoTracking()
            .Include(t => t.Category)
            .Where(t => t.Date.Year == year && t.Date.Month == month)
            .ToListAsync();

        // Load all budgets for the month (with category)
        var budgets = await db.Budgets
            .AsNoTracking()
            .Include(b => b.Category)
            .Where(b => b.Year == year && b.Month == month)
            .ToListAsync();

        // Aggregate totals
        var totalIncome = transactions
            .Where(t => t.Category.Type == CategoryType.Income)
            .Sum(t => t.Amount);

        var totalExpenses = transactions
            .Where(t => t.Category.Type == CategoryType.Expense)
            .Sum(t => t.Amount);

        // Build per-category breakdown from transactions
        var breakdowns = new Dictionary<Guid, CategoryBreakdown>();

        foreach (var group in transactions.GroupBy(t => t.CategoryId))
        {
            var category = group.First().Category;
            var total = group.Sum(t => t.Amount);
            var budget = budgets.FirstOrDefault(b => b.CategoryId == group.Key);

            breakdowns[group.Key] = new CategoryBreakdown
            {
                CategoryId = category.Id,
                CategoryName = category.Name,
                CategoryType = category.Type,
                TotalAmount = total,
                BudgetAmount = budget?.Amount,
                BudgetDifference = budget is not null ? budget.Amount - total : null,
            };
        }

        // Add categories that have a budget but no transactions this month
        foreach (var budget in budgets.Where(b => !breakdowns.ContainsKey(b.CategoryId)))
        {
            breakdowns[budget.CategoryId] = new CategoryBreakdown
            {
                CategoryId = budget.CategoryId,
                CategoryName = budget.Category.Name,
                CategoryType = budget.Category.Type,
                TotalAmount = 0,
                BudgetAmount = budget.Amount,
                BudgetDifference = budget.Amount, // fully under budget
            };
        }

        // Sort: expenses first (by amount desc), then income (by amount desc)
        var sortedBreakdowns = breakdowns.Values
            .OrderBy(b => b.CategoryType == CategoryType.Expense ? 0 : 1)
            .ThenByDescending(b => b.TotalAmount)
            .ThenBy(b => b.CategoryName)
            .ToList();

        // Highest-spending expense category
        var highestExpense = sortedBreakdowns
            .Where(b => b.CategoryType == CategoryType.Expense && b.TotalAmount > 0)
            .Select(b => new TopExpenseCategory { CategoryName = b.CategoryName, Amount = b.TotalAmount })
            .FirstOrDefault();

        return new SummaryResponse
        {
            TotalIncome = totalIncome,
            TotalExpenses = totalExpenses,
            Balance = totalIncome - totalExpenses,
            CategoryBreakdowns = sortedBreakdowns,
            HighestExpenseCategory = highestExpense,
        };
    }
}
